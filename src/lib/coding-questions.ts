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
    id: "read4-ii",
    title: "Read N Characters Given read4 II — Call Multiple Times",
    difficulty: "Hard",
    marks: 10,
    prompt:
`Given a file and assuming you can only read the file using a given method read4, implement a method read to read n characters. Your method read may be called multiple times.

Method read4: The API read4 reads exactly 4 consecutive characters from the file, then writes those characters into the buffer buf4. The return value is the number of actual characters read.
(read4 has its own internal file pointer, much like FILE *fp in C.)

Method read: Using read4, implement read(buf, n) that reads n characters from the file and stores them in buf. The return value is the number of actual characters read.

You cannot manipulate the file directly. The file is only accessible via read4. The read function may be called multiple times.

------------------------------------------------------------
INPUT / OUTPUT PROTOCOL FOR THIS JUDGE
------------------------------------------------------------
Line 1: the file contents (a single string, no spaces).
Line 2: an integer Q — number of read() calls.
Line 3: Q space-separated integers — the n value for each successive call.

Print Q space-separated integers on a single line: the actual count returned by each successive read() call (i.e. how many characters were written into buf).`,
    inputFormat:
`Line 1: file string (no spaces)
Line 2: integer Q
Line 3: Q space-separated integers (queries)`,
    outputFormat: "A single line with Q space-separated integers — the value returned by each read() call.",
    constraints: [
      "1 ≤ |file| ≤ 500",
      "file consists of English letters and digits",
      "1 ≤ n ≤ 1000",
      "1 ≤ Q ≤ 100",
      "Successive read() calls share state (leftover characters from read4).",
    ],
    sample: [
      { input: "abc\n3\n1 2 1", output: "1 2 0",
        explanation: "read(1) -> 'a' (1). read(2) -> 'bc' (2). read(1) -> EOF (0)." },
      { input: "abc\n2\n4 1", output: "3 0",
        explanation: "read(4) -> 'abc' (3). read(1) -> EOF (0)." },
    ],
    testCases: [
      { stdin: "abc\n3\n1 2 1",          expected: "1 2 0",     hidden: false },
      { stdin: "abc\n2\n4 1",            expected: "3 0",       hidden: false },
      { stdin: "abcde\n3\n2 2 2",        expected: "2 2 1",     hidden: true  },
      { stdin: "abcdefgh\n4\n3 3 3 3",   expected: "3 3 2 0",   hidden: true  },
      { stdin: "a\n2\n1 5",              expected: "1 0",       hidden: true  },
      { stdin: "abcdefghij\n1\n1000",    expected: "10",        hidden: true  },
    ],
  },
  {
    id: "sudoku-solver",
    title: "Sudoku Solver",
    difficulty: "Hard",
    marks: 10,
    prompt:
`Write a program to solve a Sudoku puzzle by filling the empty cells. A sudoku solution must satisfy all of the following rules:

1. Each of the digits 1-9 must occur exactly once in each row.
2. Each of the digits 1-9 must occur exactly once in each column.
3. Each of the digits 1-9 must occur exactly once in each of the 9 3x3 sub-boxes of the grid.

The '.' character indicates empty cells.

------------------------------------------------------------
INPUT / OUTPUT PROTOCOL FOR THIS JUDGE
------------------------------------------------------------
Read 9 lines from stdin. Each line is exactly 9 characters long containing digits '1'-'9' or '.' for empty cells.
Print 9 lines to stdout. Each line is the corresponding row of the fully solved board (9 digits, no separators).`,
    inputFormat: "9 lines, each 9 characters (digits '1'-'9' or '.').",
    outputFormat: "9 lines, each 9 digits — the completely solved board.",
    constraints: [
      "Board is exactly 9x9.",
      "Each cell is a digit '1'-'9' or '.'.",
      "Input is guaranteed to have exactly one valid solution.",
    ],
    sample: [
      {
        input: "53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79",
        output: "534678912\n672195348\n198342567\n859761423\n426853791\n713924856\n961537284\n287419635\n345286179",
        explanation: "Classic LeetCode Sudoku sample. Solver fills all empty cells with the unique solution.",
      },
    ],
    testCases: [
      {
        stdin: "53..7....\n6..195...\n.98....6.\n8...6...3\n4..8.3..1\n7...2...6\n.6....28.\n...419..5\n....8..79",
        expected: "534678912\n672195348\n198342567\n859761423\n426853791\n713924856\n961537284\n287419635\n345286179",
        hidden: false,
      },
      {
        stdin: "534678912\n672195348\n198342567\n859761423\n426853791\n713924856\n961537284\n287419635\n34528617.",
        expected: "534678912\n672195348\n198342567\n859761423\n426853791\n713924856\n961537284\n287419635\n345286179",
        hidden: true,
      },
    ],
  },
  {
    id: "fizz-buzz",
    title: "Fizz Buzz",
    difficulty: "Easy",
    marks: 5,
    prompt:
`Given an integer n, return a string array answer (1-indexed) where:

- answer[i] == "FizzBuzz" if i is divisible by 3 and 5.
- answer[i] == "Fizz" if i is divisible by 3.
- answer[i] == "Buzz" if i is divisible by 5.
- answer[i] == i (as a string) if none of the above conditions are true.

------------------------------------------------------------
INPUT / OUTPUT PROTOCOL FOR THIS JUDGE
------------------------------------------------------------
Read a single integer n from stdin.
Print the resulting array on ONE line as a JSON-style list of double-quoted strings, e.g. ["1","2","Fizz"].
Use commas with NO spaces between elements.`,
    inputFormat: "A single integer n.",
    outputFormat: `One line: ["v1","v2",...,"vn"] (double-quoted, comma-separated, no spaces).`,
    constraints: ["1 <= n <= 10^4"],
    sample: [
      { input: "3",  output: `["1","2","Fizz"]` },
      { input: "5",  output: `["1","2","Fizz","4","Buzz"]` },
      { input: "15", output: `["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]` },
    ],
    testCases: [
      { stdin: "3",  expected: `["1","2","Fizz"]`, hidden: false },
      { stdin: "5",  expected: `["1","2","Fizz","4","Buzz"]`, hidden: false },
      { stdin: "15", expected: `["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]`, hidden: true },
      { stdin: "1",  expected: `["1"]`, hidden: true },
      { stdin: "2",  expected: `["1","2"]`, hidden: true },
    ],
  },
];

export const getCodingQuestion = (id: string) =>
  CODING_QUESTIONS.find((q) => q.id === id);

