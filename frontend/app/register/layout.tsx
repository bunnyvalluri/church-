import type { Metadata } from "next";
import { PAGE_METADATA } from "@/lib/seo";

export const metadata: Metadata = PAGE_METADATA.register;
export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
