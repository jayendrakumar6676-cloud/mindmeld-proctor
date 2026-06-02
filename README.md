# XPay Exam Portal — local setup

A self-contained proctored exam app. Submissions are saved as JSON files on
**your laptop** in `./submissions/`.

## Stack

- Frontend: Vite + React 18 + React Router + Tailwind + shadcn/ui
- Backend: a tiny Express server (`server/index.js`) that writes submission
  files to `./submissions/<examId>/<email>__<timestamp>.json`
- One command (`npm run dev`) runs both via `concurrently`

## Prerequisites

- **Node.js 20 or newer** — https://nodejs.org
- Verify in a terminal: `node -v`

## Run it (step by step)

1. Open this folder in VS Code.
2. Open the integrated terminal (`Ctrl+\`` / `Cmd+\``).
3. First time only — install dependencies:
   ```
   npm install
   ```
4. Start the app:
   ```
   npm run dev
   ```
   This boots:
   - Frontend on http://localhost:5173
   - Submissions API on http://localhost:8787
5. Open http://localhost:5173 in Chrome. Sign in, pick an exam folder, take it.
6. After submit, look in the project's `submissions/` folder — every attempt
   is saved as a JSON file you can open or share.
7. Invigilator dashboard: http://localhost:5173/submissions → PIN `xpay-2026`.
   You can also click **Download JSON** to save any attempt.
8. Stop the servers with `Ctrl+C` in the terminal.

## Multiple students on different laptops (same Wi-Fi)

The dev server already binds to `0.0.0.0`. Find your laptop's LAN IP
(e.g. `192.168.1.42`) and have students open:

```
http://192.168.1.42:5173
```

Every submission from any device gets written to **your laptop's** `submissions/` folder.

Note: webcam/mic require either `localhost` or HTTPS. Over LAN with plain
`http://<ip>:5173` Chrome will block camera. The simplest fix is to have
students use the same laptop, or set up HTTPS with `mkcert` (advanced).

## Where data lives

```
submissions/
├── aptitude/
│   └── jane@x.com__2026-06-02T14-23-11-000Z.json
├── coding/
├── dsa/
├── system/
└── technical/
```

Each file contains: candidate name + email, exam id, every question, given
answer, correct answer, score, violations, and (for coding) the full code +
per-test-case results.

## Editing questions

- MCQ exams (Aptitude / DSA / System / Technical): edit `src/lib/exams.ts`.
- Coding round questions + test cases: edit `src/lib/coding-questions.ts`.

Save the file and the dev server hot-reloads automatically.

## Changing the invigilator PIN

Edit `INVIGILATOR_PIN` in `src/pages/Submissions.tsx`.

## Production build

```
npm run build
npm run start    # serves the build + runs the API
```
