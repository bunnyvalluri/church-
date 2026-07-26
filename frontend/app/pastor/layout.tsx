"use client";

import React from "react";
import PastorPortalLayout from "@/components/pastor/layout/PastorPortalLayout";

export default function PastorRootLayout({ children }: { children: React.ReactNode }) {
  return <PastorPortalLayout>{children}</PastorPortalLayout>;
}
