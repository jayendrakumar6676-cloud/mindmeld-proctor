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
    options: ["Option A", "Option B", "Option C", "Option D", "None of the above"],
    answer: 0,
  }));

// 30 aptitude questions — every question includes "None of the above" as the 5th option.
const aptitudeQuestions: Question[] = [
  { id: 1, q: "In an exhaustive macroeconomic analysis of post-industrial agrarian supply chains, researchers observed a profound operational paradox: while the systemic implementation of high-frequency automated harvesting sub-routines universally escalated the absolute raw material yield across all tested demographics, the aggregate profitability metrics of the adopting cooperatives paradoxically demonstrated a statistically significant negative correlation over a fiscal quadriennium. Further forensic market auditing revealed that the artificially accelerated yield vectors induced a hyper-localized market saturation, thereby completely destabilizing the equilibrium of the localized price-elasticity curve. Based strictly on the empirical data and causal relationships explicitly articulated in this synopsis, which of the following extrapolations represents the most logically rigorous deduction?",
    options: ["The deployment of automated harvesting sub-routines is inherently detrimental to the long-term ecological sustainability of agrarian sectors.", "The aggregate financial deficit incurred by the cooperatives is directly and exclusively attributable to the exorbitant mechanical maintenance costs of the automated systems.", "A quantifiable escalation in raw material output does not unconditionally guarantee a corresponding proportional increase in the aggregate profitability of the producing entity.", "Hyper-localized market saturation is an inevitable, unavoidable consequence of all technological modernization efforts within the agricultural industry.", "None of the above."], answer: 2 },
  { id: 2, q: "Algorithm Alpha, operating in isolation, requires 24 continuous hours to process one petabyte of data. Algorithm Beta requires 36 hours for the same volume. If both algorithms are executed concurrently for exactly 8 hours, what fraction of the one-petabyte dataset will remain unprocessed?",
    options: ["5/9", "4/9", "7/18", "11/18", "None of the above."], answer: 1 },
  { id: 3, q: "A regulatory compliance officer is auditing a designated consumption zone governed by a strict statutory mandate: 'Any biological entity engaging in the ingestion of ethanol-based beverages must possess a verified chronological age strictly exceeding 18 solar years.' The officer observes four entities: Entity Alpha is actively consuming an ethanol-based beverage; Entity Beta is consuming a non-alcoholic botanical extract; Entity Gamma's official identification verifies a chronological age of precisely 16 solar years; and Entity Delta possesses documentation proving an age of 22 solar years. To rigorously prove that no statutory violations are occurring, the officer must execute a state-verification procedure on which precise combination of entities?",
    options: ["Only Entity Alpha and Entity Gamma", "Only Entity Alpha", "Entity Alpha, Beta, Gamma, and Delta", "Only Entity Alpha, Gamma, and Delta", "None of the above."], answer: 0 },
  { id: 4, q: "Consider a continuous scalar variable x in the reals satisfying x^2 + x - 1 = 0. Deduce the exact numerical evaluation of the higher-order expression x^4 + 1/x^4.",
    options: ["1", "5", "7", "9", "None of the above."], answer: 2 },
  { id: 5, q: "During a high-altitude expedition, five researchers P, Q, R, S, T must arrange their sleeping bags in a strictly linear adjacent sequence. P, Q, and T strictly mandate non-adjacent placement relative to R. Furthermore, P and S expressly prohibit any proximity to Q's immediate left or right coordinates. Identify the exact left-to-right positional sequence.",
    options: ["R, S, P, T, Q", "Q, S, P, T, R", "R, P, S, T, Q", "P, S, R, T, Q", "None of the above."], answer: 0 },
  { id: 6, q: "A primary containment vessel holds exactly 40 cubic meters of brine at a 15% volumetric salinity concentration. Due to a prolonged thermal exposure cycle, exactly 16 cubic meters of the H2O solvent is evaporated, leaving the entire precipitate mass suspended. Determine the updated percentage salinity of the concentrated solution.",
    options: ["20%", "22.5%", "25%", "31.5%", "None of the above."], answer: 2 },
  { id: 7, q: "An algorithmic quantitative trading protocol liquidated a digital asset, realizing an 18% financial deficit relative to its initial fiat acquisition cost. Had the asset been liquidated at a price point exactly 680 INR higher, the transaction would have yielded a 16% fiscal surplus instead of a deficit. Determine the absolute initial fiat acquisition cost.",
    options: ["2,000 INR", "2,500 INR", "3,400 INR", "4,000 INR", "None of the above."], answer: 0 },
  { id: 8, q: "In the optimization of a multivariate non-linear cost function, u and v satisfy u + v = 7 and u*v = 10. Determine u^3 + v^3.",
    options: ["125", "133", "217", "343", "None of the above."], answer: 1 },
  { id: 9, q: "A perfect cube monolith is uniformly painted on its entire exterior surface, then partitioned orthogonally into exactly 27 isometric sub-cubes of identical dimensions. How many sub-cubes possess the paint coating on exactly two orthogonal faces?",
    options: ["4", "8", "12", "24", "None of the above."], answer: 2 },
  { id: 10, q: "Despite the investigator's assertion that the new framework would establish a transparent, universally applicable, and ________ paradigm for predicting anomalous particle trajectories, the publication was so densely layered with contradictory axioms and recursive logic loops that it only served to ________ the very phenomena it was engineered to clarify.",
    options: ["unambiguous ... obfuscate", "convoluted ... elucidate", "irrefutable ... synthesize", "esoteric ... propagate", "None of the above."], answer: 0 },
  { id: 11, q: "A datacenter engineer installs 5 proprietary modules (M1..M5) and 7 distinguishable generic chassis into a linear rack. The 5 modules must remain in the strict consecutive order M1, M2, M3, M4, M5 (each immediately adjacent to the next). Calculate the absolute number of unique linear configurations possible.",
    options: ["5,040", "40,320", "3,628,800", "39,916,800", "None of the above."], answer: 1 },
  { id: 12, q: "A physicist isolates two discrete superimposed energy states x and y. The sum of their eigenvalues is 32 and the absolute differential magnitude between them is exactly 18. Deduce the exact numerical product xy.",
    options: ["175", "225", "400", "576", "None of the above."], answer: 0 },
  { id: 13, q: "A recursive decryption algorithm's scaling state space satisfies 5^(2y - 1) = 3125. Evaluate the secondary exponential function 4^(y + 2).",
    options: ["256", "1024", "4096", "16384", "None of the above."], answer: 1 },
  { id: 14, q: "A demographer notes the current population is exactly 1,102,500 individuals after compounding annual growth at 5% year-over-year. What was the population baseline exactly 24 months prior?",
    options: ["1,000,000", "1,025,000", "1,050,000", "995,000", "None of the above."], answer: 0 },
  { id: 15, q: "At exactly 07:00, two locomotives start from the same coincident origin. The first heads North at a constant 80 km/h; the second heads South at 100 km/h. At what exact timestamp will the linear displacement between them reach exactly 540 km?",
    options: ["09:00 hours", "10:00 hours", "11:00 hours", "11:30 hours", "None of the above."], answer: 1 },
  { id: 16, q: "An epidemiological cohort of 250 test subjects yields: 130 react to Pathogen X, 110 react to Pathogen Y, and 40 react to both. How many subjects are entirely asymptomatic (react to neither)?",
    options: ["30", "50", "70", "90", "None of the above."], answer: 1 },
  { id: 17, q: "Suspension Alpha has active:solvent = 1:3; Beta has 1:4. They are blended in volumetric ratio 2:3. Selling Alpha alone yields a 20% profit margin at its per-liter price. The blended mixture is priced at the exact same per-liter rate as Alpha (inert solvent is free). What is the profit/loss percentage on the final mixture?",
    options: ["25.55% profit", "36.36% profit", "18.18% deficit", "42.00% profit", "None of the above."], answer: 1 },
  { id: 18, q: "A UAV launches from origin, displaces 24 km strictly North, then yaws 90 degrees starboard (East) and proceeds 7 km. Determine the linear displacement magnitude from origin to final destination, and the overall heading.",
    options: ["25 km, North-East", "31 km, North-East", "25 km, North-West", "31 km, North-West", "None of the above."], answer: 0 },
  { id: 19, q: "12,000 INR is invested in a fixed-yield instrument at 5% per annum, compounded annually over exactly 3 fiscal years. What is the total accumulated interest at maturity?",
    options: ["1,800.00 INR", "1,891.50 INR", "1,925.25 INR", "2,050.00 INR", "None of the above."], answer: 1 },
  { id: 20, q: "From a batch of 20 microprocessors (8 defective, 12 fully functional), a technician extracts 3 at random without replacement. What is the exact probability that all 3 extracted units are fully functional?",
    options: ["11/57", "33/95", "27/125", "12/57", "None of the above."], answer: 0 },
  { id: 21, q: "A maglev carriage of total length 200 meters sustains a constant velocity of 144 km/h and traverses a subterranean tunnel of length 600 meters. Calculate the absolute duration in seconds from the moment the nose-cone enters the tunnel until the rear tail-section fully exits.",
    options: ["15 seconds", "20 seconds", "22.5 seconds", "25 seconds", "None of the above."], answer: 1 },
  { id: 22, q: "A perfectly circular silicon wafer undergoes isotropic thermal expansion such that its radius increases by exactly 15%. What is the corresponding percentage increase in its total two-dimensional surface area?",
    options: ["15.00%", "30.00%", "32.25%", "35.50%", "None of the above."], answer: 2 },
  { id: 23, q: "In a recent journal publication analyzing the anomalous behavior of quantum entanglements, the lead researcher described the resulting data fluctuations as possessing a quality that defies all known logical frameworks, making it entirely impossible to rationalize, interpret, or articulate. Which lexical choice most accurately encapsulates the researcher's characterization?",
    options: ["Incomprehensible", "Indelible", "Inextricable", "Infallible", "None of the above."], answer: 0 },
  { id: 24, q: "Despite a prolonged media campaign engineered to erode his credibility through baseless allegations of misconduct, the esteemed magistrate's reputation within the jurisprudential community ultimately proved to be completely ________.",
    options: ["undiminished", "resolved", "illegal", "uncertain", "None of the above."], answer: 0 },
  { id: 25, q: "On a standard 12-hour analog dial, what is the precise acute angular divergence (in degrees) between the hour and minute hands at exactly 08:30?",
    options: ["60 degrees", "75 degrees", "85 degrees", "90 degrees", "None of the above."], answer: 1 },
  { id: 26, q: "If x + y = 5 and x*y = 6, what is the value of x^3 + y^3?",
    options: ["35", "91", "125", "215", "None of the above."], answer: 0 },
  { id: 27, q: "Statement: 'To improve the city's air quality, the government has decided to ban all diesel vehicles older than 10 years.' Assumption I: Older diesel vehicles contribute significantly to air pollution. Assumption II: Banning these vehicles is the only way to improve air quality. Which is implicit?",
    options: ["Only Assumption I is implicit.", "Only Assumption II is implicit.", "Both I and II are implicit.", "Neither I nor II is implicit.", "None of the above."], answer: 0 },
  { id: 28, q: "A bag contains 5 red balls and 7 blue balls. Two balls are drawn at random without replacement. What is the probability that both drawn balls are red?",
    options: ["5/33", "5/12", "25/144", "10/33", "None of the above."], answer: 0 },
  { id: 29, q: "A piece of paper is folded in half horizontally, then in half vertically. A single circular hole is punched through all layers. How many holes are visible when the paper is fully unfolded?",
    options: ["1", "2", "4", "8", "None of the above."], answer: 2 },
  { id: 30, q: "If the radius of a circle is increased by 20%, by what percentage does its area increase?",
    options: ["20%", "40%", "44%", "400%", "None of the above."], answer: 2 },
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
