import type { Metadata } from "next";
import { PAGE_METADATA } from "@/lib/seo";

export const metadata: Metadata = PAGE_METADATA.events;
export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
