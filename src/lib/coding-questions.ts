// Coding-round question bank.
// Each question is language-agnostic: candidate reads from STDIN and writes to STDOUT.
// Test cases compare trimmed stdout.

export interface TestCase {
  stdin: string;
  expected: string;
  hidden: boolean; // hidden = not shown to candidate, only used for grading
}

export interface CodingQuestion {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  prompt: string;          // problem statement (supports plain text / markdown-ish)
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  sample: { input: string; output: string; explanation?: string }[];
  testCases: TestCase[];   // includes sample (hidden:false) + hidden cases
  marks: number;
}

export const SUPPORTED_LANGUAGES = [
  { id: "python",     label: "Python 3",  pistonLang: "python",     pistonVersion: "3.10.0",
    starter: `# Read input from stdin, print output to stdout\nimport sys\n\ndef solve():\n    data = sys.stdin.read().split()\n    # TODO: your code\n    pass\n\nsolve()\n` },
  { id: "javascript", label: "JavaScript (Node)", pistonLang: "javascript", pistonVersion: "18.15.0",
    starter: `// Read all stdin, write to stdout\nlet input = "";\nprocess.stdin.on("data", d => input += d);\nprocess.stdin.on("end", () => {\n  const tokens = input.split(/\\s+/).filter(Boolean);\n  // TODO: your code\n});\n` },
  { id: "java",       label: "Java 17",   pistonLang: "java",       pistonVersion: "15.0.2",
    starter: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // TODO: your code\n    }\n}\n` },
  { id: "cpp",        label: "C++ 17",    pistonLang: "c++",        pistonVersion: "10.2.0",
    starter: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    // TODO: your code\n    return 0;\n}\n` },
  { id: "c",          label: "C (GCC)",   pistonLang: "c",          pistonVersion: "10.2.0",
    starter: `#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\nint main() {\n    // TODO: your code\n    return 0;\n}\n` },
] as const;

export type LanguageId = typeof SUPPORTED_LANGUAGES[number]["id"];

// ---------- Default question bank (replace freely) ----------
export const CODING_QUESTIONS: CodingQuestion[] = [
  {
    id: "sum-two",
    title: "Sum of Two Numbers",
    difficulty: "Easy",
    marks: 10,
    prompt:
      "Given two integers A and B, print their sum.\n\nThis is a warm-up to verify your I/O setup works in the language of your choice.",
    inputFormat: "A single line containing two space-separated integers A and B.",
    outputFormat: "A single integer: A + B.",
    constraints: ["-10^9 ≤ A, B ≤ 10^9"],
    sample: [
      { input: "3 5", output: "8" },
      { input: "-2 10", output: "8" },
    ],
    testCases: [
      { stdin: "3 5",            expected: "8",          hidden: false },
      { stdin: "-2 10",          expected: "8",          hidden: false },
      { stdin: "0 0",            expected: "0",          hidden: true  },
      { stdin: "1000000000 1",   expected: "1000000001", hidden: true  },
      { stdin: "-7 -8",          expected: "-15",        hidden: true  },
    ],
  },
  {
    id: "reverse-string",
    title: "Reverse a String",
    difficulty: "Easy",
    marks: 15,
    prompt:
      "Given a string S (no spaces inside), print its reverse.",
    inputFormat: "A single line containing the string S.",
    outputFormat: "The reversed string on a single line.",
    constraints: ["1 ≤ |S| ≤ 10^5", "S contains printable ASCII (no spaces)"],
    sample: [
      { input: "hello",  output: "olleh" },
      { input: "XPay",   output: "yaPX"  },
    ],
    testCases: [
      { stdin: "hello",       expected: "olleh",       hidden: false },
      { stdin: "XPay",        expected: "yaPX",        hidden: false },
      { stdin: "a",           expected: "a",           hidden: true  },
      { stdin: "racecar",     expected: "racecar",     hidden: true  },
      { stdin: "abcdefghij",  expected: "jihgfedcba",  hidden: true  },
    ],
  },
  {
    id: "fizzbuzz",
    title: "FizzBuzz Up To N",
    difficulty: "Medium",
    marks: 20,
    prompt:
      "Given an integer N, print numbers from 1 to N, one per line. For multiples of 3 print 'Fizz', for multiples of 5 print 'Buzz', and for multiples of both print 'FizzBuzz'.",
    inputFormat: "A single integer N.",
    outputFormat: "N lines as described above.",
    constraints: ["1 ≤ N ≤ 100"],
    sample: [
      {
        input: "5",
        output: "1\n2\nFizz\n4\nBuzz",
      },
    ],
    testCases: [
      { stdin: "5",  expected: "1\n2\nFizz\n4\nBuzz", hidden: false },
      { stdin: "1",  expected: "1",                   hidden: true  },
      { stdin: "3",  expected: "1\n2\nFizz",          hidden: true  },
      { stdin: "15", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz", hidden: true },
    ],
  },
];

export const getCodingQuestion = (id: string) =>
  CODING_QUESTIONS.find((q) => q.id === id);
