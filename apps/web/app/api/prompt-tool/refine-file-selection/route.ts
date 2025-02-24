// apps/web/app/api/prompt-tool/refine-file-selection/route.ts
'use server';

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

function extractPathsSimple(text: string): string[] {
  const regex = /(["'`])([^"'`]+?\.\w+)\1/g;
  const matches = [...text.matchAll(regex)];
  const paths = matches.map((m) => m[2]);
  return [...new Set(paths)];
}

export async function POST(request: Request) {
  try {
    const { objective, directoryStructure, context } = await request.json();

    if (!objective || !directoryStructure) {
      return NextResponse.json(
        { error: 'Missing objective or directoryStructure' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // PASS 1: Directory-Only Analysis
    const systemPromptPass1 = `You are an expert software developer assistant.
Given the project context and directory structure, identify the core files needed for the objective.
Focus on:
- Files that will need modification
- Key interfaces and types
- Related components and dependencies
- Configuration/style files if needed

Return a JSON object with "files" array containing paths.`;

    const directoryJson = JSON.stringify(directoryStructure, null, 2);

    const userPromptPass1 = `Project Context:
${context || 'Next.js/React/TypeScript application'}

Objective:
${objective}

Directory Structure:
${directoryJson}

List recommended file paths as JSON with "files" array.`;

    const pass1Response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPromptPass1 },
        { role: 'user', content: userPromptPass1 },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const pass1Content = pass1Response.choices[0]?.message?.content?.trim();
    if (!pass1Content) {
      return NextResponse.json({ recommendedFiles: [] });
    }

    let recommendedFilesFirstPass: string[] = [];
    try {
      const parsed = JSON.parse(pass1Content);
      if (Array.isArray(parsed.files)) {
        recommendedFilesFirstPass = parsed.files
          .map((f: string) => f.trim());
      } else {
        recommendedFilesFirstPass = extractPathsSimple(pass1Content);
      }
    } catch {
      recommendedFilesFirstPass = extractPathsSimple(pass1Content);
    }

    if (!recommendedFilesFirstPass.length) {
      return NextResponse.json({ recommendedFiles: [] });
    }

    // PASS 2: Content Analysis
    const fetchedFilesContent: { path: string; content: string }[] = [];

    for (const filePath of recommendedFilesFirstPass) {
      try {
        const fileRes = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/file`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filePath }),
          }
        );

        if (fileRes.ok) {
          const data = await fileRes.json();
          fetchedFilesContent.push({ 
            path: filePath, 
            content: data.content || ''
          });
        }
      } catch (err) {
        console.warn(`Failed to fetch content for ${filePath}`, err);
      }
    }

    if (fetchedFilesContent.length === 0) {
      return NextResponse.json({
        recommendedFiles: recommendedFilesFirstPass,
      });
    }

    const systemPromptPass2 = `You are reviewing the actual contents of recommended files to validate their relevance to the objective.
Consider:
- Implementation details in the files
- Dependencies between files
- Missing files that might be needed
- Whether some files can be removed

Return a final JSON with "files" array listing the most relevant paths.`;

    let userPromptPass2 = `Project Context:
${context || 'Next.js/React/TypeScript application'}

Objective:
${objective}

Files from initial analysis with contents:\n`;

    for (const fileObj of fetchedFilesContent) {
      const truncatedContent = fileObj.content.slice(0, 3000);
      userPromptPass2 += `=== ${fileObj.path} ===\n${truncatedContent}\n\n`;
    }

    userPromptPass2 += '\nProvide final recommended files as JSON with "files" array.';

    const pass2Response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPromptPass2 },
        { role: 'user', content: userPromptPass2 },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const pass2Content = pass2Response.choices[0]?.message?.content?.trim();
    if (!pass2Content) {
      return NextResponse.json({ recommendedFiles: recommendedFilesFirstPass });
    }

    let finalRecommendedFiles: string[] = [];
    try {
      const parsed2 = JSON.parse(pass2Content);
      if (Array.isArray(parsed2.files)) {
        finalRecommendedFiles = parsed2.files
          .map((f: string) => f.trim());
      } else {
        finalRecommendedFiles = extractPathsSimple(pass2Content);
      }
    } catch {
      finalRecommendedFiles = extractPathsSimple(pass2Content);
    }

    return NextResponse.json({ recommendedFiles: finalRecommendedFiles });
  } catch (err: unknown) {
    console.error('Error in refine-file-selection:', err);

    if (err instanceof OpenAI.APIError) {
      if (
        err.status === 429 ||
        err.code?.toLowerCase() === 'insufficient_quota'
      ) {
        return NextResponse.json(
          {
            error:
              'You have exceeded your current OpenAI quota. Please check your plan and billing details: https://platform.openai.com/account/billing',
          },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}