const KEY = (email: string) => `xpay-attempts::${email.toLowerCase()}`;

export interface AttemptRecord {
  examId: string;
  submittedAt: number;
  violations: number;
  score: number;
  total: number;
  // ms spent on each question, keyed by question id
  timePerQuestion?: Record<number, number>;
  durationMs?: number;
  correctCount?: number;
  attemptedCount?: number;
  accuracy?: number; // 0..1
}

export function getAttempts(email: string): AttemptRecord[] {
  try {
    return JSON.parse(localStorage.getItem(KEY(email)) || "[]");
  } catch {
    return [];
  }
}

export function hasAttempted(email: string, examId: string) {
  return getAttempts(email).some((a) => a.examId === examId);
}

export function recordAttempt(email: string, rec: AttemptRecord) {
  const all = getAttempts(email);
  if (all.some((a) => a.examId === rec.examId)) return;
  all.push(rec);
  localStorage.setItem(KEY(email), JSON.stringify(all));
}
