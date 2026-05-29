import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getExam } from "@/lib/exams";
import { hasAttempted, recordAttempt } from "@/lib/exam-attempts";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/exam/$examId")({
  head: () => ({
    meta: [
      { title: "Exam | XPay Portal" },
      { name: "description", content: "Secure proctored MCQ exam." },
    ],
  }),
  component: ExamPage,
});

const MAX_VIOLATIONS = 3;

type Phase = "gate" | "permissions" | "instructions" | "running" | "submitted" | "blocked";

function ExamPage() {
  const { examId } = Route.useParams();
  const navigate = useNavigate();
  const exam = getExam(examId);

  const [phase, setPhase] = useState<Phase>("gate");
  const [candidateEmail, setCandidateEmail] = useState<string>("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState((exam?.durationMin ?? 10) * 60);
  const [violations, setViolations] = useState(0);
  const [permError, setPermError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const finishedRef = useRef(false);

  // Gate: candidate + already-attempted check
  useEffect(() => {
    const raw = sessionStorage.getItem("xpay-candidate");
    if (!raw) { navigate({ to: "/login" }); return; }
    const c = JSON.parse(raw);
    setCandidateEmail(c.email);
    if (!exam) { navigate({ to: "/dashboard" }); return; }
    if (hasAttempted(c.email, exam.id)) {
      setPhase("blocked");
      return;
    }
    setPhase("permissions");
  }, [exam, navigate]);

  const submit = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    let s = 0;
    exam?.questions.forEach((q) => {
      if (answers[q.id] === q.answer) s++;
    });
    if (exam && candidateEmail) {
      recordAttempt(candidateEmail, {
        examId: exam.id,
        submittedAt: Date.now(),
        violations,
        score: s,
        total: exam.questions.length,
      });
    }
    // stop camera/mic
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setPhase("submitted");
  }, [answers, exam, candidateEmail, violations]);

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

  // Anti-cheating listeners — only while running
  useEffect(() => {
    if (phase !== "running") return;

    const onVisibility = () => { if (document.hidden) flagViolation("Tab/window switched."); };
    const onBlur = () => flagViolation("Window lost focus.");
    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 || e.clientX <= 0 || e.clientX >= window.innerWidth) {
        flagViolation("Cursor left the exam window.");
      }
    };
    const onContext = (e: MouseEvent) => { e.preventDefault(); flagViolation("Right-click disabled."); };
    const onCopy = (e: ClipboardEvent) => { e.preventDefault(); flagViolation("Copy disabled."); };
    const onPaste = (e: ClipboardEvent) => { e.preventDefault(); flagViolation("Paste disabled."); };
    const onCut = (e: ClipboardEvent) => { e.preventDefault(); flagViolation("Cut disabled."); };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ["c","v","x","u","s","p","a","f"].includes(k)) {
        e.preventDefault(); flagViolation("Blocked shortcut.");
      }
      if (k === "f12" || (e.ctrlKey && e.shiftKey && ["i","j","c"].includes(k))) {
        e.preventDefault(); flagViolation("DevTools blocked.");
      }
      if (k === "printscreen") flagViolation("Screenshot attempt.");
    };
    const onFsChange = () => {
      if (!document.fullscreenElement && !finishedRef.current) flagViolation("Exited fullscreen.");
    };
    // Detect devtools by window size diff
    const devtoolsCheck = setInterval(() => {
      const threshold = 160;
      if (window.outerWidth - window.innerWidth > threshold ||
          window.outerHeight - window.innerHeight > threshold) {
        flagViolation("Possible DevTools detected.");
      }
      // ensure camera still active
      const tracks = streamRef.current?.getTracks() ?? [];
      if (tracks.length === 0 || tracks.some((t) => t.readyState !== "live")) {
        flagViolation("Camera/microphone disabled.");
      }
    }, 4000);

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("contextmenu", onContext);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("cut", onCut);
    document.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFsChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFsChange);
      clearInterval(devtoolsCheck);
    };
  }, [phase, flagViolation]);

  // Timer
  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(id); submit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, submit]);

  const requestPermissions = async () => {
    setPermError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play().catch(() => {});
      }
      setPhase("instructions");
    } catch {
      setPermError("Camera & microphone access is required to take this exam. Please allow access and retry.");
    }
  };

  const startExam = async () => {
    try { await containerRef.current?.requestFullscreen?.(); } catch { /* ignore */ }
    setPhase("running");
  };

  const mmss = useMemo(() => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, "0");
    const s = (timeLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [timeLeft]);

  // Cleanup stream on unmount
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  if (!exam) return null;

  return (
    <div ref={containerRef} className="min-h-screen select-none bg-background">
      <Toaster position="top-center" richColors />

      {/* Persistent floating webcam preview while running */}
      {phase === "running" && (
        <div className="fixed bottom-4 right-4 z-50 overflow-hidden rounded-xl border-2 border-[var(--brand-blue)] shadow-brand bg-black">
          <video ref={videoRef} className="h-28 w-40 object-cover" playsInline autoPlay muted />
          <div className="absolute left-1 top-1 flex items-center gap-1 rounded-full bg-red-600/90 px-2 py-0.5 text-[10px] font-semibold text-white">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> REC
          </div>
        </div>
      )}

      {phase === "blocked" && (
        <div className="grid min-h-screen place-items-center px-4">
          <Card className="max-w-md w-full glass shadow-brand">
            <CardContent className="p-8 text-center">
              <Logo className="mx-auto h-12" />
              <h1 className="mt-6 text-2xl font-bold text-brand-gradient">Already Attempted</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                You have already submitted the <strong>{exam.title}</strong>.
                Each exam can be attempted only once.
              </p>
              <Link to="/dashboard">
                <Button className="mt-6 w-full bg-brand-gradient border-0 text-white font-semibold">Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {phase === "permissions" && (
        <div className="grid min-h-screen place-items-center px-4">
          <Card className="max-w-lg w-full glass shadow-brand">
            <CardContent className="p-8 text-center">
              <Logo className="mx-auto h-12" />
              <h1 className="mt-6 text-2xl font-bold">
                <span className="text-brand-gradient">{exam.title}</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                This exam requires <strong>camera and microphone</strong> access for proctoring.
              </p>
              <div className="mx-auto my-6 grid h-32 w-full max-w-xs place-items-center rounded-xl border border-dashed border-border bg-muted/40 text-4xl">
                🎥 🎙️
              </div>
              {permError && (
                <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{permError}</p>
              )}
              <Button
                onClick={requestPermissions}
                className="h-11 w-full bg-brand-gradient border-0 text-white font-semibold transition-smooth hover:opacity-95"
              >
                Allow Camera & Microphone
              </Button>
              <Link to="/dashboard">
                <Button variant="ghost" className="mt-3 w-full">Cancel</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {phase === "instructions" && (
        <div className="grid min-h-screen place-items-center px-4">
          <Card className="max-w-lg w-full glass shadow-brand">
            <CardContent className="p-8">
              <div className="text-center">
                <Logo className="mx-auto h-12" />
                <h1 className="mt-6 text-2xl font-bold">
                  <span className="text-brand-gradient">Proctored Exam Instructions</span>
                </h1>
              </div>
              <div className="mx-auto my-5 w-fit overflow-hidden rounded-xl border-2 border-[var(--brand-blue)] shadow-brand">
                <video ref={videoRef} className="h-36 w-48 object-cover bg-black" playsInline autoPlay muted />
              </div>
              <ul className="space-y-2 text-left text-sm text-muted-foreground">
                <li>• Duration: <strong className="text-foreground">{exam.durationMin} minutes</strong> · {exam.questions.length} questions.</li>
                <li>• Runs in <strong className="text-foreground">fullscreen</strong>. Exiting counts as a violation.</li>
                <li>• Tab switching, copy/paste, right-click and DevTools are blocked.</li>
                <li>• Camera & microphone must stay ON for the entire exam.</li>
                <li>• After <strong className="text-foreground">{MAX_VIOLATIONS} violations</strong>, the exam auto-submits.</li>
                <li>• Each exam can be taken <strong className="text-foreground">only once</strong>.</li>
              </ul>
              <Button
                onClick={startExam}
                className="mt-6 h-11 w-full bg-brand-gradient border-0 text-white font-semibold transition-smooth hover:opacity-95 hover:shadow-brand"
              >
                I understand — Start Exam
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {phase === "running" && (() => {
        const q = exam.questions[current];
        const answered = Object.keys(answers).length;
        const progress = (answered / exam.questions.length) * 100;
        return (
          <div className="mx-auto max-w-4xl px-4 py-6">
            <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl glass px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <Logo className="h-8" />
                <Badge variant="secondary" className="hidden sm:inline-flex">{exam.title}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="rounded-full bg-destructive/10 px-3 py-1 font-medium text-destructive">
                  ⚠ {violations}/{MAX_VIOLATIONS}
                </span>
                <span className="rounded-full bg-ink-gradient px-4 py-1 font-mono font-semibold text-white">
                  ⏱ {mmss}
                </span>
              </div>
            </header>

            <div className="mb-4">
              <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                <span>Question {current + 1} of {exam.questions.length}</span>
                <span>{answered} answered</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Card className="shadow-brand">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-lg font-semibold leading-relaxed sm:text-xl">{q.q}</h2>
                <div className="mt-6 space-y-3">
                  {q.options.map((opt, i) => {
                    const checked = answers[q.id] === i;
                    return (
                      <button
                        key={i}
                        onClick={() => setAnswers({ ...answers, [q.id]: i })}
                        className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-smooth ${
                          checked
                            ? "border-transparent bg-brand-gradient text-white shadow-brand"
                            : "border-border bg-card hover:border-[var(--brand-blue)] hover:bg-accent/40"
                        }`}
                      >
                        <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${checked ? "bg-white/25" : "bg-muted"}`}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="flex-1">{opt}</span>
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
                  {current < exam.questions.length - 1 ? (
                    <Button
                      onClick={() => setCurrent((c) => Math.min(exam.questions.length - 1, c + 1))}
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
              {exam.questions.map((qq, i) => (
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
        );
      })()}

      {phase === "submitted" && (
        <div className="grid min-h-screen place-items-center px-4">
          <Card className="max-w-md w-full glass shadow-brand">
            <CardContent className="p-8 text-center">
              <Logo className="mx-auto h-12" />
              <div className="mx-auto mt-6 grid h-16 w-16 place-items-center rounded-full bg-brand-gradient text-3xl text-white">
                ✓
              </div>
              <h1 className="mt-4 text-2xl font-bold">
                <span className="text-brand-gradient">Submission Received</span>
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Thank you. Your response for <strong>{exam.title}</strong> has been recorded.
                Your result will be shared by the invigilator. Results are not displayed here.
              </p>
              <Link to="/dashboard">
                <Button className="mt-6 h-11 w-full bg-brand-gradient border-0 text-white font-semibold transition-smooth hover:opacity-95 hover:shadow-brand">
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
