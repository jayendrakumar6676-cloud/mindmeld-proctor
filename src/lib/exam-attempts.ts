const KEY = (email: string) => `xpay-attempts::${email.toLowerCase()}`;

export interface AttemptRecord {
  examId: string;
  submittedAt: number;
  violations: number;
  // score intentionally NOT exposed to candidate; stored for invigilator only
  score: number;
  total: number;
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
