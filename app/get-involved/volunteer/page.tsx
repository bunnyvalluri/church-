import type { Metadata } from "next";
import VolunteerClientPage from "./VolunteerClientPage";

export const metadata: Metadata = {
  title: "Volunteer | Kingdom of Christ Ministries",
  description: "Discover volunteer opportunities and serve at Kingdom of Christ Ministries",
};

export default function VolunteerPage() {
  return <VolunteerClientPage />;
}

