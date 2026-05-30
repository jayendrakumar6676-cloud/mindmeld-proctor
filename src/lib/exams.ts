export interface Question {
  id: number;
  q: string;
  options: string[];
  answer: number; // index 0-3
}

export interface ExamCategory {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  accent: string;
  icon: string;
  marksPerQuestion: number;
  negativeMarkFraction: number; // e.g. 0.25 means -1/4 of marksPerQuestion
  questions: Question[];
}

const placeholder = (topic: string): Question[] =>
  Array.from({ length: 5 }).map((_, i) => ({
    id: i + 1,
    q: `[${topic}] Sample question ${i + 1} — replace this with your real question.`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    answer: 0,
  }));

const aptitudeQuestions: Question[] = [
  { id: 1, q: "In a recent journal publication analyzing the anomalous behavior of quantum entanglements, the lead researcher described the resulting data fluctuations as possessing a quality that defies all known logical frameworks, making it entirely impossible to rationalize, interpret, or articulate. Which of the following lexical choices most accurately encapsulates the researcher's characterization of the phenomenon?",
    options: ["Incomprehensible", "Indelible", "Inextricable", "Infallible"], answer: 0 },
  { id: 2, q: "A demographer analyzing the urban sprawl of a metropolitan sector noted that its demographic count currently stands at exactly 1,102,500 individuals. According to the census bureau's historical data models, this sector has experienced a compounding annual growth trajectory, strictly adhering to a 5% expansion rate year-over-year. Assuming no exogenous variables disrupted this continuous compound growth function, what was the exact demographic baseline of this sector exactly twenty-four months prior to the current measurement?",
    options: ["1,000,000", "1,025,000", "1,050,000", "995,000"], answer: 0 },
  { id: 3, q: "During a high-altitude expedition, a quintet of researchers—designated P, Q, R, S, and T—must arrange their sleeping bags in a strictly linear adjacent sequence within a primary atmospheric tent. R suffers from chronic sleep apnea, so P, Q, and T mandate a non-adjacent placement relative to R. Q exhibits involuntary somnambulistic clutching, so P and S prohibit any proximity to Q's immediate left or right. Identify the exact left-to-right positional sequence of the subjects.",
    options: ["R, S, P, T, Q", "Q, S, P, T, R", "R, P, S, T, Q", "P, S, R, T, Q"], answer: 0 },
  { id: 4, q: "An architect conceptualizes a perfect hexahedron monolith, applying a uniform layer of crimson polymeric coating across its entire exterior surface. It is partitioned orthogonally into exactly 27 isometric sub-hexahedrons of identical volume. How many sub-components possess the crimson coating on exactly two orthogonal planes?",
    options: ["4", "8", "12", "24"], answer: 2 },
  { id: 5, q: "Despite a prolonged and highly publicized media campaign engineered to systematically erode his professional credibility through the proliferation of baseless and fabricated allegations of judicial misconduct, the esteemed magistrate's overarching reputation and authoritative standing within the jurisprudential community ultimately proved to be completely ________.",
    options: ["undiminished", "resolved", "illegal", "uncertain"], answer: 0 },
  { id: 6, q: "Consider a continuous scalar variable x in the real numbers satisfying x^2 + x - 1 = 0. Deduce the exact numerical value of x^4 + 1/x^4.",
    options: ["1", "5", "7", "9"], answer: 2 },
  { id: 7, q: "At exactly 07:00 hours, two locomotives start from the same point. The first travels North at 80 km/h; the second travels South at 100 km/h. At what time will the distance between them be exactly 540 km?",
    options: ["09:00 hours", "10:00 hours", "11:00 hours", "11:30 hours"], answer: 1 },
  { id: 8, q: "Rule: anyone consuming an ethanol-based beverage must be strictly over 18 years old. Alpha is drinking alcohol; Beta is drinking a non-alcoholic extract; Gamma is verified as 16 years old; Delta is verified as 22 years old. Which entities must be checked to rigorously prove no violations are occurring?",
    options: ["Only Alpha and Gamma", "Only Alpha", "Alpha, Beta, Gamma, and Delta", "Only Alpha, Gamma, and Delta"], answer: 0 },
  { id: 9, q: "Suspension Alpha has active:solvent = 1:3; Suspension Beta has 1:4. They are mixed in ratio 2:3 by volume. Alpha alone yields a 20% profit when sold. The mixture is sold at the same per-liter rate as Alpha. Solvent is free. What is the profit/loss percentage on the mixture?",
    options: ["25.55% profit", "36.36% profit", "18.18% deficit", "42.00% profit"], answer: 1 },
  { id: 10, q: "A vessel holds 40 m³ of brine at 15% salinity. 16 m³ of water evaporates with all salt remaining. What is the new salinity?",
    options: ["20%", "22.5%", "25%", "31.5%"], answer: 2 },
  { id: 11, q: "5 distinct modules M1..M5 must be installed in a fixed consecutive order (M1 immediately before M2, etc.) along with 7 distinguishable chassis in a linear rack. How many unique arrangements are possible?",
    options: ["5,040", "40,320", "3,628,800", "39,916,800"], answer: 1 },
  { id: 12, q: "Algorithm Alpha processes 1 PB in 24 hours; Beta in 36 hours. Running concurrently for 8 hours, what fraction of the 1 PB dataset remains unprocessed?",
    options: ["5/9", "4/