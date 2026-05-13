"use client";

import { createGameWithQuestions } from "@/lib/gameActions";

export function startGame(questions) {
  return createGameWithQuestions(questions);
}
