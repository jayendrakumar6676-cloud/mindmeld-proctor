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

const NOTA = "None of the above.";
const Q = (id: number, q: string, options: string[], answer: number): Question => ({ id, q, options, answer });

const aptitudeQuestions: Question[] = [
  Q(1, "In an exhaustive macroeconomic analysis of post-industrial agrarian supply chains, researchers observed a profound operational paradox: while the systemic implementation of high-frequency automated harvesting sub-routines universally escalated the absolute raw material yield across all tested demographics, the aggregate profitability metrics of the adopting cooperatives paradoxically demonstrated a statistically significant negative correlation over a fiscal quadriennium. Further forensic market auditing revealed that the artificially accelerated yield vectors induced a hyper-localized market saturation, thereby completely destabilizing the equilibrium of the localized price-elasticity curve. Based strictly on the empirical data and causal relationships explicitly articulated in this synopsis, which of the following extrapolations represents the most logically rigorous deduction?",
    ["The deployment of automated harvesting sub-routines is inherently detrimental to the long-term ecological sustainability of agrarian sectors.", "The aggregate financial deficit incurred by the cooperatives is directly and exclusively attributable to the exorbitant mechanical maintenance costs of the automated systems.", "A quantifiable escalation in raw material output does not unconditionally guarantee a corresponding proportional increase in the aggregate profitability of the producing entity.", "Hyper-localized market saturation is an inevitable, unavoidable consequence of all technological modernization efforts within the agricultural industry.", NOTA], 2),
  Q(2, "Algorithm Alpha, operating in isolation, requires 24 continuous hours to process one petabyte of data. Algorithm Beta requires 36 hours for the same volume. If both algorithms are executed concurrently for exactly 8 hours, what fraction of the one-petabyte dataset will remain unprocessed?",
    ["5/9", "4/9", "7/18", "11/18", NOTA], 1),
  Q(3, "A regulatory compliance officer is auditing a designated consumption zone governed by a strict statutory mandate: 'Any biological entity engaging in the ingestion of ethanol-based beverages must possess a verified chronological age strictly exceeding 18 solar years.' The officer observes four entities: Entity Alpha is actively consuming an ethanol-based beverage; Entity Beta is consuming a non-alcoholic botanical extract; Entity Gamma's official identification verifies a chronological age of precisely 16 solar years; and Entity Delta possesses documentation proving an age of 22 solar years. To rigorously prove that no statutory violations are occurring, the officer must execute a state-verification procedure on which precise combination of entities?",
    ["Only Entity Alpha and Entity Gamma", "Only Entity Alpha", "Entity Alpha, Beta, Gamma, and Delta", "Only Entity Alpha, Gamma, and Delta", NOTA], 0),
  Q(4, "Consider a continuous scalar variable x in the reals satisfying x^2 + x - 1 = 0. Deduce the exact numerical evaluation of the higher-order expression x^4 + 1/x^4.",
    ["1", "5", "7", "9", NOTA], 2),
  Q(5, "During a high-altitude expedition, five researchers P, Q, R, S, T must arrange their sleeping bags in a strictly linear adjacent sequence. P, Q, and T strictly mandate non-adjacent placement relative to R. Furthermore, P and S expressly prohibit any proximity to Q's immediate left or right coordinates. Identify the exact left-to-right positional sequence.",
    ["R, S, P, T, Q", "Q, S, P, T, R", "R, P, S, T, Q", "P, S, R, T, Q", NOTA], 0),
  Q(6, "A primary containment vessel holds exactly 40 cubic meters of brine at a 15% volumetric salinity concentration. Due to a prolonged thermal exposure cycle, exactly 16 cubic meters of the H2O solvent is evaporated, leaving the entire precipitate mass suspended. Determine the updated percentage salinity of the concentrated solution.",
    ["20%", "22.5%", "25%", "31.5%", NOTA], 2),
  Q(7, "An algorithmic quantitative trading protocol liquidated a digital asset, realizing an 18% financial deficit relative to its initial fiat acquisition cost. Had the asset been liquidated at a price point exactly 680 INR higher, the transaction would have yielded a 16% fiscal surplus instead of a deficit. Determine the absolute initial fiat acquisition cost.",
  Q(8, "u + v = 7 and u*v = 10. Determine u^3 + v^3.", ["125", "133", "217", "343", NOTA], 1),
  Q(9, "A cube painted on the exterior is partitioned into 27 isometric sub-cubes. How many have paint on exactly two faces?", ["4", "8", "12", "24", NOTA], 2),
  Q(10, "Despite the investigator's assertion that the new framework would establish a transparent, universally applicable, and ________ paradigm for predicting anomalous particle trajectories, the publication was so densely layered with contradictory axioms and recursive logic loops that it only served to ________ the very phenomena it was engineered to clarify.",
    ["unambiguous ... obfuscate", "convoluted ... elucidate", "irrefutable ... synthesize", "esoteric ... propagate", NOTA], 0),
  Q(11, "5 modules (M1..M5, must stay consecutive in order) + 7 distinguishable chassis placed linearly. Total unique configurations?", ["5,040", "40,320", "3,628,800", "39,916,800", NOTA], 1),
  Q(12, "x + y = 32, |x - y| = 18. Compute xy.", ["175", "225", "400", "576", NOTA], 0),
  Q(13, "5^(2y - 1) = 3125. Evaluate 4^(y + 2).", ["256", "1024", "4096", "16384", NOTA], 1),
  Q(14, "Current population is 1,102,500 after 2 years of compounding at 5%/yr. Baseline 24 months prior?", ["1,000,000", "1,025,000", "1,050,000", "995,000", NOTA], 0),
  Q(15, "Two locomotives leave the same origin at 07:00; one North at 80 km/h, one South at 100 km/h. When is the separation exactly 540 km?", ["09:00", "10:00", "11:00", "11:30", NOTA], 1),
  Q(16, "Cohort of 250: 130 react to X, 110 react to Y, 40 react to both. How many are asymptomatic?", ["30", "50", "70", "90", NOTA], 1),
  Q(17, "Alpha has active:solvent = 1:3; Beta 1:4. Blended 2:3 by volume. Alpha alone gives 20% profit at its per-liter price. Mixture is priced equal to Alpha (solvent free). Profit/loss % on mixture?",
    ["25.55% profit", "36.36% profit", "18.18% deficit", "42.00% profit", NOTA], 1),
  Q(18, "A UAV goes 24 km North, yaws 90° starboard (East) and goes 7 km. Displacement magnitude and heading?",
    ["25 km, NE", "31 km, NE", "25 km, NW", "31 km, NW", NOTA], 0),
  Q(19, "12,000 INR invested at 5% p.a. compounded annually for 3 years. Total accumulated interest?",
    ["1,800.00", "1,891.50", "1,925.25", "2,050.00", NOTA], 1),
  Q(20, "20 microprocessors (8 defective, 12 functional). Draw 3 without replacement. P(all 3 functional)?",
    ["11/57", "33/95", "27/125", "12/57", NOTA], 0),
  Q(21, "A 200 m maglev at 144 km/h traverses a 600 m tunnel. Seconds from nose entering to tail exiting?",
    ["15", "20", "22.5", "25", NOTA], 1),
  Q(22, "A circular wafer's radius increases by 15%. % increase in area?",
    ["15.00%", "30.00%", "32.25%", "35.50%", NOTA], 2),
  Q(23, "Data fluctuations defy all known frameworks — impossible to rationalize, interpret, or articulate. Best single word?",
    ["Incomprehensible", "Indelible", "Inextricable", "Infallible", NOTA], 0),
  Q(24, "Despite a media campaign of baseless allegations, the magistrate's reputation proved completely ________.",
    ["undiminished", "resolved", "illegal", "uncertain", NOTA], 0),
  Q(25, "Acute angle between hour and minute hands at 08:30?", ["60°", "75°", "85°", "90°", NOTA], 1),
  Q(26, "x + y = 5 and x*y = 6. Find x^3 + y^3.", ["35", "91", "125", "215", NOTA], 0),
  Q(27, "Statement: 'Ban diesel vehicles older than 10 years to improve air quality.' I: Older diesel vehicles pollute significantly. II: Banning is the only way to improve air quality. Implicit?",
    ["Only I", "Only II", "Both I and II", "Neither", NOTA], 0),
  Q(28, "Bag with 5 red, 7 blue balls. Draw 2 without replacement. P(both red)?", ["5/33", "5/12", "25/144", "10/33", NOTA], 0),
  Q(29, "Paper folded in half horizontally then vertically. One circular hole punched through all layers. How many holes when fully unfolded?",
    ["1", "2", "4", "8", NOTA], 2),
  Q(30, "Radius of a circle increased by 20%. % increase in area?", ["20%", "40%", "44%", "400%", NOTA], 2),
];

// 20 Pro-Level System Design & Architecture MCQs.
const systemQuestions: Question[] = [
  Q(1, "In an HTTP/2 architecture, multiple client requests are multiplexed over a single TCP connection to an Express API Gateway. If a single packet containing a partial payload for Request A is lost in transit, what happens to Request B, which is fully received and queued behind it?",
    ["Request B is processed immediately because HTTP/2 streams are independent at the application layer.",
     "Request B is blocked until the missing packet for Request A is retransmitted and acknowledged, due to TCP's strict ordered delivery (TCP head-of-line blocking).",
     "The TCP connection automatically falls back to HTTP/1.1 to process Request B.",
     "The API Gateway drops both requests and forces a new TLS handshake.", NOTA], 1),
  Q(2, "You are designing a high-throughput time-series DB and choose an LSM-Tree over a B-Tree. What is a primary trade-off of LSM-Trees?",
    ["LSM-Trees suffer from extreme Write Amplification, burning out SSDs faster than B-Trees.",
     "LSM-Trees provide faster reads but slower writes than B-Trees.",
     "LSM-Trees require continuous background compaction that can cause periodic latency spikes during reads.",
     "LSM-Trees cannot support range queries or sequential scans.", NOTA], 2),
  Q(3, "A high-frequency trading platform needs minimum latency. The load balancer only needs to distribute traffic based on IP and Port — no HTTP inspection. Which strategy fits?",
    ["Layer 7 HTTP Reverse Proxy", "Layer 4 Transport Level Load Balancing", "Application-Level Anycast", "DNS Round Robin with low TTL", NOTA], 1),
  Q(4, "According to PACELC, what trade-off must a distributed DB (Cassandra/DynamoDB) make during normal operation when there is Else (E) no partition?",
    ["Latency (L) versus Consistency (C)", "Availability (A) versus Durability (D)", "Partition Tolerance (P) versus Latency (L)", "Consistency (C) versus Partition Tolerance (P)", NOTA], 0),
  Q(5, "CQRS with normalized PostgreSQL Command DB and denormalized ElasticSearch Query DB. Most significant architectural challenge?",
    ["The system can no longer handle concurrent writes.",
     "You must handle Eventual Consistency between Command and Query DBs — users may read stale data right after a write.",
     "ElasticSearch cannot be horizontally scaled if used only for queries.",
     "The API Gateway must execute 2PC across both DBs for every read.", NOTA], 1),
