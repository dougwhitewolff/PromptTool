// app/prompt-tool/components/ObjectiveForm.tsx
'use client';

import React from 'react';

interface ObjectiveFormProps {
  objective: string;
  setObjective: (obj: string) => void;
}

export default function ObjectiveForm({
  objective,
  setObjective,
}: ObjectiveFormProps) {
  return (
    <div className="flex flex-col p-4">
      {/* Just the text area and label */}
      <label className="font-semibold mb-2 text-gray-700 dark:text-gray-200">
        Objective
      </label>
      <textarea
        className="w-full h-64 p-4 border border-gray-300 
                   dark:border-gray-600 rounded bg-white 
                   dark:bg-gray-700 text-base"
        value={objective}
        onChange={(e) => setObjective(e.target.value)}
        placeholder="Describe what you want to accomplish..."
      />
    </div>
  );
}
