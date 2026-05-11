import base35 from "@/sol-questions/reading_3_5.json";
import base44 from "@/sol-questions/reading_4_4.json";
import base55 from "@/sol-questions/reading_5_5.json";

import { generateVariationsForQuestion } from "@/lib/readingVariationEngine";

type SOLQuestion = {
  id: string;
  standard: string;
  question: string;
  choices: string[];
  answerIndex: number;
};

export function loadReadingSOLSet(standard: "3.5" | "4.4" | "5.5") {
  let baseQuestions: SOLQuestion[] | undefined;

  if (standard === "3.5") baseQuestions = base35 as SOLQuestion[];
  if (standard === "4.4") baseQuestions = base44 as SOLQuestion[];
  if (standard === "5.5") baseQuestions = base55 as SOLQuestion[];

  // Safety check — prevents undefined errors
  if (!baseQuestions) {
    console.warn(`No SOL questions found for standard: ${standard}`);
    return [];
  }

  const expanded: SOLQuestion[] = [];

  for (const q of baseQuestions) {
    const type =
      q.question.includes("mean") ? "vocab" :
      q.question.includes("infer") ? "inference" :
      "mainIdea";

    const vocabWord = q.question.match(/"(.*?)"/)?.[1];

    const variants = generateVariationsForQuestion(q, {
      type,
      vocabWord
    });

    expanded.push(q, ...variants);
  }

  // Shuffle so every game is different
  return expanded.sort(() => Math.random() - 0.5);
}
