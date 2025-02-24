// apps/web/libs/utils/environment.ts

export const isClient = typeof window !== 'undefined';
export const isServer = !isClient;
