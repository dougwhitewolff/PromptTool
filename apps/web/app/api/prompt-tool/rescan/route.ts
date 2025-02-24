// apps/web/app/api/prompt-tool/rescan/route.ts

import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

const EXCLUDED_DIRECTORIES = [
  'node_modules',
  '.next',
  'dist',
  '.git',
  'public',
];

function getDirectoryStructure(dir: string) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries
      .filter((entry) => {
        if (entry.name.startsWith('.')) return false;
        if (EXCLUDED_DIRECTORIES.includes(entry.name)) return false;
        return true;
      })
      .map((entry) => {
        const res: {
          name: string;
          type: 'directory' | 'file';
          children?: any[];
        } = {
          name: entry.name,
          type: entry.isDirectory() ? 'directory' : 'file',
        };
        if (entry.isDirectory()) {
          try {
            res.children = getDirectoryStructure(path.join(dir, entry.name));
          } catch (error) {
            console.error(`Failed to read directory ${entry.name}: ${error}`);
          }
        }
        return res;
      });
  } catch (error) {
    console.error(`Failed to read directory ${dir}: ${error}`);
    return [];
  }
}

export async function POST() {
  try {
    console.log('Rescan request received');

    // Get project root directory (two levels up from process.cwd())
    const projectRoot = path.resolve(process.cwd(), '../..');
    console.log(`Project Root: ${projectRoot}`);

    const outputPath = path.join(
      projectRoot,
      'apps',
      'web',
      'public',
      'file-structure.json'
    );
    console.log(`Output Path: ${outputPath}`);

    // Generate directory structure
    const structure = getDirectoryStructure(projectRoot);

    // Ensure the public directory exists
    const publicDir = path.dirname(outputPath);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Write the structure to file
    fs.writeFileSync(outputPath, JSON.stringify(structure, null, 2), 'utf8');
    console.log('File structure successfully written');

    return NextResponse.json({
      message: 'File structure updated successfully',
      path: outputPath,
    });
  } catch (err) {
    console.error('Error in rescan endpoint:', err);
    return NextResponse.json(
      {
        error: 'Failed to rescan directory',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
