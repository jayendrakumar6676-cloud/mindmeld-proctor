/**
 * voice-questions.ts
 *
 * ACCURACY DESIGN:
 * - `keywords`: exact/substring matches (fast path)
 * - `spokenVariants`: covers how speech-recognition transcribes the answer
 *   (numbers as words, symbols spoken aloud, abbreviations expanded, etc.)
 * - `negativeKeywords`: if present in answer, reject even if keywords matched
 *   (prevents accidental matches like saying "not a stack")
 * - Evaluator uses BOTH lists with normalisation (remove punctuation, collapse spaces)
 */

export interface VoiceQuestion {
  speak: string;          // what AI says aloud (question)
  display: string;        // shown on screen
  keywords: string[];     // any substring match → correct
  spokenVariants: string[];// speech-recognition-friendly synonyms
  negativeKeywords?: string[]; // if matched, override to incorrect
  hint: string;           // spoken after first wrong attempt
  explanation: string;    // spoken after second attempt (correct or not)
}

export interface ExamScreening {
  intro: string;
  questions: VoiceQuestion[];
  passMark: number;
}

const SCREENINGS: Record<string, ExamScreening> = {

  // ─────────────────────────────────────────────────────────────────────────
  dsa: {
    intro: "Welcome to the DSA screening. I will ask you 3 Data Structures and Algorithms questions.",
    passMark: 2,
    questions: [
      {
        speak: "Question 1. What is the time complexity of Binary Search?",
        display: "What is the time complexity of Binary Search?",
        keywords: ["log n", "o log", "logarithm"],
        spokenVariants: [
          "log n", "o log n", "oh log n", "order log n", "big o log n",
          "logarithmic", "log of n", "log base 2", "log n complexity",
          "order of log n", "o of log n", "big oh log n",
        ],
        hint: "Think about how Binary Search splits the array in half each time. What does halving repeatedly give you?",
        explanation: "Binary Search runs in O log n time because it halves the search space with every comparison.",
      },
      {
        speak: "Question 2. Which data structure uses Last In First Out order, also known as LIFO?",
        display: "Which data structure uses LIFO (Last In First Out) order?",
        keywords: ["stack"],
        spokenVariants: [
          "stack", "stacks", "a stack", "the stack", "it's a stack",
          "stack data structure", "call stack",
        ],
        negativeKeywords: ["not a stack", "queue"],
        hint: "Think of a pile of plates. You always take the top plate first. What data structure works like that?",
        explanation: "A Stack uses LIFO order — the last element pushed is the first one popped, just like a stack of plates.",
      },
      {
        speak: "Question 3. What is the worst case time complexity of QuickSort?",
        display: "What is the worst-case time complexity of QuickSort?",
        keywords: ["n squared", "n^2", "o n 2"],
        spokenVariants: [
          "n squared", "o n squared", "oh n squared", "n to the power 2",
          "n to the 2", "order n squared", "big o n squared",
          "n2", "o n2", "n power 2", "n to 2", "quadratic",
          "two hundred", // avoid, but keeping for safety
        ],
        hint: "It happens when the pivot is always the smallest or largest element. It degrades to what complexity?",
        explanation: "QuickSort has O n squared worst-case complexity when the pivot is always the minimum or maximum, causing n levels of recursion.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  coding: {
    intro: "Welcome to the Coding Round screening. I will ask you 3 fundamental programming questions.",
    passMark: 2,
    questions: [
      {
        speak: "Question 1. In JavaScript, what keyword do you use to declare a variable whose value cannot be reassigned?",
        display: "What keyword declares a constant variable in JavaScript?",
        keywords: ["const"],
        spokenVariants: [
          "const", "constant", "the const keyword", "use const",
          "it's const", "declare const", "using const",
        ],
        hint: "It's a 5-letter keyword, starts with C. It prevents reassignment.",
        explanation: "The const keyword declares a block-scoped variable that cannot be reassigned after initialisation.",
      },
      {
        speak: "Question 2. In web development, what does the acronym DOM stand for?",
        display: "What does DOM stand for in web development?",
        keywords: ["document object model", "document object"],
        spokenVariants: [
          "document object model", "document object",
          "dom stands for document object model",
          "it means document object model",
          "document object model dom",
        ],
        hint: "It represents the HTML page as a tree of objects. What does D-O-M stand for?",
        explanation: "DOM stands for Document Object Model — a tree representation of the HTML page that JavaScript can manipulate.",
      },
      {
        speak: "Question 3. In object-oriented programming, what is inheritance and what does it allow a class to do?",
        display: "What is inheritance in OOP?",
        keywords: ["inherit", "parent", "child class", "base class", "subclass", "extends", "derive"],
        spokenVariants: [
          "inherit", "inherits", "inheritance", "parent class", "child class",
          "base class", "subclass", "sub class", "extends", "derived class",
          "derive", "reuse", "properties from parent", "methods from parent",
          "one class gets properties", "acquire properties",
        ],
        hint: "It involves a parent and a child class relationship. The child class gets something from the parent.",
        explanation: "Inheritance lets a child class acquire properties and methods from a parent class, enabling code reuse and hierarchy.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  system: {
    intro: "Welcome to the System Design screening. I will ask you 3 system architecture questions.",
    passMark: 2,
    questions: [
      {
        speak: "Question 1. What does API stand for?",
        display: "What does API stand for?",
        keywords: ["application programming interface"],
        spokenVariants: [
          "application programming interface",
          "api stands for application programming interface",
          "application program interface",
          "application programming",
        ],
        hint: "It's three words: Application, Programming, and…?",
        explanation: "API stands for Application Programming Interface — a contract that defines how software components talk to each other.",
      },
      {
        speak: "Question 2. What is the role of a load balancer in a distributed system?",
        display: "What is the purpose of a load balancer?",
        keywords: ["distribute", "traffic", "balance", "spread", "multiple server"],
        spokenVariants: [
          "distribute", "distributes", "distribute traffic", "distribute requests",
          "balance load", "balance traffic", "spread load", "spread requests",
          "multiple servers", "routes traffic", "route requests",
          "prevent overload", "even distribution", "handle traffic",
        ],
        hint: "Think about what happens when millions of users hit your server. How do you prevent one server from crashing?",
        explanation: "A load balancer distributes incoming requests across multiple servers so no single server is overwhelmed, ensuring availability and performance.",
      },
      {
        speak: "Question 3. What does SQL stand for?",
        display: "What does SQL stand for?",
        keywords: ["structured query language", "structured query"],
        spokenVariants: [
          "structured query language",
          "sql stands for structured query language",
          "structured query",
          "sequel stands for structured query language",
        ],
        hint: "It starts with Structured Query… what's the last word?",
        explanation: "SQL stands for Structured Query Language, used to create, read, update, and delete data in relational databases.",
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  technical: {
    intro: "Welcome to the Technical Assessment screening. I will ask you 3 backend development questions.",
    passMark: 2,
    questions: [
      {
        speak: "Question 1. When a REST API successfully creates a new resource, what HTTP status code should it return?",
        display: "What HTTP status code means a resource was successfully created?",
        keywords: ["201"],
        spokenVariants: [
          "201", "two hundred and one", "two oh one", "two zero one",
          "201 created", "http 201", "status 201",
          "two hundred one", "201 status code",
        ],
        hint: "It's in the 2xx success range, one above 200 OK. What's the number?",
        explanation: "HTTP 201 Created is returned when a resource is successfully created — for example, after a POST request to create a new user.",
      },
      {
        speak: "Question 2. What does REST stand for in REST API?",
        display: "What does REST stand for?",
        keywords: ["representational state transfer", "representational state"],
        spokenVariants: [
          "representational state transfer",
          "rest stands for representational state transfer",
          "representational state",
          "representational",
        ],
        hint: "It starts with Representational State… what's the last word?",
        explanation: "REST stands for Representational State Transfer — an architectural style where clients interact with resources via standard HTTP methods.",
      },
      {
        speak: "Question 3. What is the key difference between the GET and POST HTTP methods?",
        display: "What is the difference between GET and POST HTTP methods?",
        keywords: ["get", "post", "retrieve", "send", "data"],
        spokenVariants: [
          "get retrieves", "post sends", "get reads", "post creates",
          "get fetches", "post submits", "get no body", "post has body",
          "get is for reading", "post is for creating",
          "retrieve data", "send data", "get request", "post request",
          "read data", "submit data", "get doesn't change", "post changes",
        ],
        hint: "Think about which one is used to fetch data and which one is used to send or create data.",
        explanation: "GET retrieves data without changing server state. POST sends data to create or update a resource. GET is idempotent; POST is not.",
      },
    ],
  },
};

export function getScreening(examId: string): ExamScreening | null {
  return SCREENINGS[examId] ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// ADVANCED EVALUATOR
// ─────────────────────────────────────────────────────────────────────────────

/** Normalise: lowercase, remove punctuation, collapse whitespace */
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Evaluate a spoken answer against a question.
 * Returns true if answer is correct.
 *
 * Algorithm:
 * 1. Normalise both answer and all keyword/variant lists.
 * 2. Check negative keywords first — if any match, return false immediately.
 * 3. Check keywords (exact substring match on normalised text).
 * 4. Check spokenVariants (exact substring match on normalised text).
 * 5. Returns true if ANY keyword OR variant matched (and no negative matched).
 */
export function evaluateAnswer(q: VoiceQuestion, rawAnswer: string): boolean {
  if (!rawAnswer.trim()) return false;

  const answer = norm(rawAnswer);

  // Step 1: negative keywords override everything
  if (q.negativeKeywords) {
    for (const neg of q.negativeKeywords) {
      if (answer.includes(norm(neg))) return false;
    }
  }

  // Step 2: check keywords
  for (const kw of q.keywords) {
    if (answer.includes(norm(kw))) return true;
  }

  // Step 3: check spoken variants
  for (const sv of q.spokenVariants) {
    if (answer.includes(norm(sv))) return true;
  }

  return false;
}
