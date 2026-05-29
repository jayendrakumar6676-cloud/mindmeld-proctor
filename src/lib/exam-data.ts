export interface Question {
  id: number;
  q: string;
  options: string[];
  answer: number;
}

export const EXAM_QUESTIONS: Question[] = [
  {
    id: 1,
    q: "Which protocol is primarily used for secure web browsing?",
    options: ["FTP", "HTTPS", "SMTP", "TELNET"],
    answer: 1,
  },
  {
    id: 2,
    q: "What does CPU stand for?",
    options: [
      "Central Process Unit",
      "Computer Personal Unit",
      "Central Processing Unit",
      "Central Processor Utility",
    ],
    answer: 2,
  },
  {
    id: 3,
    q: "Which data structure uses LIFO order?",
    options: ["Queue", "Stack", "Array", "Tree"],
    answer: 1,
  },
  {
    id: 4,
    q: "In SQL, which clause filters grouped rows?",
    options: ["WHERE", "ORDER BY", "HAVING", "GROUP BY"],
    answer: 2,
  },
  {
    id: 5,
    q: "Which of these is a JavaScript framework?",
    options: ["Django", "Laravel", "React", "Flask"],
    answer: 2,
  },
  {
    id: 6,
    q: "Default port for HTTPS is?",
    options: ["80", "21", "443", "22"],
    answer: 2,
  },
  {
    id: 7,
    q: "Big-O of binary search on a sorted array?",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
    answer: 1,
  },
  {
    id: 8,
    q: "Which company develops the TypeScript language?",
    options: ["Google", "Meta", "Microsoft", "Apple"],
    answer: 2,
  },
  {
    id: 9,
    q: "RAM is a type of?",
    options: ["Storage", "Volatile memory", "Processor", "Bus"],
    answer: 1,
  },
  {
    id: 10,
    q: "Which HTTP method is idempotent and used to retrieve data?",
    options: ["POST", "PUT", "GET", "PATCH"],
    answer: 2,
  },
];
