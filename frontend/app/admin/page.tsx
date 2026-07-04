// Always server-render this route — it is auth-gated and must never be statically prerendered
export const dynamic = "force-dynamic";

import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}

