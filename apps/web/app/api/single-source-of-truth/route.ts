// apps/web/app/api/single-source-of-truth/route.ts

import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import {
  generateSingleSourceOfTruth,
  SingleSourceOfTruth,
} from '@/lib/dependency-tracker/singleSourceOfTruth';

/**
 * POST Handler: Generates the single source of truth and writes it to a JSON file.
 */
export async function POST() {
  try {
    console.log('Starting generation of Single Source of Truth...');
    // 1. Define project root; adjust as necessary for your monorepo structure
    const projectRoot = path.resolve(process.cwd(), '../../..'); // Adjust based on your directory structure
    console.log('Project Root:', projectRoot);

    // 2. Generate the single source of truth
    const sstData: SingleSourceOfTruth =
      await generateSingleSourceOfTruth(projectRoot);
    console.log('SST Data Generated:', sstData);

    // 3. Define the output path
    const sstOutputPath = path.join(
      projectRoot,
      'apps',
      'web',
      'public',
      'single-source-of-truth.json'
    );
    console.log('SST Output Path:', sstOutputPath);

    // 4. Ensure the public directory exists
    const publicDir = path.dirname(sstOutputPath);
    await fs.mkdir(publicDir, { recursive: true });
    console.log('Ensured that the public directory exists.');

    // 5. Write the JSON data to the file
    await fs.writeFile(
      sstOutputPath,
      JSON.stringify(sstData, null, 2),
      'utf-8'
    );
    console.log('SST successfully written to', sstOutputPath);

    // 6. Return a success response
    return NextResponse.json({
      message: 'Single source of truth generated successfully.',
      outputPath: 'apps/web/public/single-source-of-truth.json',
    });
  } catch (error) {
    console.error('Error generating Single Source of Truth:', error);
    return NextResponse.json(
      { error: 'Failed to generate single source of truth.' },
      { status: 500 }
    );
  }
}

/**
 * GET Handler: Triggers SST generation and returns the generated SST.
 */
export async function GET() {
  try {
    console.log('GET request received. Triggering SST generation...');
    // 1. Define project root; adjust as necessary
    const projectRoot = path.resolve(process.cwd(), '../../..'); // Adjust based on your directory structure
    console.log('Project Root:', projectRoot);

    // 2. Generate the single source of truth
    const sstData: SingleSourceOfTruth =
      await generateSingleSourceOfTruth(projectRoot);
    console.log('SST Data Generated:', sstData);

    // 3. Define the output path
    const sstOutputPath = path.join(
      projectRoot,
      'apps',
      'web',
      'public',
      'single-source-of-truth.json'
    );
    console.log('SST Output Path:', sstOutputPath);

    // 4. Ensure the public directory exists
    const publicDir = path.dirname(sstOutputPath);
    await fs.mkdir(publicDir, { recursive: true });
    console.log('Ensured that the public directory exists.');

    // 5. Write the JSON data to the file
    await fs.writeFile(
      sstOutputPath,
      JSON.stringify(sstData, null, 2),
      'utf-8'
    );
    console.log('SST successfully written to', sstOutputPath);

    // 6. Return the generated SST as response
    return NextResponse.json({
      message: 'Single source of truth generated successfully via GET request.',
      sstData,
    });
  } catch (error) {
    console.error('Error generating Single Source of Truth via GET:', error);
    return NextResponse.json(
      { error: 'Failed to generate single source of truth via GET request.' },
      { status: 500 }
    );
  }
}
