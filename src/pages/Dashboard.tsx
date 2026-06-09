import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EXAMS } from "@/lib/exams";
import { getAttempts } from "@/lib/exam-attempts";

interface Candidate { name?: string; email: string; loginAt: number }

export default function Dashboard() {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [attemptedIds, setAttemptedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const raw = sessionStorage.getItem("xpay-candidate");
    if (!raw) { navigate("/login"); return; }
    const c: Candidate = JSON.parse(raw);
    setCandidate(c);
    setAttemptedIds(new Set(getAttempts(c.email).map((a) => a.examId)));
  }, [navigate]);

  const logout = () => {
    sessionStorage.removeItem("xpay-candidate");
    navigate("/login");
  };

  if (!candidate) return null;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 glass border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo className="h-9" />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {candidate.name ? `${candidate.name} · ` : ""}{candidate.email}
            </span>
            <Link to="/submissions"><Button variant="ghost" size="sm">Invigilator</Button></Link>
            <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="mb-10 overflow-hidden rounded-3xl bg-ink-gradient p-8 text-white shadow-brand sm:p-12 relative">
          <div className="relative z-10">
            <p className="text-sm uppercase tracking-widest text-white/70">Welcome back</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Choose your <span className="text-brand-gradient">XPay Assessment</span>
            </h1>
            <p className="mt-3 max-w-xl text-white/80">
              Each test can be attempted <strong>only once</strong>. Camera &amp; microphone
              access is required. Tab-switching, copy/paste and right-click are monitored.
            </p>
          </div>
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-brand-gradient opacity-40 blur-3xl" />
        </section>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {EXAMS.map((exam) => {
            const done   = attemptedIds.has(exam.id);
            // direct routing — no voice screening gate
            const target = exam.id === "coding" ? `/coding/${exam.id}` : `/exam/${exam.id}`;

            return (
              <Card key={exam.id} className={`relative overflow-hidden transition-smooth ${
                done ? "opacity-70" : "hover:shadow-brand hover:-translate-y-1"
              }`}>
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${exam.accent}`} />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="text-3xl">{exam.icon}</div>
                    <div className="flex flex-col items-end gap-1">
                      {done
                        ? <Badge variant="secondary">Attempted</Badge>
                        : <Badge className="bg-brand-gradient text-white border-0">Available</Badge>
                      }
                    </div>
                  </div>
                  <CardTitle className="mt-3 text-lg">{exam.title}</CardTitle>
                  <CardDescription>{exam.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-xs text-muted-foreground">
                    {exam.questions.length} questions · {exam.durationMin} min · Proctored
                  </p>
                  {done ? (
                    <Button disabled className="w-full" variant="secondary">Already submitted</Button>
                  ) : (
                    <Link to={target}>
                      <Button className="w-full bg-brand-gradient border-0 text-white font-semibold transition-smooth hover:opacity-95">
                        Start →
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>
      </main>
    </div>
  );
}
