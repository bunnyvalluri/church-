import type { Metadata } from "next";
import { PAGE_METADATA } from "@/lib/seo";
import Navbar from "@/components/layout/Navbar";
import NgoSubNav from "@/components/ngo/NgoSubNav";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = PAGE_METADATA.ngo;

export default function NgoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-rose-500/20 selection:text-rose-600">
      <Navbar />
      <div className="pt-[56px] sm:pt-[60px] md:pt-[64px] lg:pt-[72px] xl:pt-[108px] flex-1 flex flex-col">
        <NgoSubNav />
        <main className="flex-1">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}

