/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // Disable SWC for Docker compatibility
  swcMinify: false,

  // Disable static optimization for dynamic pages
  trailingSlash: false,

  experimental: {
    // Optimizations for Docker
    outputFileTracingRoot: process.cwd(),
    serverComponentsExternalPackages: [],
  },

  // API rewrites for backend communication
  async rewrites() {
    return [
      {
        source: '/api/rules/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/rules/:path*`,
      },
    ];
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Image optimization
  images: {
    unoptimized: true, // For Docker compatibility
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Force dynamic rendering for all pages by default
  staticPageGenerationTimeout: 0,

  // Disable static generation globally
  generateStaticParams: false,

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
};

module.exports = nextConfig;
