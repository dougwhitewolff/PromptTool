// apps/web/lib/token/types.ts

export interface Token {
  value: string;
  expiresAt: number; // Unix timestamp
  refreshToken?: string;
}

export interface TokenResponse {
  token: string;
  expiresIn: number; // Seconds until expiration
  refreshToken?: string;
}

export interface TokenError {
  code: string;
  message: string;
}

export interface TokenManagerConfig {
  refreshThreshold?: number; // Seconds before expiry to trigger refresh
  maxRetries?: number;
  retryDelay?: number; // ms
}
