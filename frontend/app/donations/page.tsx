"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DonationsGateway() {
  const router = useRouter();

  useEffect(() => {
    window.location.replace("/give");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#05050a]">
      <div className="text-center p-8 bg-white/40 dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/10 rounded-3xl backdrop-blur-md shadow-2xl max-w-sm w-full mx-4">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-600 rounded-full animate-spin mx-auto mb-6" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Navigating...</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Redirecting you to the online giving portal.</p>
      </div>
    </div>
  );
}
