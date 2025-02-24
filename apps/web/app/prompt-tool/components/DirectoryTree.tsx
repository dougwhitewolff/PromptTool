import React, { useState, useMemo } from 'react';
import { FaFolder, FaFolderOpen, FaFile, FaStar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import DirectorySearch from './DirectorySearch';
import { DirectoryEntry } from '@/lib/prompt-tool/types';
import { normalizeFilePath } from '@/lib/prompt-tool/utils';

interface EnhancedDirectoryEntry extends DirectoryEntry {
  selectable?: boolean;
  children?: EnhancedDirectoryEntry[];
}

function getAllFilesInDirectory(entry: EnhancedDirectoryEntry, basePath: string): string[] {
  if (!entry.selectable) return [];

  if (entry.type === 'file') {
    return [`${basePath}/${entry.name}`.replace(/\/+/g, '/')];
  }

  if (entry.type === 'directory' && entry.children) {
    const dirPath = `${basePath}/${entry.name}`.replace(/\/+/g, '/');
    return entry.children.flatMap((child) => getAllFilesInDirectory(child, dirPath));
  }

  return [];
}

interface DirectoryTreeProps {
  directory: DirectoryEntry[];
  selectedFiles: string[];
  setSelectedFiles: (files: string[]) => void;
  currentPath: string;
  recommendedFiles: string[];
}

export default function DirectoryTree({
  directory,
  selectedFiles,
  setSelectedFiles,
  currentPath,
  recommendedFiles,
}: DirectoryTreeProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDirectory = useMemo(() => {
    const filterEntries = (entries: DirectoryEntry[]): EnhancedDirectoryEntry[] => {
      return entries
        .filter((entry) => !entry.name.includes('rescan'))
        .map((entry) => ({
          ...entry,
          selectable: true,
          children: entry.type === 'directory' && entry.children 
            ? filterEntries(entry.children) 
            : undefined,
        }))
        .filter((entry) => {
          if (searchQuery.trim() === '') return true;

          const query = searchQuery.toLowerCase();
          if (entry.type === 'file') {
            return entry.name.toLowerCase().includes(query);
          }
          if (entry.type === 'directory') {
            const nameMatches = entry.name.toLowerCase().includes(query);
            const hasMatchingChildren = entry.children && entry.children.length > 0;
            return nameMatches || hasMatchingChildren;
          }
          return false;
        });
    };
    return filterEntries(directory);
  }, [directory, searchQuery]);

  return (
    <div className="p-4 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        <p className="font-semibold text-lg">Directory Structure</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
          {recommendedFiles.length > 0 && ` (${recommendedFiles.length} recommended)`}
        </p>
      </div>
      
      <DirectorySearch onSearch={setSearchQuery} />
      
      {filteredDirectory.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          {searchQuery.trim() === ''
            ? 'No files or directories found in this location.'
            : `No files or directories found matching "${searchQuery}".`}
        </p>
      ) : (
        <div className="space-y-1">
          {filteredDirectory.map((entry) => (
            <EntryView
              key={entry.name}
              entry={entry}
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              basePath={currentPath}
              depth={0}
              recommendedFiles={recommendedFiles}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EntryView({
  entry,
  selectedFiles,
  setSelectedFiles,
  basePath,
  depth,
  recommendedFiles,
}: {
  entry: EnhancedDirectoryEntry;
  selectedFiles: string[];
  setSelectedFiles: (files: string[]) => void;
  basePath: string;
  depth: number;
  recommendedFiles: string[];
}) {
  const [expanded, setExpanded] = useState(true);
  const currentPath = useMemo(
    () => normalizeFilePath(`${basePath}/${entry.name}`),
    [basePath, entry.name]
  );

  const allFiles = useMemo(() => {
    if (entry.type === 'directory') {
      return getAllFilesInDirectory(entry, basePath).map(normalizeFilePath);
    }
    return [currentPath];
  }, [entry, basePath, currentPath]);

  const allSelected = useMemo(() => {
    return allFiles.every((file) => selectedFiles.includes(file));
  }, [allFiles, selectedFiles]);

  const someSelected = useMemo(() => {
    if (entry.type === 'directory') {
      return allFiles.some((file) => selectedFiles.includes(file)) && !allSelected;
    }
    return false;
  }, [entry.type, allFiles, selectedFiles, allSelected]);

  const isRecommended = useMemo(() => {
    if (entry.type === 'file') {
      return recommendedFiles.includes(currentPath);
    }
    return allFiles.some(file => recommendedFiles.includes(file));
  }, [entry.type, currentPath, recommendedFiles, allFiles]);

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (allSelected) {
      setSelectedFiles(selectedFiles.filter((file) => !allFiles.includes(file)));
    } else {
      const newSelectedFiles = new Set([...selectedFiles, ...allFiles]);
      setSelectedFiles(Array.from(newSelectedFiles));
    }
  };

  const paddingLeft = `${depth * 16}px`;

  if (entry.type === 'directory') {
    return (
      <div>
        <div
          className={`flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
            allSelected ? 'bg-blue-100 dark:bg-blue-700' : ''
          }`}
          style={{ paddingLeft }}
          onClick={handleSelection}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="w-5 h-5 flex items-center justify-center text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transform transition-transform duration-200"
            title={expanded ? 'Collapse directory' : 'Expand directory'}
          >
            {expanded ? <FaFolderOpen /> : <FaFolder />}
          </button>
          <input
            type="checkbox"
            checked={allSelected}
            ref={(input) => {
              if (input) {
                input.indeterminate = someSelected;
              }
            }}
            onChange={(e) => handleSelection(e as unknown as React.MouseEvent)}
            className="h-5 w-5 rounded border-gray-300 dark:border-gray-600"
            title="Select/Deselect all files in this directory"
          />
          <span className="font-medium text-blue-900 dark:text-blue-100 flex-1">
            {entry.name}/
          </span>
          {isRecommended && (
            <FaStar className="w-4 h-4 text-yellow-400" title="Contains recommended files" />
          )}
          {allSelected && <FaFile className="w-4 h-4 text-green-500" />}
        </div>
        <AnimatePresence initial={false}>
          {expanded && entry.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="ml-4"
            >
              {entry.children.map((child) => (
                <EntryView
                  key={child.name}
                  entry={child}
                  selectedFiles={selectedFiles}
                  setSelectedFiles={setSelectedFiles}
                  basePath={currentPath}
                  depth={depth + 1}
                  recommendedFiles={recommendedFiles}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
        selectedFiles.includes(currentPath)
          ? 'bg-green-100 dark:bg-green-700'
          : ''
      }`}
      style={{ paddingLeft: `${depth * 16 + 16}px` }}
      onClick={handleSelection}
    >
      <FaFile className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      <input
        type="checkbox"
        checked={selectedFiles.includes(currentPath)}
        onChange={(e) => handleSelection(e as unknown as React.MouseEvent)}
        id={currentPath}
        className="h-5 w-5 rounded border-gray-300 dark:border-gray-600"
        title="Select this file to include its content in the prompt"
        onClick={(e) => e.stopPropagation()}
      />
      <label
        htmlFor={currentPath}
        className="text-sm cursor-pointer flex items-center gap-2 text-gray-700 dark:text-gray-300"
      >
        {entry.name}
      </label>
      {isRecommended && (
        <FaStar 
          className="w-4 h-4 text-yellow-400 ml-auto" 
          title="Recommended by AI"
        />
      )}
    </div>
  );
}