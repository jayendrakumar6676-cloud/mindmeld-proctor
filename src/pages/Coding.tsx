import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-python";
import "prismjs/components/prism-javascript";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CODING_QUESTIONS, SUPPORTED_LANGUAGES, type LanguageId,
} from "@/lib/coding-questions";
import { runOnce } from "@/lib/code-runner";
import { hasCodingSubmission, saveCodingSubmission, type QuestionResult } from "@/lib/coding-submissions";
import { postSubmission } from "@/lib/api";

const PRISM_LANG: Record<LanguageId, string> = {
  python: "python", javascript: "javascript", java: "java", cpp: "cpp", c: "c",
};
const langLabel: Record<LanguageId, string> = {
  python: "main.py", javascript: "main.js", java: "Main.java", cpp: "main.cpp", c: "main.c",
};

const MAX_VIOLATIONS = 3;
const DURATION_MIN = 60;
type Phase = "gate" | "instructions" | "permissions" | "running" | "submitted" | "blocked";

interface CodeState {
  language: LanguageId;
  code: string;
  lastRun?: { passed: number; total: number; logs: string };
}

export default function Coding() {
  const { examId = "coding" } = useParams();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>("gate");
  const [candidate, setCandidate] = useState<{ name?: string; email: string } | null>(null);
  const questions = CODING_QUESTIONS;
  const [current, setCurrent] = useState(0);
  const [state, setState] = useState<Record<string, CodeState>>(() => {
    const init: Record<string, CodeState> = {};
    for (const qq of CODING_QUESTIONS) init[qq.id] = { language: "python", code: SUPPORTED_LANGUAGES[0].starter };
    return init;
  });
  const [timeLeft, setTimeLeft] = useState(DURATION_MIN * 60);
  const [violations, setViolations] = useState(0);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [permError, setPermError] = useState<string | null>(null);
  const [timePerQuestion, setTimePerQuestion] = useState<Record<string, number>>({});
  const [editsPerQuestion, setEditsPerQuestion] = useState<Record<string, number>>({});
  const focusStartRef = useRef<number>(Date.now());
  const examStartRef = useRef<number>(Date.now());

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("xpay-candidate");
    if (!raw) { navigate("/login"); return; }
    const c = JSON.parse(raw);
    setCandidate(c);
    if (hasCodingSubmission(c.email, examId)) { setPhase("blocked"); return; }
    setPhase("instructions");
  }, [examId, navigate]);

  const q = questions[current];
  const cur = q ? state[q.id] : undefined;

  const setLanguage = (lang: LanguageId) => {
    if (!q) return;
    const def = SUPPORTED_LANGUAGES.find((l) => l.id === lang)!;
    setState((s) => ({ ...s, [q.id]: { ...s[q.id], language: lang, code: def.starter } }));
  };
  const setCode = (code: string) => {
    if (!q) return;
    setState((s) => ({ ...s, [q.id]: { ...s[q.id], code } }));
    setEditsPerQuestion((m) => ({ ...m, [q.id]: (m[q.id] ?? 0) + 1 }));
  };

  // Accumulate time spent on a given question id, then reset focus marker
  const accumulateTime = useCallback((qid: string) => {
    const now = Date.now();
    const delta = now - focusStartRef.current;
    focusStartRef.current = now;
    if (delta > 0 && delta < 1000 * 60 * 30) {
      setTimePerQuestion((m) => ({ ...m, [qid]: (m[qid] ?? 0) + delta }));
    }
  }, []);

  const gotoQuestion = useCallback(
    (idx: number) => {
      if (q) accumulateTime(q.id);
      setCurrent(idx);
    },
    [accumulateTime, q],
  );

  const submit = useCallback(async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setSubmitting(true);
    // Final accumulate
    if (q) {
      const now = Date.now();
      const delta = now - focusStartRef.current;
      if (delta > 0 && delta < 1000 * 60 * 30) {
        setTimePerQuestion((m) => ({ ...m, [q.id]: (m[q.id] ?? 0) + delta }));
      }
    }
    const tpqSnap: Record<string, number> = { ...timePerQuestion };
    if (q) {
      const delta = Date.now() - focusStartRef.current;
      if (delta > 0 && delta < 1000 * 60 * 30) tpqSnap[q.id] = (tpqSnap[q.id] ?? 0) + delta;
    }
    const results: QuestionResult[] = [];
    let totalMarks = 0, totalPossible = 0;
    for (const qq of questions) {
      const st = state[qq.id];
      const perCase: QuestionResult["perCase"] = [];
      let passed = 0;
      for (const tc of qq.testCases) {
        const r = await runOnce(st.language, st.code, tc.stdin, tc.expected);
        perCase.push({ hidden: tc.hidden, passed: r.passed, stdout: r.stdout, expected: tc.expected, stderr: r.stderr });
        if (r.passed) passed++;
      }
      const fraction = passed / qq.testCases.length;
      const earned = Math.round(qq.marks * fraction * 100) / 100;
      totalMarks += earned; totalPossible += qq.marks;
      results.push({ questionId: qq.id, language: st.language, code: st.code, passed, total: qq.testCases.length, marksEarned: earned, perCase });
    }
    const durationMs = Date.now() - examStartRef.current;
    const accuracy = totalPossible > 0 ? totalMarks / totalPossible : 0;
    if (candidate) {
      saveCodingSubmission(candidate.email, { examId, submittedAt: Date.now(), violations, results, totalMarks, totalPossible });
      void postSubmission({
        kind: "coding",
        examId, candidateEmail: candidate.email, candidateName: candidate.name,
        submittedAt: Date.now(), violations, results, totalMarks, totalPossible,
        accuracy, durationMs,
        timePerQuestion: tpqSnap,
        codeEditsPerQuestion: editsPerQuestion,
      });
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setSubmitting(false);
    setPhase("submitted");
  }, [questions, state, candidate, examId, violations, q, timePerQuestion, editsPerQuestion]);

  const flagViolation = useCallback((reason: string) => {
    setViolations((v) => {
      const next = v + 1;
      if (next >= MAX_VIOLATIONS) { toast.error("Coding round auto-submitted: too many violations."); setTimeout(() => { submit(); }, 200); }
      else toast.warning(`Warning ${next}/${MAX_VIOLATIONS}: ${reason}`);
      return next;
    });
  }, [submit]);

  useEffect(() => {
    if (phase !== "running") return;
    const onVisibility = () => { if (document.hidden) flagViolation("Tab/window switched."); };
    const onBlur = () => flagViolation("Window lost focus.");
    const onContext = (e: MouseEvent) => { e.preventDefault(); flagViolation("Right-click disabled."); };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const inEditor = (e.target as HTMLElement)?.dataset?.codeEditor === "true";
      if (k === "f12" || (e.ctrlKey && e.shiftKey && ["i","j","c"].includes(k))) { e.preventDefault(); flagViolation("DevTools blocked."); return; }
      if (!inEditor && (e.ctrlKey || e.metaKey) && ["c","v","x","a","s","p","u"].includes(k)) { e.preventDefault(); flagViolation("Shortcut blocked outside editor."); }
      if (k === "printscreen") flagViolation("Screenshot attempt.");
    };
    const onFs = () => { if (!document.fullscreenElement && !finishedRef.current) flagViolation("Exited fullscreen."); };
    const check = setInterval(() => {
      const tracks = streamRef.current?.getTracks() ?? [];
      if (tracks.length === 0 || tracks.some((t) => t.readyState !== "live")) flagViolation("Camera/microphone disabled.");
    }, 5000);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("contextmenu", onContext);
    document.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFs);
      clearInterval(check);
    };
  }, [phase, flagViolation]);

  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      setTimeLeft((t) => { if (t <= 1) { clearInterval(id); submit(); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, submit]);

  const requestPermissions = async () => {
    setPermError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      try { await containerRef.current?.requestFullscreen?.(); } catch { /* ignore */ }
      setPhase("running");
    } catch {
      setPermError("Camera & microphone access is required. Please allow and retry.");
    }
  };

  useEffect(() => {
    if (phase !== "running") return;
    examStartRef.current = Date.now();
    focusStartRef.current = Date.now();
    const v = videoRef.current, s = streamRef.current;
    if (!v || !s) return;
    v.srcObject = s; v.muted = true; v.playsInline = true;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay(); v.onloadedmetadata = tryPlay;
  }, [phase]);

  const runSampleTests = async () => {
    if (!q || !cur || running) return;
    setRunning(true);
    const visible = q.testCases.filter((t) => !t.hidden);
    let passed = 0;
    const logs: string[] = [];
    for (let i = 0; i < visible.length; i++) {
      const tc = visible[i];
      const r = await runOnce(cur.language, cur.code, tc.stdin, tc.expected);
      const ok = r.passed; if (ok) passed++;
      logs.push(
        `── Sample ${i + 1} ${ok ? "✅ PASSED" : "❌ FAILED"}\nInput:\n${tc.stdin || "(empty)"}\nExpected:\n${tc.expected}\nGot:\n${r.stdout || "(no output)"}\n` +
        (r.stderr ? `Stderr:\n${r.stderr}\n` : "")
      );
    }
    setState((s) => ({ ...s, [q.id]: { ...s[q.id], lastRun: { passed, total: visible.length, logs: logs.join("\n") } } }));
    setRunning(false);
    if (passed === visible.length) toast.success(`All ${visible.length} sample tests passed`);
    else toast.error(`${passed}/${visible.length} sample tests passed`);
  };

  const mmss = useMemo(() => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, "0");
    const s = (timeLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [timeLeft]);

  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  return (
    <div ref={containerRef} className="min-h-screen select-none bg-background">
      {phase === "running" && (
        <div className="fixed bottom-4 right-4 z-50 overflow-hidden rounded-xl border-2 border-[var(--brand-blue)] shadow-brand bg-black">
          <video ref={videoRef} className="h-24 w-32 object-cover" playsInline autoPlay muted />
          <div className="absolute left-1 top-1 flex items-center gap-1 rounded-full bg-red-600/90 px-2 py-0.5 text-[10px] font-semibold text-white">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> REC
          </div>
        </div>
      )}

      {phase === "blocked" && (
        <CenterCard>
          <Logo className="mx-auto h-12" />
          <h1 className="mt-6 text-2xl font-bold text-brand-gradient">Already Attempted</h1>
          <p className="mt-3 text-sm text-muted-foreground">You have already submitted the Coding Round.</p>
          <Link to="/dashboard"><Button className="mt-6 w-full bg-brand-gradient border-0 text-white font-semibold">Back to Dashboard</Button></Link>
        </CenterCard>
      )}

      {phase === "instructions" && (
        <div className="grid min-h-screen place-items-center px-4 py-10">
          <Card className="max-w-2xl w-full glass shadow-brand">
            <CardContent className="p-8">
              <div className="text-center">
                <Logo className="mx-auto h-12" />
                <h1 className="mt-6 text-2xl font-bold text-brand-gradient">Coding Round — Instructions</h1>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Stat label="Total Questions" value={`${questions.length}`} />
                <Stat label="Duration" value={`${DURATION_MIN} min`} />
                <Stat label="Languages" value="Python, JS, Java, C++, C" />
                <Stat label="Grading" value="Hidden test cases" />
              </div>
              <ul className="mt-6 space-y-2 text-left text-sm text-muted-foreground">
                <li>• Each question is graded against visible + hidden test cases. Partial credit is given.</li>
                <li>• Pick any language per question. Read from STDIN, write to STDOUT.</li>
                <li>• Use Run Sample Tests to verify before submitting.</li>
                <li>• Runs in fullscreen with camera + mic. Tab-switch, right-click, DevTools and screenshots are blocked.</li>
                <li>• After {MAX_VIOLATIONS} violations the round auto-submits.</li>
                <li>• Only one attempt. Scores are not shown.</li>
              </ul>
              <div className="mt-6 flex gap-3">
                <Link to="/dashboard" className="flex-1"><Button variant="outline" className="w-full">Cancel</Button></Link>
                <Button onClick={() => setPhase("permissions")} className="flex-1 h-11 bg-brand-gradient border-0 text-white font-semibold">I understand — Continue</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {phase === "permissions" && (
        <CenterCard>
          <Logo className="mx-auto h-12" />
          <h1 className="mt-6 text-2xl font-bold text-brand-gradient">Camera & Microphone</h1>
          <p className="mt-2 text-sm text-muted-foreground">Required for proctoring throughout the coding round.</p>
          <div className="mx-auto my-6 grid h-28 w-full max-w-xs place-items-center rounded-xl border border-dashed border-border bg-muted/40 text-4xl">🎥 🎙️</div>
          {permError && <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{permError}</p>}
          <Button onClick={requestPermissions} className="h-11 w-full bg-brand-gradient border-0 text-white font-semibold">Allow & Start Coding Round</Button>
          <Link to="/dashboard"><Button variant="ghost" className="mt-3 w-full">Cancel</Button></Link>
        </CenterCard>
      )}

      {phase === "running" && q && cur && (
        <div className="mx-auto max-w-[1400px] px-4 py-4">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl glass px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3"><Logo className="h-8" /><Badge variant="secondary">Coding Round</Badge></div>
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full bg-destructive/10 px-3 py-1 font-medium text-destructive">⚠ {violations}/{MAX_VIOLATIONS}</span>
              <span className="rounded-full bg-ink-gradient px-4 py-1 font-mono font-semibold text-white">⏱ {mmss}</span>
            </div>
          </header>

          <div className="mb-3 flex gap-2 overflow-x-auto">
            {questions.map((qq, i) => (
              <button key={qq.id} onClick={() => gotoQuestion(i)}
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-smooth ${
                  i === current ? "bg-brand-gradient text-white shadow-brand" : "bg-muted text-muted-foreground hover:bg-accent"
                }`}>
                Q{i + 1}. {qq.title}
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="shadow-brand">
              <CardContent className="p-6 max-h-[75vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">{q.title}</h2>
                  <Badge variant={q.difficulty === "Easy" ? "secondary" : q.difficulty === "Medium" ? "default" : "destructive"}>
                    {q.difficulty} · {q.marks} marks
                  </Badge>
                </div>
                <pre className="mt-4 whitespace-pre-wrap text-sm text-foreground">{q.prompt}</pre>
                <Section title="Input Format">{q.inputFormat}</Section>
                <Section title="Output Format">{q.outputFormat}</Section>
                <Section title="Constraints"><ul className="list-inside list-disc">{q.constraints.map((c, i) => <li key={i}>{c}</li>)}</ul></Section>
                <h3 className="mt-5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Sample I/O</h3>
                {q.sample.map((s, i) => (
                  <div key={i} className="mt-3 rounded-lg border border-border bg-muted/30 p-3 text-xs font-mono">
                    <div className="text-muted-foreground">Input</div><pre className="whitespace-pre-wrap">{s.input}</pre>
                    <div className="mt-2 text-muted-foreground">Output</div><pre className="whitespace-pre-wrap">{s.output}</pre>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-brand">
              <CardContent className="p-4 flex flex-col gap-3 max-h-[75vh]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <select value={cur.language} onChange={(e) => setLanguage(e.target.value as LanguageId)}
                      className="rounded-md border border-border bg-card px-3 py-2 text-sm font-medium">
                      {SUPPORTED_LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                    </select>
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-600">
                      ⏱ {(((timePerQuestion[q.id] ?? 0) + (Date.now() - focusStartRef.current)) / 1000).toFixed(0)}s on this Q
                    </span>
                    <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-medium text-blue-600">
                      ✎ {editsPerQuestion[q.id] ?? 0} edits
                    </span>
                  </div>
                  <Button size="sm" variant="outline" onClick={runSampleTests} disabled={running}>
                    {running ? "Running…" : "▶ Run Sample Tests"}
                  </Button>
                </div>

                {/* VS Code-styled editor */}
                <div className="vscode-editor flex flex-col" data-code-editor="true">
                  <div className="vscode-titlebar">
                    <span className="vscode-dot" style={{ background: "#ff5f56" }} />
                    <span className="vscode-dot" style={{ background: "#ffbd2e" }} />
                    <span className="vscode-dot" style={{ background: "#27c93f" }} />
                    <span className="ml-3 opacity-70">XPay · Coding Round</span>
                    <span className="ml-auto opacity-50">UTF-8 · LF</span>
                  </div>
                  <div style={{ background: "#2d2d2d", borderBottom: "1px solid #1a1a1a" }}>
                    <span className="vscode-tab">{langLabel[cur.language]}</span>
                  </div>
                  <div style={{ maxHeight: "42vh", overflow: "auto", background: "#1e1e1e" }}>
                    <Editor
                      value={cur.code}
                      onValueChange={(code) => setCode(code)}
                      highlight={(code) =>
                        Prism.highlight(code, Prism.languages[PRISM_LANG[cur.language]] || Prism.languages.clike, PRISM_LANG[cur.language])
                      }
                      padding={14}
                      textareaId="vscode-textarea"
                      textareaClassName="vscode-textarea"
                      preClassName="vscode-pre"
                      style={{
                        fontFamily:
                          '"Fira Code", "JetBrains Mono", "Cascadia Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontSize: 14,
                        lineHeight: 1.55,
                        minHeight: "40vh",
                        outline: "none",
                        color: "#d4d4d4",
                        caretColor: "#ffffff",
                      }}
                    />
                  </div>
                  <div className="vscode-statusbar">
                    <span>{SUPPORTED_LANGUAGES.find((l) => l.id === cur.language)?.label}</span>
                    <span>Ln {cur.code.split("\n").length}</span>
                    <span>{cur.code.length} chars</span>
                    <span className="ml-auto">⚡ XPay Exam Portal</span>
                  </div>
                </div>

                <div className="overflow-y-auto rounded-md border border-border bg-muted/30 p-3 text-xs font-mono">
                  {cur.lastRun ? (
                    <>
                      <div className={`mb-2 font-semibold ${cur.lastRun.passed === cur.lastRun.total ? "text-emerald-600" : "text-destructive"}`}>
                        {cur.lastRun.passed}/{cur.lastRun.total} sample tests passed
                      </div>
                      <pre className="whitespace-pre-wrap">{cur.lastRun.logs}</pre>
                    </>
                  ) : <span className="text-muted-foreground">Run sample tests to see output here.</span>}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Button variant="outline" onClick={() => gotoQuestion(Math.max(0, current - 1))} disabled={current === 0}>← Previous</Button>
            {current < questions.length - 1 ? (
              <Button onClick={() => gotoQuestion(current + 1)} className="bg-brand-gradient border-0 text-white font-semibold">Next →</Button>
            ) : (
              <Button onClick={submit} disabled={submitting} className="bg-brand-gradient border-0 text-white font-semibold">
                {submitting ? "Submitting…" : "Submit Coding Round"}
              </Button>
            )}
          </div>
        </div>
      )}

      {phase === "submitted" && (
        <CenterCard>
          <Logo className="mx-auto h-12" />
          <div className="mx-auto mt-6 grid h-16 w-16 place-items-center rounded-full bg-brand-gradient text-3xl text-white">✓</div>
          <h1 className="mt-4 text-2xl font-bold text-brand-gradient">Submission Received</h1>
          <p className="mt-3 text-sm text-muted-foreground">Your code has been recorded. Results will be shared by the invigilator.</p>
          <Link to="/dashboard"><Button className="mt-6 h-11 w-full bg-brand-gradient border-0 text-white font-semibold">Back to Dashboard</Button></Link>
        </CenterCard>
      )}
    </div>
  );
}

function CenterCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <Card className="max-w-md w-full glass shadow-brand"><CardContent className="p-8 text-center">{children}</CardContent></Card>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-bold text-brand-gradient">{value}</div>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}
