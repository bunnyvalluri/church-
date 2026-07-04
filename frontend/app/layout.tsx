import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "@/app/globals.css";
import { Providers } from "@/components/providers/index";
import dynamic from "next/dynamic";
const AIChat = dynamic(() => import("@/components/ai/AIChat"), { ssr: false });
import SmoothScroll from "@/components/ui/SmoothScroll";
import BackToTop from "@/components/ui/BackToTop";

console.log("DEBUG LAYOUT IMPORTS:");
console.log("  Providers:", typeof Providers);
console.log("  AIChat:", typeof AIChat);
console.log("  SmoothScroll:", typeof SmoothScroll);
console.log("  BackToTop:", typeof BackToTop);

const inter  = Inter({
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

export const metadata: Metadata = {
  title: "Kingdom of Christ Ministries | Hyderabad",
  description: "Welcome to Kingdom of Christ Ministries - A place of worship, prayer, and community in Jeedimetla, Hyderabad. Join us for services, events, and spiritual growth.",
  keywords: ["church", "ministry", "worship", "prayer", "Hyderabad", "Jeedimetla", "Kingdom of Christ"],
  authors: [{ name: "Kingdom of Christ Ministries" }],
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/logo.png",
  },
  openGraph: {
    title: "Kingdom of Christ Ministries",
    description: "A place of worship and community in Hyderabad",
    type: "website",
    locale: "en_IN",
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
        {/* Network performance optimizations: preconnect to high-priority origins */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />
        
        {/* DNS prefetching as a fallback for secondary domains */}
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="https://apis.google.com" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        {/* Suppress Vercel toolbar on all pages */}
        <style>{`vercel-toolbar,#vercel-toolbar,.__vercel-toolbar,[data-vercel-toolbar]{display:none!important}`}</style>
      </head>
      <body suppressHydrationWarning className={`${inter.variable} ${outfit.variable} font-sans relative min-h-screen bg-background overflow-x-hidden selection:bg-primary/30 selection:text-primary`}>
        {/* Dynamic Premium Ambient Mesh Background (GPU hardware-accelerated, zero scrolling paint overhead) */}
        <div className="premium-glow-bg" />
        <div className="fixed inset-0 z-[-2] bg-white/70 dark:bg-[#05050A]/85 pointer-events-none" />

        <Providers>
          <SmoothScroll />
          {children}
          <BackToTop />
          <AIChat />
        </Providers>
      </body>
    </html>
  );
}
