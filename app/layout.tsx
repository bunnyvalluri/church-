import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "@/app/globals.css";
import { Providers } from "@/components/providers";
import AIChat from "@/components/ai/AIChat";
import SmoothScroll from "@/components/ui/SmoothScroll";
import BackToTop from "@/components/ui/BackToTop";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Kingdom of Christ Ministries | Hyderabad",
  description: "Welcome to Kingdom of Christ Ministries - A place of worship, prayer, and community in Jeedimetla, Hyderabad. Join us for services, events, and spiritual growth.",
  keywords: ["church", "ministry", "worship", "prayer", "Hyderabad", "Jeedimetla", "Kingdom of Christ"],
  authors: [{ name: "Kingdom of Christ Ministries" }],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
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
      <body suppressHydrationWarning className={`${inter.variable} ${outfit.variable} font-sans relative min-h-screen bg-background overflow-x-hidden selection:bg-primary/30 selection:text-primary`}>
        {/* Animated Colorful Ambient Background */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/20 dark:bg-purple-600/20 blur-[120px] animate-float opacity-50 mix-blend-screen" />
          <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-500/20 dark:bg-pink-600/20 blur-[120px] animate-float animation-delay-2000 opacity-50 mix-blend-screen" />
          <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 dark:bg-indigo-600/20 blur-[120px] animate-float animation-delay-4000 opacity-50 mix-blend-screen" />
          <div className="absolute inset-0 bg-white/70 dark:bg-[#05050A]/85" />
        </div>

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
