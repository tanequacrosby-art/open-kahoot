"use server";

import type { Question, Game } from "@/types/game";
import { v4 as uuidv4 } from "uuid";

const GAME_STORE: Record<string, Game> = {};

export async function createGameWithQuestions(questions: Question[]) {
  const id = uuidv4().slice(0, 8);

  const game: Game = {
    id,
    pin: id,
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

  // ❌ remove redirect()
  // return the ID instead
  return id;
}
