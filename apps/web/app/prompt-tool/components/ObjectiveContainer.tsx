// app/prompt-tool/components/ObjectiveContainer.tsx

'use client';

import React, { useState } from 'react';
import { DirectoryEntry } from '@/app/prompt-tool/lib/prompt-tool/types';

interface ObjectiveContainerProps {
  objective: string;
  setObjective: (obj: string) => void;
  directoryStructure?: DirectoryEntry[];
  setPromptContent: (content: string) => void;
}

/**
 * ObjectiveContainer:
 * - Lets the user type an objective.
 * - Includes a "Refine Objective" button.
 * - Displays refined suggestions with "Discard" or "Update Objective" options.
 */
export default function ObjectiveContainer({
  objective,
  setObjective,
  directoryStructure = [],
  setPromptContent,
}: ObjectiveContainerProps) {
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRefined, setShowRefined] = useState(false);
  const [refinedObjective, setRefinedObjective] = useState('');

  const handleRefine = async () => {
    if (!objective.trim()) {
      setError('Please enter an objective to refine.');
      return;
    }

    setIsRefining(true);
    setError(null);

    try {
      const response = await fetch('/api/prompt-tool/refine-objective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective,
          directoryStructure,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to refine objective.');
      }

      const data = await response.json();
      setRefinedObjective(data.refinedObjective);
      setShowRefined(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to refine objective.'
      );
    } finally {
      setIsRefining(false);
    }
  };

  const handleDiscard = () => {
    setRefinedObjective('');
    setShowRefined(false);
    setError(null);
  };

  const handleAccept = () => {
    setObjective(refinedObjective);
    setPromptContent(refinedObjective);
    setRefinedObjective('');
    setShowRefined(false);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Text Area for Objective */}
      <textarea
        className="w-full h-64 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        value={objective}
        onChange={(e) => setObjective(e.target.value)}
        placeholder="Describe what you want to accomplish..."
      />

      {/* Refine Button */}
      <button
        onClick={handleRefine}
        disabled={isRefining || !objective.trim()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed w-40"
      >
        {isRefining ? 'Refining...' : 'Refine Objective'}
      </button>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-100 text-red-700 border border-red-300 rounded">
          {error}
        </div>
      )}

      {/* Refined Objective Display */}
      {showRefined && refinedObjective && (
        <div className="p-4 bg-green-50 border border-green-200 rounded space-y-4">
          <p className="text-green-700 whitespace-pre-wrap">
            {refinedObjective}
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={handleDiscard}
              className="text-gray-600 hover:text-gray-900"
            >
              Discard
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Update Objective
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
