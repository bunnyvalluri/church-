import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "@/app/globals.css";
import { Providers } from "@/components/providers/index";

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

export const metadata: Metadata = {
  title: "Admin Dashboard | Kingdom of Christ Ministries",
  description: "Secure administrative portal for Kingdom of Christ Ministries.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <head>
        {/* Suppress Vercel toolbar */}
        <style>{`vercel-toolbar,#vercel-toolbar,.__vercel-toolbar,[data-vercel-toolbar]{display:none!important}`}</style>
      </head>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${outfit.variable} font-sans min-h-screen bg-[#0a0a0f] overflow-x-hidden`}
      >
        {/* Clean dark admin background - no public site chrome */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
