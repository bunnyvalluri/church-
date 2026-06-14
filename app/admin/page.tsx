import dynamic from "next/dynamic";

const AdminDashboard = dynamic(() => import("@/components/admin/AdminDashboard"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 animate-spin border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto" />
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Securing Admin Connection...</p>
      </div>
    </div>
  )
});

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
