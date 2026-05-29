import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EXAM_QUESTIONS } from "@/lib/exam-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | XPay Exam Portal" },
      { name: "description", content: "Your candidate dashboard for upcoming and past exams." },
    ],
  }),
  component: Dashboard,
});

interface Candidate { email: string; loginAt: number }

function Dashboard() {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("xpay-candidate");
    if (!raw) { navigate({ to: "/login" }); return; }
    setCandidate(JSON.parse(raw));
  }, [navigate]);

  const logout = () => {
    sessionStorage.removeItem("xpay-candidate");
    navigate({ to: "/login" });
  };

  if (!candidate) return null;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 glass border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo className="h-9" />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{candidate.email}</span>
            <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="mb-10 overflow-hidden rounded-3xl bg-ink-gradient p-8 text-white shadow-brand sm:p-12">
          <div className="relative z-10">
            <p className="text-sm uppercase tracking-widest text-white/70">Welcome back</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Ready for your <span className="text-brand-gradient">XPay Assessment</span>?
            </h1>
            <p className="mt-3 max-w-xl text-white/80">
              The exam runs in a secure proctored mode. Tab-switching, copy/paste and right-click
              are monitored. Make sure you're in a quiet space before starting.
            </p>
          </div>
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-brand-gradient opacity-40 blur-3xl" />
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 transition-smooth hover:shadow-brand">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="mb-2 bg-brand-gradient text-white border-0">Available now</Badge>
                  <CardTitle className="text-2xl">XPay General Aptitude — MCQ</CardTitle>
                  <CardDescription>10 questions · 10 minutes · Proctored</CardDescription>
                </div>
                <span className="hidden sm:inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                  Anti-cheat ON
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="mb-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <li>• {EXAM_QUESTIONS.length} multiple choice questions</li>
                <li>• Fullscreen enforced during exam</li>
                <li>• Tab-switch detection</li>
                <li>• Copy / paste & right-click blocked</li>
              </ul>
              <Link to="/exam">
                <Button className="bg-brand-gradient border-0 text-white font-semibold h-11 px-6 transition-smooth hover:opacity-95 hover:shadow-brand">
                  Start Exam →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="transition-smooth hover:shadow-brand">
            <CardHeader>
              <CardTitle className="text-lg">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium break-all">{candidate.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Session started</p>
                <p className="font-medium">{new Date(candidate.loginAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <span className="inline-flex items-center gap-2 font-medium">
                  <span className="inline-block h-2 w-2 rounded-full bg-[var(--brand-green)] animate-pulse-glow" />
                  Verified
                </span>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
