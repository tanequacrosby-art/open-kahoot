import type { Question } from "@/types/game";

export type VariationOptions = {
  type: "vocab" | "inference" | "mainIdea";
  vocabWord?: string;
};

export function generateVariationsForQuestion(
  base: Question,
  opts: VariationOptions
): Question[] {
  const { type, vocabWord } = opts;

  const variations: Question[] = [];

  // -----------------------------
  // VARIATION 1 — Shuffle options
  // -----------------------------
  const shuffledOptions = [...base.options].sort(() => Math.random() - 0.5);

  variations.push({
    ...base,
    id: `${base.id}-var1`,
    options: shuffledOptions,
    correctAnswer: base.correctAnswer
  });

  // -----------------------------
  // VARIATION 2 — Vocabulary focus
  // -----------------------------
  if (type === "vocab" && vocabWord) {
    variations.push({
      ...base,
      id: `${base.id}-var2`,
      prompt: `What does the word "${vocabWord}" MOST LIKELY mean in the sentence?`,
      options: [...base.options],
      correctAnswer: base.correctAnswer
    });
  }

  // -----------------------------
  // VARIATION 3 — Inference focus
  // -----------------------------
  if (type === "inference") {
    variations.push({
      ...base,
      id: `${base.id}-var3`,
      prompt: `What can the reader INFER from this sentence?`,
      options: [...base.options],
      correctAnswer: base.correctAnswer
    });
  }

  // -----------------------------
  // VARIATION 4 — Main idea focus
  // -----------------------------
  if (type === "mainIdea") {
    variations.push({
      ...base,
      id: `${base.id}-var4`,
      prompt: `What is the MAIN IDEA of this sentence?`,
      options: [...base.options],
      correctAnswer: base.correctAnswer
    });
  }

  return variations;
}
