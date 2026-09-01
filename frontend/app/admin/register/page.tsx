import { redirect } from "next/navigation";

export default function AdminRegisterPage() {
  // Unified registration: All accounts register via /register
  redirect("/register");
}
