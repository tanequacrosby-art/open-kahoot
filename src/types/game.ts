export interface Question {
  id: string;
  prompt: string;            // The question text shown to players
  options: string[];         // Multiple-choice options
  correctAnswer: string;     // The actual correct answer text
  timeLimit: number;         // Seconds allowed to answer
  standard: string;          // SOL standard (e.g., "3.5")
  explanation?: string;
  image?: string;
}

export interface AnswerRecord {
  playerId: string;
  playerName: string;
  questionIndex: number;
  questionId: string;
  answerIndex: number | null; // null if no answer was given
  answerTime?: number;
  responseTime: number;       // milliseconds from question start
  pointsEarned: number;
  wasCorrect: boolean;
  hasDyslexiaSupport: boolean;
}

export interface GameSettings {
  thinkTime: number;          // Time before answering is allowed
  answerTime: number;         // Time allowed to answer
}

export type GamePhase =
  | "waiting"
  | "preparation"
  | "thinking"
  | "answering"
  | "results"
  | "leaderboard"
  | "finished";

export interface Player {
  id: string;
  name: string;
  socketId: string;
  isHost: boolean;
  isConnected: boolean;

  wasCorrect?: boolean;
  pointsEarned?: number;
  streak?: number;

  hasDyslexiaSupport?: boolean;   // ← ADD THIS

  score: number;
  currentAnswer?: number | string;
  answerTime?: number;
}

export interface Game {
  id: string;
  pin: string;
  hostId: string;
  title: string;
  questions: Question[];
  settings: GameSettings;
  currentQuestionIndex: number;
  status: GamePhase;
  phase: GamePhase;
  players: Player[];
  questionStartTime?: number;
  phaseStartTime?: number;
  phaseEndTime?: number;
  gameLoopActive?: boolean;
  answerHistory: AnswerRecord[];
}

export interface GameStats {
  question: Question;
  answers: {
    optionIndex: number;
    count: number;
    percentage: number;
  }[];
  correctAnswers: number;
  totalPlayers: number;
}

export interface PersonalResult {
  wasCorrect: boolean;
  pointsEarned: number;
  totalScore: number;
  position: number;
  pointsBehind: number;
  nextPlayerName: string | null;
  explanation?: string;
}

export interface ServerToClientEvents {
  gameJoined: (game: Game) => void;
  gameStarted: (game: Game) => void;
  questionStarted: (question: Question, timeLimit: number) => void;
  thinkingPhase: (question: Question, thinkTime: number) => void;
  answeringPhase: (answerTime: number) => void;
  questionEnded: (stats: GameStats) => void;
  hostResults: (stats: GameStats) => void;
  personalResult: (result: PersonalResult) => void;
  leaderboardShown: (leaderboard: Player[], game: Game) => void;
  gameFinished: (finalScores: Player[]) => void;
  playerJoined: (player: Player) => void;
  playerReconnected: (player: Player) => void;
  playerLeft: (playerId: string) => void;
  playerDisconnected: (playerId: string) => void;
  error: (message: string) => void;
  playerAnswered: (playerId: string) => void;
  gameLogs: (tsvData: string, filename: string) => void;
  gameUpdated: (game: Game) => void;
}

export interface ClientToServerEvents {
  createGame: (
    title: string,
    questions: Question[],
    settings: GameSettings,
    callback: (game: Game) => void
  ) => void;

  joinGame: (
    pin: string,
    playerName: string,
    persistentId?: string,
    callback?: (success: boolean, game?: Game, playerId?: string) => void
  ) => void;

  validateGame: (
    gameId: string,
    callback: (valid: boolean, game?: Game) => void
  ) => void;

  startGame: (gameId: string) => void;

  submitAnswer: (
    gameId: string,
    questionId: string,
    answerIndex: number,
    persistentId?: string
  ) => void;

  nextQuestion: (gameId: string) => void;
  showLeaderboard: (gameId: string) => void;
  endGame: (gameId: string) => void;
  downloadGameLogs: (gameId: string) => void;
  toggleDyslexiaSupport: (gameId: string, playerId: string) => void;
}
