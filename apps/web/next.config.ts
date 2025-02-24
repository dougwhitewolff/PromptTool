// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals = [
      ...(config.externals as any[]),
      {
        'utf-8-validate': 'commonjs utf-8-validate',
        bufferutil: 'commonjs bufferutil',
        ws: 'commonjs ws',
      },
    ];
    return config;
  },
  experimental: {
    serverActions: {}, // Changed from boolean to object
    // If you have specific configurations for serverActions, add them here.
    // For example:
    // serverActions: {
    //   someFeature: true,
    // },
  },
  // Removed 'serverComponentsExternalPackages' as it is unrecognized.
};

export default nextConfig;
