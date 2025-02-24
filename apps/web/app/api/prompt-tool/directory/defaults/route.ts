// apps/web/app/api/prompt-tool/directory/defaults/route.ts
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

function isValidProjectDirectory(dirPath: string): boolean {
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

    const contents = fs.readdirSync(dirPath);

    // Less strict validation - any development-related files/folders make it valid
    const hasDevFiles = contents.some(
      (item) =>
        ['.git', 'package.json', '.env', 'src', 'app', 'public'].includes(
          item
        ) ||
        item.endsWith('.ts') ||
        item.endsWith('.js') ||
        item.endsWith('.json') ||
        item.endsWith('.md')
    );

    console.log('Directory checks:', {
      dirPath,
      hasDevFiles,
      isValid: hasDevFiles,
    });

    return hasDevFiles;
  } catch (error) {
    console.error(`Error checking directory ${dirPath}:`, error);
    return false;
  }
}

export async function GET() {
  try {
    const developmentDir = 'C:\\Development';

    console.log('Base directory:', developmentDir);

    if (!fs.existsSync(developmentDir)) {
      console.error('Development directory not found:', developmentDir);
      return NextResponse.json(
        {
          paths: [],
          error: 'Development directory not found',
        },
        { status: 404 }
      );
    }

    const entries = fs.readdirSync(developmentDir, { withFileTypes: true });
    const projectDirs = entries
      .filter((entry) => entry.isDirectory())
      .filter((entry) => {
        const fullPath = path.join(developmentDir, entry.name);
        const isValid = isValidProjectDirectory(fullPath);
        console.log(`Checking project directory: ${entry.name}`, {
          fullPath,
          isValid,
        });
        return isValid;
      })
      .map((entry) => entry.name);

    if (projectDirs.length === 0) {
      console.log('No valid projects found');
      return NextResponse.json({
        paths: [],
        warning: 'No valid projects found',
      });
    }

    return NextResponse.json({ paths: projectDirs });
  } catch (error) {
    console.error('Error in directory defaults:', error);
    return NextResponse.json(
      {
        error: 'Failed to get default paths',
        details: error instanceof Error ? error.message : 'Unknown error',
        paths: [],
      },
      { status: 500 }
    );
  }
}
