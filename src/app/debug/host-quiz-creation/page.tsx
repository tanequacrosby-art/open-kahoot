'use client';

import HostQuizCreationScreen from '@/components/host-setup/HostQuizCreationScreen';
import { mockQuestions, mockGameSettings } from '@/lib/debug-data';

export default function DebugHostQuizCreationPage() {

  return (
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
  onGenerateAIQuestions={() => {}}
/>
  );
} 
