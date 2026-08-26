import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "@/app/globals.css";
import { Providers } from "@/components/providers/index";
import AIChat from "@/components/ai/AIChat";
import SmoothScroll from "@/components/ui/SmoothScroll";
import BackToTop from "@/components/ui/BackToTop";
import SkipToContent from "@/components/ui/SkipToContent";
import OfflineBanner from "@/components/ui/OfflineBanner";
import ServiceWorkerProvider from "@/components/providers/ServiceWorkerProvider";
import ConflictDialog from "@/components/offline/ConflictDialog";
import { JsonLd } from "@/components/seo/JsonLd";
import { churchSchema, websiteSchema } from "@/lib/schema";
import { SITE_URL } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  preload: true,
  weight: ["400", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#05050A" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Kingdom of Christ Ministries | Faith, Worship & Community in Hyderabad",
    template: "%s | Kingdom of Christ Ministries",
  },
  description:
    "Kingdom of Christ Ministries — a Christ-centred church community in Jeedimetla & Bahadurpally, Hyderabad. Join us for worship, sermons, prayer, ministries, events and community outreach.",
  keywords: [
    "Kingdom of Christ Ministries",
    "KCM church",
    "KCM Ministries",
    "church Hyderabad",
    "church Jeedimetla",
    "Bishop Kurra Kristhu Raju",
    "Sunday service Hyderabad",
    "Christian community Hyderabad",
  ],
  authors: [{ name: "Kingdom of Christ Ministries", url: SITE_URL }],
  creator: "Kingdom of Christ Ministries",
  publisher: "Kingdom of Christ Ministries",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png", type: "image/png" }],
    shortcut: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KCM Church",
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Kingdom of Christ Ministries | Faith, Worship & Community",
    description:
      "Kingdom of Christ Ministries — a Christ-centred church in Jeedimetla & Bahadurpally, Hyderabad. Worship, sermons, prayer, ministries and community outreach.",
    url: SITE_URL,
    siteName: "Kingdom of Christ Ministries",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: `${SITE_URL}/logo.png`,
        width: 512,
        height: 512,
        alt: "Kingdom of Christ Ministries",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kingdom of Christ Ministries | Hyderabad",
    description:
      "A Christ-centred church in Jeedimetla & Bahadurpally, Hyderabad. Join us for worship, sermons, prayer and community.",
    images: [`${SITE_URL}/logo.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      "CrXIpIzuGUYxLQOuD16DJnLmUMafzisYdXY4LGzPHMw",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <head>
        {/* Explicit color-scheme declaration to prevent Samsung Internet forced auto-dark mode inversion */}
        <meta name="color-scheme" content="light dark" />

        {/* Global Schema.org structured data — Church + WebSite */}
        <JsonLd data={[churchSchema(), websiteSchema()]} />

        {/* Network performance optimizations: preconnect to high-priority origins */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />

        {/* DNS prefetching as a fallback for secondary domains */}
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="https://apis.google.com" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
      </head>
      <body suppressHydrationWarning className={`${inter.variable} ${outfit.variable} font-sans relative min-h-screen bg-background overflow-x-hidden selection:bg-primary/30 selection:text-primary pt-safe pb-safe pl-safe pr-safe`}>
        {/* Dynamic Premium Ambient Mesh Background (GPU hardware-accelerated, zero scrolling paint overhead) */}
        <div className="premium-glow-bg" />
        <div className="fixed inset-0 z-[-2] bg-white/70 dark:bg-[#05050A]/85 pointer-events-none" />

        <Providers>
          <SkipToContent />
          <ServiceWorkerProvider />
          <OfflineBanner />
          <ConflictDialog />
          <SmoothScroll />
          <div id="main-content" tabIndex={-1} className="outline-none">
            {children}
          </div>
          <BackToTop />
          <AIChat />
        </Providers>
      </body>
    </html>
  );
}

