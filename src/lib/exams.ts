export interface Question {
  id: number;
  q: string;
  options: string[];
  answer: number;
}

export interface ExamCategory {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  accent: string; // tailwind gradient classes
  icon: string;
  questions: Question[];
}

// Placeholder questions — you (admin) can replace these later.
const placeholder = (topic: string): Question[] =>
  Array.from({ length: 5 }).map((_, i) => ({
    id: i + 1,
    q: `[${topic}] Sample question ${i + 1} — replace this with your real question.`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    answer: 0,
  }));

export const EXAMS: ExamCategory[] = [
  {
    id: "aptitude",
    title: "Aptitude Test",
    description: "Quantitative, logical reasoning & verbal ability.",
    durationMin: 15,
    accent: "from-sky-500 to-emerald-400",
    icon: "🧮",
    questions: placeholder("Aptitude"),
  },
  {
    id: "dsa",
    title: "DSA Test",
    description: "Data Structures & Algorithms MCQs.",
    durationMin: 20,
    accent: "from-indigo-500 to-cyan-400",
    icon: "🧩",
    questions: placeholder("DSA"),
  },
  {
    id: "coding",
    title: "Coding Round",
    description: "Code reasoning, dry-run & output prediction.",
    durationMin: 30,
    accent: "from-blue-600 to-teal-400",
    icon: "💻",
    questions: placeholder("Coding"),
  },
  {
    id: "system",
    title: "System Understanding",
    description: "OS, Networks, DBMS fundamentals.",
    durationMin: 20,
    accent: "from-violet-500 to-sky-400",
    icon: "🖥️",
    questions: placeholder("System"),
  },
  {
    id: "technical",
    title: "Technical Assessment",
    description: "Domain-specific technical evaluation.",
    durationMin: 25,
    accent: "from-emerald-500 to-lime-400",
    icon: "⚙️",
    questions: placeholder("Technical"),
  },
];

export const getExam = (id: string) => EXAMS.find((e) => e.id === id);
