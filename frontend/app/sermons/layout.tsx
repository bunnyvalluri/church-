import type { Metadata } from "next";
import { PAGE_METADATA } from "@/lib/seo";

export const metadata: Metadata = PAGE_METADATA.sermons;
export default function SermonsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
