import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login | XPay Exam Portal" },
      { name: "description", content: "Sign in to the XPay exam portal to start your assessment." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || password.length < 4) {
      setErr("Enter a valid email and a password of 4+ characters.");
      return;
    }
    sessionStorage.setItem(
      "xpay-candidate",
      JSON.stringify({ email: email.trim(), loginAt: Date.now() })
    );
    navigate({ to: "/dashboard" });
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-gradient opacity-30 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-brand-gradient opacity-25 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />

      <div className="relative z-10 grid min-h-screen place-items-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo className="h-14" />
            <h1 className="mt-6 text-3xl font-bold tracking-tight">
              <span className="text-brand-gradient">Exam Portal</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to start your secure assessment.
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="glass rounded-2xl p-8 shadow-brand"
          >
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Candidate Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Access Code</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                />
              </div>

              {err && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {err}
                </p>
              )}

              <Button
                type="submit"
                className="h-11 w-full bg-brand-gradient text-white font-semibold transition-smooth hover:opacity-95 hover:shadow-brand border-0"
              >
                Sign in & Continue
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By signing in you agree to the exam integrity policy.
              </p>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Need help? <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">Contact your invigilator</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
