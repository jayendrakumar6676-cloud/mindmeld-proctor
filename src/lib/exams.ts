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
  accent: string;
  icon: string;
  marksPerQuestion: number;
  negativeMarkFraction: number;
  questions: Question[];
}

const placeholder = (topic: string): Question[] =>
  Array.from({ length: 5 }).map((_, i) => ({
    id: i + 1,
    q: `[${topic}] Sample question ${i + 1} - replace with real question.`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    answer: 0,
  }));

const aptitudeQuestions: Question[] = [
  { id: 1, q: "In a recent journal publication analyzing the anomalous behavior of quantum entanglements, the lead researcher described the resulting data fluctuations as possessing a quality that defies all known logical frameworks, making it entirely impossible to rationalize, interpret, or articulate. Which lexical choice most accurately encapsulates the researcher's characterization?", options: ["Incomprehensible", "Indelible", "Inextricable", "Infallible"], answer: 0 },
  { id: 2, q: "A demographic sector currently stands at 1,102,500 individuals after compounding annual growth of 5% year-over-year. What was the population exactly 24 months prior?", options: ["1,000,000", "1,025,000", "1,050,000", "995,000"], answer: 0 },
  { id: 3, q: "Five researchers P, Q, R, S, T sit in a linear row. P, Q, and T must NOT be adjacent to R. P and S must NOT be adjacent to Q. Identify the left-to-right sequence.", options: ["R, S, P, T, Q", "Q, S, P, T, R", "R, P, S, T, Q", "P, S, R, T, Q"], answer: 0 },
  { id: 4, q: "A painted cube is cut into 27 equal smaller cubes. How many smaller cubes have paint on exactly two faces?", options: ["4", "8", "12", "24"], answer: 2 },
  { id: 5, q: "Despite a prolonged media campaign engineered to erode his credibility through baseless allegations of misconduct, the magistrate's reputation within the jurisprudential community proved to be completely ________.", options: ["undiminished", "resolved", "illegal", "uncertain"], answer: 0 },
  { id: 6, q: "If x is a real number satisfying x^2 + x - 1 = 0, find the value of x^4 + 1/x^4.", options: ["1", "5", "7", "9"], answer: 2 },
  { id: 7, q: "At 07:00, two trains start from the same point. One heads North at 80 km/h; the other heads South at 100 km/h. At what time is the distance between them exactly 540 km?", options: ["09:00 hours", "10:00 hours", "11:00 hours", "11:30 hours"], answer: 1 },
  { id: 8, q: "Rule: anyone drinking alcohol must be over 18. Alpha is drinking alcohol; Beta is drinking juice; Gamma is 16 years old; Delta is 22 years old. Which entities must be checked to prove no rule violation?", options: ["Only Alpha and Gamma", "Only Alpha", "Alpha, Beta, Gamma, and Delta", "Only Alpha, Gamma, and Delta"], answer: 0 },
  { id: 9, q: "Suspension Alpha has active:solvent = 1:3; Beta has 1:4. They are mixed 2:3 by volume. Alpha alone yields 20% profit at its price. The mixture is sold at the same per-liter rate as Alpha (solvent is free). What is the profit/loss on the mixture?", options: ["25.55% profit", "36.36% profit", "18.18% deficit", "42.00% profit"], answer: 1 },
  { id: 10, q: "A vessel holds 40 cubic meters of brine at 15% salinity. 16 cubic meters of water evaporates (all salt retained). What is the new salinity?", options: ["20%", "22.5%", "25%", "31.5%"], answer: 2 },
  { id: 11, q: "5 distinct modules M1..M5 must be installed in fixed consecutive order along with 7 distinguishable chassis in a linear rack. How many unique arrangements are possible?", options: ["5,040", "40,320", "3,628,800", "39,916,800"], answer: 1 },
  { id: 12, q: "Algorithm Alpha processes 1 PB in 24 h; Beta in 36 h. Running concurrently for 8 h, what fraction of the 1 PB remains unprocessed?", options: ["5/9", "4/9", "7/18", "11/18"], answer: 1 },
  { id: 13, q: "On a standard 12-hour analog clock at exactly 08:30, what is the acute angle between the hour and minute hands?", options: ["60 degrees", "75 degrees", "85 degrees", "90 degrees"], answer: 1 },
  { id: 14, q: "Two numbers x and y satisfy x + y = 32 and |x - y| = 18. Find the product xy.", options: ["175", "225", "400", "576"], answer: 0 },
  { id: 15, q: "A UAV travels 24 km North, then turns 90 degrees East and travels 7 km. Find the straight-line distance from origin and heading.", options: ["25 km, North-East", "31 km, North-East", "25 km, North-West", "31 km, North-West"], answer: 0 },
  { id: 16, q: "In a study of 250 subjects: 130 react to Pathogen X, 110 to Pathogen Y, and 40 react to both. How many react to neither?", options: ["30", "50", "70", "90"], answer: 1 },
  { id: 17, q: "If u + v = 7 and uv = 10, find u^3 + v^3.", options: ["125", "133", "217", "343"], answer: 1 },
  { id: 18, q: "From a batch of 20 microprocessors (8 defective, 12 good), 3 are drawn without replacement. Probability that all 3 are good?", options: ["11/57", "33/95", "27/125", "12/57"], answer: 0 },
  { id: 19, q: "A 200 m long train moves at 144 km/h through a 600 m tunnel. How many seconds from the moment the nose enters until the tail fully exits?", options: ["15 seconds", "20 seconds", "22.5 seconds", "25 seconds"], answer: 1 },
  { id: 20, q: "If the radius of a circular wafer increases by 15%, what is the percentage increase in its surface area?", options: ["15.00%", "30.00%", "32.25%", "35.50%"], answer: 2 },
  { id: 21, q: "Principal of 12,000 INR is invested at 5% annual compound interest for 3 years. What is the total interest earned at maturity?", options: ["1,800.00 INR", "1,891.50 INR", "1,925.25 INR", "2,050.00 INR"], answer: 1 },
  { id: 22, q: "An asset was sold at 18% loss. Had it been sold for 680 INR more, it would have gained 16%. Find the original cost price.", options: ["2,000 INR", "2,500 INR", "3,400 INR", "4,000 INR"], answer: 0 },
  { id: 23, q: "Given 5^(2y - 1) = 3125, evaluate 4^(y + 2).", options: ["256", "1024", "4096", "16384"], answer: 1 },
  { id: 24, q: "If x + y = 5 and xy = 6, find x^3 + y^3.", options: ["35", "91", "125", "215"], answer: 0 },
  { id: 25, q: "A bag has 5 red and 7 blue balls. Two balls are drawn without replacement. Probability that both are red?", options: ["5/33", "5/12", "25/144", "10/33"], answer: 0 },
  { id: 26, q: "A 150 m train at 90 km/h crosses a 300 m bridge. Time taken?", options: ["10 seconds", "15 seconds", "18 seconds", "20 seconds"], answer: 2 },
  { id: 27, q: "Find the odd one out:", options: ["Sphere", "Cylinder", "Circle", "Cone"], answer: 2 },
  { id: 28, q: "Pointing to a photograph, a man said, 'I have no brother or sister but that man's father is my father's son.' Whose photograph was it?", options: ["His own", "His son's", "His father's", "His nephew's"], answer: 1 },
  { id: 29, q: "If the radius of a circle is increased by 20%, by what percentage does its area increase?", options: ["20%", "40%", "44%", "400%"], answer: 2 },
  { id: 30, q: "Which number is completely divisible by 9?", options: ["456138", "835261", "215982", "674512"], answer: 2 },
  { id: 31, q: "Despite the sudden downpour, the match continued ________.", options: ["uninterrupted", "sporadically", "reluctantly", "violently"], answer: 0 },
  { id: 32, q: "Simple interest on 5000 INR at 8% per annum for 3 years?", options: ["800 INR", "1200 INR", "1500 INR", "1800 INR"], answer: 1 },
  { id: 33, q: "Six people A, B, C, D, E, F sit around a circular table facing center. A is second to the left of B. C is opposite A. D is not an immediate neighbor of B. Who is to the immediate right of A?", options: ["E", "F", "Either E or F", "D"], answer: 2 },
  { id: 34, q: "A shopkeeper sells an article at 10% loss. Had he sold it for 45 INR more, he would have gained 5%. Cost price?", options: ["200 INR", "250 INR", "300 INR", "350 INR"], answer: 2 },
  { id: 35, q: "Analogy: Odometer : Mileage :: Compass : ________", options: ["Speed", "Hiking", "Needle", "Direction"], answer: 3 },
  { id: 36, q: "A paper is folded in half horizontally, then in half vertically. A hole is punched through all layers. How many holes when fully unfolded?", options: ["1", "2", "4", "8"], answer: 2 },
  { id: 37, q: "If 3^x = 81, find 2^(x-1).", options: ["4", "8", "16", "32"], answer: 1 },
  { id: 38, q: "Statement: 'To improve the city's air quality, the government has decided to ban all diesel vehicles older than 10 years.' Assumption I: Older diesel vehicles contribute significantly to air pollution. Assumption II: Banning these vehicles is the only way to improve air quality. Which is implicit?", options: ["Only Assumption I is implicit.", "Only Assumption II is implicit.", "Both I and II are implicit.", "Neither I nor II is implicit."], answer: 0 },
  { id: 39, q: "Researchers found that automated harvesting universally increased raw yield, yet cooperatives' aggregate profitability fell because hyper-localized market saturation destabilized price-elasticity. Which deduction is most logically rigorous?", options: ["Automated harvesting is inherently detrimental to long-term ecological sustainability.", "The financial deficit is exclusively due to mechanical maintenance costs.", "An increase in raw output does not unconditionally guarantee a proportional increase in profitability.", "Hyper-localized saturation is an inevitable consequence of all agricultural modernization."], answer: 2 },
  { id: 40, q: "Despite the investigator's assertion that the new framework would establish a transparent, universally applicable, and ________ paradigm for predicting particle trajectories, the publication was so densely layered with contradictory axioms and recursive logic that it only served to ________ the very phenomena it was engineered to clarify.", options: ["unambiguous ... obfuscate", "convoluted ... elucidate", "irrefutable ... synthesize", "esoteric ... propagate"], answer: 0 },
];

