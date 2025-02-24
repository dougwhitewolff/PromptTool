'use client';

import React, { useEffect } from 'react';
import { DirectoryEntry } from '@/lib/prompt-tool/types';
import { generatePrompt } from '@/lib/prompt-tool/utils';

interface LivePreviewContainerProps {
  role: string;
  roleDescription: string;
  context: string;
  objective: string;
  instructions: string[];
  selectedFiles: { path: string; content: string }[];
  directoryStructure: DirectoryEntry[];
  showPreview: boolean;
  analysisFramework: string;
  setPromptContent: React.Dispatch<React.SetStateAction<string>>;
  handleCopyPrompt: (e: React.MouseEvent) => void;
  setShowPreview: React.Dispatch<React.SetStateAction<boolean>>;
}

const LivePreviewContainer = ({
  role,
  roleDescription,
  context,
  objective,
  instructions,
  selectedFiles,
  directoryStructure,
  showPreview,
  analysisFramework,
  setPromptContent,
  handleCopyPrompt,
  setShowPreview,
}: LivePreviewContainerProps) => {
  const [content, setContent] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    if (!showPreview) return;

    const generateContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const generatedPrompt = await generatePrompt({
          role,
          roleDescription,
          context,
          objective,
          instructions,
          directoryStructure,
          selectedFiles,
          analysisFramework,
        });

        setContent(generatedPrompt);
        setPromptContent(generatedPrompt);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred while generating the preview'
        );
      } finally {
        setIsLoading(false);
      }
    };

    generateContent();
  }, [
    showPreview,
    role,
    roleDescription,
    context,
    objective,
    instructions,
    selectedFiles,
    directoryStructure,
    analysisFramework,
    setPromptContent,
  ]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <h3 className="font-bold mb-2">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3">Generating preview...</span>
      </div>
    );
  }

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">{content}</div>
  );
};

export default LivePreviewContainer;
