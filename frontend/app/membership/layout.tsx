import type { Metadata } from "next";
import { PAGE_METADATA } from "@/lib/seo";

export const metadata: Metadata = PAGE_METADATA.membership;
export default function MembershipLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
