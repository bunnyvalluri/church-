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

