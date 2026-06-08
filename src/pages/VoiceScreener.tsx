import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { getScreening, type VoiceQuestion } from "@/lib/voice-questions";
import { EXAMS } from "@/lib/exams";

type Stage = "intro" | "question" | "feedback" | "result";

interface ScoreEntry { correct: boolean; heard: string; }

// ── singleton mic permission (asked only once) ──
let micStream: MediaStream | null = null;
async function ensureMicPermission(): Promise<boolean> {
  if (micStream) return true;
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // stop tracks immediately — we just needed the permission grant
    micStream.getTracks().forEach((t) => t.stop());
    micStream = null; // allow re-use
    return true;
  } catch {
    return false;
  }
}

export default function VoiceScreener() {
  const { examId } = useParams<{ examId: string }>();
  const navigate    = useNavigate();
  const screening   = examId ? getScreening(examId) : null;
  const exam        = EXAMS.find((e) => e.id === examId);

  const [stage,       setStage]       = useState<Stage>("intro");
  const [qIndex,      setQIndex]      = useState(0);
  const [scores,      setScores]      = useState<ScoreEntry[]>([]);
  const [transcript,  setTranscript]  = useState("");
  const [statusText,  setStatusText]  = useState("");
  const [statusKind,  setStatusKind]  = useState<"idle"|"speaking"|"listening"|"correct"|"wrong">("idle");
  const [orbPulse,    setOrbPulse]    = useState<"idle"|"speaking"|"listening">("idle");
  const [micReady,    setMicReady]    = useState(false);
  const [permError,   setPermError]   = useState(false);
  const [qualified,   setQualified]   = useState(false);

  const recogRef   = useRef<SpeechRecognition | null>(null);
  const listeningRef = useRef(false);

  const candidate = (() => {
    try { return JSON.parse(sessionStorage.getItem("xpay-candidate") ?? ""); } catch { return null; }
  })();

  // ── redirect if no candidate or invalid exam ──
  useEffect(() => {
    if (!candidate) { navigate("/login"); return; }
    if (!screening || !exam) { navigate("/dashboard"); return; }
  }, []);

  // ── request mic permission ONCE on mount ──
  useEffect(() => {
    ensureMicPermission().then((ok) => {
      if (ok) { setMicReady(true); }
      else    { setPermError(true); }
    });
  }, []);

  // ── speech synthesis ──
  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang   = "en-US";
      utt.rate   = 0.92;
      utt.pitch  = 1.05;
      utt.volume = 1;
      const voices = window.speechSynthesis.getVoices();
      const v = voices.find((v) =>
        v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural"))
      ) || voices.find((v) => v.lang.startsWith("en"));
      if (v) utt.voice = v;
      utt.onstart = () => { setOrbPulse("speaking"); setStatusKind("speaking"); };
      utt.onend   = () => { setOrbPulse("idle");     resolve(); };
      utt.onerror = () => { setOrbPulse("idle");     resolve(); };
      window.speechSynthesis.speak(utt);
    });
  }, []);

  // ── speech recognition ──
  const listen = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) { resolve(""); return; }
      const rec = new SR() as SpeechRecognition;
      recogRef.current = rec;
      rec.lang = "en-US";
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      listeningRef.current = true;
      setOrbPulse("listening");
      setStatusKind("listening");
      setStatusText("🔴 Listening... speak now");
      setTranscript("");

      let final = "", interim = "";
      rec.onresult = (e) => {
        final = ""; interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) final += t; else interim += t;
        }
        setTranscript(final || interim);
      };
      rec.onend   = () => { listeningRef.current = false; setOrbPulse("idle"); resolve((final || interim).trim()); };
      rec.onerror = () => { listeningRef.current = false; setOrbPulse("idle"); resolve(final.trim()); };
      rec.start();
    });
  }, []);

  const stopListening = () => {
    if (recogRef.current && listeningRef.current) recogRef.current.stop();
  };

  function evaluate(q: VoiceQuestion, answer: string): boolean {
    const lower = answer.toLowerCase();
    return q.keywords.some((kw) => lower.includes(kw.toLowerCase()));
  }

  // ── main screening flow ──
  const runFlow = useCallback(async () => {
    if (!screening || !exam || !candidate) return;
    setStage("intro");

    // preload voices
    window.speechSynthesis.getVoices();
    await new Promise((r) => setTimeout(r, 300));

    setStatusText("🤖 AI is speaking...");
    setStatusKind("speaking");
    await speak(`Hello ${candidate.name}! ${screening.intro} You need at least ${screening.passMark} correct answers to qualify. Let's begin!`);

    const newScores: ScoreEntry[] = [];

    for (let i = 0; i < screening.questions.length; i++) {
      const q = screening.questions[i];
      setQIndex(i);
      setStage("question");
      setTranscript("");
      setStatusText("🤖 AI is speaking...");
      setStatusKind("speaking");
      await speak(q.speak);
      await new Promise((r) => setTimeout(r, 300));

      setStatusText("🔴 Your turn — speak your answer!");
      setStatusKind("listening");
      const answer = await listen();
      const heard  = answer || "(no answer heard)";
      setTranscript(heard);

      const correct = answer ? evaluate(q, answer) : false;
      newScores.push({ correct, heard });
      setScores([...newScores]);
      setStage("feedback");

      setStatusText(correct ? "✅ Correct!" : "❌ Incorrect");
      setStatusKind(correct ? "correct" : "wrong");
      await speak(correct ? `Correct! ${q.explanation}` : `Not quite. ${q.explanation}`);
      await new Promise((r) => setTimeout(r, 200));
    }

    const total  = newScores.filter((s) => s.correct).length;
    const passed = total >= screening.passMark;
    setQualified(passed);
    setStage("result");
    setStatusText("📊 Screening complete");
    setStatusKind("idle");

    if (passed) {
      await speak(`Congratulations ${candidate.name}! You scored ${total} out of ${screening.questions.length} and have qualified for the ${exam.title}. You may now proceed.`);
    } else {
      await speak(`Sorry ${candidate.name}. You scored ${total} out of ${screening.questions.length}. You need at least ${screening.passMark} correct to qualify. Please try again.`);
    }
  }, [screening, exam, candidate, speak, listen]);

  // start once mic is ready
  useEffect(() => {
    if (micReady && candidate && screening && exam) runFlow();
  }, [micReady]);

  if (!screening || !exam || !candidate) return null;

  const total   = scores.length;
  const correct = scores.filter((s) => s.correct).length;
  const pct     = screening.questions.length > 0
    ? ((qIndex + (stage === "result" ? 1 : 0)) / screening.questions.length) * 100
    : 0;

  // ── Permission Error ──
  if (permError) {
    return (
      <main className="relative min-h-screen grid place-items-center px-4">
        <div className="glass rounded-2xl p-10 max-w-md w-full text-center shadow-brand">
          <div className="text-5xl mb-4">🎤</div>
          <h2 className="text-xl font-bold mb-3">Microphone Access Required</h2>
          <p className="text-sm text-muted-foreground mb-6">
            The AI voice screener needs microphone access.<br />
            Please allow it in your browser and refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="h-11 w-full rounded-xl bg-brand-gradient text-white font-semibold"
          >
            Refresh & Try Again
          </button>
        </div>
      </main>
    );
  }

  // ── Result Screen ──
  if (stage === "result") {
    return (
      <main className="relative min-h-screen grid place-items-center px-4 py-12">
        <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-gradient opacity-20 blur-3xl" />
        <div className="glass rounded-2xl p-10 max-w-lg w-full text-center shadow-brand">
          <div className="text-6xl mb-4">{qualified ? "🎉" : "😔"}</div>
          <h2 className={`text-3xl font-bold mb-2 ${qualified ? "text-green-400" : "text-red-400"}`}>
            {qualified ? "You Qualified!" : "Not Qualified"}
          </h2>
          <p className="text-muted-foreground mb-6">
            Score: <strong className="text-foreground">{correct} / {screening.questions.length}</strong>
            &nbsp;·&nbsp; Pass mark: {screening.passMark}
          </p>

          <div className="space-y-3 mb-8 text-left">
            {scores.map((s, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${
                  s.correct
                    ? "bg-green-500/10 border border-green-500/25"
                    : "bg-red-500/10 border border-red-500/25"
                }`}
              >
                <span className="text-lg mt-0.5">{s.correct ? "✅" : "❌"}</span>
                <div>
                  <p className="font-medium">{screening.questions[i].display}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">You said: "{s.heard}"</p>
                </div>
              </div>
            ))}
          </div>

          {qualified ? (
            <button
              onClick={() => {
                const target = examId === "coding" ? `/coding/${examId}` : `/exam/${examId}`;
                navigate(target);
              }}
              className="h-12 w-full rounded-xl bg-brand-gradient text-white font-bold text-base border-0 hover:opacity-90 transition-all"
            >
              Proceed to {exam.title} →
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => { setStage("intro"); setScores([]); setQIndex(0); runFlow(); }}
                className="h-12 w-full rounded-xl bg-brand-gradient text-white font-bold text-base border-0 hover:opacity-90 transition-all"
              >
                🔄 Try Again
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="h-11 w-full rounded-xl border border-border bg-transparent text-muted-foreground text-sm hover:bg-muted/20 transition-all"
              >
                ← Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  const q = screening.questions[qIndex] ?? screening.questions[0];

  // ── Main Voice Screen ──
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-gradient opacity-20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-brand-gradient opacity-15 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

      {/* Header */}
      <header className="sticky top-0 z-20 glass border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Logo className="h-9" />
          <div className="text-sm text-muted-foreground">
            AI Voice Screening &nbsp;·&nbsp; <span className="text-foreground font-medium">{exam.title}</span>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-10 flex flex-col items-center gap-8">

        {/* Progress */}
        <div className="w-full">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Question {Math.min(qIndex + 1, screening.questions.length)} of {screening.questions.length}</span>
            <span>👤 {candidate.name}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted/30">
            <div
              className="h-1.5 rounded-full bg-brand-gradient transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* AI Orb */}
        <div className="relative flex items-center justify-center">
          {/* rings */}
          {[0, 1].map((i) => (
            <span
              key={i}
              className={`absolute rounded-full border-2 ${
                orbPulse === "speaking" ? "border-primary/40 animate-ping" :
                orbPulse === "listening" ? "border-red-400/40 animate-ping" :
                "border-primary/10"
              }`}
              style={{
                width:  `${180 + i * 30}px`,
                height: `${180 + i * 30}px`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: "1.6s",
              }}
            />
          ))}
          <div
            className={`relative z-10 h-36 w-36 rounded-full bg-brand-gradient flex items-center justify-center text-6xl shadow-brand transition-transform duration-300 ${
              orbPulse === "speaking" ? "scale-110" :
              orbPulse === "listening" ? "scale-105" : "scale-100"
            }`}
          >
            🤖
          </div>
        </div>

        {/* Question Card */}
        <div className="glass w-full rounded-2xl p-6 shadow-brand text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Question {qIndex + 1} / {screening.questions.length}
          </p>
          <p className="text-lg font-semibold leading-relaxed">{q.display}</p>

          {/* Status badge */}
          <div className={`inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full text-sm font-medium border ${
            statusKind === "speaking"  ? "bg-primary/15 border-primary/30 text-primary" :
            statusKind === "listening" ? "bg-red-500/15 border-red-400/30 text-red-400" :
            statusKind === "correct"   ? "bg-green-500/15 border-green-400/30 text-green-400" :
            statusKind === "wrong"     ? "bg-red-500/15 border-red-400/30 text-red-400" :
            "bg-muted/20 border-border text-muted-foreground"
          }`}>
            {statusText || "⏳ Getting ready..."}
          </div>
        </div>

        {/* Transcript */}
        <div className={`w-full glass rounded-xl px-5 py-4 text-sm text-center min-h-[52px] transition-all ${
          transcript ? "text-foreground" : "text-muted-foreground italic"
        }`}>
          {transcript || "Your spoken answer will appear here..."}
        </div>

        {/* Mic button */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={stopListening}
            disabled={!listeningRef.current}
            className={`h-16 w-16 rounded-full border-0 text-2xl flex items-center justify-center transition-all ${
              listeningRef.current
                ? "bg-red-500 shadow-[0_0_32px_rgba(239,68,68,0.6)] scale-110 animate-pulse cursor-pointer"
                : "bg-muted/30 opacity-40 cursor-not-allowed"
            }`}
          >
            🎤
          </button>
          <span className="text-xs text-muted-foreground">
            {listeningRef.current ? "🔴 Listening — click to stop" : "Wait for AI to finish..."}
          </span>
        </div>

      </div>
    </main>
  );
}
