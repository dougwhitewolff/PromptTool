// apps/web/app/prompt-tool/components/PromptPreview.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { generatePrompt } from '../lib/prompt';
import { defaultDescriptions } from '../assets/defaultDescriptions';
import { defaultContext } from '../assets/defaultContext';
import { defaultAnalysisFramework } from '../assets/defaultAnalysisFramework';

interface PromptPreviewProps {
  promptContent: string;
  handleCopyPrompt: () => void;
}

const PromptPreview: React.FC<PromptPreviewProps> = ({
  promptContent,
  handleCopyPrompt,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [formattedContent, setFormattedContent] = useState<string>('');

  useEffect(() => {
    // Always use the actual prompt content or generate a complete default prompt
    if (!promptContent) {
      // Use generatePrompt to create consistent default content
      generatePrompt({
        roleDescription: defaultDescriptions['Expert Software Developer'],
        context: defaultContext,
        objective: '',
        directoryStructure: [],
        selectedFiles: [],
        analysisFramework: defaultAnalysisFramework,
      }).then((defaultContent) => {
        setFormattedContent(defaultContent);
      });
    } else {
      setFormattedContent(promptContent);
    }
  }, [promptContent]);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header with controls */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Prompt Preview
          </h2>
          <label className="flex items-center cursor-pointer">
            <span className="mr-2 text-sm text-gray-600 dark:text-gray-400">
              Show Prompt
            </span>
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition duration-150 ease-in-out"
            />
          </label>
        </div>
        <button
          onClick={handleCopyPrompt}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
          <span>Copy Prompt</span>
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto p-4">
        {isVisible ? (
          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
            {formattedContent}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p className="text-center">
              Prompt is hidden. You can still copy it using the button above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptPreview;
