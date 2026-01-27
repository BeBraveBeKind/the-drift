import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    // Enable image optimization
    unoptimized: false,
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  // Optimize production builds
  productionBrowserSourceMaps: false,
  // Enable strict mode for better performance
  reactStrictMode: true,
  // Optimize bundle splitting
  experimental: {
    optimizeCss: true,
  },
  // Headers for caching and performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, immutable, max-age=31536000'
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, immutable, max-age=31536000'
          },
        ],
      },
    ]
  },
};

export default nextConfig;
