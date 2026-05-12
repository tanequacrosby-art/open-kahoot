"use client";

import React, { useState } from "react";
import type { Question } from "@/types/game";

interface Props {
  question: Question;
  onChange: (updated: Question) => void;
  onDelete: () => void;
}

export default function QuestionEditor({ question, onChange, onDelete }: Props) {
  const [localQuestion, setLocalQuestion] = useState<Question>(question);

  // Update wrapper
  const update = (updated: Partial<Question>) => {
    const newQ = { ...localQuestion, ...updated };
    setLocalQuestion(newQ);
    onChange(newQ);
  };

  // Handle option text change
  const updateOption = (index: number, value: string) => {
    const newOptions = [...localQuestion.options];
    newOptions[index] = value;

    // If the correct answer text changed, update it too
    const updatedCorrect =
      localQuestion.correctAnswer === localQuestion.options[index]
        ? value
        : localQuestion.correctAnswer;

    update({
      options: newOptions,
      correctAnswer: updatedCorrect,
    });
  };

  // Handle reordering options
  const moveOption = (from: number, to: number) => {
    const newOptions = [...localQuestion.options];
    const moved = newOptions.splice(from, 1)[0];
    newOptions.splice(to, 0, moved);

    // Pair each option with its original index
    const optionsWithIndices = newOptions.map((opt, index) => ({
      option: opt,
      originalIndex: index,
    }));

    // Find the new index of the correct answer (string match)
    const newCorrectAnswerIndex = optionsWithIndices.findIndex(
      (item) => item.option === localQuestion.correctAnswer
    );

    // Update the correct answer (string)
    const updatedCorrectAnswer =
      newCorrectAnswerIndex !== -1
        ? optionsWithIndices[newCorrectAnswerIndex].option
        : localQuestion.correctAnswer;

    update({
      options: newOptions,
      correctAnswer: updatedCorrectAnswer,
    });
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      {/* Question Prompt */}
      <label className="block font-semibold mb-1">Question Prompt</label>
      <textarea
        className="w-full p-2 border rounded mb-4"
        value={localQuestion.prompt}
        onChange={(e) => update({ prompt: e.target.value })}
      />

      {/* SOL Standard */}
      <label className="block font-semibold mb-1">SOL Standard</label>
      <input
        className="w-full p-2 border rounded mb-4"
        value={localQuestion.standard}
        onChange={(e) => update({ standard: e.target.value })}
      />

      {/* Options */}
      <label className="block font-semibold mb-2">Options</label>
      {localQuestion.options.map((opt, index) => (
        <div key={index} className="flex items-center gap-2 mb-2">
          <input
            className="flex-1 p-2 border rounded"
            value={opt}
            onChange={(e) => updateOption(index, e.target.value)}
          />

          {/* Mark correct answer */}
          <input
            type="radio"
            checked={localQuestion.correctAnswer === opt}
            onChange={() => update({ correctAnswer: opt })}
          />

          {/* Move up */}
          {index > 0 && (
            <button
              className="px-2 py-1 bg-gray-200 rounded"
              onClick={() => moveOption(index, index - 1)}
            >
              ↑
            </button>
          )}

          {/* Move down */}
          {index < localQuestion.options.length - 1 && (
            <button
              className="px-2 py-1 bg-gray-200 rounded"
              onClick={() => moveOption(index, index + 1)}
            >
              ↓
            </button>
          )}
        </div>
      ))}

      {/* Time Limit */}
      <label className="block font-semibold mt-4 mb-1">Time Limit (seconds)</label>
      <input
        type="number"
        className="w-full p-2 border rounded mb-4"
        value={localQuestion.timeLimit}
        onChange={(e) => update({ timeLimit: Number(e.target.value) })}
      />

      {/* Delete Button */}
      <button
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
        onClick={onDelete}
      >
        Delete Question
      </button>
    </div>
  );
}
