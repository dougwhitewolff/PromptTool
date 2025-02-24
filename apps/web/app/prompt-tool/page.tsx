'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ProjectDirectoryContainer from './components/ProjectDirectoryContainer';
import FileSelectionContainer from './components/FileSelectionContainer';
import PromptPreview from './components/PromptPreview';
import AnalysisFrameworkForm from './components/AnalysisFrameworkForm';
import RoleSelectorContainer from './components/RoleSelectorContainer';
import RoleDescriptionContainer from './components/RoleDescriptionContainer';
import TechnicalContextContainer from './components/TechnicalContextContainer';
import ObjectiveContainer from './components/ObjectiveContainer';

import { defaultAnalysisFramework } from './assets/defaultAnalysisFramework';
import { defaultDescriptions } from './assets/defaultDescriptions';
import { defaultContext } from './assets/defaultContext';
import { DirectoryEntry } from './lib/prompt-tool/types';
import { generatePrompt } from './lib/prompt';

// Dynamically import ErrorBoundary with no SSR
const ErrorBoundary = dynamic(() => import('../../components/ErrorBoundary'), {
  ssr: false,
});

export default function PromptToolPage() {
  // 1) Initialize to "reDo/apps/web" so server sees "C:\Development\reDo\apps\web"
  const [currentPath, setCurrentPath] = useState('apps/web');

  const [directoryStructure, setDirectoryStructure] = useState<DirectoryEntry[] | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // These states were previously used in the old ObjectiveForm flow,
  // but we'll keep them so we can pass them to ObjectiveContainer
  const [objective, setObjective] = useState('');
  const [analysisFramework, setAnalysisFramework] = useState(
    defaultAnalysisFramework
  );
  const [role, setRole] = useState('Expert Software Developer');
  const [roleDescription, setRoleDescription] = useState(
    defaultDescriptions['Expert Software Developer']
  );
  const [context, setContext] = useState(defaultContext);
  const [promptContent, setPromptContent] = useState('');

  // Heights for resizable containers
  const [roleSelectorHeight, setRoleSelectorHeight] = useState(200);
  const [roleDescriptionHeight, setRoleDescriptionHeight] = useState(200);
  const [technicalContextHeight, setTechnicalContextHeight] = useState(200);
  const [objectiveHeight, setObjectiveHeight] = useState(300);
  const [analysisFrameworkHeight, setAnalysisFrameworkHeight] = useState(300);

  // Fetch directory structure
  const fetchDirectory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch('/api/prompt-tool/directory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: currentPath }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch directory structure.');
      }

      const data = await res.json();
      setDirectoryStructure(data.structure);
      setSuccessMessage('Directory structure loaded successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch directory structure.');
      setDirectoryStructure(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentPath]);

  // Fetch file contents when files are selected
  const fetchFileContents = async (
    filePaths: string[]
  ): Promise<FileFetchResult[]> => {
    const results: FileFetchResult[] = [];

    for (const filePath of filePaths) {
      try {
        const response = await fetch('/api/file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath }),
        });

        if (!response.ok) {
          throw new Error(`HTTP Error ${response.status}`);
        }

        const { content } = await response.json();
        results.push({ path: filePath, content });
      } catch (error) {
        console.error(`Error fetching file content for ${filePath}:`, error);
        results.push({ path: filePath, error: error.message });
      }
    }

    return results;
  };

  // Whenever objective or selected files or role, etc. change, we regenerate the prompt
  useEffect(() => {
    if (selectedFiles.length > 0) {
      fetchFileContents(selectedFiles).then((fileContents) => {
        generatePrompt({
          role,
          roleDescription,
          context,
          objective,
          directoryStructure: directoryStructure || [],
          selectedFiles: fileContents,
          analysisFramework,
        }).then((newPrompt) => {
          setPromptContent(newPrompt);
        });
      });
    } else {
      generatePrompt({
        role,
        roleDescription,
        context,
        objective,
        directoryStructure: directoryStructure || [],
        selectedFiles: [],
        analysisFramework,
      }).then((newPrompt) => {
        setPromptContent(newPrompt);
      });
    }
  }, [
    selectedFiles,
    role,
    roleDescription,
    context,
    objective,
    directoryStructure,
    analysisFramework,
  ]);

  useEffect(() => {
    if (currentPath) {
      fetchDirectory();
    }
  }, [currentPath, fetchDirectory]);

  const handleRescan = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      const res = await fetch('/api/prompt-tool/rescan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: currentPath }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server error: ${res.status}`);
      }

      setSuccessMessage('File structure updated successfully!');
      await new Promise((resolve) => setTimeout(resolve, 500));
      await fetchDirectory();
    } catch (err) {
      setError(
        err instanceof Error
          ? `Failed to rescan files: ${err.message}`
          : 'Failed to rescan files: Unknown error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPrompt = useCallback(() => {
    if (promptContent) {
      navigator.clipboard
        .writeText(promptContent)
        .then(() => {
          setSuccessMessage('Prompt copied to clipboard!');
          setTimeout(() => setSuccessMessage(null), 2000);
        })
        .catch(() => {
          setError('Failed to copy prompt. Please try again.');
          setTimeout(() => setError(null), 2000);
        });
    }
  }, [promptContent]);

  // Generic hook for resizing
  const useResizable = ({
    setHeight,
  }: {
    setHeight: React.Dispatch<React.SetStateAction<number>>;
  }) => {
    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        const newHeight = e.clientY;
        if (newHeight > 100) {
          setHeight(newHeight);
        }
      },
      [setHeight]
    );

    const handleMouseUp = useCallback(() => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);

    const initiateResize = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      },
      [handleMouseMove, handleMouseUp]
    );

    return initiateResize;
  };

  const initiateResizeRoleSelector = useResizable({
    setHeight: setRoleSelectorHeight,
  });
  const initiateResizeRoleDescription = useResizable({
    setHeight: setRoleDescriptionHeight,
  });
  const initiateResizeTechnicalContext = useResizable({
    setHeight: setTechnicalContextHeight,
  });
  const initiateResizeObjective = useResizable({
    setHeight: setObjectiveHeight,
  });
  const initiateResizeAnalysisFramework = useResizable({
    setHeight: setAnalysisFrameworkHeight,
  });

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto p-8 space-y-10">
        {/* ========== HEADER ========== */}
        <header className="space-y-6">
          <h1 className="text-4xl font-extrabold">Prompt Generation Tool</h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={fetchDirectory}
              disabled={isLoading}
              className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-400"
            >
              {isLoading ? 'Loading...' : 'Refresh Directory'}
            </button>
            <button
              onClick={handleRescan}
              disabled={isLoading}
              className="px-5 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:bg-green-400"
            >
              {isLoading ? 'Rescanning...' : 'Rescan Files'}
            </button>
          </div>

          {/* Error / Success messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-green-600 dark:text-green-400">
                {successMessage}
              </p>
            </div>
          )}
        </header>

        {/* ========== MAIN CONTENT ========== */}
        <main className="space-y-8">
          {/* LEFT: Project Directory + RIGHT: Role/Description/Context */}
          <div className="grid grid-cols-4 gap-8">
            {/* 1) Project Directory on the left side */}
            <div className="col-span-1">
              <ProjectDirectoryContainer
                currentPath={currentPath}
                onPathChange={setCurrentPath}
              />
            </div>

            {/* 2) Role, Role Description, Tech Context on the right */}
            <div className="col-span-3 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                {/* Role Selector */}
                <div className="space-y-8">
                  <div
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow relative flex flex-col"
                    style={{ height: roleSelectorHeight }}
                  >
                    <h2 className="text-xl font-bold mb-4">Role Selector</h2>
                    <div className="flex-1 overflow-auto">
                      <RoleSelectorContainer
                        role={role}
                        setRole={setRole}
                        defaultDescriptions={defaultDescriptions}
                        setRoleDescription={setRoleDescription}
                      />
                    </div>
                    <div
                      className="absolute bottom-0 left-0 right-0 h-2 bg-transparent cursor-ns-resize"
                      onMouseDown={initiateResizeRoleSelector}
                    />
                  </div>

                  {/* Role Description */}
                  <div
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow relative flex flex-col"
                    style={{ height: roleDescriptionHeight }}
                  >
                    <h2 className="text-xl font-bold mb-4">Role Description</h2>
                    <div className="flex-1 overflow-auto">
                      <RoleDescriptionContainer
                        roleDescription={roleDescription}
                        setRoleDescription={setRoleDescription}
                      />
                    </div>
                    <div
                      className="absolute bottom-0 left-0 right-0 h-2 bg-transparent cursor-ns-resize"
                      onMouseDown={initiateResizeRoleDescription}
                    />
                  </div>
                </div>

                {/* Technical Context */}
                <div>
                  <div
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow relative flex flex-col"
                    style={{ height: technicalContextHeight }}
                  >
                    <h2 className="text-xl font-bold mb-4">
                      Technical Context
                    </h2>
                    <div className="flex-1 overflow-auto">
                      <TechnicalContextContainer
                        context={context}
                        setContext={setContext}
                        defaultContext={defaultContext}
                      />
                    </div>
                    <div
                      className="absolute bottom-0 left-0 right-0 h-2 bg-transparent cursor-ns-resize"
                      onMouseDown={initiateResizeTechnicalContext}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* OBJECTIVE + ANALYSIS FRAMEWORK */}
          <div className="grid grid-cols-2 gap-8">
            {/* ========== OBJECTIVE CONTAINER ========== */}
            <div
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow relative flex flex-col"
              style={{ height: objectiveHeight }}
            >
              <h2 className="text-xl font-bold mb-4">Objective</h2>

              {/* The new ObjectiveContainer does BOTH user input + refine flow */}
              <div className="flex-1 overflow-auto">
                <ObjectiveContainer
                  objective={objective}
                  setObjective={setObjective}
                  directoryStructure={directoryStructure || []}
                  setPromptContent={setPromptContent}
                />
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 h-2 bg-transparent cursor-ns-resize"
                onMouseDown={initiateResizeObjective}
              />
            </div>

            {/* ========== ANALYSIS FRAMEWORK ========== */}
            <div
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow relative flex flex-col"
              style={{ height: analysisFrameworkHeight }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Analysis Framework</h2>
                <button
                  onClick={() => setAnalysisFramework(defaultAnalysisFramework)}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  Reset to Default
                </button>
              </div>
              <div className="flex-1 overflow-auto">
                <AnalysisFrameworkForm
                  framework={analysisFramework}
                  setFramework={setAnalysisFramework}
                />
              </div>
              <div
                className="absolute bottom-0 left-0 right-0 h-2 bg-transparent cursor-ns-resize"
                onMouseDown={initiateResizeAnalysisFramework}
              />
            </div>
          </div>

          {/* FILE SELECTION + PROMPT PREVIEW */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <FileSelectionContainer
                directory={directoryStructure || []}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                currentPath={currentPath}
                objective={objective} // Added prop
              />
            </div>
            <div>
              <PromptPreview
                promptContent={promptContent}
                handleCopyPrompt={handleCopyPrompt}
              />
            </div>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}
