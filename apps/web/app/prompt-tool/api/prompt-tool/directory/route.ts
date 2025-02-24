// app/api/prompt-tool/directory/route.ts

import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { DirectoryEntry } from '@/lib/prompt-tool/types';

function isValidAppDirectory(dirPath: string): boolean {
  try {
    console.log('Checking directory:', dirPath);

    if (!fs.existsSync(dirPath)) {
      console.log('Directory does not exist:', dirPath);
      return false;
    }

    const stats = fs.statSync(dirPath);
    if (!stats.isDirectory()) {
      console.log('Not a directory:', dirPath);
      return false;
    }

    const hasPackageJson = fs.existsSync(path.join(dirPath, 'package.json'));
    const hasAppDir =
      fs.existsSync(path.join(dirPath, 'app')) ||
      fs.existsSync(path.join(dirPath, 'src'));

    console.log('Directory checks:', {
      dirPath,
      hasPackageJson,
      hasAppDir,
      isValid: hasPackageJson && hasAppDir,
    });

    return hasPackageJson && hasAppDir;
  } catch (error) {
    console.error(`Error checking directory ${dirPath}:`, error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const targetPath = body.path || '';

    const resolvedBase = path.resolve(process.cwd(), '../..');
    const appsDir = path.join(resolvedBase, 'apps');

    console.log('Path resolution:', {
      resolvedBase,
      appsDir,
      cwd: process.cwd(),
      targetPath,
    });

    if (!fs.existsSync(appsDir)) {
      console.error('Apps directory not found:', appsDir);
      return NextResponse.json(
        { error: 'Apps directory not found', paths: ['web'] },
        { status: 404 }
      );
    }

    const entries = fs.readdirSync(appsDir, { withFileTypes: true });
    const appNames = entries
      .filter((entry) => entry.isDirectory())
      .filter((entry) => {
        const fullPath = path.join(appsDir, entry.name);
        const isValid = isValidAppDirectory(fullPath);
        console.log(`Checking app directory: ${entry.name}`, {
          fullPath,
          isValid,
        });
        return isValid;
      })
      .map((entry) => entry.name);

    if (appNames.length === 0) {
      console.log('No valid apps found, falling back to web');
      return NextResponse.json({ paths: ['web'] });
    }

    // Get the current app name from the target path
    const pathParts = targetPath.split('/');
    const currentAppName = pathParts[1] || appNames[0]; // Use first app if none specified

    // Get the subdirectory path after the app name
    const subPath = pathParts.slice(2).join('/');

    // Get the full path to scan
    const targetFullPath = path.join(appsDir, currentAppName, subPath);

    function getDirectoryStructure(dir: string): DirectoryEntry[] {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        return entries
          .filter(
            (entry) =>
              !entry.name.startsWith('.') &&
              entry.name !== 'node_modules' &&
              entry.name !== 'dist' &&
              entry.name !== '.next'
          )
          .map((entry) => {
            const res: DirectoryEntry = {
              name: entry.name,
              type: entry.isDirectory() ? 'directory' : 'file',
            };

            if (entry.isDirectory()) {
              try {
                res.children = getDirectoryStructure(
                  path.join(dir, entry.name)
                );
              } catch {
                console.error(`Error reading subdirectory ${entry.name}:`, err);
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
        console.error('Error reading directory:', error);
        return [];
      }
    }

    // Create the root structure with the app name
    const structure: DirectoryEntry[] = [
      {
        name: currentAppName,
        type: 'directory',
        children: getDirectoryStructure(targetFullPath),
      },
    ];

    return NextResponse.json({
      paths: appNames,
      structure,
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
