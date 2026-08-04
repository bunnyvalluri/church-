"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedundantMemberRegistryPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/members");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="text-center p-6">
        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-gray-300">Redirecting to Members Directory...</p>
      </div>
    </div>
  );
}
