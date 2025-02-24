import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { APIError } from '@/lib/error-handling/types';
import { EmbeddingRateLimiter } from '@/lib/semantic-search/embeddingRateLimiter';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const rateLimiter = EmbeddingRateLimiter.getInstance();

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      throw new APIError('Text is required', 400, 'MISSING_TEXT');
    }

    const estimatedTokens = Math.ceil(text.length / 4);
    await rateLimiter.waitForToken(estimatedTokens);

    if (text.length > 8191) {
      throw new APIError('Text exceeds maximum length', 400, 'TEXT_TOO_LONG');
    }

    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    const embedding = response.data[0]?.embedding;

    if (!embedding) {
      throw new APIError('Invalid embedding response', 500, 'INVALID_RESPONSE');
    }

    return NextResponse.json({
      embedding,
    });
  } catch (error) {
    if (error instanceof APIError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      );
    }

    console.error('Embedding generation error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
