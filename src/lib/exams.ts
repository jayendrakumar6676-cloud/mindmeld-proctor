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
