// Per-candidate coding submissions (stored locally so the invigilator can review).
const KEY = (email: string) => `xpay-coding::${email.toLowerCase()}`;

export interface QuestionResult {
  questionId: string;
  language: string;
  code: string;
  passed: number;          // hidden + visible passed
  total: number;
  marksEarned: number;
  perCase: { hidden: boolean; passed: boolean; stdout: string; expected: string; stderr?: string }[];
}

export interface CodingSubmission {
  examId: string;
  submittedAt: number;
  violations: number;
  results: QuestionResult[];
  totalMarks: number;
  totalPossible: number;
}

export function getCodingSubmissions(email: string): CodingSubmission[] {
  try { return JSON.parse(localStorage.getItem(KEY(email)) || "[]"); }
  catch { return []; }
}

export function hasCodingSubmission(email: string, examId: string) {
  return getCodingSubmissions(email).some((s) => s.examId === examId);
}

export function saveCodingSubmission(email: string, sub: CodingSubmission) {
  const all = getCodingSubmissions(email);
  if (all.some((s) => s.examId === sub.examId)) return;
  all.push(sub);
  localStorage.setItem(KEY(email), JSON.stringify(all));
}

// ---- Invigilator helpers ----
export function listAllCandidates(): string[] {
  const out: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("xpay-coding::")) out.push(k.replace("xpay-coding::", ""));
  }
  return out;
}
