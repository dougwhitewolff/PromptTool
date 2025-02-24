// lib/semantic-search/index.ts
import { FileMetadata } from '../file-matcher/types';

export class SemanticSearch {
  private embeddings: Map<string, Embedding> = new Map();

  async indexMetadata(metadata: Record<string, FileMetadata>) {
    for (const [path, data] of Object.entries(metadata)) {
      const text = this.prepareText(data);
      const embedding = await this.getEmbedding(text);
      this.embeddings.set(path, embedding);
    }
  }

  async findMatches(objective: string, threshold = 0.7): Promise<string[]> {
    const queryEmbedding = await this.getEmbedding(objective);
    const scores = Array.from(this.embeddings.entries()).map(
      ([path, embedding]) => ({
        path,
        score: this.cosineSimilarity(queryEmbedding.vector, embedding.vector),
      })
    );

    return scores
      .filter((score) => score.score > threshold)
      .sort((a, b) => b.score - a.score)
      .map((score) => score.path);
  }

  private prepareText(metadata: FileMetadata): string {
    return [
      metadata.purpose,
      ...metadata.keywords,
      ...metadata.categories,
    ].join(' ');
  }

  private async getEmbedding(text: string): Promise<Embedding> {
    return getEmbedding(text);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}

// lib/semantic-search/cache.ts
import { Embedding } from './types';

export class EmbeddingCache {
  private static instance: EmbeddingCache;
  private cache: Map<string, Embedding> = new Map();
  private persist: boolean;

  private constructor(persist = true) {
    this.persist = persist;
    if (persist) {
      this.loadFromStorage();
    }
  }

  static getInstance(): EmbeddingCache {
    if (!EmbeddingCache.instance) {
      EmbeddingCache.instance = new EmbeddingCache();
    }
    return EmbeddingCache.instance;
  }

  get(key: string): Embedding | undefined {
    return this.cache.get(key);
  }

  set(key: string, embedding: Embedding): void {
    this.cache.set(key, embedding);
    if (this.persist) {
      this.saveToStorage();
    }
  }

  private loadFromStorage(): void {
    const stored = localStorage.getItem('embeddingCache');
    if (stored) {
      const parsed = JSON.parse(stored);
      this.cache = new Map(Object.entries(parsed));
    }
  }

  private saveToStorage(): void {
    const obj = Object.fromEntries(this.cache);
    localStorage.setItem('embeddingCache', JSON.stringify(obj));
  }
}
