"use client";

import { createGameWithQuestions } from "@/lib/server/gameActions";
import type { Question } from "@/types/game";
import { useRouter } from "next/navigation";

export async function startGame(questions: Question[]) {
  const id = await createGameWithQuestions(questions);
  window.location.href = `/game/${id}`;
}
