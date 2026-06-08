/**
 * VoiceScreener — AI speaks question → candidate answers by voice → AI evaluates
 *
 * Architecture:
 *  - SpeechSynthesis for AI voice output
 *  - SpeechRecognition with ROLLING RESTART pattern:
 *      Chrome stops recognition after ~8s silence or when TTS is active.
 *      We restart it automatically in onend until the user clicks "Done".
 *  - Mic permission requested ONCE via getUserMedia before everything starts.
 *  - A React ref `submittedRef` acts as the single gate that stops the rolling restarts
 *    and resolves the listen() promise.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { EXAMS } from "@/lib/exams";
import { getScreening, type VoiceQuestion } from "@/lib/voice-questions";

// ─── one-time mic permission ───────────────────────────────────────────────
let _micOk = false;
async function grantMic(): Promise<boolean> {
  if (_micOk) return true;
  try {
    const s = await navigator.mediaDevices.getUserMedia({ audio: true });
    s.getTracks().forEach((t) => t.stop());
    _micOk = true;
    return true;
  } catch { return false; }
}

// ─── TTS helper ────────────────────────────────────────────────────────────
function tts(text: string, rate = 0.88): Promise<void> {
  return new Promise((resolve) => {
    window.speechSynthesis.cancel();
    const u   = new SpeechSynthesisUtterance(text);
    u.lang    = "en-US";
    u.rate    = rate;
    u.pitch   = 1.05;
    u.volume  = 1;
    const vs = window.speechSynthesis.getVoices();
    u.voice  = vs.find((v) => v.lang.startsWith("en") && /Google|Natural|Neural/i.test(v.name))
            ?? vs.find((v) => v.lang.startsWith("en"))
            ?? null;
    u.onend   = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

// ─── voices preload ────────────────────────────────────────────────────────
function waitForVoices(): Promise<void> {
  return new Promise((r) => {
    if (window.speechSynthesis.getVoices().length) { r(); return; }
    const h = () => { window.speechSynthesis.removeEventListener("voiceschanged", h); r(); };
    window.speechSynthesis.addEventListener("voiceschanged", h);
    setTimeout(r, 2000);
  });
}

const LISTEN_SEC = 120; // 2 minutes per question

// format mm:ss
function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function VoiceScreener() {
  const { examId } = useParams<{ examId: string }>();
  const navigate   = useNavigate();
  const screening  = examId ? getScreening(examId) : null;
  const exam       = EXAMS.find((e) => e.id === examId);

  const [qIndex,      setQIndex]      = useState(0);
  const [transcript,  setTranscript]  = useState("");
  const [phase,       setPhase]       = useState<"boot"|"speaking"|"listening"|"feedback"|"result">("boot");
  const [aiText,      setAiText]      = useState("");
  const [timeLeft,    setTimeLeft]    = useState(LISTEN_SEC);
  const [scores,      setScores]      = useState<{ correct: boolean; heard: string }[]>([]);
  const [qualified,   setQualified]   = useState(false);
  const [permErr,     setPermErr]     = useState(false);
  const [ready,       setReady]       = useState(false);

  const recRef       = useRef<SpeechRecognition | null>(null);
  const submittedRef = useRef(false);
  const resolveRef   = useRef<((s: string) => void) | null>(null);
  const accumRef     = useRef("");
  const interimRef   = useRef("");
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef     = useRef(LISTEN_SEC);
  const runningRef   = useRef(false);

  const candidate = (() => {
    try { return JSON.parse(sessionStorage.getItem("xpay-candidate") ?? "{}"); }
    catch { return null; }
  })();

  useEffect(() => {
    if (!candidate?.email) { navigate("/login"); return; }
    if (!screening || !exam) { navigate("/dashboard"); return; }
    grantMic().then((ok) => { if (ok) setReady(true); else setPermErr(true); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    window.speechSynthesis.cancel();
    stopRec();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopRec() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (recRef.current) { try { recRef.current.abort(); } catch {} recRef.current = null; }
  }

  function submitAnswer() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    stopRec();
    setPhase("feedback");
    const answer = (accumRef.current || interimRef.current).trim();
    setTranscript(answer || "(no answer)");
    if (resolveRef.current) { resolveRef.current(answer); resolveRef.current = null; }
  }

  function startRec() {
    if (submittedRef.current) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec: SpeechRecognition = new SR();
    rec.lang            = "en-US";
    rec.interimResults  = true;
    rec.maxAlternatives = 1;
    rec.continuous      = false;
    recRef.current      = rec;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let fin = "", intr = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) fin  += e.results[i][0].transcript;
        else                      intr += e.results[i][0].transcript;
      }
      if (fin) accumRef.current += (accumRef.current ? " " : "") + fin;
      interimRef.current = intr;
      setTranscript((accumRef.current + (intr ? " " + intr : "")).trim());
    };

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === "aborted") return;
      recRef.current = null;
      if (!submittedRef.current) setTimeout(startRec, 300);
    };

    rec.onend = () => {
      recRef.current = null;
      if (!submittedRef.current) setTimeout(startRec, 300);
    };

    try { rec.start(); } catch { if (!submittedRef.current) setTimeout(startRec, 500); }
  }

  const listen = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      submittedRef.current  = false;
      resolveRef.current    = resolve;
      accumRef.current      = "";
      interimRef.current    = "";

      setTranscript("");
      setPhase("listening");
      setAiText("🔴 Listening… speak your answer");

      startRec();

      countRef.current = LISTEN_SEC;
      setTimeLeft(LISTEN_SEC);
      timerRef.current = setInterval(() => {
        countRef.current -= 1;
        setTimeLeft(countRef.current);
        if (countRef.current <= 0) {
          clearInterval(timerRef.current!); timerRef.current = null;
          submitAnswer();
        }
      }, 1000);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function evaluate(q: VoiceQuestion, answer: string): boolean {
    const lower = answer.toLowerCase();
    return q.keywords.some((kw) => lower.includes(kw.toLowerCase()));
  }

  const runFlow = useCallback(async () => {
    if (!screening || !exam || !candidate || runningRef.current) return;
    runningRef.current = true;

    await waitForVoices();
    await new Promise((r) => setTimeout(r, 300));

    setPhase("speaking");
    setAiText("🤖 AI is speaking…");
    await tts(
      `Hello ${candidate.name}! ${screening.intro} ` +
      `You need at least ${screening.passMark} correct answers to qualify. ` +
      `You have 2 minutes to answer each question. Let's begin!`
    );

    const newScores: { correct: boolean; heard: string }[] = [];

    for (let i = 0; i < screening.questions.length; i++) {
      const q = screening.questions[i];
      setQIndex(i);
      setTranscript("");

      setPhase("speaking");
      setAiText(`🤖 Question ${i + 1}: ${q.display}`);
      await tts(q.speak);
      await new Promise((r) => setTimeout(r, 700));

      const answer = await listen();
      const heard  = answer || "(no answer)";

      const correct = evaluate(q, answer);
      newScores.push({ correct, heard });
      setScores([...newScores]);

      setPhase("feedback");
      setAiText(correct ? `✅ Correct! ${q.explanation}` : `❌ Not quite. ${q.explanation}`);
      await tts(correct ? `Correct! ${q.explanation}` : `Not quite. ${q.explanation}`);
      await new Promise((r) => setTimeout(r, 400));
    }

    const total  = newScores.filter((s) => s.correct).length;
    const passed = total >= screening.passMark;
    setQualified(passed);
    setPhase("result");

    const msg = passed
      ? `Congratulations ${candidate.name}! You scored ${total} out of ${screening.questions.length} and qualified for the ${exam.title}. You may now proceed.`
      : `Sorry ${candidate.name}. You scored ${total} out of ${screening.questions.length}. You need ${screening.passMark} correct to qualify. Please try again.`;
    setAiText(msg);
    await tts(msg);
    runningRef.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listen]);

  useEffect(() => { if (ready) runFlow(); }, [ready, runFlow]);

  if (!screening || !exam || !candidate) return null;

  const qObj       = screening.questions[Math.min(qIndex, screening.questions.length - 1)];
  const pct        = phase === "result" ? 100 : (qIndex / screening.questions.length) * 100;
  const R          = 40;
  const CIRCUM     = 2 * Math.PI * R;
  const dashOff    = CIRCUM * (1 - timeLeft / LISTEN_SEC);
  const isListening = phase === "listening";
  const isLow      = timeLeft <= 30; // last 30 s turns red

  // ─── PERM ERROR ─────────────────────────────────────────────────────────
  if (permErr) return (
    <main className="min-h-screen grid place-items-center px-4">
      <div className="glass rounded-2xl p-10 max-w-md w-full text-center shadow-brand">
        <div className="text-5xl mb-4">🎤</div>
        <h2 className="text-xl font-bold mb-2">Microphone Access Required</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Please allow microphone access in your browser, then refresh.
        </p>
        <button onClick={() => window.location.reload()}
          className="h-11 w-full rounded-xl bg-brand-gradient text-white font-semibold border-0 cursor-pointer">
          Refresh &amp; Retry
        </button>
      </div>
    </main>
  );

  // ─── RESULT ─────────────────────────────────────────────────────────────
  if (phase === "result") {
    const correctCount = scores.filter((s) => s.correct).length;
    return (
      <main className="min-h-screen grid place-items-center px-4 py-12 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-gradient opacity-20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-brand-gradient opacity-15 blur-3xl" />
        <div className="glass rounded-2xl p-10 max-w-lg w-full text-center shadow-brand relative z-10">
          <div className="text-6xl mb-3">{qualified ? "🎉" : "😔"}</div>
          <h2 className={`text-3xl font-bold mb-2 ${qualified ? "text-green-400" : "text-red-400"}`}>
            {qualified ? "You Qualified!" : "Not Qualified"}
          </h2>
          <p className="text-muted-foreground mb-6">
            Score: <strong className="text-foreground">{correctCount}&nbsp;/&nbsp;{screening.questions.length}</strong>
            &nbsp;·&nbsp; Pass mark: {screening.passMark}
          </p>
          <div className="space-y-3 mb-8 text-left">
            {scores.map((s, i) => (
              <div key={i} className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm border ${
                s.correct ? "bg-green-500/10 border-green-500/25" : "bg-red-500/10 border-red-500/25"
              }`}>
                <span className="text-xl mt-0.5">{s.correct ? "✅" : "❌"}</span>
                <div>
                  <p className="font-medium">{screening.questions[i]?.display}</p>
                  <p className="text-xs text-muted-foreground mt-1">You said: &ldquo;{s.heard}&rdquo;</p>
                </div>
              </div>
            ))}
          </div>
          {qualified ? (
            <button
              onClick={() => navigate(examId === "coding" ? `/coding/${examId}` : `/exam/${examId}`)}
              className="h-12 w-full rounded-xl bg-brand-gradient text-white font-bold border-0 cursor-pointer hover:opacity-90 transition-all">
              Proceed to {exam.title} →
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => { setPhase("boot"); setScores([]); setQIndex(0); runningRef.current = false; runFlow(); }}
                className="h-12 w-full rounded-xl bg-brand-gradient text-white font-bold border-0 cursor-pointer hover:opacity-90 transition-all">
                🔄 Try Again
              </button>
              <button onClick={() => navigate("/dashboard")}
                className="h-11 w-full rounded-xl border border-border bg-transparent text-muted-foreground text-sm cursor-pointer hover:bg-muted/20 transition-all">
                ← Dashboard
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  // ─── MAIN UI ─────────────────────────────────────────────────────────────
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-gradient opacity-20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-brand-gradient opacity-15 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

      <header className="sticky top-0 z-20 glass border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Logo className="h-9" />
          <span className="text-sm text-muted-foreground">
            AI Screening&nbsp;·&nbsp;<span className="text-foreground font-medium">{exam.title}</span>
          </span>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-10 flex flex-col items-center gap-8">

        {/* Progress */}
        <div className="w-full">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Question {Math.min(qIndex + 1, screening.questions.length)}&nbsp;of&nbsp;{screening.questions.length}</span>
            <span>👤&nbsp;{candidate.name}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted/30">
            <div className="h-1.5 rounded-full bg-brand-gradient transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* AI Orb */}
        <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
          {[0, 1].map((i) => (
            <span key={i}
              className={`absolute rounded-full border-2 ${
                phase === "speaking"  ? "border-primary/50 animate-ping" :
                phase === "listening" ? "border-red-400/50 animate-ping" :
                "border-transparent"
              }`}
              style={{
                width: 172 + i * 30, height: 172 + i * 30,
                top: "50%", left: "50%",
                transform: "translate(-50%,-50%)",
                animationDelay: `${i * 0.45}s`,
                animationDuration: "1.6s",
              }}
            />
          ))}
          <div className={`relative z-10 h-36 w-36 rounded-full bg-brand-gradient flex items-center justify-center text-6xl shadow-brand transition-transform duration-300 select-none ${
            phase === "speaking"  ? "scale-110" :
            phase === "listening" ? "scale-105" : "scale-100"
          }`}>
            🤖
          </div>
        </div>

        {/* AI speech bubble */}
        {aiText && (
          <div className="glass w-full rounded-2xl px-6 py-4 shadow-brand border border-border">
            <p className="text-sm font-medium leading-relaxed text-center">{aiText}</p>
          </div>
        )}

        {/* Question card */}
        <div className="glass w-full rounded-2xl p-6 shadow-brand text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Question {qIndex + 1} / {screening.questions.length}
          </p>
          <p className="text-lg font-semibold leading-relaxed">{qObj.display}</p>

          <div className={`inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full text-sm font-medium border ${
            phase === "speaking"  ? "bg-primary/15 border-primary/30 text-primary" :
            phase === "listening" ? "bg-red-500/15 border-red-400/30 text-red-400" :
            phase === "feedback" && scores[scores.length - 1]?.correct
              ? "bg-green-500/15 border-green-400/30 text-green-400"
            : phase === "feedback"
              ? "bg-red-500/15 border-red-400/30 text-red-400"
            : "bg-muted/20 border-border text-muted-foreground"
          }`}>
            {phase === "boot"      ? "⏳ Preparing…" :
             phase === "speaking"  ? "🤖 AI is speaking…" :
             phase === "listening" ? "🔴 Listening — speak now" :
             phase === "feedback"  ? (scores[scores.length - 1]?.correct ? "✅ Correct!" : "❌ Incorrect") :
             ""}
          </div>
        </div>

        {/* Live transcript */}
        <div className={`w-full glass rounded-xl px-5 py-4 text-sm text-center min-h-[64px] leading-relaxed border transition-all ${
          transcript
            ? "text-foreground border-primary/25"
            : "text-muted-foreground italic border-border"
        }`}>
          {transcript || (isListening ? "Speak now… I'm listening 🎙️" : "Your answer will appear here")}
        </div>

        {/* Mic + countdown ring */}
        <div className="flex flex-col items-center gap-4 pb-6">

          {/* ring + button */}
          <div className="relative flex items-center justify-center" style={{ width: 112, height: 112 }}>
            <svg className="absolute inset-0" width="112" height="112"
              style={{ transform: "rotate(-90deg)" }} aria-hidden>
              <circle cx="56" cy="56" r={R} fill="none"
                stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
              {isListening && (
                <circle cx="56" cy="56" r={R} fill="none"
                  stroke={isLow ? "#ef4444" : "#6366f1"}
                  strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={CIRCUM}
                  strokeDashoffset={dashOff}
                  style={{ transition: "stroke-dashoffset 0.95s linear, stroke 0.5s" }}
                />
              )}
            </svg>

            <button
              onClick={() => isListening && submitAnswer()}
              disabled={!isListening}
              aria-label={isListening ? `Submit answer, ${fmt(timeLeft)} remaining` : "Waiting for AI"}
              className={`relative z-10 h-18 w-18 rounded-full border-0 flex items-center justify-center transition-all select-none
                ${ isListening
                  ? `text-3xl bg-red-500 cursor-pointer shadow-[0_0_32px_rgba(239,68,68,0.6)] hover:scale-105 ${ isLow ? "animate-pulse" : "" }`
                  : "text-3xl bg-muted/30 opacity-35 cursor-not-allowed"
                }`}
              style={{ width: 72, height: 72 }}
            >
              🎤
            </button>
          </div>

          {/* mm:ss countdown */}
          {isListening && (
            <span className={`text-4xl font-bold tabular-nums leading-none ${
              isLow ? "text-red-400" : "text-primary"
            }`}>
              {fmt(timeLeft)}
            </span>
          )}

          {/* helper */}
          <p className="text-xs text-muted-foreground text-center max-w-xs leading-relaxed">
            {isListening
              ? `🔴 Mic is active · speak freely · click 🎤 when done · auto-submits at 0:00`
              : phase === "speaking" ? "🤖 AI is speaking, please wait…"
              : phase === "feedback" ? "🤖 AI is giving feedback, next question coming…"
              : "⏳ Please wait…"}
          </p>
        </div>

      </div>
    </main>
  );
}
