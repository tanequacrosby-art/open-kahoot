'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, MonitorPlay } from 'lucide-react';
import type { Question, GameSettings } from '@/types/game';
import PageLayout from '@/components/PageLayout';
import Card from '@/components/Card';
import Button from '@/components/Button';
import HostGameSettingsSection from './HostGameSettingsSection';
import HostQuestionsSection from './HostQuestionsSection';
import HostAIGenerationModal from './HostAIGenerationModal';

interface HostQuizCreationScreenProps {
  questions: Question[];
  gameSettings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onAddQuestion: (index?: number) => void;
  onAppendTSV: (index: number, event: React.ChangeEvent<HTMLInputElement>) => void;
  onFileImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateQuestion: (index: number, updated: Question) => void;
  onRemoveQuestion: (index: number) => void;
  onDownloadTSV: () => void;
  onCreateGame: () => void;
  onGenerateAIQuestions: (
    subject: string,
    language: 'english' | 'french',
    accessKey: string,
    questionCount: number
  ) => Promise<void>;
}

export default function HostQuizCreationScreen({
  questions,
  gameSettings,
  onUpdateSettings,
  onAddQuestion,
  onAppendTSV,
  onFileImport,
  onUpdateQuestion,
  onRemoveQuestion,
  onDownloadTSV,
  onCreateGame,
  onGenerateAIQuestions
}: HostQuizCreationScreenProps) {
  const { t } = useTranslation();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // FIXED: use prompt instead of question
  const isFormValid = !questions.some(q => !q.prompt || q.options.some(o => !o));

  return (
    <PageLayout gradient="host" maxWidth="4xl">
      <Card>
        <HostGameSettingsSection 
          gameSettings={gameSettings}
          onUpdateSettings={onUpdateSettings}
        />

        <HostQuestionsSection
          questions={questions}
          onAddQuestion={onAddQuestion}
          onAppendTSV={onAppendTSV}
          onFileImport={onFileImport}
          onUpdateQuestion={onUpdateQuestion}
          onRemoveQuestion={onRemoveQuestion}
          onOpenAIModal={() => setIsAIModalOpen(true)}
        />

        {questions.length > 0 && (
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={onDownloadTSV}
                variant="primary"
                size="lg"
                icon={Download}
              >
                {t('host.quizCreation.downloadTSV')}
              </Button>

              <Button
                onClick={onCreateGame}
                disabled={!isFormValid}
                variant="primary"
                size="lg"
                icon={MonitorPlay}
              >
                {t('host.quizCreation.createGame')}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <HostAIGenerationModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onGenerateQuestions={onGenerateAIQuestions}
      />
    </PageLayout>
  );
}
