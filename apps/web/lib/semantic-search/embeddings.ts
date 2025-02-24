// lib/semantic-search/embeddings.ts

import { APIError } from '@/lib/error-handling/types';
import { EmbeddingCache } from '@/lib/semantic-search/cache';
import { withRetry } from '@/lib/retry';
import { Telemetry } from '@/lib/telemetry';
import { PerformanceMonitor } from '@/lib/performance/monitor';
import { Embedding } from '@/lib/semantic-search/types';
import fetch from 'node-fetch'; // Ensure fetch is available or use global fetch

export async function getEmbedding(text: string): Promise<Embedding> {
  const telemetry = Telemetry.getInstance();
  const monitor = PerformanceMonitor.getInstance();
  const eventId = `embedding-${Date.now()}`;

  telemetry.startTimer(eventId);
  const startTime = performance.now();

  const cache = EmbeddingCache.getInstance();
  const cached = cache.get(text);

  if (cached) {
    monitor.trackCacheMetrics(true);
    telemetry.logEvent('cache_hit', { id: eventId, textLength: text.length });
    return cached;
  }

  monitor.trackCacheMetrics(false);

  try {
    const result = await withRetry(async () => {
      const response = await fetch('/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const error = new APIError(
          'Embedding generation failed',
          response.status,
          response.status === 429 ? 'RATE_LIMIT' : 'EMBEDDING_FAILED'
        );
        throw error;
      }

      const data = await response.json();
      return { vector: data.embedding, text };
    });

    const duration = performance.now() - startTime;
    monitor.trackResponseTime(duration);
    telemetry.logEvent('embedding_success', {
      id: eventId,
      textLength: text.length,
      duration: telemetry.stopTimer(eventId),
    });

    cache.set(text, result);
    return result;
  } catch (error) {
    monitor.trackRetry();
    telemetry.logEvent('embedding_error', {
      id: eventId,
      error: error instanceof APIError ? error.code : 'UNKNOWN',
      duration: telemetry.stopTimer(eventId),
    });
    throw error;
  }
}
