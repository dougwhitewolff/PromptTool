// apps/web/app/api/prompt-tool/directory/route.ts
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { DirectoryEntry } from '@/lib/prompt-tool/types';

export const runtime = 'nodejs';

const EXCLUDED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  '.cache',
  '.vscode',
  'coverage',
]);

function getDirectoryStructure(dirPath: string): DirectoryEntry[] {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => {
        if (entry.name.startsWith('.')) return false;
        if (EXCLUDED_DIRS.has(entry.name)) return false;
        return true;
      })
      .map((entry) => {
        const res: DirectoryEntry = {
          name: entry.name,
          type: entry.isDirectory() ? 'directory' : 'file',
        };

        if (entry.isDirectory()) {
          try {
            res.children = getDirectoryStructure(
              path.join(dirPath, entry.name)
            );
          } catch (error) {
            console.error(`Error reading subdirectory ${entry.name}:`, error);
            res.children = [];
          }
        }
        return res;
      })
      .sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'directory' ? -1 : 1;
      });
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
    return [];
  }
}

function resolveProjectPath(baseDir: string, requestedPath: string): string {
  // Special handling for reDo project
  if (requestedPath === 'apps/reDo' || requestedPath === 'apps/web') {
    return path.join(baseDir, 'reDo');
  }

  // If the path starts with 'apps/' but isn't reDo, strip the 'apps/' prefix
  if (requestedPath.startsWith('apps/')) {
    return path.join(baseDir, requestedPath.replace('apps/', ''));
  }

  // For all other paths, use them directly
  return path.join(baseDir, requestedPath);
}

export async function POST(req: Request) {
  try {
    const { path: requestedPath = '' } = await req.json();

    // Use Development directory as base
    const baseDir = process.env.MONOREPO_ROOT || 'C:\\Development';

    // Resolve the full path using our helper function
    const fullPath = resolveProjectPath(baseDir, requestedPath);

    console.log('Path resolution:', {
      baseDir,
      requestedPath,
      fullPath,
    });

    // Check if path exists
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json(
        { error: 'Path does not exist', path: fullPath },
        { status: 404 }
      );
    }

    // Check if it's a directory
    const stats = fs.statSync(fullPath);
    if (!stats.isDirectory()) {
      return NextResponse.json(
        { error: 'Path is not a directory', path: fullPath },
        { status: 400 }
      );
    }

    // Get the directory structure
    const structure = getDirectoryStructure(fullPath);

    return NextResponse.json({
      structure,
      currentPath: requestedPath,
    });
  } catch (error) {
    console.error('Error in directory endpoint:', error);
    return NextResponse.json(
      {
        error: 'Failed to process directory request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
