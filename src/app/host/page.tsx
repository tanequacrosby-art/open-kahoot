'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket-client';
import { appConfig } from '@/lib/config';
import type { Question, Game, Player, GameSettings } from '@/types/game';

import HostGameLobbyScreen from '@/components/host-setup/HostGameLobbyScreen';
import { loadReadingSOLSet } from '@/lib/loadReadingSOL';

export default function HostPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [gameSettings] = useState<GameSettings>({
    thinkTime: 5,
    answerTime: 20
  });
  const [game, setGame] = useState<Game | null>(null);

  useEffect(() => {
    const socket = getSocket();

    socket.on('playerJoined', (player: Player) => {
      setGame(prev =>
        prev
          ? {
              ...prev,
              players: [...prev.players.filter(p => p.id !== player.id), player]
            }
          : null
      );
    });

    socket.on('playerLeft', (playerId: string) => {
      setGame(prev =>
        prev
          ? {
              ...prev,
              players: prev.players.filter(p => p.id !== playerId)
            }
          : null
      );
    });

    socket.on('gameUpdated', (updatedGame: Game) => {
      setGame(updatedGame);
    });

    return () => {
      socket.off('playerJoined');
      socket.off('playerLeft');
      socket.off('gameUpdated');
    };
  }, []);

  const createGameWithQuestions = (solQuestions: Question[]) => {
    if (solQuestions.length === 0) return;

    const socket = getSocket();
    const title = 'Reading SOL Practice';

    setQuestions(solQuestions);

    socket.emit('createGame', title, solQuestions, gameSettings, (createdGame: Game) => {
      setGame(createdGame);
    });
  };

  const startGame = () => {
    if (!game) return;

    const socket = getSocket();
    socket.emit('startGame', game.id);
    router.push(`/game/${game.id}?host=true`);
  };

  const toggleDyslexiaSupport = (playerId: string) => {
    if (!game) return;

    const socket = getSocket();
    socket.emit('toggleDyslexiaSupport', game.id, playerId);
  };

  const getJoinUrl = () => {
    if (!game) return '';
    return `${appConfig.url}/join?pin=${game.pin}`;
  };

  if (game) {
    return (
      <HostGameLobbyScreen
        game={game}
        joinUrl={getJoinUrl()}
        onStartGame={startGame}
        onToggleDyslexiaSupport={toggleDyslexiaSupport}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold">
        Reading SOL Practice
      </h1>
      <p className="text-gray-700">
        Choose a Reading SOL set to host a game. Questions are aligned to Virginia SOL and Common Core, with rigorous stems and variations.
      </p>

      <div className="flex flex-col gap-3 mt-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            const solQuestions = loadReadingSOLSet('3.5');
            createGameWithQuestions(solQuestions);
          }}
        >
          Reading SOL 3.5 (Grade 3)
        </button>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            const solQuestions = loadReadingSOLSet('4.4');
            createGameWithQuestions(solQuestions);
          }}
        >
          Reading SOL 4.4 (Grade 4)
        </button>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            const solQuestions = loadReadingSOLSet('5.5');
            createGameWithQuestions(solQuestions);
          }}
        >
          Reading SOL 5.5 (Grade 5)
        </button>
      </div>
    </div>
  );
}
