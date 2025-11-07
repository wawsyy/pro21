import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: FHEVM requires COOP/COEP headers, but RainbowKit Base Account SDK conflicts
  // We'll use a more permissive COOP setting to allow both to work
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // COEP is required by FHEVM, but it blocks some RainbowKit analytics requests
          // This is acceptable - analytics errors don't affect core functionality
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          // Set COOP to 'unsafe-none' to satisfy Base Account SDK requirements
          // This is a compromise: FHEVM prefers 'same-origin', but Base Account SDK requires it not to be 'same-origin'
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'unsafe-none',
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;

