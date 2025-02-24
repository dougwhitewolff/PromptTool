// apps/web/app/prompt-tool/components/RefineObjective.tsx
'use client';

import React from 'react';

interface RefineObjectiveProps {
  refinedObjective: string;
  onDiscard: () => void;
  onAccept: () => void;
}

/**
 * A simple component that only shows the refined text
 * plus 'Discard' and 'Update Objective' buttons.
 *
 * The actual API calls and state management remain outside.
 */
const RefineObjective: React.FC<RefineObjectiveProps> = ({
  refinedObjective,
  onDiscard,
  onAccept,
}) => {
  if (!refinedObjective) return null;

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-4">
      <h3 className="font-semibold text-green-800">
        Suggested Refined Objective
      </h3>
      <p className="text-green-700 whitespace-pre-wrap">{refinedObjective}</p>
      <div className="flex justify-end gap-4">
        <button
          onClick={onDiscard}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Discard
        </button>
        <button
          onClick={onAccept}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Update Objective
        </button>
      </div>
    </div>
  );
};

export default RefineObjective;
