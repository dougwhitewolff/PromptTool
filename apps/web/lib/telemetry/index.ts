// lib/telemetry/index.ts
import { APIError } from '../error-handling/types';

interface TelemetryEvent {
  timestamp: number;
  type: string;
  data: Record<string, any>;
  duration?: number;
}

export class Telemetry {
  private static instance: Telemetry;
  private events: TelemetryEvent[] = [];
  private timers: Map<string, number> = new Map();

  static getInstance(): Telemetry {
    if (!this.instance) {
      this.instance = new Telemetry();
    }
    return this.instance;
  }

  startTimer(id: string) {
    this.timers.set(id, performance.now());
  }

  stopTimer(id: string): number {
    const start = this.timers.get(id);
    if (!start) return 0;
    const duration = performance.now() - start;
    this.timers.delete(id);
    return duration;
  }

  logEvent(type: string, data: Record<string, any>) {
    const event = {
      timestamp: Date.now(),
      type,
      data,
    };
    this.events.push(event);
    this.sendToAnalytics(event);
  }

  private async sendToAnalytics(event: TelemetryEvent) {
    try {
      await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to send telemetry:', error);
    }
  }
}

// Update embeddings.ts with telemetry
export async function getEmbedding(text: string) {
  const telemetry = Telemetry.getInstance();
  const eventId = `embedding-${Date.now()}`;
  telemetry.startTimer(eventId);

  try {
    const result = await withRetry(async () => {
      // Existing embedding logic
    });

    telemetry.logEvent('embedding_success', {
      id: eventId,
      textLength: text.length,
      duration: telemetry.stopTimer(eventId),
    });

    return result;
  } catch (error) {
    telemetry.logEvent('embedding_error', {
      id: eventId,
      error: error instanceof APIError ? error.code : 'UNKNOWN',
      duration: telemetry.stopTimer(eventId),
    });
    throw error;
  }
}
