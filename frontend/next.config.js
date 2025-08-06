/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable SWC for Docker compatibility
  swcMinify: false,

  // Disable static optimization for dynamic pages
  trailingSlash: false,

  experimental: {
    // Optimizations for Docker
    outputFileTracingRoot: process.cwd(),
    serverComponentsExternalPackages: [],
  },

  // Image optimization for Docker
  images: {
    unoptimized: true,
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Force dynamic rendering for all pages
  staticPageGenerationTimeout: 0,

  // Set all pages to be dynamic by default
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },

  // Prevent build-time API calls
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
