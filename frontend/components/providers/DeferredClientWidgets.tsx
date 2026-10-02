"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const AIChat = dynamic(() => import("@/components/ai/AIChat"), { ssr: false });
const SmoothScroll = dynamic(() => import("@/components/ui/SmoothScroll"), { ssr: false });
const OfflineBanner = dynamic(() => import("@/components/ui/OfflineBanner"), { ssr: false });
const ServiceWorkerProvider = dynamic(() => import("@/components/providers/ServiceWorkerProvider"), { ssr: false });
const ConflictDialog = dynamic(() => import("@/components/offline/ConflictDialog"), { ssr: false });
const BackToTop = dynamic(() => import("@/components/ui/BackToTop"), { ssr: false });

export default function DeferredClientWidgets() {
  const [canLoad, setCanLoad] = useState(false);

  useEffect(() => {
    // Delay mounting non-critical floating widgets until browser idle or 1.5s after load
    if ("requestIdleCallback" in window) {
      const handle = (window as any).requestIdleCallback(
        () => setCanLoad(true),
        { timeout: 2000 }
      );
      return () => {
        if ("cancelIdleCallback" in window) {
          (window as any).cancelIdleCallback(handle);
        }
      };
    } else {
      const timer = setTimeout(() => setCanLoad(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!canLoad) return null;

  return (
    <>
      <ServiceWorkerProvider />
      <OfflineBanner />
      <ConflictDialog />
      <SmoothScroll />
      <BackToTop />
      <AIChat />
    </>
  );
}
