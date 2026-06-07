/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Performance ──────────────────────────────────────────────────────────
  compress: true,
  poweredByHeader: false,
  swcMinify: true,

  // Optimise large package imports (tree-shaking) — dramatically reduces bundle size
  experimental: {
    serverComponentsExternalPackages: ['firebase', '@firebase/firestore'],
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-icons',
    ],
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'localhost:3001',
        'localhost:3002',
        'localhost:3003',
        'localhost:3004',
        'localhost:3005',
        'church-valluri-rahuls-projects.vercel.app'
      ],
    },
  },

  // ── Images ───────────────────────────────────────────────────────────────
  images: {
    formats: ['image/avif', 'image/webp'],   // AVIF first = smallest file size
    minimumCacheTTL: 31536000,               // Cache images for 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  // ── Security & caching headers ────────────────────────────────────────────
  async headers() {
    return [
      {
        // Cache static JS/CSS assets for 1 year (immutable = browser never re-validates)
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // Cache public fonts and images
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
