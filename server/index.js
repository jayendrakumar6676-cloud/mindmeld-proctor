// Tiny local Express server.
// - POST /api/submit       → writes each submission to ./submissions/<examId>/<email>__<timestamp>.json
// - GET  /api/submissions  → lists all saved submissions (for the invigilator dashboard)
// - GET  /api/submissions/:file → returns the full JSON of one submission
//
// All data lives on YOUR laptop, inside the ./submissions folder.
// Stop with Ctrl+C.

import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SUBMISSIONS_DIR = path.join(ROOT, "submissions");

if (!fs.existsSync(SUBMISSIONS_DIR)) fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const safe = (s) => String(s ?? "").replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80) || "unknown";

app.get("/api/health", (_req, res) => res.json({ ok: true, dir: SUBMISSIONS_DIR }));

app.post("/api/submit", (req, res) => {
  try {
    const body = req.body || {};
    const examId = safe(body.examId);
    const email = safe(body.candidateEmail);
    const ts = new Date(body.submittedAt || Date.now()).toISOString().replace(/[:.]/g, "-");
    const dir = path.join(SUBMISSIONS_DIR, examId);
    fs.mkdirSync(dir, { recursive: true });
    const fileName = `${email}__${ts}.json`;
    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2), "utf8");
    console.log(`✓ Saved submission: submissions/${examId}/${fileName}`);
    res.json({ ok: true, file: path.join(examId, fileName) });
  } catch (err) {
    console.error("Failed to save submission:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/submissions", (_req, res) => {
  try {
    const out = [];
    if (!fs.existsSync(SUBMISSIONS_DIR)) return res.json(out);
    for (const examId of fs.readdirSync(SUBMISSIONS_DIR)) {
      const dir = path.join(SUBMISSIONS_DIR, examId);
      if (!fs.statSync(dir).isDirectory()) continue;
      for (const f of fs.readdirSync(dir)) {
        if (!f.endsWith(".json")) continue;
        try {
          const data = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
          out.push({
            file: path.join(examId, f),
            kind: data.kind,
            examId: data.examId,
            candidateEmail: data.candidateEmail,
            candidateName: data.candidateName,
            submittedAt: data.submittedAt,
            totalMarks: data.totalMarks,
            totalPossible: data.totalPossible,
            score: data.score,
            total: data.total,
            violations: data.violations ?? 0,
          });
        } catch (e) {
          console.warn("Skipping unreadable file", f, e.message);
        }
      }
    }
    out.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/submissions/:file(*)", (req, res) => {
  try {
    const rel = req.params.file.replace(/\\/g, "/");
    if (rel.includes("..")) return res.status(400).json({ error: "Bad path" });
    const filePath = path.join(SUBMISSIONS_DIR, rel);
    if (!filePath.startsWith(SUBMISSIONS_DIR)) return res.status(400).json({ error: "Bad path" });
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Not found" });
    res.type("application/json").send(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`\n  🔵  XPay submissions API: http://localhost:${PORT}`);
  console.log(`  📁  Saving submissions to: ${SUBMISSIONS_DIR}\n`);
});
