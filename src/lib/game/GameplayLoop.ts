import { Server as SocketIOServer } from 'socket.io';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  Game,
  GamePhase
} from '@/types/game';

import { GameManager } from './GameManager';
import { PlayerManager } from './PlayerManager';
import { QuestionManager } from './QuestionManager';
import { TimerManager } from './TimerManager';

export class GameplayLoop {
  private phaseCallbacks: Map<string, (() => void) | null> = new Map();

  constructor(
    private io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>,
    private gameManager: GameManager,
    private playerManager: PlayerManager,
    private questionManager: QuestionManager,
    private timerManager: TimerManager
  ) {}

  /* -------------------------------------------------------
     START GAME LOOP
  -------------------------------------------------------- */
  startGameLoop(game: Game): void {
    if (game.gameLoopActive) {
      console.log(`[PIN ${game.pin}] Game loop already active`);
      return;
    }

    console.log(
      `[PIN ${game.pin}] Starting game loop with ${game.players.length} players`
    );

    this.gameManager.updateGamePhase(game.id, 'preparation');
    game.gameLoopActive = true;

    this.schedulePhase(game, 'preparation', 0);
  }

  /* -------------------------------------------------------
     STOP GAME LOOP
  -------------------------------------------------------- */
  stopGameLoop(gameId: string): void {
    this.timerManager.clearAllTimers(gameId);
    this.phaseCallbacks.delete(gameId);

    const game = this.gameManager.getGame(gameId);
    if (game) {
      game.gameLoopActive = false;
      console.log(`[PIN ${game.pin}] Game loop stopped`);
    }
  }

  /* -------------------------------------------------------
     MANUAL PHASE TRANSITION
  -------------------------------------------------------- */
  transitionToPhase(game: Game, phase: GamePhase): void {
    if (!game.gameLoopActive) {
      console.log(`[PIN ${game.pin}] Cannot transition — loop inactive`);
      return;
    }

    this.timerManager.clearAllTimers(game.id);
    console.log(`[PIN ${game.pin}] Manual transition → ${phase}`);

    this.schedulePhase(game, phase, 0);
  }

  /* -------------------------------------------------------
     SCHEDULE PHASE
  -------------------------------------------------------- */
  private schedulePhase(game: Game, phase: GamePhase, delay: number): void {
    const timerType = `phase_${phase}`;

    this.timerManager.setTimer(
      game.id,
      timerType,
      () => this.executePhase(game, phase),
      delay
    );

    if (delay > 0) {
      console.log(`[PIN ${game.pin}] Scheduled ${phase} in ${delay}ms`);
    }
  }

  /* -------------------------------------------------------
     EXECUTE PHASE
  -------------------------------------------------------- */
  private executePhase(game: Game, phase: GamePhase): void {
    console.log(
      `[PIN ${game.pin}] Phase: ${phase} | Q ${game.currentQuestionIndex + 1}/${
        game.questions.length
      }`
    );

    this.gameManager.updateGamePhase(game.id, phase);
    game.phaseStartTime = Date.now();

    switch (phase) {
      case 'preparation':
        this.executePreparationPhase(game);
        break;
      case 'thinking':
        this.executeThinkingPhase(game);
        break;
      case 'answering':
        this.executeAnsweringPhase(game);
        break;
      case 'results':
        this.executeResultsPhase(game);
        break;
      case 'leaderboard':
        this.executeLeaderboardPhase(game);
        break;
      case 'finished':
        this.executeFinishedPhase(game);
        break;
      default:
        console.error(`[PIN ${game.pin}] Unknown phase: ${phase}`);
    }
  }

  /* -------------------------------------------------------
     PREPARATION PHASE
  -------------------------------------------------------- */
  private executePreparationPhase(game: Game): void {
    if (game.currentQuestionIndex >= 0) {
      this.playerManager.storeAnswersToHistory(game);
    }

    this.playerManager.clearAnswers(game);

    const question = this.questionManager.startNextQuestion(game);
    if (!question) {
      console.log(`[PIN ${game.pin}] No more questions — finishing`);
      this.schedulePhase(game, 'finished', 100);
      return;
    }

    this.schedulePhase(game, 'thinking', 500);
  }

  /* -------------------------------------------------------
     THINKING PHASE
  -------------------------------------------------------- */
  private executeThinkingPhase(game: Game): void {
    const question = this.questionManager.getCurrentQuestion(game);
    if (!question) return;

    console.log(
      `[PIN ${game.pin}] Thinking | "${question.prompt.substring(0, 30)}${
        question.prompt.length > 30 ? '...' : ''
      }"`
    );

    this.io.to(game.id).emit('thinkingPhase', question, game.settings.thinkTime);

    this.timerManager.setThinkingPhaseTimer(
      game.id,
      () => this.executePhase(game, 'answering'),
      game.settings.thinkTime
    );
  }

  /* -------------------------------------------------------
     ANSWERING PHASE
  -------------------------------------------------------- */
  private executeAnsweringPhase(game: Game): void {
    const activePlayers = game.players.filter(
      (p) => !p.isHost && p.isConnected
    );

    console.log(
      `[PIN ${game.pin}] Answering | ${activePlayers.length} active players`
    );

    this.gameManager.setQuestionStartTime(game.id, Date.now());
    this.io.to(game.id).emit('answeringPhase', game.settings.answerTime);

    this.timerManager.setAnsweringPhaseTimer(
      game.id,
      () => this.executePhase(game, 'results'),
      game.settings.answerTime
    );

    this.phaseCallbacks.set(game.id, () => {
      const total = activePlayers.length;
      const answered = this.questionManager.getAnsweredPlayerCount(game);

      if (total > 0 && this.questionManager.hasAllPlayersAnswered(game)) {
        console.log(
          `[PIN ${game.pin}] All players answered (${answered}/${total})`
        );

        this.timerManager.clearTimer(
          game.id,
          TimerManager.TIMER_TYPES.ANSWERING_PHASE
        );

        this.executePhase(game, 'results');
      }
    });
  }

