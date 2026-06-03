# XPay Exam Portal — Windows/local setup

A self-contained proctored exam app. Submissions are saved as JSON files on
**your laptop** in `submissions/`.

## What this project runs

- Frontend: Vite + React 18 + React Router + Tailwind + shadcn/ui
- Local storage server: Express (`server/index.js`)
- Student submissions are written to `submissions/<examId>/<email>__<timestamp>.json`
- One command starts everything: `npm run dev`

## First-time setup on Windows

1. Install **Node.js 20 LTS or newer** from https://nodejs.org/
2. Download/export the latest project ZIP.
3. Extract it to a simple folder, for example:
   ```
   C:\XPayExamPortal
   ```
   Avoid folders like `mindmeld-proctor-main(1)` because repeated ZIP copies can confuse you.
4. Open that folder in VS Code.
5. Open VS Code terminal with `Ctrl + backtick`.
6. Run:
   ```
   npm install
   npm run doctor
   npm run dev
   ```
7. Open Chrome at:
   ```
   http://localhost:8080
   ```

## Easiest Windows start

Double-click:

```
start-windows.bat
```

It checks Node.js, installs dependencies if needed, verifies the setup, and starts the app.

## Important local URLs

- Student login: http://localhost:8080
- Invigilator dashboard: http://localhost:8080/submissions
- Local API health check: http://localhost:8080/api/health
- Invigilator PIN: `xpay-2026`

Keep the terminal window open while exams are running.

## If you see “Missing script: dev”

You are running commands in the wrong/old folder. Fix it like this:

1. Delete the old extracted folder.
2. Download/export the latest ZIP again.
3. Extract it once to `C:\XPayExamPortal`.
4. Open `C:\XPayExamPortal` in VS Code.
5. Run:
   ```
   npm install
   npm run doctor
   npm run dev
   ```

To confirm you are in the correct folder, this command must show `dev`, `doctor`, `build`, and `start`:

```
npm run
```

## Multiple students on different laptops (same Wi-Fi)

The dev server already binds to `0.0.0.0`. Find your laptop's LAN IP
(e.g. `192.168.1.42`) and have students open:

```
http://192.168.1.42:8080
```

Every submission from any device gets written to **your laptop's** `submissions/` folder.

Note: webcam/mic require either `localhost` or HTTPS. Over LAN with plain
`http://<ip>:8080` Chrome will block camera. The simplest fix is to have
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
npm install
npm run build
npm run start    # serves the build + runs the API
```

For normal exam use, prefer `npm run dev` or `start-windows.bat`.
