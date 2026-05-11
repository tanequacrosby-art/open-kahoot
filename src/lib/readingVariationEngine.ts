import type { SOLQuestion } from "@/types/sol";

type VariationOptions = {
  type: "vocab" | "inference" | "mainIdea";
  vocabWord?: string;
};

export function generateVariationsForQuestion(
  base: SOLQuestion,
  opts: VariationOptions
): SOLQuestion[] {
  const variations: SOLQuestion[] = [];

  // Variation 1 — Vocabulary
  if (opts.type === "vocab" && opts.vocabWord) {
    variations.push({
      ...base,
      id: `${base.id}-v1`,
      question: `What does the word "${opts.vocabWord}" MOST LIKELY mean in the sentence?`,
    });
  }

  // Variation 2 — Inference
  if (opts.type === "inference") {
    variations.push({
      ...base,
      id: `${base.id}-v2`,
      question: `What can the reader INFER from this sentence?`,
    });
  }

  // Variation 3 — Main Idea
  if (opts.type === "mainIdea") {
    variations.push({
      ...base,
      id: `${base.id}-v3`,
      question: `What is the MAIN IDEA of this sentence?`,
    });
  }

  return variations;
}
