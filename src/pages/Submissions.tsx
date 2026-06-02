// Invigilator-only page. Lists every submission saved on this laptop
// via the local Express server (./submissions/<exam>/<file>.json).
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { listSubmissions, getSubmission, type ServerSubmissionListItem, type ServerSubmission } from "@/lib/api";

const INVIGILATOR_PIN = "xpay-2026";

export default function SubmissionsPage() {
  const [pin, setPin] = useState("");
  const [ok, setOk] = useState(false);
  const [items, setItems] = useState<ServerSubmissionListItem[]>([]);
  const [serverDown, setServerDown] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<ServerSubmission | null>(null);
  const [filter, setFilter] = useState("");

  const refresh = async () => {
    const res = await fetch("/api/health").catch(() => null);
    if (!res || !res.ok) { setServerDown(true); setItems([]); return; }
    setServerDown(false);
    setItems(await listSubmissions());
  };

  useEffect(() => { if (ok) refresh(); }, [ok]);

  useEffect(() => {
    if (!selected) { setDetail(null); return; }
    getSubmission(selected).then(setDetail);
  }, [selected]);

  if (!ok) {
    return (
      <div className="grid min-h-screen place-items-center px-4">
        <Card className="max-w-sm w-full glass shadow-brand">
          <CardContent className="p-8">
            <Logo className="mx-auto h-12" />
            <h1 className="mt-6 text-center text-xl font-bold text-brand-gradient">Invigilator Access</h1>
            <Input type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Enter invigilator PIN" className="mt-6"
              onKeyDown={(e) => { if (e.key === "Enter") pin === INVIGILATOR_PIN ? setOk(true) : alert("Wrong PIN"); }} />
            <Button onClick={() => pin === INVIGILATOR_PIN ? setOk(true) : alert("Wrong PIN")}
              className="mt-3 w-full bg-brand-gradient text-white border-0">Unlock</Button>
            <Link to="/login"><Button variant="ghost" className="mt-2 w-full">Back</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filtered = items.filter((it) =>
    !filter || it.candidateEmail.toLowerCase().includes(filter.toLowerCase())
    || (it.candidateName || "").toLowerCase().includes(filter.toLowerCase())
    || it.examId.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 glass border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo className="h-9" />
          <div className="flex items-center gap-2">
            <Badge>Invigilator Mode</Badge>
            <Button variant="outline" size="sm" onClick={refresh}>Refresh</Button>
            <Link to="/login"><Button variant="ghost" size="sm">Exit</Button></Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-bold">All Submissions</h1>
        <p className="text-sm text-muted-foreground">
          Saved on this laptop in <code>./submissions/</code>. {items.length} total.
        </p>

        {serverDown && (
          <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            ⚠ Local submissions server (port 8787) is not running. Start it with <code>npm run dev</code> in VS Code.
          </div>
        )}

        <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter by name, email or exam…" className="mt-4 max-w-md" />

        <div className="mt-6 grid gap-4 md:grid-cols-[360px,1fr]">
          <Card>
            <CardContent className="p-2 max-h-[70vh] overflow-y-auto">
              {filtered.length === 0 && <p className="p-3 text-sm text-muted-foreground">No submissions.</p>}
              {filtered.map((it) => (
                <button key={it.file} onClick={() => setSelected(it.file)}
                  className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-smooth ${
                    selected === it.file ? "bg-brand-gradient text-white" : "hover:bg-accent"
                  }`}>
                  <div className="font-semibold">{it.candidateName || it.candidateEmail}</div>
                  <div className={`text-xs ${selected === it.file ? "text-white/80" : "text-muted-foreground"}`}>
                    {it.examId} · {new Date(it.submittedAt).toLocaleString()}
                  </div>
                  <div className={`text-xs ${selected === it.file ? "text-white/80" : "text-muted-foreground"}`}>
                    {it.kind === "coding"
                      ? `Score ${(it.totalMarks ?? 0).toFixed(2)}/${it.totalPossible ?? "?"}`
                      : `Score ${(it.score ?? 0).toFixed(2)}/${it.total ?? "?"}`} · ⚠ {it.violations}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 max-h-[70vh] overflow-y-auto">
              {!detail && <p className="text-sm text-muted-foreground">Select a submission to view full details.</p>}
              {detail && (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-bold">{detail.candidateName || detail.candidateEmail}</h2>
                    <Button size="sm" variant="outline" asChild>
                      <a href={`/api/submissions/${selected}`} download>Download JSON</a>
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {detail.examId} · {new Date(detail.submittedAt).toLocaleString()} · ⚠ {detail.violations}
                  </div>
                  <pre className="mt-4 max-h-[55vh] overflow-auto rounded-md bg-[#0b1020] p-3 font-mono text-xs text-green-100">
                    {JSON.stringify(detail, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
