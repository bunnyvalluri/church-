import { redirect } from "next/navigation";

// Dashboard is hidden — redirect all visitors to the homepage
export default function DashboardPage() {
  redirect("/");
}
