// Voice screening questions per exam type.
// Keywords are matched against the spoken answer (case-insensitive).
export interface VoiceQuestion {
  speak: string;       // what AI says aloud
  display: string;     // shown on screen
  keywords: string[];  // any match = correct
  explanation: string; // AI reads this after answering
}

export interface ExamScreening {
  intro: string;       // AI intro speech
  questions: VoiceQuestion[];
  passMark: number;    // minimum correct to qualify
}

const SCREENINGS: Record<string, ExamScreening> = {
  dsa: {
    intro: "Welcome to the DSA screening. I will ask you 3 Data Structures and Algorithms questions. Answer each one by speaking clearly.",
    passMark: 2,
    questions: [
      {
        speak: "Question 1. What is the time complexity of Binary Search?",
        display: "What is the time complexity of Binary Search?",
        keywords: ["log n", "o log n", "logarithmic", "log"],
        explanation: "Binary Search has O log n time complexity because it halves the search space each step.",
      },
      {
        speak: "Question 2. Which data structure uses LIFO — Last In First Out — order?",
        display: "Which data structure uses LIFO order?",
        keywords: ["stack"],
        explanation: "A Stack uses LIFO order — the last element pushed is the first one popped.",
      },
      {
        speak: "Question 3. What is the worst-case time complexity of QuickSort?",
        display: "What is the worst-case time complexity of QuickSort?",
        keywords: ["o n squared", "n squared", "n^2", "n 2"],
        explanation: "QuickSort has O n squared worst-case complexity when the pivot is always the smallest or largest element.",
      },
    ],
  },
  coding: {
    intro: "Welcome to the Coding Round screening. I will ask you 3 fundamental programming questions. Please answer each one out loud.",
    passMark: 2,
    questions: [
      {
        speak: "Question 1. What keyword is used to declare a constant variable in JavaScript?",
        display: "What keyword declares a constant in JavaScript?",
        keywords: ["const"],
        explanation: "The const keyword is used to declare a constant variable in JavaScript.",
      },
      {
        speak: "Question 2. What does DOM stand for in web development?",
        display: "What does DOM stand for?",
        keywords: ["document object model", "document object", "dom"],
        explanation: "DOM stands for Document Object Model — it represents the HTML structure as a tree of objects.",
      },
      {
        speak: "Question 3. In object-oriented programming, what is inheritance?",
        display: "What is inheritance in OOP?",
        keywords: ["inherit", "parent", "child", "base class", "subclass", "extends", "derive"],
        explanation: "Inheritance allows a child class to acquire properties and methods from a parent class, promoting code reuse.",
      },
    ],
  },
  system: {
    intro: "Welcome to the System Design screening. I will ask you 3 system architecture questions. Please answer each one verbally.",
    passMark: 2,
    questions: [
      {
        speak: "Question 1. What does API stand for?",
        display: "What does API stand for?",
        keywords: ["application programming interface", "application programming", "api"],
        explanation: "API stands for Application Programming Interface — it defines how software components communicate.",
      },
      {
        speak: "Question 2. What is the purpose of a load balancer in a distributed system?",
        display: "What is the purpose of a load balancer?",
        keywords: ["distribute", "traffic", "balance", "spread", "servers", "requests"],
        explanation: "A load balancer distributes incoming network traffic across multiple servers to ensure no single server is overwhelmed.",
      },
      {
        speak: "Question 3. What does SQL stand for?",
        display: "What does SQL stand for?",
        keywords: ["structured query language", "structured query", "sql"],
        explanation: "SQL stands for Structured Query Language, used to manage and query relational databases.",
      },
    ],
  },
  technical: {
    intro: "Welcome to the Technical Assessment screening. I will ask you 3 backend development questions. Please answer each one out loud.",
    passMark: 2,
    questions: [
      {
        speak: "Question 1. What HTTP status code means a resource was successfully created?",
        display: "What HTTP status code means successfully created?",
        keywords: ["201", "two hundred and one", "two oh one"],
        explanation: "HTTP status code 201 Created indicates that a resource was successfully created on the server.",
      },
      {
        speak: "Question 2. What does REST stand for in REST API?",
        display: "What does REST stand for?",
        keywords: ["representational state transfer", "representational state", "rest"],
        explanation: "REST stands for Representational State Transfer — an architectural style for designing networked APIs.",
      },
      {
        speak: "Question 3. What is the difference between GET and POST HTTP methods?",
        display: "What is the difference between GET and POST?",
        keywords: ["get retrieves", "post sends", "get reads", "post creates", "get fetch", "post data", "get no body", "retrieve", "submit", "create", "send data"],
        explanation: "GET retrieves data from the server without changing state. POST sends data to the server to create or update a resource.",
      },
    ],
  },
};

export function getScreening(examId: string): ExamScreening | null {
  return SCREENINGS[examId] ?? null;
}
