import type { Metadata } from "next";
import { PAGE_METADATA } from "@/lib/seo";

export const metadata: Metadata = PAGE_METADATA.ngo;
export default function NgoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
