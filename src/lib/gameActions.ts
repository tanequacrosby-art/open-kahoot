"use server";

import { redirect } from "next/navigation";
import type { Question } from "@/types/game";

// This function creates a game session and redirects the host to the game screen
export async function createGameWithQuestions(questions: Question[]) {
  // Store the questions in a temporary session (in-memory or DB)
  // For now, we’ll use a simple global store (works on Netlify too)

  globalThis.__GAME__ = {
    id: Math.random().toString(36).slice(2, 8),
    questions,
    createdAt: Date.now(),
  };

  // Redirect host to the game lobby
  redirect(`/game/${globalThis.__GAME__.id}`);
}
