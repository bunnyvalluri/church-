import type { Metadata } from "next";
import { PAGE_METADATA } from "@/lib/seo";

export const metadata: Metadata = PAGE_METADATA.smallGroups;
export default function SmallGroupsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
