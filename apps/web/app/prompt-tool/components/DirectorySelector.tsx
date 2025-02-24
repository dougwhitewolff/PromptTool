// apps/web/app/prompt-tool/components/DirectorySelector.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface DirectorySelectorProps {
  currentPath: string;
  onPathChange: (path: string) => void;
}

export default function DirectorySelector({
  currentPath,
  onPathChange,
}: DirectorySelectorProps) {
  const [appNames, setAppNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDefaults = async () => {
      try {
        setError(null);
        setIsLoading(true);

        const response = await fetch('/api/prompt-tool/directory/defaults');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.paths && Array.isArray(data.paths)) {
          setAppNames(data.paths);
          
          // If no current path is set and we have paths, set the first one
          if (!currentPath && data.paths.length > 0) {
            // Special handling for reDo project
            if (data.paths[0] === 'reDo') {
              onPathChange('apps/reDo');
            } else {
              onPathChange(data.paths[0]); // Direct path for other projects
            }
          }
        } else {
          setError('Invalid data format received from server');
        }
      } catch (err) {
        console.error('Error fetching default paths:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch directories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDefaults();
  }, [currentPath, onPathChange]);

  const handleAppChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedApp = e.target.value;
    if (selectedApp) {
      // Special handling for reDo project
      if (selectedApp === 'reDo') {
        onPathChange(`apps/${selectedApp}`);
      } else {
        onPathChange(selectedApp); // Direct path for other projects
      }
    }
  };

  // Extract the current app name from the path
  const getCurrentAppName = () => {
    // Handle special case for reDo project
    if (currentPath.startsWith('apps/')) {
      return currentPath.split('/')[1];
    }
    // For other projects, use the path directly
    return currentPath;
  };

  const selectedApp = getCurrentAppName();
  const singleApp = appNames.length === 1;

  if (isLoading) {
    return (
      <Card className="bg-gray-900 text-white border-none shadow-lg">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 text-white border-none shadow-lg">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="app-select" className="text-sm font-medium text-gray-300">
            Select Project
          </label>
          <select
            id="app-select"
            value={selectedApp}
            onChange={handleAppChange}
            disabled={singleApp || isLoading}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select a project...</option>
            {appNames.map((appName) => (
              <option key={appName} value={appName}>
                {appName}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-800 rounded-md">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="text-sm text-gray-400">
          <p>Current Path: <code className="text-blue-400">{currentPath}</code></p>
          {singleApp && (
            <p className="mt-2 italic">Only one project is available in this workspace.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}