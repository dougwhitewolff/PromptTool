class EmbeddingRateLimiter {
  private static instance: EmbeddingRateLimiter;
  private tokens: number;
  private maxTokens: number;
  private refillRate: number;
  private lastRefill: number;

  private constructor() {
    this.tokens = 100; // Initial tokens
    this.maxTokens = 100; // Maximum tokens
    this.refillRate = 1; // Tokens refilled per second
    this.lastRefill = Date.now();
  }

  public static getInstance(): EmbeddingRateLimiter {
    if (!EmbeddingRateLimiter.instance) {
      EmbeddingRateLimiter.instance = new EmbeddingRateLimiter();
    }
    return EmbeddingRateLimiter.instance;
  }

  private refillTokens() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const tokensToAdd = Math.floor(elapsed * this.refillRate);
    this.tokens = Math.min(this.tokens + tokensToAdd, this.maxTokens);
    this.lastRefill = now;
  }

  public async waitForToken(tokensNeeded: number) {
    this.refillTokens();
    if (tokensNeeded > this.maxTokens) {
      throw new Error('Requested tokens exceed maximum token capacity');
    }

    while (this.tokens < tokensNeeded) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.refillTokens();
    }

    this.tokens -= tokensNeeded;
  }
}

export { EmbeddingRateLimiter };