  /* -------------------------------------------------------
     RESULTS PHASE
  -------------------------------------------------------- */
  private executeResultsPhase(game: Game): void {
    const currentQuestion = this.questionManager.getCurrentQuestion(game);
    if (!currentQuestion) return;

    this.playerManager.updateScores(game, currentQuestion.correctAnswer);

    const stats = this.questionManager.getQuestionStats(game);

    if (stats) {
      const correctIndex = currentQuestion.options.indexOf(
        currentQuestion.correctAnswer
      );

      const correctCount =
        stats.answers.find((a) => a.optionIndex === correctIndex)?.count || 0;

      console.log(
        `[PIN ${game.pin}] Results | Correct ${correctCount}/${stats.totalPlayers}`
      );

      this.io.to(game.id).emit('questionEnded', stats);
    }

    const host = this.playerManager.getHost(game);
if (host?.isConnected && stats) {
  this.io.to(host.socketId).emit('hostResults', stats);
}

    game.players.forEach((player) => {
      if (!player.isHost) {
        const personal = this.questionManager.getPersonalResult(
          game,
          player.id
        );
        if (personal) {
          this.io.to(player.socketId).emit('personalResult', personal);
        }
      }
    });

    this.phaseCallbacks.set(game.id, null);

    console.log(
      `[PIN ${game.pin}] Waiting for host to continue to leaderboard`
    );
  }

  /* -------------------------------------------------------
     LEADERBOARD PHASE
  -------------------------------------------------------- */
  private executeLeaderboardPhase(game: Game): void {
    const leaderboard = this.playerManager.getLeaderboard(game);
    const top = leaderboard[0];

    console.log(
      `[PIN ${game.pin}] Leaderboard | Top: ${
        top ? `${top.name} (${top.score})` : 'none'
      }`
    );

    this.io.to(game.id).emit('leaderboardShown', leaderboard, game);

    const last = this.questionManager.isLastQuestion(game);
    console.log(
      `[PIN ${game.pin}] ${
        last ? 'Final leaderboard shown' : 'Waiting for next question'
      }`
    );
  }

  /* -------------------------------------------------------
     FINISHED PHASE
  -------------------------------------------------------- */
  private executeFinishedPhase(game: Game): void {
    if (game.currentQuestionIndex >= 0) {
      this.playerManager.storeAnswersToHistory(game);
    }

    this.gameManager.updateGamePhase(game.id, 'finished');

    const finalResults = this.playerManager.getFinalResults(game);
    const sorted = [...game.players]
      .filter((p) => !p.isHost)
      .sort((a, b) => b.score - a.score);

    const winner = sorted[0];

    console.log(
      `[PIN ${game.pin}] Game finished | Winner: ${
        winner ? `${winner.name} (${winner.score})` : 'none'
      }`
    );

    this.io.to(game.id).emit('gameFinished', finalResults);

    this.stopGameLoop(game.id);

    this.timerManager.setTimer(
      game.id,
      'game_cleanup',
      () => {
        console.log(`[PIN ${game.pin}] Cleaning up game resources`);
        this.gameManager.deleteGame(game.id);
      },
      30000
    );
  }

  /* -------------------------------------------------------
     PLAYER ANSWERED
  -------------------------------------------------------- */
  onPlayerAnswered(game: Game): void {
    const answered = this.questionManager.getAnsweredPlayerCount(game);
    const total = game.players.filter(
      (p) => !p.isHost && p.isConnected
    ).length;

    console.log(`[PIN ${game.pin}] Player answered ${answered}/${total}`);

    const callback = this.phaseCallbacks.get(game.id);
    if (callback && game.phase === 'answering') callback();
  }

  /* -------------------------------------------------------
     SYNC PLAYER TO CURRENT PHASE
  -------------------------------------------------------- */
  syncPlayerToCurrentPhase(
    game: Game,
    socketId: string,
    isHost: boolean
  ): void {
    if (!game.gameLoopActive) return;

    const type = isHost ? 'Host' : 'Player';
    console.log(`[PIN ${game.pin}] ${type} reconnected`);

    switch (game.phase) {
      case 'thinking': {
        const q = this.questionManager.getCurrentQuestion(game);
        if (q) {
         const elapsed = Date.now() - (game.phaseStartTime ?? Date.now());
          const remaining = Math.max(
            0,
            game.settings.thinkTime - Math.floor(elapsed / 1000)
          );
          this.io.to(socketId).emit('thinkingPhase', q, remaining);
        }
        break;
      }

      case 'answering': {
        const q = this.questionManager.getCurrentQuestion(game);
        if (q) {
          this.io.to(socketId).emit(
            'thinkingPhase',
            q,
            game.settings.thinkTime
          );

          const delay = isHost ? 2000 : 100;

          setTimeout(() => {
            const elapsed = Date.now() - game.questionStartTime;
            const remaining = Math.max(
              0,
              game.settings.answerTime - Math.floor(elapsed / 1000)
            );
            this.io.to(socketId).emit('answeringPhase', remaining);
          }, delay);
        }
        break;
      }

      case 'leaderboard': {
        const leaderboard = this.playerManager.getLeaderboard(game);
        this.io.to(socketId).emit('leaderboardShown', leaderboard, game);
        break;
      }

      case 'finished': {
        const finalResults = this.playerManager.getFinalResults(game);
        this.io.to(socketId).emit('gameFinished', finalResults);
        break;
      }
    }
  }
}
