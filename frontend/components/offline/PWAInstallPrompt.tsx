"use client";

import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("[PWA] User accepted install prompt");
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-sm p-4 rounded-2xl bg-gradient-to-r from-purple-900/90 to-indigo-900/90 backdrop-blur-xl border border-purple-500/30 text-white shadow-2xl animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/30 flex items-center justify-center border border-purple-400/30 shrink-0">
            <Download className="w-5 h-5 text-purple-300 animate-bounce" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Install KCM Portal App</h4>
            <p className="text-xs text-purple-200/80">
              Access sermons, events, & prayer requests offline anytime.
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowPrompt(false)}
          className="text-purple-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          onClick={handleInstallClick}
          className="px-4 py-1.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-semibold text-xs transition-all shadow-md"
        >
          Install App
        </button>
      </div>
    </div>
  );
}
