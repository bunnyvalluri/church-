/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Performance ────────────────────────────────────────────────────────────
  compress: true,
  poweredByHeader: false,
  swcMinify: true,

  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // ── Package import optimization (tree-shakes icon/animation libraries) ──────
  // Prevents bundling the entire lucide-react/react-icons library — only imports
  // the icons actually used. Critical for bundle size reduction.
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "framer-motion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
    ],
    serverComponentsExternalPackages: [
      "prisma",
      "@prisma/client",
      "firebase-admin",
      "@google-cloud/storage",
      "cloudinary",
    ],
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "localhost:3001",
        "localhost:3002",
        "localhost:3003",
        "localhost:3004",
        "localhost:3005",
        "church-valluri-rahuls-projects.vercel.app",
        "church-eight-hazel.vercel.app",
      ],
    },
  },

  // ── Transpile packages needed for SSR/ESM compat ───────────────────────────
  transpilePackages: [
    "framer-motion",
    "react-markdown",
    "remark-gfm",
    "remark-parse",
    "rehype-raw",
    "unified",
    "vfile",
    "bail",
    "is-plain-obj",
    "trough",
    "zwitch",
    "unist-util-stringify-position",
    "mdast-util-from-markdown",
    "mdast-util-to-string",
    "micromark",
    "ai",
    "@ai-sdk/react",
  ],

  // ── Images ─────────────────────────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },

  // ── Security & caching headers ─────────────────────────────────────────────
  async headers() {
    return [
      // Immutable cache for hashed static assets
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Long cache for public fonts/images
      {
        source: "/(fonts|images)/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Short cache for API routes (allow real-time data freshness)
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=10, stale-while-revalidate=59" },
        ],
      },
      // Security headers on all pages
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Allow Vercel Speed Insights & Analytics
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://www.youtube.com https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://firebasestorage.googleapis.com https://lh3.googleusercontent.com",
              "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
              "connect-src 'self' https://res.cloudinary.com https://firebasestorage.googleapis.com wss: ws:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;