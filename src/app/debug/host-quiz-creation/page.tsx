'use client';

import HostQuizCreationScreen from '@/components/host-setup/HostQuizCreationScreen';
import type { Question, GameSettings } from '@/types/game';

export default function DebugHostQuizCreationPage() {
  const questions: Question[] = [
    {
      id: 'q1',
      prompt: 'Sample question prompt',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      timeLimit: 30,
      standard: 'SOL-1.1'
    }
  ];

  const gameSettings: GameSettings = {
    thinkTime: 5,
    answerTime: 20
  };

  return (
    <div className="p-8">
      <HostQuizCreationScreen
        questions={questions}
        gameSettings={gameSettings}
        onUpdateSettings={() => {}}
        onAddQuestion={() => {}}
        onAppendTSV={() => {}}
        onFileImport={() => {}}
        onUpdateQuestion={() => {}}
        onRemoveQuestion={() => {}}
        onDownloadTSV={() => {}}
        onCreateGame={() => {}}
        onGenerateAIQuestions={() => Promise.resolve()}
      />
    </div>
  );
}
