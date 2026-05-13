import { v4 as uuidv4 } from 'uuid';
import type { Game, Player, AnswerRecord } from '@/types/game';

export interface JoinGameResult {
  success: boolean;
  game?: Game;
  playerId?: string;
  isReconnection?: boolean;
}

export class PlayerManager {
  joinGame(
    game: Game,
    socketId: string,
    playerName: string,
    persistentId: string | null = null
  ): JoinGameResult {
    // Reconnection via persistent ID
    if (persistentId) {
      const existingPlayer = game.players.find((p) => p.id === persistentId);
      if (existingPlayer) {
        existingPlayer.socketId = socketId;
        existingPlayer.isConnected = true;
        return { success: true, game, playerId: persistentId, isReconnection: true };
      }
    }

    // New joins only allowed while waiting
    if (game.status !== 'waiting') {
      return { success: false };
    }

    // Prevent duplicate names (non-host)
    if (game.players.some((p) => p.name === playerName && !p.isHost)) {
      return { success: false };
    }

    const playerId = uuidv4();
    const newPlayer: Player = {
      id: playerId,
      socketId,
      name: playerName,
      score: 0,
      isHost: false,
      isConnected: true
    };

    game.players.push(newPlayer);
    return { success: true, game, playerId, isReconnection: false };
  }

  disconnectPlayer(socketId: string, game: Game): Player | undefined {
    const player = game.players.find((p) => p.socketId === socketId);
    if (player) {
      player.isConnected = false;
      return player;
    }
    return undefined;
  }

  removePlayer(playerId: string, game: Game): boolean {
    const index = game.players.findIndex((p) => p.id === playerId);
    if (index !== -1) {
      const player = game.players[index];
      game.players.splice(index, 1);
      console.log(`[PIN ${game.pin}] Removed player ${player.name} (${player.id})`);
      return true;
    }
    return false;
  }

  getPlayerBySocketId(socketId: string, game: Game): Player | undefined {
    return game.players.find((p) => p.socketId === socketId);
  }

  getPlayerById(playerId: string, game: Game): Player | undefined {
    return game.players.find((p) => p.id === playerId);
  }

  getConnectedPlayers(game: Game): Player[] {
    return game.players.filter((p) => p.isConnected && !p.isHost);
  }

  getHost(game: Game): Player | undefined {
    return game.players.find((p) => p.isHost);
  }

  isHost(socketId: string, game: Game): boolean {
    const player = this.getPlayerBySocketId(socketId, game);
    return player?.isHost ?? false;
  }

  submitAnswer(
    game: Game,
    playerIdOrSocketId: string,
    answerIndex: number,
    isPersistentId: boolean = false
  ): boolean {
    const player = isPersistentId
      ? this.getPlayerById(playerIdOrSocketId, game)
      : this.getPlayerBySocketId(playerIdOrSocketId, game);

    if (!player || player.isHost) return false;

    // Prevent duplicate answers
    if (player.currentAnswer !== undefined) return false;

    // Store index for now; we derive text later
    player.currentAnswer = answerIndex;
    player.answerTime = Date.now();
    return true;
  }

  clearAnswers(game: Game): void {
    game.players.forEach((player) => {
      if (!player.isHost) {
        delete player.currentAnswer;
        delete player.answerTime;
        player.wasCorrect = undefined;
        player.pointsEarned = undefined;
      }
    });
  }

  storeAnswersToHistory(game: Game): void {
    const currentQuestion = game.questions[game.currentQuestionIndex];
    if (!currentQuestion) return;

    const questionStartTime = game.questionStartTime ?? Date.now();

    game.players.forEach((player) => {
      if (player.isHost) return;

      const responseTime = player.answerTime
        ? player.answerTime - questionStartTime
        : 0;

      const answerIndex =
        typeof player.currentAnswer === 'number' ? player.currentAnswer : null;

      const answerText =
        typeof player.currentAnswer === 'string'
          ? player.currentAnswer
          : typeof player.currentAnswer === 'number'
          ? currentQuestion.options[player.currentAnswer] ?? null
          : null;

      const wasCorrect =
        !!answerText && answerText === currentQuestion.correctAnswer;

      // Points calculation (time‑based, with dyslexia adjustment)
      let pointsEarned = 0;
      if (wasCorrect && player.answerTime) {
        const answerTimeLimitMs = game.settings.answerTime * 1000;
        const timeUsedRatio = responseTime / answerTimeLimitMs;

        let adjustedRatio = timeUsedRatio;
        if (player.hasDyslexiaSupport) {
          adjustedRatio = timeUsedRatio * 0.8; // 20% less penalty
        }

        pointsEarned = Math.max(0, Math.round(1000 * (1 - adjustedRatio)));
      }

      const answerRecord: AnswerRecord = {
        playerId: player.id,
        playerName: player.name,
        questionIndex: game.currentQuestionIndex,
        questionId: currentQuestion.id,
        answerIndex,
        answerText,
        answerTime: player.answerTime,
        responseTime,
        pointsEarned,
        wasCorrect,
        hasDyslexiaSupport: player.hasDyslexiaSupport ?? false
      };

      game.answerHistory.push(answerRecord);
    });
  }

