import base35 from "@/sol-questions/reading_3_5.json";
import base44 from "@/sol-questions/reading_4_4.json";
import base55 from "@/sol-questions/reading_5_5.json";

import { generateVariationsForQuestion } from "@/lib/readingVariationEngine";

export function loadReadingSOLSet(standard: "3.5" | "4.4" | "5.5") {
  let baseQuestions;

  if (standard === "3.5") baseQuestions = base35;
  if (standard === "4.4") baseQuestions = base44;
  if (standard === "5.5") baseQuestions = base55;

  const expanded: any[] = [];

  for (const q of baseQuestions) {
    // Generate 3 variations per question
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
