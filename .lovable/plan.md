## Goal

Replace the current TanStack Start setup with the simplest possible stack that runs cleanly in VS Code and saves every student's answers as JSON files **on the laptop running the exam** (no cloud, no database).

## New stack

- **Vite 5 + React 18 + TypeScript** — fast dev server, no SSR, no server functions, no edge runtime quirks.
- **React Router v6** — standard client-side routing.
- **Tailwind CSS v3** — stable, plain `tailwind.config.js` (no v4 quirks).
- **shadcn/ui components** — keep the existing look.
- **Monaco Editor** — code editor for the coding round.
- **Express (tiny local server)** — single file, ~60 lines. Receives submissions and writes them to `./submissions/<exam>/<student>-<timestamp>.json` on your laptop's disk. Also serves the list to the invigilator dashboard.
- **Concurrently** — one `npm run dev` command starts both Vite (frontend) and Express (backend).

## Folder layout after rewrite

```text
exam-app/
├── server/
│   └── index.js              ← Express: POST /api/submit, GET /api/submissions
├── submissions/              ← auto-created; YOUR DATA LIVES HERE
│   ├── aptitude/
│   ├── coding-round/
│   ├── dsa/
│   ├── system-understanding/
│   └── technical/
├── src/
│   ├── main.tsx              ← React entry
│   ├── App.tsx               ← Router setup
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx     ← exam folders
│   │   ├── Exam.tsx          ← MCQ exam (aptitude/dsa/technical/system)
│   │   ├── Coding.tsx        ← coding round with Monaco
│   │   └── Submissions.tsx   ← PIN-protected invigilator view
│   ├── lib/
│   │   ├── exams.ts          ← exam definitions + question banks
│   │   ├── coding-questions.ts
│   │   ├── attempts.ts       ← one-time attempt lock (localStorage)
│   │   ├── proctor.ts        ← webcam/mic + tab-switch + fullscreen logic
│   │   └── api.ts            ← fetch wrapper for the local server
│   └── components/ui/...     ← shadcn components (kept as-is)
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts            ← proxies /api → http://localhost:8787
├── package.json              ← scripts: dev / build / start
└── README.md                 ← run instructions
```

## Features preserved

- 5 exam folders: Aptitude, DSA, Coding Round, System Understanding, Technical Assessment.
- One-time attempt lock (per browser, via localStorage + filename check on server).
- Webcam + mic permission gate before the exam starts; video preview visible while writing.
- Anti-cheat: fullscreen lock, tab-switch detection, copy/paste/right-click blocked, devtools warning.
- Question shuffling, 40 aptitude questions, negative marking (−¼), 2 marks each, instructions screen before start.
- Coding round: Monaco editor, language picker (Python/Java/C++/JS), test cases stored with the question, student's code + output saved to the JSON file (no in-browser execution of arbitrary languages — code is captured for manual review; only JS test cases can run client-side).
- Invigilator dashboard at `/submissions`, PIN `xpay-2026`, lists all JSON files saved on the laptop, click to view full answers, download as JSON.
- Results NEVER shown to the student after submitting — only a "Submitted" confirmation.

## How data is saved on your laptop

When a student clicks "Submit", the frontend POSTs the full attempt to `http://localhost:8787/api/submit`. Express writes:

```text
submissions/aptitude/john-doe__2026-06-02T14-23-11.json
```

The file contains: student name, exam id, start/end time, every question + their answer, score (for MCQ), proctor events (tab switches, fullscreen exits), and the raw code (for coding round). You can open the `submissions/` folder in VS Code and see every attempt.

## Step-by-step to run in VS Code (after the rewrite)

1. Install **Node.js 20+** from nodejs.org. Verify: `node -v`.
2. Open the project folder in VS Code → open the integrated terminal.
3. Run `npm install` (one time).
4. Run `npm run dev`. This starts:
   - Vite frontend on `http://localhost:5173`
   - Express backend on `http://localhost:8787`
5. Open `http://localhost:5173` in Chrome. Log in, pick an exam folder, take the exam.
6. After submission, check the `submissions/` folder in VS Code — the JSON file is there.
7. Invigilator: go to `http://localhost:5173/submissions`, enter PIN `xpay-2026`, browse all attempts.
8. To stop: `Ctrl+C` in the terminal.

For multiple students on one laptop: each student logs in with their own name; the server appends the name + timestamp to the filename so attempts never overwrite each other.

For students on different laptops over the same Wi-Fi: run `npm run dev -- --host`, then they open `http://<your-laptop-ip>:5173` from their devices. The Express server saves every submission to YOUR laptop.

## What gets deleted

Everything TanStack-specific:
- `src/routes/`, `src/router.tsx`, `src/start.ts`, `src/server.ts`, `src/routeTree.gen.ts`
- `src/lib/api/`, `src/lib/config.server.ts`, `src/lib/error-page.ts`, `src/lib/error-capture.ts`
- `vite.config.ts` (replaced with a plain Vite + React config)
- `bunfig.toml`
- All TanStack packages from `package.json`

What's reused: every `src/components/ui/*` file, `src/lib/exams.ts`, `src/lib/coding-questions.ts`, `src/lib/exam-attempts.ts`, `src/lib/code-runner.ts`, and the Logo. The page components are rewritten as plain React Router pages (no `createFileRoute`, no loaders, no server fns).

## Caveat about the Lovable preview

This change makes the project a **Vite SPA**, not a TanStack Start app. It will still run locally in VS Code perfectly, but the Lovable in-browser preview is tuned for TanStack Start and may show a blank screen or limited functionality after the rewrite. The local VS Code experience is the target — if you want both Lovable preview AND local VS Code to work, the better option is "Keep TanStack Start, just fix the run errors" (option 3 in the previous question). Confirm you're OK with losing the Lovable preview before I proceed.
