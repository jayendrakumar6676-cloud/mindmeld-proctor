/**
 * VoiceScreener — Advanced AI Voice Interviewer
 *
 * ACCURACY FEATURES:
 * - 2 attempts per question (hint given after first wrong answer)
 * - Advanced evaluator (keywords + spokenVariants + negativeKeywords + normalisation)
 * - AI confirms what it heard before evaluating (builds candidate trust)
 * - Encouragement messages to reduce candidate anxiety
 * - MediaStream kept alive for entire session (fixes Chrome mic permission)
 * - Rolling-restart SpeechRecognition (handles Chrome auto-stop after 8s silence)
 * - startRecRef pattern eliminates ALL stale-closure bugs
 */
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { EXAMS } from "@/lib/exams";
import { evaluateAnswer, getScreening, type VoiceQuestion } from "@/lib/voice-questions";

// ─── TTS ──────────────────────────────────────────────────────────────────
function speakText(text: string): Promise<void> {
  return new Promise((resolve) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US"; u.rate = 0.88; u.pitch = 1.05; u.volume = 1;
    const vs = window.speechSynthesis.getVoices();
    u.voice =
      vs.find((v) => v.lang.startsWith("en") && /Google|Natural|Neural/i.test(v.name)) ??
      vs.find((v) => v.lang.startsWith("en")) ?? null;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

function waitVoices(): Promise<void> {
  return new Promise((r) => {
    if (window.speechSynthesis.getVoices().length) { r(); return; }
    const cb = () => { window.speechSynthesis.removeEventListener("voiceschanged", cb); r(); };
    window.speechSynthesis.addEventListener("voiceschanged", cb);
    setTimeout(r, 2500);
  });
}

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
function fmtTime(s: number) { return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`; }

const LISTEN_SEC = 120;
const ATTEMPTS   = 2; // attempts per question before moving on

type Phase = "idle" | "starting" | "speaking" | "listening" | "feedback" | "result";

// ─────────────────────────────────────────────────────────────────────────────
export default function VoiceScreener() {
  const { examId } = useParams<{ examId: string }>();
  const navigate   = useNavigate();
  const screening  = examId ? getScreening(examId) : null;
  const exam       = EXAMS.find((e) => e.id === examId);

  // UI state
  const [phase,      setPhase]      = useState<Phase>("idle");
  const [qIndex,     setQIndex]     = useState(0);
  const [attempt,    setAttempt]    = useState(1);  // 1 or 2
  const [transcript, setTranscript] = useState("");
  const [aiText,     setAiText]     = useState("");
  const [timeLeft,   setTimeLeft]   = useState(LISTEN_SEC);
  const [scores,     setScores]     = useState<{ correct: boolean; heard: string; attempts: number }[]>([]);
  const [qualified,  setQualified]  = useState(false);
  const [permErr,    setPermErr]    = useState("");

  // refs
  const streamRef    = useRef<MediaStream | null>(null);
  const recRef       = useRef<SpeechRecognition | null>(null);
  const submittedRef = useRef(true);
  const resolveRef   = useRef<((s: string) => void) | null>(null);
  const accumRef     = useRef("");
  const interimRef   = useRef("");
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);
  const countRef     = useRef(LISTEN_SEC);
  const runningRef   = useRef(false);
  const phaseRef     = useRef<Phase>("idle");

  function goPhase(p: Phase) { phaseRef.current = p; setPhase(p); }

  const candidate = (() => {
    try { return JSON.parse(sessionStorage.getItem("xpay-candidate") ?? "{}"); }
    catch { return null; }
  })();

  useEffect(() => {
    if (!candidate?.email) { navigate("/login"); return; }
    if (!screening || !exam) { navigate("/dashboard"); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => {
    window.speechSynthesis.cancel();
    killRec();
    closeStream();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function closeStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function killRec() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (recRef.current) { try { recRef.current.abort(); } catch {} recRef.current = null; }
  }

  function submitAnswer() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    killRec();
    goPhase("feedback");
    const answer = (accumRef.current + (interimRef.current ? " " + interimRef.current : "")).trim();
    setTranscript(answer || "(no answer)");
    resolveRef.current?.(answer);
    resolveRef.current = null;
  }

  // startRecRef — always latest, no stale closures
  const startRecRef = useRef<() => void>(() => {});
  startRecRef.current = function startRec() {
    if (submittedRef.current) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setPermErr("SpeechRecognition not supported. Please use Chrome or Edge."); return; }

    const rec: SpeechRecognition = new SR();
    rec.lang = "en-US"; rec.interimResults = true; rec.maxAlternatives = 3; rec.continuous = false;
    recRef.current = rec;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let fin = "", intr = "";
      for (let i = 0; i < e.results.length; i++) {
        // use the highest-confidence alternative
        if (e.results[i].isFinal) {
          let best = ""; let bestConf = 0;
          for (let a = 0; a < e.results[i].length; a++) {
            if (e.results[i][a].confidence >= bestConf) {
              bestConf = e.results[i][a].confidence;
              best = e.results[i][a].transcript;
            }
          }
          fin += best;
        } else {
          intr += e.results[i][0].transcript;
        }
      }
      if (fin) accumRef.current += (accumRef.current ? " " : "") + fin;
      interimRef.current = intr;
      setTranscript((accumRef.current + (intr ? " " + intr : "")).trim());
    };

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      recRef.current = null;
      if (e.error === "aborted") return;
      if (e.error === "not-allowed") {
        setPermErr("Microphone permission denied. Please allow mic access and refresh.");
        submittedRef.current = true; return;
      }
      if (!submittedRef.current) setTimeout(() => startRecRef.current(), 400);
    };

    rec.onend = () => {
      recRef.current = null;
      if (!submittedRef.current) setTimeout(() => startRecRef.current(), 300);
    };

    try { rec.start(); }
    catch { if (!submittedRef.current) setTimeout(() => startRecRef.current(), 500); }
  };

  function listenForAnswer(): Promise<string> {
    return new Promise((resolve) => {
      submittedRef.current = false;
      resolveRef.current   = resolve;
      accumRef.current     = "";
      interimRef.current   = "";
      setTranscript("");
      goPhase("listening");
      startRecRef.current();
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
  }

  // ─── MAIN FLOW ────────────────────────────────────────────────────────────
  async function runFlow() {
    if (!screening || !exam || !candidate || runningRef.current) return;
    runningRef.current = true;

    goPhase("starting");
    setAiText("⏳ Requesting microphone access…");

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err: any) {
      setPermErr(
        err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError"
          ? "Microphone permission denied. Please allow mic access in your browser settings, then refresh."
          : "Could not access microphone. Please check your device and refresh."
      );
      runningRef.current = false;
      return;
    }

    await waitVoices();
    await delay(300);

    // Intro
    goPhase("speaking");
    setAiText("🤖 AI is speaking…");
    await speakText(
      `Hello ${candidate.name}! ${screening.intro} ` +
      `You need ${screening.passMark} correct answers to qualify. ` +
      `You have 2 minutes per question, and you will get 2 attempts if you get one wrong. ` +
      `Speak clearly and take your time. Let's begin!`
    );

    const newScores: { correct: boolean; heard: string; attempts: number }[] = [];

    for (let i = 0; i < screening.questions.length; i++) {
      const q = screening.questions[i];
      setQIndex(i);
      setTranscript("");

      let finalCorrect = false;
      let finalHeard   = "";
      let totalAttempts = 0;

      for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
        totalAttempts = attempt;
        setAttempt(attempt);

        // AI reads question (re-read on second attempt too)
        goPhase("speaking");
        if (attempt === 1) {
          setAiText(`🤖 Question ${i + 1} of ${screening.questions.length}: ${q.display}`);
          await speakText(q.speak);
        } else {
          setAiText(`🤖 Let's try again. Question ${i + 1}: ${q.display}`);
          await speakText(`Let me repeat the question. ${q.speak}`);
        }

        await delay(800);

        // Set hint in AI bubble while listening
        setAiText(`🔴 Listening… speak your answer. You have 2 minutes.`);

        // Listen
        const answer = await listenForAnswer();
        finalHeard = answer || "(no answer)";
        setTranscript(finalHeard);

        await delay(400);

        // Confirm what AI heard
        goPhase("feedback");
        if (answer.trim()) {
          const heardMsg = `I heard you say: ${answer.trim().slice(0, 120)}.`;
          setAiText(`🤖 ${heardMsg}`);
          await speakText(heardMsg);
          await delay(400);
        }

        // Evaluate
        const correct = evaluateAnswer(q, answer);

        if (correct) {
          finalCorrect = true;
          const praise = attempt === 1
            ? ["Excellent!", "Great job!", "Perfect!", "Well done!"][i % 4]
            : "Correct on the second try!";
          setAiText(`✅ ${praise} ${q.explanation}`);
          await speakText(`${praise} ${q.explanation}`);
          break; // no need for second attempt
        } else {
          if (attempt < ATTEMPTS) {
            // First wrong — give hint, allow retry
            setAiText(`❌ Not quite. Here's a hint: ${q.hint}`);
            await speakText(`Not quite. Here's a hint: ${q.hint} Try again.`);
            await delay(500);
          } else {
            // Second wrong — give explanation
            setAiText(`❌ The answer is: ${q.explanation}`);
            await speakText(`That's not right. ${q.explanation}`);
          }
        }
      }

      newScores.push({ correct: finalCorrect, heard: finalHeard, attempts: totalAttempts });
      setScores([...newScores]);
      await delay(500);
    }

    // Result
    const total  = newScores.filter((s) => s.correct).length;
    const passed = total >= screening.passMark;
    setQualified(passed);
    closeStream();
    goPhase("result");

    const msg = passed
      ? `Congratulations ${candidate.name}! You scored ${total} out of ${screening.questions.length} and qualified for ${exam.title}. You may now proceed.`
      : `You scored ${total} out of ${screening.questions.length}. You need ${screening.passMark} to qualify. Don't give up, ${candidate.name} — try again!`;
    setAiText(msg);
    await speakText(msg);
    runningRef.current = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  if (!screening || !exam || !candidate) return null;

  const qObj        = screening.questions[Math.min(qIndex, screening.questions.length - 1)];
  const pct         = phase === "result" ? 100 : (qIndex / screening.questions.length) * 100;
  const R           = 40;
  const CIRCUM      = 2 * Math.PI * R;
  const dashOff     = CIRCUM * (1 - timeLeft / LISTEN_SEC);
  const isListening = phase === "listening";
  const isLow       = timeLeft <= 30;

  // ── PERM ERROR ────────────────────────────────────────────────────────────
  if (permErr) return (
    <main className="min-h-screen grid place-items-center px-4">
      <div className="glass rounded-2xl p-10 max-w-md w-full text-center shadow-brand">
        <div className="text-5xl mb-4">🎤</div>
        <h2 className="text-xl font-bold mb-2">Microphone Required</h2>
        <p className="text-sm text-muted-foreground mb-5">{permErr}</p>
        <button onClick={() => window.location.reload()}
          className="h-11 w-full rounded-xl bg-brand-gradient text-white font-semibold border-0 cursor-pointer">
          Refresh &amp; Retry
        </button>
      </div>
    </main>
  );

  // ── IDLE (Start gate) ──────────────────────────────────────────────────────
  if (phase === "idle") return (
    <main className="min-h-screen grid place-items-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-gradient opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-brand-gradient opacity-15 blur-3xl" />
      <div className="glass rounded-2xl p-10 max-w-md w-full text-center shadow-brand relative z-10">
        <div className="text-6xl mb-4">🤖</div>
        <h2 className="text-2xl font-bold mb-1">AI Voice Screening</h2>
        <p className="font-medium text-primary mb-1">{exam.title}</p>
        <p className="text-muted-foreground text-sm mb-6">
          {screening.questions.length} questions &middot; {screening.passMark} correct to qualify &middot; 2 attempts each
        </p>
        <div className="glass rounded-xl p-4 mb-6 text-xs text-left space-y-2 border border-border">
          <p>🎤 Microphone enabled when you click Start</p>
          <p>🔇 Find a quiet place, speak clearly and naturally</p>
          <p>⏱ 2 minutes per question</p>
          <p>🔁 You get 2 attempts per question — a hint is given after wrong answer</p>
          <p>🔴 Click the mic button to submit your answer early</p>
        </div>
        <button onClick={runFlow}
          className="h-12 w-full rounded-xl bg-brand-gradient text-white font-bold border-0 cursor-pointer hover:opacity-90 transition-all text-base">
          🎤 Start Screening
        </button>
      </div>
    </main>
  );

  // ── RESULT ──────────────────────────────────────────────────────────────────
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
            &nbsp;&middot;&nbsp;Pass mark: {screening.passMark}
          </p>
          <div className="space-y-3 mb-8 text-left">
            {scores.map((s, i) => (
              <div key={i} className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm border ${
                s.correct ? "bg-green-500/10 border-green-500/25" : "bg-red-500/10 border-red-500/25"
              }`}>
                <span className="text-xl mt-0.5">{s.correct ? "✅" : "❌"}</span>
                <div>
                  <p className="font-medium">{screening.questions[i]?.display}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    You said: &ldquo;{s.heard}&rdquo;
                    {s.attempts > 1 && (
                      <span className="ml-2 text-yellow-400">(took {s.attempts} attempts)</span>
                    )}
                  </p>
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
              <button onClick={() => {
                setScores([]); setQIndex(0); setAttempt(1); setTranscript(""); setAiText("");
                runningRef.current = false; goPhase("idle");
              }}
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

  // ── MAIN SCREENING UI ───────────────────────────────────────────────────────
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-gradient opacity-20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-brand-gradient opacity-15 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

      <header className="sticky top-0 z-20 glass border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Logo className="h-9" />
          <span className="text-sm text-muted-foreground">
            AI Screening&nbsp;&middot;&nbsp;<span className="text-foreground font-medium">{exam.title}</span>
          </span>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-10 flex flex-col items-center gap-7">

        {/* Progress */}
        <div className="w-full">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>
              Question {Math.min(qIndex + 1, screening.questions.length)}&nbsp;of&nbsp;{screening.questions.length}
              {phase === "listening" && attempt === 2 && (
                <span className="ml-2 text-yellow-400 font-medium">(Attempt 2 of 2)</span>
              )}
            </span>
            <span>👤&nbsp;{candidate.name}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted/30">
            <div className="h-1.5 rounded-full bg-brand-gradient transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* AI Orb */}
        <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
          {[0, 1].map((i) => (
            <span key={i}
              className={`absolute rounded-full border-2 ${
                phase === "speaking"  ? "border-primary/50 animate-ping" :
                phase === "listening" ? "border-red-400/50 animate-ping" :
                "border-transparent"
              }`}
              style={{
                width: 160 + i * 28, height: 160 + i * 28,
                top: "50%", left: "50%",
                transform: "translate(-50%,-50%)",
                animationDelay: `${i * 0.45}s`,
                animationDuration: "1.6s",
              }}
            />
          ))}
          <div className={`relative z-10 h-32 w-32 rounded-full bg-brand-gradient
            flex items-center justify-center text-5xl shadow-brand select-none
            transition-transform duration-300
            ${ phase === "speaking" ? "scale-110" : phase === "listening" ? "scale-105" : "scale-100" }`}>
            🤖
          </div>
        </div>

        {/* AI bubble */}
        {aiText && (
          <div className="glass w-full rounded-2xl px-6 py-4 border border-border shadow-brand">
            <p className="text-sm font-medium leading-relaxed text-center">{aiText}</p>
          </div>
        )}

        {/* Question card */}
        <div className="glass w-full rounded-2xl p-6 shadow-brand text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Question {qIndex + 1} / {screening.questions.length}
          </p>
          <p className="text-lg font-semibold leading-relaxed">{qObj.display}</p>

          <span className={`inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full text-sm font-medium border ${
            phase === "starting"  ? "bg-muted/20 border-border text-muted-foreground" :
            phase === "speaking"  ? "bg-primary/15 border-primary/30 text-primary" :
            phase === "listening" ? "bg-red-500/15 border-red-400/30 text-red-400" :
            phase === "feedback" && scores[scores.length - 1]?.correct
              ? "bg-green-500/15 border-green-400/30 text-green-400"
            : phase === "feedback"
              ? "bg-orange-500/15 border-orange-400/30 text-orange-400"
            : "bg-muted/20 border-border text-muted-foreground"
          }`}>
            {{
              starting:  "⏳ Starting…",
              speaking:  "🤖 AI speaking…",
              listening: "🔴 Listening — speak now",
              feedback:  scores[scores.length - 1]?.correct ? "✅ Correct!" : "💡 Hint coming…",
              result:    "",
              idle:      "",
            }[phase]}
          </span>
        </div>

        {/* Live transcript */}
        <div className={`w-full glass rounded-xl px-5 py-4 text-sm text-center
          min-h-[64px] leading-relaxed border transition-all ${
          transcript ? "text-foreground border-primary/25" : "text-muted-foreground italic border-border"
        }`}>
          {transcript || (isListening ? "Speak now… I'm listening 🎙️" : "Your answer will appear here…")}
        </div>

        {/* Mic + ring */}
        <div className="flex flex-col items-center gap-3 pb-8">
          <div className="relative flex items-center justify-center" style={{ width: 112, height: 112 }}>
            <svg className="absolute inset-0" width="112" height="112"
              style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
              <circle cx="56" cy="56" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
              {isListening && (
                <circle cx="56" cy="56" r={R} fill="none"
                  stroke={isLow ? "#ef4444" : "#6366f1"}
                  strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={CIRCUM} strokeDashoffset={dashOff}
                  style={{ transition: "stroke-dashoffset 0.95s linear, stroke 0.5s" }}
                />
              )}
            </svg>
            <button
              onClick={() => { if (isListening) submitAnswer(); }}
              disabled={!isListening}
              aria-label={isListening ? `Submit answer, ${fmtTime(timeLeft)} remaining` : "Waiting for AI"}
              style={{ width: 72, height: 72 }}
              className={`relative z-10 rounded-full border-0 flex items-center justify-center
                text-3xl transition-all select-none
                ${ isListening
                  ? `bg-red-500 cursor-pointer shadow-[0_0_32px_rgba(239,68,68,0.6)] hover:scale-105 active:scale-95 ${ isLow ? "animate-pulse" : "" }`
                  : "bg-muted/30 opacity-35 cursor-not-allowed"
                }`}
            >
              🎤
            </button>
          </div>

          {isListening && (
            <span className={`text-4xl font-bold tabular-nums ${
              isLow ? "text-red-400" : "text-primary"
            }`}>
              {fmtTime(timeLeft)}
            </span>
          )}

          <p className="text-xs text-muted-foreground text-center max-w-xs leading-relaxed">
            {isListening
              ? `🔴 Mic active · speak your answer · click 🎤 to submit early`
              : phase === "speaking"  ? "🤖 AI is speaking, please wait…"
              : phase === "feedback"  ? "🤖 Feedback playing…"
              : phase === "starting"  ? "⏳ Starting…"
              : ""}
          </p>
        </div>

      </div>
    </main>
  );
}
