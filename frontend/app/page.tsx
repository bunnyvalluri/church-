/**
 * app/page.tsx — Homepage (Server Component)
 *
 * Previous: "use client" — forced the ENTIRE page + all 7 sections to ship
 *   as client-side JavaScript, killing static rendering.
 *
 * Now: Server Component — Next.js can statically render this shell.
 *   Each heavy section is dynamically imported with ssr:false so they
 *   code-split into separate JS chunks and hydrate independently.
 *
 * Load order (by visual priority):
 *   - Navbar: eager (needed before paint)
 *   - Hero: eager (LCP element)
 *   - All below-fold sections: dynamic imports (lazy)
 */

import dynamic from "next/dynamic";
import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";

// ── Below-fold sections: lazy-loaded JS chunks ────────────────────────────────
const NgoShowcase = dynamic(() => import("@/components/sections/NgoShowcase"), {
  ssr: false,
  loading: () => <SectionSkeleton height="400px" />,
});
const About = dynamic(() => import("@/components/sections/About"), {
  ssr: false,
  loading: () => <SectionSkeleton height="600px" />,
});
const Services = dynamic(() => import("@/components/sections/Services"), {
  ssr: false,
  loading: () => <SectionSkeleton height="500px" />,
});
const Events = dynamic(() => import("@/components/sections/Events"), {
  ssr: false,
  loading: () => <SectionSkeleton height="500px" />,
});
const Sermons = dynamic(() => import("@/components/sections/Sermons"), {
  ssr: false,
  loading: () => <SectionSkeleton height="600px" />,
});
const Contact = dynamic(() => import("@/components/sections/Contact"), {
  ssr: false,
  loading: () => <SectionSkeleton height="500px" />,
});
const Footer = dynamic(() => import("@/components/layout/Footer"), {
  ssr: false,
  loading: () => <SectionSkeleton height="200px" />,
});

// ── Thin skeleton to reserve space while sections load ────────────────────────
function SectionSkeleton({ height }: { height: string }) {
  return (
    <div
      className="w-full animate-pulse bg-slate-100 dark:bg-white/[0.02]"
      style={{ minHeight: height }}
      aria-hidden="true"
    />
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
function Divider({ opacity = "0.2" }: { opacity?: string }) {
  return (
    <div
      className="h-px bg-gradient-to-r from-transparent to-transparent"
      style={{
        backgroundImage: `linear-gradient(to right, transparent, hsl(var(--primary) / ${opacity}), transparent)`,
      }}
    />
  );
}

// ── Page (Server Component — no "use client") ─────────────────────────────────
export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Navbar />

      {/* Hero: eagerly loaded — it IS the LCP element */}
      <Hero />

      <Divider opacity="0.15" />

      {/* Below-fold: each section lazy-loaded, space reserved by skeleton */}
      <Suspense fallback={<SectionSkeleton height="400px" />}>
        <NgoShowcase />
      </Suspense>

      <Divider opacity="0.3" />

      <Suspense fallback={<SectionSkeleton height="600px" />}>
        {/* cv-auto: browser skips layout+paint for off-screen sections */}
        <div className="cv-auto">
          <About />
        </div>
      </Suspense>

      <Divider opacity="0.2" />

      <Suspense fallback={<SectionSkeleton height="500px" />}>
        <div className="cv-auto">
          <Services />
        </div>
      </Suspense>

      <Divider opacity="0.2" />

      <Suspense fallback={<SectionSkeleton height="500px" />}>
        <div className="cv-auto">
          <Events />
        </div>
      </Suspense>

      <Divider opacity="0.3" />

      <Suspense fallback={<SectionSkeleton height="600px" />}>
        <div className="cv-auto">
          <Sermons />
        </div>
      </Suspense>

      <Divider opacity="0.15" />

      <Suspense fallback={<SectionSkeleton height="500px" />}>
        <div className="cv-auto">
          <Contact />
        </div>
      </Suspense>

      <Suspense fallback={<SectionSkeleton height="200px" />}>
        <Footer />
      </Suspense>
    </main>
  );
}
