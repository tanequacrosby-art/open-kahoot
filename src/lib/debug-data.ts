import type {
  Game,
  Question,
  GameSettings,
  Player,
  GameStats,
  PersonalResult
} from '@/types/game';

/* ---------------------------------------------
   MOCK QUESTIONS (SOL‑compatible)
---------------------------------------------- */

export const mockQuestions: Question[] = [
  {
    id: '1',
    prompt: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 'Paris',
    timeLimit: 30,
    standard: 'SOL-1.1',
    explanation:
      'Paris is the capital of France, known for its art, fashion, and culture.'
  },
  {
    id: '2',
    prompt: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 'Mars',
    timeLimit: 30,
    standard: 'SOL-4.4',
    explanation:
      'Mars is called the Red Planet because of its reddish appearance, caused by iron oxide on its surface.'
  },
  {
    id: '3',
    prompt: 'Who painted the Mona Lisa?',
    options: [
      'Vincent van Gogh',
      'Pablo Picasso',
      'Leonardo da Vinci',
      'Claude Monet'
    ],
    correctAnswer: 'Leonardo da Vinci',
    timeLimit: 30,
    standard: 'SOL-3.2',
    explanation:
      'The Mona Lisa was painted by the Italian artist Leonardo da Vinci.',
    image: 'data:image/jpeg;base64,...'
  }
];

/* ---------------------------------------------
   MOCK PLAYERS
---------------------------------------------- */

export const mockPlayers: Player[] = [
  {
    id: 'p1',
    socketId: 'sock1',
    name: 'Alice',
    score: 1200,
    isHost: false,
    isConnected: true,
    hasDyslexiaSupport: false
  },
  {
    id: 'p2',
    socketId: 'sock2',
    name: 'Bob',
    score: 900,
    isHost: false,
    isConnected: true,
    hasDyslexiaSupport: true
  },
  {
    id: 'host',
    socketId: 'sock-host',
    name: 'Teacher',
    score: 0,
    isHost: true,
    isConnected: true
  }
];

/* ---------------------------------------------
   MOCK GAME SETTINGS
---------------------------------------------- */

export const mockSettings: GameSettings = {
  thinkTime: 5,
  answerTime: 20
};

/* ---------------------------------------------
   MOCK GAME OBJECT
---------------------------------------------- */

export const mockGame: Game = {
  id: 'game-123',
  pin: '123456',
  hostId: 'host',
  title: 'Debug Quiz',
  questions: mockQuestions,
  settings: mockSettings,
  currentQuestionIndex: 0,
  status: 'waiting',
  phase: 'waiting',
  players: mockPlayers,
  answerHistory: [],
  questionStartTime: Date.now(),
  phaseStartTime: Date.now(),
  phaseEndTime: Date.now() + 5000,
  gameLoopActive: false
};

/* ---------------------------------------------
   MOCK GAME STATS (for results screens)
---------------------------------------------- */

export const mockStats: GameStats = {
  question: mockQuestions[0],
  answers: [
    { optionIndex: 0, count: 1, percentage: 20 },
    { optionIndex: 1, count: 0, percentage: 0 },
    { optionIndex: 2, count: 4, percentage: 80 },
    { optionIndex: 3, count: 0, percentage: 0 }
  ],
  correctAnswers: 4,
  totalPlayers: 5
};

/* ---------------------------------------------
   MOCK PERSONAL RESULT (for player results)
---------------------------------------------- */

export const mockPersonalResult: PersonalResult = {
  wasCorrect: true,
  pointsEarned: 200,
  totalScore: 1200,
  position: 1,
  pointsBehind: 0,
  nextPlayerName: null,
  explanation: mockQuestions[0].explanation
};

export const mockFinalScores: Player[] = mockPlayers
  .map(p => ({
    ...p, // includes socketId, name, score, isHost, isConnected, etc.
  }))
  .sort((a, b) => b.score - a.score);