  updateScores(game: Game, correctAnswer: string): void {
    for (const player of game.players) {
      if (player.isHost) continue;

      const submission = [...game.answerHistory]
        .filter(
          (a) =>
            a.playerId === player.id &&
            a.questionIndex === game.currentQuestionIndex
        )
        .pop();

      if (!submission) {
        player.wasCorrect = false;
        player.pointsEarned = 0;
        player.streak = 0;
        continue;
      }

      const isCorrect =
        submission.answerText != null &&
        submission.answerText === correctAnswer;

      player.wasCorrect = isCorrect;

      if (!isCorrect) {
        player.pointsEarned = 0;
        player.streak = 0;
        continue;
      }

      // Use points from history (already time‑adjusted)
      const points = submission.pointsEarned ?? 0;

      // Streak handling
      player.streak = (player.streak ?? 0) + 1;

      player.pointsEarned = points;
      player.score += points;
    }
  }

  getLeaderboard(game: Game): Player[] {
    return game.players
      .filter((p) => !p.isHost)
      .sort((a, b) => b.score - a.score);
  }

  getFinalResults(game: Game): Player[] {
    return this.getLeaderboard(game);
  }

  generateGameLogsTSV(game: Game): string {
    const headers = [
      'question_index',
      'question_datetime',
      'question_string',
      'proposition_correct',
      'proposition_wrong1',
      'proposition_wrong2',
      'proposition_wrong3',
      'question_explanation',
      'player_id',
      'player_nickname',
      'choice_string',
      'choice_datetime',
      'has_dyslexia_support'
    ];

    const rows: string[] = [headers.join('\t')];

    const sortedAnswers = [...game.answerHistory].sort((a, b) => {
      if (a.questionIndex !== b.questionIndex) {
        return a.questionIndex - b.questionIndex;
      }
      return a.playerName.localeCompare(b.playerName);
    });

    sortedAnswers.forEach((answerRecord) => {
      const question = game.questions[answerRecord.questionIndex];
      if (!question) return;

      const questionStartTime = answerRecord.answerTime
        ? new Date(answerRecord.answerTime - answerRecord.responseTime)
        : new Date();

      const questionDatetime = questionStartTime.toISOString();
      const choiceDatetime = answerRecord.answerTime
        ? new Date(answerRecord.answerTime).toISOString()
        : '';

      const correctProposition = question.correctAnswer;

      const wrongPropositions = question.options.filter(
        (opt) => opt !== question.correctAnswer
      );

      while (wrongPropositions.length < 3) {
        wrongPropositions.push('');
      }

      const choiceString = answerRecord.answerText ?? '';

      const row = [
        answerRecord.questionIndex.toString(),
        questionDatetime,
        question.prompt.replace(/\t/g, ' '),
        correctProposition.replace(/\t/g, ' '),
        wrongPropositions[0].replace(/\t/g, ' '),
        wrongPropositions[1].replace(/\t/g, ' '),
        wrongPropositions[2].replace(/\t/g, ' '),
        (question.explanation || '').replace(/\t/g, ' '),
        answerRecord.playerId,
        answerRecord.playerName.replace(/\t/g, ' '),
        choiceString.replace(/\t/g, ' '),
        choiceDatetime,
        answerRecord.hasDyslexiaSupport ? 'true' : 'false'
      ];

      rows.push(row.join('\t'));
    });

    return rows.join('\n');
  }

  toggleDyslexiaSupport(game: Game, playerId: string): boolean {
    const player = this.getPlayerById(playerId, game);
    if (!player || player.isHost) return false;

    player.hasDyslexiaSupport = !player.hasDyslexiaSupport;
    return true;
  }
}
