import React, { useState } from 'react';
import { DirectoryEntry } from '@/lib/prompt-tool/types';
import DirectoryTree from './DirectoryTree';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FileSelectionContainerProps {
  directory: DirectoryEntry[];
  selectedFiles: string[];
  setSelectedFiles: (files: string[]) => void;
  currentPath: string;
  objective?: string;
  className?: string;
}

const validateRecommendedPath = (filePath: string): string => {
  const isWebPath = filePath.startsWith('apps/web/');
  const isStandalonePromptPath = filePath.startsWith('apps/standalone-prompt-tool/');

  if (isWebPath) return filePath;
  if (isStandalonePromptPath) {
    return filePath.replace('apps/standalone-prompt-tool/', 'apps/web/');
  }
  return `apps/web/${filePath}`;
};

export default function FileSelectionContainer({
  directory,
  selectedFiles,
  setSelectedFiles,
  currentPath,
  objective = '',
  className = '',
}: FileSelectionContainerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  // Tracks which files are specifically recommended
  const [recommendedFiles, setRecommendedFiles] = useState<string[]>([]);

  const handleGetRecommendedFiles = async () => {
    if (!objective) {
      setError('Please provide an objective before getting file recommendations');
      return;
    }

    setIsLoadingRecommendations(true);
    setError(null);

    try {
      const response = await fetch('/api/prompt-tool/refine-file-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective,
          directoryStructure: directory,
        }),
      });

      if (!response.ok) {
        const { error: serverError } = await response.json();
        throw new Error(serverError || 'Failed to get file recommendations');
      }

      const data = await response.json();

      if (data.recommendedFiles) {
        const validatedPaths = data.recommendedFiles.map(validateRecommendedPath);
        setRecommendedFiles(validatedPaths);
        setSelectedFiles(validatedPaths); // Directly set as selected files
      }
    } catch (err) {
      console.error('File recommendation error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to get file recommendations. Please try again.'
      );
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedFiles([]);
    setRecommendedFiles([]);
    setError(null);
  };

  return (
    <div className="h-full">
      <Card className={`bg-white dark:bg-gray-800 border-none shadow-lg ${className}`}>
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">File Selection</CardTitle>
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                {recommendedFiles.length > 0 && ` (${recommendedFiles.length} recommended)`}
              </p>
              <div className="flex gap-2">
                {(selectedFiles.length > 0 || recommendedFiles.length > 0) && (
                  <button
                    onClick={handleClearSelection}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 
                             dark:text-gray-400 dark:hover:text-gray-100
                             hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg 
                             transition-colors duration-200"
                  >
                    Clear Selection
                  </button>
                )}
                <button
                  onClick={handleGetRecommendedFiles}
                  disabled={isLoadingRecommendations || !objective}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                           transition-colors duration-200 disabled:opacity-50 
                           disabled:cursor-not-allowed flex items-center gap-2
                           text-sm font-medium"
                  title={
                    !objective
                      ? 'Please provide an objective first'
                      : 'Get AI-recommended files based on your objective'
                  }
                >
                  {isLoadingRecommendations ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Getting Recommendations...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">🤖</span>
                      <span>Get Recommended Files</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {error && (
            <div
              className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 
                           dark:border-red-800 rounded-lg text-red-600 dark:text-red-400"
            >
              {error}
            </div>
          )}

          <div className="h-full">
            <DirectoryTree
              directory={directory}
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              currentPath={currentPath}
              recommendedFiles={recommendedFiles}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}