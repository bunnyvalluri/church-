"use client";

import { useEffect } from "react";

export default function ScrollToTopOnMount() {
  useEffect(() => {
    // If there is a hash in the URL (e.g. #about, #services), smoothly scroll to the target anchor
    if (typeof window !== "undefined" && window.location.hash) {
      const targetId = window.location.hash.substring(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        requestAnimationFrame(() => {
          targetEl.scrollIntoView({ behavior: "smooth" });
        });
        return;
      }
    }

    // Otherwise prevent the browser from automatically restoring the scroll position on reload
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    
    // Force scroll to top for fresh page loads without hash
    window.scrollTo(0, 0);
  }, []);

  return null;
}

