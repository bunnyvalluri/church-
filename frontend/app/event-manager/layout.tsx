"use client";

import React from "react";

export default function EventManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative" suppressHydrationWarning>
      {children}
    </div>
  );
}

