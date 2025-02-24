// apps/web/app/prompt-tool/components/TechnicalContextContainer.tsx

import React from 'react';

interface TechnicalContextContainerProps {
  context: string;
  setContext: (context: string) => void;
  defaultContext: string;
}

const TechnicalContextContainer: React.FC<TechnicalContextContainerProps> = ({
  context,
  setContext,
  defaultContext,
}) => {
  return (
    <div className="flex flex-col h-full space-y-4">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Technical Context
      </label>
      <textarea
        value={context}
        onChange={(e) => setContext(e.target.value)}
        className="mt-1 block w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
        rows={6}
        placeholder="Provide technical context here..."
      />
    </div>
  );
};

export default TechnicalContextContainer;
