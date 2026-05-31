// Runs candidate code against test cases using the public Piston API
// (https://github.com/engineer-man/piston) — free, no API key.
import { SUPPORTED_LANGUAGES, type LanguageId } from "./coding-questions";

const PISTON_URL = "https://emkc.org/api/v2/piston/execute";

export interface RunOutcome {
  stdout: string;
  stderr: string;
  ok: boolean;       // executed without runtime error
  passed: boolean;   // stdout matches expected (trimmed)
}

const normalize = (s: string) =>
  s.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").trim();

export async function runOnce(
  langId: LanguageId,
  code: string,
  stdin: string,
  expected: string,
): Promise<RunOutcome> {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.id === langId);
  if (!lang) return { stdout: "", stderr: "Unsupported language", ok: false, passed: false };

  const body = {
    language: lang.pistonLang,
    version: lang.pistonVersion,
    files: [{
      name: langId === "java" ? "Main.java" : `main.${langId === "cpp" ? "cpp" : langId === "javascript" ? "js" : langId === "python" ? "py" : langId}`,
      content: code,
    }],
    stdin,
    run_timeout: 5000,
    compile_timeout: 10000,
  };

  try {
    const res = await fetch(PISTON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return { stdout: "", stderr: `Runner error (HTTP ${res.status})`, ok: false, passed: false };
    }
    const json = await res.json() as {
      run?: { stdout: string; stderr: string; code: number };
      compile?: { stdout: string; stderr: string; code: number };
      message?: string;
    };
    if (json.compile && json.compile.code !== 0) {
      return { stdout: "", stderr: json.compile.stderr || json.compile.stdout || "Compilation failed", ok: false, passed: false };
    }
    const stdout = json.run?.stdout ?? "";
    const stderr = json.run?.stderr ?? json.message ?? "";
    const passed = normalize(stdout) === normalize(expected);
    return { stdout, stderr, ok: (json.run?.code ?? 1) === 0, passed };
  } catch (e) {
    return { stdout: "", stderr: `Network error: ${(e as Error).message}`, ok: false, passed: false };
  }
}
