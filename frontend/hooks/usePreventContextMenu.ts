"use client";

import { useEffect } from "react";

/**
 * usePreventContextMenu
 * ─────────────────────────────────────────────────────────────────────────────
 * Route-scoped React hook to prevent the browser's default right-click
 * and long-press context menu on specific security-sensitive pages
 * (e.g., /ngo/donations and /member/give).
 *
 * Guarantees:
 * - Intercepts contextmenu at window capture phase for 100% coverage.
 * - Does NOT affect left-click, single tap, scrolling, or form interactions.
 * - Does NOT affect keyboard navigation or accessibility APIs.
 * - Cleaned up automatically on component unmount / route transition.
 * - Zero global side effects on unrelated routes.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function usePreventContextMenu(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const handleContextMenu = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
    };

    // Window capture phase listener guarantees top-level suppression before any child bubbles
    window.addEventListener("contextmenu", handleContextMenu, { capture: true });
    document.addEventListener("contextmenu", handleContextMenu, { capture: true });

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu, { capture: true } as any);
      document.removeEventListener("contextmenu", handleContextMenu, { capture: true } as any);
    };
  }, [enabled]);
}

export default usePreventContextMenu;
