// apps/web/app/prompt-tool/components/ProjectDirectoryContainer.tsx

import React from 'react';
import DirectorySelector from './DirectorySelector';

interface ProjectDirectoryContainerProps {
  currentPath: string;
  onPathChange: React.Dispatch<React.SetStateAction<string>>;
}

export default function ProjectDirectoryContainer({
  currentPath,
  onPathChange,
}: ProjectDirectoryContainerProps) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow h-full">
      <h2 className="text-xl font-bold mb-4">Project Directory</h2>
      <DirectorySelector currentPath={currentPath} onPathChange={onPathChange} />
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Current Path: {currentPath}
      </p>
    </div>
  );
}
