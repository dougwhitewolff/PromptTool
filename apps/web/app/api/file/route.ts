// apps/web/app/api/file/route.ts
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

function resolveProjectFilePath(baseDir: string, filePath: string): string {
  console.log('Input file path:', filePath);
  
  // Handle paths for the reDo project
  if (filePath.startsWith('apps/reDo/')) {
    // Convert 'apps/reDo/apps/web/...' to 'reDo/apps/web/...'
    const pathWithoutPrefix = filePath.replace('apps/reDo/', '');
    return path.join(baseDir, 'reDo', pathWithoutPrefix);
  }
  
  // Handle paths for web/standalone app
  if (filePath.startsWith('apps/web/') || filePath.startsWith('apps/standalone-prompt-tool/')) {
    const pathWithoutPrefix = filePath.replace(/^apps\/(web|standalone-prompt-tool)\//, '');
    return path.join(baseDir, 'reDo', 'apps', 'web', pathWithoutPrefix);
  }
  
  // Handle direct paths
  return path.join(baseDir, filePath);
}

export async function POST(request: Request) {
  try {
    const { filePath } = await request.json();
    console.log('Received /api/file request:', { filePath });

    if (!filePath) {
      console.warn('Missing filePath');
      return NextResponse.json(
        { error: 'filePath is required.' },
        { status: 400 }
      );
    }

    // 1) Use MONOREPO_ROOT or fallback
    const baseDir = process.env.MONOREPO_ROOT || 'C:\\Development';
    console.log('[file] Using MONOREPO_ROOT:', baseDir);

    // 2) Resolve the full path using our helper function
    const resolvedPath = resolveProjectFilePath(baseDir, filePath);
    console.log('Resolved path:', resolvedPath);

    // 3) Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      console.log('File does not exist:', resolvedPath);
      return NextResponse.json(
        { error: 'File does not exist.' },
        { status: 400 }
      );
    }

    // 4) Verify it's a file
    const stats = fs.statSync(resolvedPath);
    if (!stats.isFile()) {
      console.log('Path is not a file:', resolvedPath);
      return NextResponse.json(
        { error: 'Path is not a file.' },
        { status: 400 }
      );
    }

    // 5) Read and return file content
    const content = fs.readFileSync(resolvedPath, 'utf-8');
    console.log('Successfully read file:', resolvedPath);

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error in /api/file route:', error);
    return NextResponse.json(
      { error: 'Failed to read file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}