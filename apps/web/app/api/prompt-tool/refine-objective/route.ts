/***************************************************************************
 * File: apps/web/app/api/prompt-tool/refine-objective/route.ts
 * Description:
 *   This Next.js API route calls a custom assistant (model) created in OpenAI
 *   to refine a given "objective". If the specified custom model is invalid or
 *   inaccessible, it falls back to a publicly available model (e.g., gpt-3.5-turbo).
 ***************************************************************************/

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

//
// 1) Construct the OpenAI client with your general API key from the environment.
//
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//
// 2) The POST handler for refining an objective.
//
export async function POST(req: Request) {
  try {
    // 2a) Extract data from the request body
    const { objective, directoryStructure } = await req.json();

    // 2b) Validate the input: "objective" is required
    if (!objective) {
      return NextResponse.json(
        { error: 'Objective is required' },
        { status: 400 }
      );
    }

    //
    // 3) Read the custom assistant ID from the environment
    //    If not set, default to "gpt-4o-mini" (existing fallback).
    //
    const refineAssistantId =
      process.env.OPENAI_REFINEMENT_ASSISTANT_ID || 'gpt-4o-mini';

    // 3a) Define a known fallback model
    const fallbackModel = 'gpt-4o-mini'; // or "gpt-4" as needed

    //
    // 4) Create a system prompt that guides the refinement process.
    //
    const systemPrompt = `You are an expert software developer assistant. Your task is to refine and improve the given objective for a software development task. Consider the following:

1. Technical clarity and specificity
2. Project context and scope
3. Actionable outcomes
4. Technical constraints and requirements

Based on the provided directory structure and objective, provide a refined, more detailed objective that will help guide the development process.

Project Directory Structure:
${directoryStructure}`;

    //
    // 5) Define a helper function to call the OpenAI chat completion.
    //
    async function callOpenAiModel(model: string) {
      return openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Please refine this software development objective: "${objective}"`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });
    }

    //
    // 6) Verify that the custom model is accessible before using it.
    //    If verification fails, we flag fallback usage.
    //
    let useFallback = false;
    try {
      // Attempt to retrieve the model's metadata
      // If this fails due to 404 or permission errors, we'll catch it below.
      await openai.models.retrieve(refineAssistantId);
      console.log(`Verified custom model "${refineAssistantId}" is accessible.`);
    } catch (verifyError: any) {
      console.warn(
        `Custom model "${refineAssistantId}" is not accessible:`,
        verifyError?.message || verifyError
      );
      useFallback = true;
    }

    // We'll attempt the primary call using either the custom model (if accessible)
    // or fallback model directly, to reduce duplication of logic.
    let completion;
    const primaryModel = useFallback ? fallbackModel : refineAssistantId;

    try {
      completion = await callOpenAiModel(primaryModel);
    } catch (primaryError: any) {
      console.error(`Error calling model "${primaryModel}":`, primaryError);

      // If it fails for any reason, attempt the fallback if we haven't already:
      if (!useFallback) {
        console.warn(
          `Falling back to "${fallbackModel}" after primary model failed.`
        );
        try {
          completion = await callOpenAiModel(fallbackModel);
        } catch (fallbackError: any) {
          console.error('Fallback model also failed:', fallbackError);
          const errorMessage =
            fallbackError instanceof Error
              ? fallbackError.message
              : 'An error occurred with fallback model';
          return NextResponse.json({ error: errorMessage }, { status: 500 });
        }
      } else {
        // If we were already using the fallback model, fail out
        const errorMessage =
          primaryError instanceof Error
            ? primaryError.message
            : 'An error occurred calling the fallback model';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
      }
    }

    //
    // 7) Extract the "refined objective" from the first choice
    //
    const refinedObjective = completion?.choices?.[0]?.message?.content?.trim();
    if (!refinedObjective) {
      throw new Error('Failed to generate refined objective');
    }

    //
    // 8) Return the result as JSON
    //
    return NextResponse.json({ refinedObjective });
  } catch (error) {
    console.error('Error in refine-objective:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
