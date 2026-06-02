// Wrapper around the local Express server that saves submissions as JSON files
// on the laptop running the exam. If the server is unreachable (e.g. running
// in the Lovable cloud preview), we silently fall back to localStorage-only.

export interface ServerSubmission {
  kind: "mcq" | "coding";
  examId: string;
  candidateEmail: string;
  candidateName?: string;
  submittedAt: number;
  violations: number;
  // MCQ payload
  answers?: Record<string, unknown>;
  score?: number;
  total?: number;
  questions?: unknown;
  // Coding payload
  results?: unknown;
  totalMarks?: number;
  totalPossible?: number;
}

export async function postSubmission(payload: ServerSubmission): Promise<{ ok: boolean; file?: string; error?: string }> {
  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return await res.json();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export interface ServerSubmissionListItem {
  file: string;
  kind: string;
  examId: string;
  candidateEmail: string;
  candidateName?: string;
  submittedAt: number;
  totalMarks?: number;
  totalPossible?: number;
  score?: number;
  total?: number;
  violations: number;
}

export async function listSubmissions(): Promise<ServerSubmissionListItem[]> {
  try {
    const res = await fetch("/api/submissions");
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getSubmission(file: string): Promise<ServerSubmission | null> {
  try {
    const res = await fetch(`/api/submissions/${encodeURIComponent(file)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
