import { redirect } from "next/navigation";

export default function AdminLoginPage() {
  // Unified single sign-on entry: All roles authenticate via /login
  redirect("/login?next=/admin/dashboard");
}
