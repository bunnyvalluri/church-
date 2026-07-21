/** @type {import('next').NextConfig} */

// ─── Content Security Policy ────────────────────────────────────────────────
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://www.googletagmanager.com https://apis.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob: https://res.cloudinary.com https://firebasestorage.googleapis.com https://images.unsplash.com https://lh3.googleusercontent.com https://api.qrserver.com;
  connect-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://api.resend.com https://api.twilio.com https://graph.facebook.com https://livekit.io wss: ws: https://*.neon.tech https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com;
  frame-src 'self' https://checkout.razorpay.com https://razorpay.com https://www.youtube.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  object-src 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig = {
  // -- Docker --
  output: 'standalone',

  // -- Performance --
  compress: true,
  poweredByHeader: false,
  swcMinify: true,

  // ⚠️  These are intentionally OFF so build errors surface immediately
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Keep build errors visible but non-blocking for existing tech debt
    // Set to false once all TS errors are resolved
    ignoreBuildErrors: true,
  },

  transpilePackages: [
    'framer-motion', 'react-markdown', 'remark-gfm', 'remark-parse', 'rehype-raw', 'unified',
    'vfile', 'bail', 'is-plain-obj', 'trough', 'zwitch', 'unist-util-stringify-position',
    'mdast-util-from-markdown', 'mdast-util-to-string', 'micromark', 'ai', '@ai-sdk/react'
  ],

  experimental: {
    serverComponentsExternalPackages: [
      'prisma', '@prisma/client', 'firebase-admin', '@google-cloud/storage', 'cloudinary'
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
        'kingdomofchristministries.org',
        'www.kingdomofchristministries.org',
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

  // -- Security & Caching Headers --
  async headers() {
    return [
      // Static assets — long cache
      {
        source: '/_next/static/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/(fonts|images)/(.*)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      // Payment API routes — strict no-cache + tightest CSP
      {
        source: '/api/donations/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
      {
        source: '/api/payments/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
      // Global security headers
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: ContentSecurityPolicy },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;