export const EXAMS: ExamCategory[] = [
  {
    id: "aptitude",
    title: "Aptitude Test",
    description: "Quantitative, logical reasoning & verbal ability.",
    durationMin: 40,
    accent: "from-sky-500 to-emerald-400",
    icon: "🧮",
    marksPerQuestion: 2,
    negativeMarkFraction: 0.25,
    questions: aptitudeQuestions,
  },
  {
    id: "dsa",
    title: "DSA Test",
    description: "Data Structures & Algorithms MCQs.",
    durationMin: 20,
    accent: "from-indigo-500 to-cyan-400",
    icon: "🧩",
    marksPerQuestion: 2,
    negativeMarkFraction: 0.25,
    questions: placeholder("DSA"),
  },
  {
    id: "coding",
    title: "Coding Round",
    description: "Code reasoning, dry-run & output prediction.",
    durationMin: 30,
    accent: "from-blue-600 to-teal-400",
    icon: "💻",
    marksPerQuestion: 2,
    negativeMarkFraction: 0.25,
    questions: placeholder("Coding"),
  },
  {
    id: "system",
    title: "System Understanding",
    description: "OS, Networks, DBMS fundamentals.",
    durationMin: 20,
    accent: "from-violet-500 to-sky-400",
    icon: "🖥️",
    marksPerQuestion: 2,
    negativeMarkFraction: 0.25,
    questions: placeholder("System"),
  },
  {
    id: "technical",
    title: "Technical Assessment",
    description: "Domain-specific technical evaluation.",
    durationMin: 25,
    accent: "from-emerald-500 to-lime-400",
    icon: "⚙️",
    marksPerQuestion: 2,
    negativeMarkFraction: 0.25,
    questions: placeholder("Technical"),
  },
];

export const getExam = (id: string) => EXAMS.find((e) => e.id === id);

// Fisher-Yates shuffle (non-mutating)
export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Shuffle questions AND options, remapping the answer index.
export function prepareExam(exam: ExamCategory): Question[] {
  return shuffle(exam.questions).map((q) => {
    const idxs = shuffle(q.options.map((_, i) => i));
    return {
      ...q,
      options: idxs.map((i) => q.options[i]),
      answer: idxs.indexOf(q.answer),
    };
  });
}
