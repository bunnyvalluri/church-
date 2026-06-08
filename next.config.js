/** @type {import('next').NextConfig} */
const nextConfig = {
  // -- Performance --
  compress: true,
  poweredByHeader: false,
  swcMinify: true,

  // Optimise large package imports (tree-shaking)
  experimental: {
    serverComponentsExternalPackages: [
      'firebase', '@firebase/app', '@firebase/auth', '@firebase/firestore',
      'react-markdown', 'remark-gfm', 'remark-parse', 'rehype-raw', 'unified',
      'vfile', 'bail', 'is-plain-obj', 'trough', 'zwitch', 'unist-util-stringify-position',
      'mdast-util-from-markdown', 'mdast-util-to-string', 'micromark',
      'ai', '@ai-sdk/react',
    ],
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'localhost:3001',
        'localhost:3002',
        'localhost:3003',
        'localhost:3004',
        'localhost:3005',
        'church-valluri-rahuls-projects.vercel.app',
        'church-eight-hazel.vercel.app',
      ],
    },
  },

  // -- Images --
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  // -- Security & caching headers --
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/(fonts|images)/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;