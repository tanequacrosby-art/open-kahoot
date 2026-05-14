import base35 from "@/sol-questions/reading_3_5.json";
import base44 from "@/sol-questions/reading_4_4.json";
import base55 from "@/sol-questions/reading_5_5.json";

import { generateVariationsForQuestion } from "@/lib/client/readingVariationEngine";
import type { Question } from "@/types/game";

type RawSOLQuestion = {
  id: string;
  sol_standard: string;
  ccss_standard: string;
  question: string;
  choices: string[];
  answerIndex: number;
};

export function loadReadingSOLSet(standard: "3.5" | "4.4" | "5.5"): Question[] {
  let baseQuestions: RawSOLQuestion[] | undefined;

  if (standard === "3.5") baseQuestions = base35 as RawSOLQuestion[];
  if (standard === "4.4") baseQuestions = base44 as RawSOLQuestion[];
  if (standard === "5.5") baseQuestions = base55 as RawSOLQuestion[];

  if (!baseQuestions) {
    console.warn(`No SOL questions found for standard: ${standard}`);
    return [];
  }

  const expanded: Question[] = [];

  for (const q of baseQuestions) {
    const baseConverted: Question = {
      id: q.id,
      prompt: q.question,
      options: q.choices,
      correctAnswer: q.choices[q.answerIndex],
      timeLimit: 20,
      standard: q.sol_standard,
      explanation: undefined,
      image: undefined
    };

    const type =
      q.question.includes("mean") ? "vocab" :
      q.question.includes("infer") ? "inference" :
      "mainIdea";

    const vocabWord = q.question.match(/"(.*?)"/)?.[1];

    const variants = generateVariationsForQuestion(baseConverted, {
      type,
      vocabWord
    });

    const cleanedVariants: Question[] = variants.map((v, i) => ({
      id: `${q.id}-v${i + 1}`,
      prompt: v.prompt ?? baseConverted.prompt,
      options: v.options ?? baseConverted.options,
      correctAnswer: v.correctAnswer ?? baseConverted.correctAnswer,
      timeLimit: v.timeLimit ?? 20,
      standard: v.standard ?? q.sol_standard,
      explanation: v.explanation,
      image: v.image
    }));

    expanded.push(baseConverted, ...cleanedVariants);
  }

  return expanded.sort(() => Math.random() - 0.5);
}
