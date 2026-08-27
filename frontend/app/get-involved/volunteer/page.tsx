import type { Metadata } from "next";
import VolunteerClientPage from "./VolunteerClientPage";
import { PAGE_METADATA } from "@/lib/seo";

export const metadata: Metadata = PAGE_METADATA.volunteer;

export default function VolunteerPage() {
  return <VolunteerClientPage />;
}

