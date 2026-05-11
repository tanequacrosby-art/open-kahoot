export type ReadingQuestion = {
  id: string;
  sol_standard: string;
  ccss_standard: string;
  question: string;
  choices: string[];
  answerIndex: number;
};

const mainIdeaTemplates = [
  (q: string) => `Which sentence best states the main idea of this passage?`,
  (q: string) => `What is the main point the author wants the reader to understand?`,
  (q: string) => `Which statement best summarizes the main idea of the text?`
];

const inferenceTemplates = [
  (q: string) => `Based on the passage, which inference can the reader make?`,
  (q: string) => `What can the reader conclude from the information in the passage?`,
  (q: string) => `Which idea is best supported by details in the passage?`
];

const vocabTemplates = [
  (word: string) => `What does the word "${word}" most nearly mean as it is used in the passage?`,
  (word: string) => `In the passage, what is the best meaning of the word "${word}"?`,
  (word: string) => `What is the meaning of "${word}" as it is used in the text?`
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateVariationsForQuestion(
  base: ReadingQuestion,
  options: { type?: "mainIdea" | "inference" | "vocab"; vocabWord?: string } = {}
): ReadingQuestion[] {
  const { type, vocabWord } = options;

  const variants: ReadingQuestion[] = [];

  // Decide which template set to use
  if (type === "mainIdea") {
    for (let i = 0; i < 3; i++) {
      variants.push({
        ...base,
        id: `${base.id}_v${i + 1}`,
        question: pickRandom(mainIdeaTemplates)(base.question)
      });
    }
  } else if (type === "inference") {
    for (let i = 0; i < 3; i++) {
      variants.push({
        ...base,
        id: `${base.id}_v${i + 1}`,
        question: pickRandom(inferenceTemplates)(base.question)
      });
    }
  } else if (type === "vocab" && vocabWord) {
    for (let i = 0; i < 3; i++) {
      variants.push({
        ...base,
        id: `${base.id}_v${i + 1}`,
        question: pickRandom(vocabTemplates)(vocabWord)
      });
    }
  } else {
    // default: just return the base as a single "variant"
    variants.push(base);
  }

  return variants;
}
