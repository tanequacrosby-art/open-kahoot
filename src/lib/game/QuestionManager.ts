import type { Game, Question, GameStats, PersonalResult, AnswerRecord } from '@/types/game';

export class QuestionManager {
  startNextQuestion(game: Game): Question | null {
    const nextIndex = game.currentQuestionIndex + 1;

    if (nextIndex >= game.questions.length) {
      return null; // No more questions
    }

    game.currentQuestionIndex = nextIndex;
    game.status = 'preparation';

    const question = game.questions[nextIndex];
    return question;
  }

  getCurrentQuestion(game: Game): Question | undefined {
    if (
      game.currentQuestionIndex < 0 ||
      game.currentQuestionIndex >= game.questions.length
    ) {
      return undefined;
    }
    return game.questions[game.currentQuestionIndex];
  }

  getQuestionStats(game: Game): GameStats | undefined {
    const question = this.getCurrentQuestion(game);
    if (!question) return undefined;

    const totalPlayers = game.players.filter((p) => !p.isHost).length;

    const answerCounts = new Array(question.options.length).fill(0);
    let correctAnswers = 0;

    const recordsForQuestion: AnswerRecord[] = game.answerHistory.filter(
      (r) => r.questionIndex === game.currentQuestionIndex
    );

    recordsForQuestion.forEach((record) => {
      if (
        record.answerIndex !== null &&
        record.answerIndex >= 0 &&
        record.answerIndex < question.options.length
      ) {
        answerCounts[record.answerIndex]++;
      }
      if (record.wasCorrect) {
        correctAnswers++;
      }
    });

    const answers = answerCounts.map((count, index) => ({
      optionIndex: index,
      count,
      percentage:
        totalPlayers > 0 ? Math.round((count / totalPlayers) * 100) : 0
    }));

    return {
      question,
      answers,
      correctAnswers,
      totalPlayers
    };
  }

  getPersonalResult(game: Game, playerId: string): PersonalResult | undefined {
    const player = game.players.find((p) => p.id === playerId);
    const question = this.getCurrentQuestion(game);

    if (!player || !question || player.isHost) {
      return undefined;
    }

    const submission = [...game.answerHistory]
      .filter(
        (r) =>
          r.playerId === playerId &&
          r.questionIndex === game.currentQuestionIndex
      )
      .pop();

    const wasCorrect = submission?.wasCorrect ?? false;
    const pointsEarned = submission?.pointsEarned ?? 0;

    const leaderboard = game.players
      .filter((p) => !p.isHost)
      .sort((a, b) => b.score - a.score);

    const position = leaderboard.findIndex((p) => p.id === playerId) + 1;

    let pointsBehind = 0;
    let nextPlayerName: string | null = null;

    if (position > 1) {
      const playerAbove = leaderboard[position - 2];
      pointsBehind = playerAbove.score - player.score;
      nextPlayerName = playerAbove.name;
    }

    return {
      wasCorrect,
      pointsEarned,
      totalScore: player.score,
      position,
      pointsBehind,
      nextPlayerName,
      explanation: question.explanation
    };
  }

  hasAllPlayersAnswered(game: Game): boolean {
    const activePlayers = game.players.filter(
      (p) => !p.isHost && p.isConnected
    );
    return activePlayers.every((p) => p.currentAnswer !== undefined);
  }

  getAnsweredPlayerCount(game: Game): number {
    return game.players.filter(
      (p) => !p.isHost && p.currentAnswer !== undefined
    ).length;
  }

  getTotalActivePlayerCount(game: Game): number {
    return game.players.filter((p) => !p.isHost && p.isConnected).length;
  }

  isLastQuestion(game: Game): boolean {
    return game.currentQuestionIndex >= game.questions.length - 1;
  }

  getQuestionProgress(game: Game): { current: number; total: number } {
    return {
      current: game.currentQuestionIndex + 1,
      total: game.questions.length
    };
  }
}
