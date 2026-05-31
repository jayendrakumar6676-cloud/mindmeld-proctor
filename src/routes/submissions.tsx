// Invigilator-only page (gated by a simple PIN stored client-side).
// Lists every coding submission saved on this device so you can review code + per-test results.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { listAllCandidates, getCodingSubmissions } from "@/lib/coding-submissions";
import { getCodingQuestion, SUPPORTED_LANGUAGES } from "@/lib/coding-questions";

const INVIGILATOR_PIN = "xpay-2026"; // change to whatever you want

export const Route = createFileRoute("/submissions")({
  head: () => ({ meta: [{ title: "Submissions | XPay Invigilator" }] }),
  component: SubmissionsPage,
});

function SubmissionsPage() {
  const [pin, setPin] = useState("");
  const [ok, setOk] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  if (!ok) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <Card className="max-w-sm w-full glass shadow-brand">
          <CardContent className="p-8">
            <Logo className="mx-auto h-12" />
            <h1 className="mt-6 text-center text-xl font-bold text-brand-gradient">Invigilator Access</h1>
            <Input
              type="password" value={pin} onChange={(e) => setPin(e.target.value)}
              placeholder="Enter invigilator PIN" className="mt-6"
            />
            <Button
              onClick={() => pin === INVIGILATOR_PIN ? setOk(true) : alert("Wrong PIN")}
              className="mt-3 w-full bg-brand-gradient text-white border-0"
            >Unlock</Button>
            <Link to="/dashboard"><Button variant="ghost" className="mt-2 w-full">Back</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const candidates = listAllCandidates();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 glass border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo className="h-9" />
          <div className="flex items-center gap-2">
            <Badge>Invigilator Mode</Badge>
            <Link to="/dashboard"><Button variant="outline" size="sm">Exit</Button></Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-bold">Coding Submissions ({candidates.length} candidate{candidates.length !== 1 && "s"})</h1>
        <p className="text-sm text-muted-foreground">
          Submissions are stored in this browser's localStorage. View one to see code + per-test results.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-[280px,1fr]">
          <Card>
            <CardContent className="p-3">
              {candidates.length === 0 && <p className="p-3 text-sm text-muted-foreground">No submissions yet.</p>}
              {candidates.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelected(c)}
                  className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-smooth ${
                    selected === c ? "bg-brand-gradient text-white" : "hover:bg-accent"
                  }`}
                >{c}</button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              {!selected && <p className="text-sm text-muted-foreground">Select a candidate to review submissions.</p>}
              {selected && getCodingSubmissions(selected).map((sub) => (
                <div key={sub.examId + sub.submittedAt} className="mb-6 rounded-xl border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-bold">{sub.examId}</h2>
                    <div className="text-xs text-muted-foreground">
                      {new Date(sub.submittedAt).toLocaleString()} · ⚠ {sub.violations} violations
                    </div>
                  </div>
                  <div className="mt-1 text-sm">
                    Score: <strong className="text-brand-gradient">{sub.totalMarks.toFixed(2)} / {sub.totalPossible}</strong>
                  </div>
                  {sub.results.map((r) => {
                    const q = getCodingQuestion(r.questionId);
                    const lang = SUPPORTED_LANGUAGES.find((l) => l.id === r.language);
                    return (
                      <details key={r.questionId} className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
                        <summary className="cursor-pointer font-semibold">
                          {q?.title ?? r.questionId} — {r.passed}/{r.total} tests · {r.marksEarned}/{q?.marks ?? "?"} marks · {lang?.label ?? r.language}
                        </summary>
                        <pre className="mt-3 max-h-72 overflow-auto rounded-md bg-[#0b1020] p-3 font-mono text-xs text-green-100">{r.code}</pre>
                        <div className="mt-3 grid gap-2">
                          {r.perCase.map((p, i) => (
                            <div key={i} className={`rounded-md border p-2 text-xs font-mono ${p.passed ? "border-emerald-500/40 bg-emerald-500/5" : "border-red-500/40 bg-red-500/5"}`}>
                              <div className="font-sans font-semibold">
                                Test {i + 1} {p.hidden && <Badge variant="secondary" className="ml-1">hidden</Badge>} — {p.passed ? "✅ pass" : "❌ fail"}
                              </div>
                              <div className="mt-1 text-muted-foreground">expected</div>
                              <pre className="whitespace-pre-wrap">{p.expected}</pre>
                              <div className="mt-1 text-muted-foreground">got</div>
                              <pre className="whitespace-pre-wrap">{p.stdout || "(empty)"}</pre>
                              {p.stderr && (<>
                                <div className="mt-1 text-muted-foreground">stderr</div>
                                <pre className="whitespace-pre-wrap text-red-500">{p.stderr}</pre>
                              </>)}
                            </div>
                          ))}
                        </div>
                      </details>
                    );
                  })}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
