"use client";

import { createGameWithQuestions } from "@/lib/gameActions";
import type { Question } from "@/types/game";

export function startGame(questions: Question[]) {
  return createGameWithQuestions(questions);
}
