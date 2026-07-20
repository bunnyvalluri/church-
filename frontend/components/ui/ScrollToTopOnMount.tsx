"use client";

import { useEffect } from "react";

export default function ScrollToTopOnMount() {
  useEffect(() => {
    // Prevent the browser from automatically restoring the scroll position on reload
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    
    // Force scroll to top
    window.scrollTo(0, 0);
  }, []);

  return null;
}
