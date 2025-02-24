// apps/web/lib/dependency-tracker/singleSourceOfTruth.ts

import fs from 'fs/promises';
import path from 'path';
import { DependencyTracker } from './utils'; // Ensure this path is correct
import { DependencyGraph } from './types';

/**
 * Interface describing the final single source of truth schema.
 */
export interface SingleSourceOfTruth {
  directoryTree: DirectoryEntry[];
  dependencyGraph: DependencyGraph;
  lastUpdated: string;
}

/**
 * Represents a simple directory entry type for building a hierarchical tree.
 * You may also reuse the existing `DirectoryEntry` from `prompt-tool/types.ts`.
 */
export interface DirectoryEntry {
  name: string;
  type: 'directory' | 'file';
  children?: DirectoryEntry[];
}

/**
 * Recursively builds a directory tree while filtering out excluded directories.
 */
async function buildDirectoryTree(
  rootDir: string,
  exclude: string[] = ['node_modules', '.next', 'dist', '.git', '@*']
): Promise<DirectoryEntry[]> {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const result: DirectoryEntry[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue; // Skip hidden files and directories
    // Skip directories that match any pattern in the exclude list
    if (
      exclude.some((pattern) => {
        if (pattern.endsWith('*')) {
          return entry.name.startsWith(pattern.slice(0, -1));
        }
        return entry.name === pattern;
      })
    )
      continue;

    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      const children = await buildDirectoryTree(fullPath, exclude);
      result.push({
        name: entry.name,
        type: 'directory',
        children,
      });
    } else if (entry.isFile()) {
      // Only include specific file types
      const ext = path.extname(entry.name).toLowerCase();
      if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
        result.push({
          name: entry.name,
          type: 'file',
        });
      }
    }
  }

  return result;
}

/**
 * Generates a single source of truth by scanning the codebase and building a dependency graph.
 */
export async function generateSingleSourceOfTruth(
  baseDir: string
): Promise<SingleSourceOfTruth> {
  // 1. Build directory tree
  const directoryTree = await buildDirectoryTree(baseDir);

  // 2. Initialize DependencyTracker
  const dependencyTracker = new DependencyTracker();

  // 3. Recursively parse all .ts, .tsx, .js, .jsx files for dependencies
  await parseDirectoryForDependencies(baseDir, dependencyTracker);

  // 4. Gather the final graph
  const dependencyGraph = dependencyTracker.getDependencyGraph();

  return {
    directoryTree,
    dependencyGraph,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Helper function to recursively parse files for dependencies.
 */
async function parseDirectoryForDependencies(
  dir: string,
  tracker: DependencyTracker,
  exclude: string[] = ['node_modules', '.next', 'dist', '.git']
) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue; // Skip hidden files and directories
    if (exclude.includes(entry.name)) continue; // Skip excluded directories

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await parseDirectoryForDependencies(fullPath, tracker, exclude);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      // Only process specific file types
      if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
        await tracker.updateDependencies(fullPath, 2); // Depth=2 or more
      }
    }
  }
}
