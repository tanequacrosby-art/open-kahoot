"use server";

import { redirect } from "next/navigation";
import type { Question, Game } from "@/types/game";
import { v4 as uuidv4 } from "uuid";

// Temporary in‑memory store (Netlify safe)
const GAME_STORE: Record<string, Game> = {};

export async function createGameWithQuestions(questions: Question[]) {
  const id = uuidv4().slice(0, 8);

  const game: Game = {
    id,
    pin: id, // or generate a PIN elsewhere
    hostId: "",
    title: "New Game",
    questions,
    settings: {
      thinkTime: 5,
      answerTime: 20
    },
    currentQuestionIndex: -1,
    status: "waiting",
    phase: "waiting",
    players: [],
    answerHistory: []
  };

  GAME_STORE[id] = game;

  redirect(`/game/${id}`);
}
