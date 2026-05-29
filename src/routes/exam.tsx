import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EXAM_QUESTIONS } from "@/lib/exam-data";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/exam")({
  head: () => ({
    meta: [
      { title: "Exam | XPay Portal" },
      { name: "description", content: "Secure proctored MCQ exam." },
    ],
  }),
  component: ExamPage,
});

const DURATION_SECONDS = 10 * 60;
const MAX_VIOLATIONS = 3;

function ExamPage() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(DURATION_SECONDS);
  const [violations, setViolations] = useState(0);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionStorage.getItem("xpay-candidate")) navigate({ to: "/login" });
  }, [navigate]);

  const submit = useCallback(() => {
    let s = 0;
    EXAM_QUESTIONS.forEach((q) => {
      if (answers[q.id] === q.answer) s++;
    });
    setScore(s);
    setFinished(true);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, [answers]);

  const flagViolation = useCallback((reason: string) => {
    setViolations((v) => {
      const next = v + 1;
      if (next >= MAX_VIOLATIONS) {
        toast.error("Exam auto-submitted: too many violations.");
        setTimeout(submit, 200);
      } else {
        toast.warning(`Warning ${next}/${MAX_VIOLATIONS}: ${reason}`);
      }
      return next;
    });
  }, [submit]);

  // Anti-cheating listeners
  useEffect(() => {
    if (!started || finished) return;

    const onVisibility = () => {
      if (document.hidden) flagViolation("You switched tabs or minimized the window.");
    };
    const onBlur = () => flagViolation("Window lost focus.");
    const onContext = (e: MouseEvent) => { e.preventDefault(); flagViolation("Right-click is disabled."); };
    const onCopy = (e: ClipboardEvent) => { e.preventDefault(); flagViolation("Copying is disabled."); };
    const onPaste = (e: ClipboardEvent) => { e.preventDefault(); flagViolation("Pasting is disabled."); };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ["c", "v", "x", "u", "s", "p"].includes(k)) {
        e.preventDefault();
        flagViolation("Blocked shortcut.");
      }
      if (k === "f12") { e.preventDefault(); flagViolation("DevTools blocked."); }
    };
    const onFsChange = () => {
      if (!document.fullscreenElement && !finished) flagViolation("Exited fullscreen.");
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("contextmenu", onContext);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFsChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, [started, finished, flagViolation]);

  // Timer
  useEffect(() => {
    if (!started || finished) return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); submit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started, finished, submit]);

  const startExam = async () => {
    try {
      await containerRef.current?.requestFullscreen?.();
    } catch { /* ignore */ }
    setStarted(true);
  };

  const mmss = useMemo(() => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, "0");
    const s = (timeLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [timeLeft]);

  const q = EXAM_QUESTIONS[current];
  const answered = Object.keys(answers).length;
  const progress = (answered / EXAM_QUESTIONS.length) * 100;

  return (
    <div ref={containerRef} className="min-h-screen select-none">
      <Toaster position="top-center" richColors />

      {!started && !finished && (
        <div className="grid min-h-screen place-items-center px-4">
          <Card className="max-w-lg w-full glass shadow-brand">
            <CardContent className="p-8 text-center">
              <Logo className="mx-auto h-12" />
              <h1 className="mt-6 text-2xl font-bold">
                <span className="text-brand-gradient">Proctored Exam Instructions</span>
              </h1>
              <ul className="mt-6 space-y-2 text-left text-sm text-muted-foreground">
                <li>• You'll have <strong className="text-foreground">10 minutes</strong> for {EXAM_QUESTIONS.length} questions.</li>
                <li>• The exam runs in <strong className="text-foreground">fullscreen</strong>. Exiting counts as a violation.</li>
                <li>• Tab switching, copy/paste, right-click and DevTools are blocked.</li>
                <li>• After <strong className="text-foreground">{MAX_VIOLATIONS} violations</strong>, the exam auto-submits.</li>
              </ul>
              <Button
                onClick={startExam}
                className="mt-8 h-11 w-full bg-brand-gradient border-0 text-white font-semibold transition-smooth hover:opacity-95 hover:shadow-brand"
              >
                I understand — Start Exam
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {started && !finished && (
        <div className="mx-auto max-w-3xl px-4 py-6">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Logo className="h-8" />
            <div className="flex items-center gap-3 text-sm">
              <span className="rounded-full bg-accent px-3 py-1 font-medium text-accent-foreground">
                Violations: {violations}/{MAX_VIOLATIONS}
              </span>
              <span className="rounded-full bg-ink-gradient px-4 py-1 font-mono font-semibold text-white">
                ⏱ {mmss}
              </span>
            </div>
          </header>

          <div className="mb-4">
            <div className="mb-2 flex justify-between text-xs text-muted-foreground">
              <span>Question {current + 1} of {EXAM_QUESTIONS.length}</span>
              <span>{answered} answered</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="glass shadow-brand">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-lg font-semibold sm:text-xl">{q.q}</h2>
              <div className="mt-6 space-y-3">
                {q.options.map((opt, i) => {
                  const checked = answers[q.id] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setAnswers({ ...answers, [q.id]: i })}
                      className={`w-full rounded-xl border p-4 text-left transition-smooth ${
                        checked
                          ? "border-transparent bg-brand-gradient text-white shadow-brand"
                          : "border-border bg-card hover:border-[var(--brand-blue)] hover:bg-accent/40"
                      }`}
                    >
                      <span className={`mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${checked ? "bg-white/25" : "bg-muted"}`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                  disabled={current === 0}
                >
                  ← Previous
                </Button>
                {current < EXAM_QUESTIONS.length - 1 ? (
                  <Button
                    onClick={() => setCurrent((c) => Math.min(EXAM_QUESTIONS.length - 1, c + 1))}
                    className="bg-brand-gradient border-0 text-white font-semibold transition-smooth hover:opacity-95"
                  >
                    Next →
                  </Button>
                ) : (
                  <Button
                    onClick={submit}
                    className="bg-brand-gradient border-0 text-white font-semibold transition-smooth hover:opacity-95"
                  >
                    Submit Exam
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 grid grid-cols-5 gap-2 sm:grid-cols-10">
            {EXAM_QUESTIONS.map((qq, i) => (
              <button
                key={qq.id}
                onClick={() => setCurrent(i)}
                className={`aspect-square rounded-lg text-sm font-semibold transition-smooth ${
                  i === current
                    ? "bg-brand-gradient text-white shadow-brand"
                    : answers[qq.id] !== undefined
                    ? "bg-[var(--brand-green)]/30 text-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {finished && (
        <div className="grid min-h-screen place-items-center px-4">
          <Card className="max-w-md w-full glass shadow-brand">
            <CardContent className="p-8 text-center">
              <Logo className="mx-auto h-12" />
              <h1 className="mt-6 text-2xl font-bold">
                <span className="text-brand-gradient">Exam Submitted</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">Here's your result</p>

              <div className="my-8">
                <div className="text-6xl font-bold text-brand-gradient">
                  {score}<span className="text-2xl text-muted-foreground">/{EXAM_QUESTIONS.length}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {violations > 0 && `Recorded violations: ${violations}`}
                </p>
              </div>

              <Button
                onClick={() => navigate({ to: "/dashboard" })}
                className="h-11 w-full bg-brand-gradient border-0 text-white font-semibold transition-smooth hover:opacity-95 hover:shadow-brand"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
