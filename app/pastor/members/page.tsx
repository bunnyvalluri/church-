"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  ArrowLeft, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Loader2, 
  Check, 
  X,
  Calendar,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PastorMembers() {
  const { user, status, mounted } = useAuth();
  const router = useRouter();

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [errorMsg, setErrorMsg] = useState("");
  const [warningMsg, setWarningMsg] = useState("");

  // Client-side route protection
  useEffect(() => {
    if (!mounted) return;
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && user && user.role !== "PASTOR" && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [mounted, status, user, router]);

  // Load members from the API
  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        
        if (res.ok && data.success) {
          setMembers(data.users || []);
          if (data.warning) {
            setWarningMsg(data.warning);
          }
        } else {
          throw new Error(data.error || "Failed to load members directory");
        }
      } catch (err: any) {
        setErrorMsg(err.message || "An unexpected error occurred loading members.");
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchMembers();
    }
  }, [status]);

  if (!mounted || status === "loading" || (user && user.role !== "PASTOR" && user.role !== "ADMIN")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Authenticating Pastor session...</p>
        </div>
      </div>
    );
  }

  // Filter members on search term & role filter
  const filteredMembers = members.filter((m) => {
    const matchesSearch = 
      (m.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.address || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "ALL" || m.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 text-gray-800 dark:text-gray-200 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link
          href="/pastor"
          className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:underline transition-all"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          Back to Pastor Dashboard
        </Link>

        {/* Title Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-150 dark:border-white/5 shadow-md p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight">Church Member Directory</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Browse cards and query profiles for all church believers</p>
            </div>
          </div>
          <div className="text-right">
            <span className="px-4 py-2 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-2xl text-xs font-black uppercase tracking-widest">
              {filteredMembers.length} active matching users
            </span>
          </div>
        </div>

        {/* Warning Badge (Database offline fallback) */}
        {warningMsg && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span><strong>Notice:</strong> {warningMsg}</span>
          </div>
        )}

        {/* Error Block */}
        {errorMsg && (
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 text-sm rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* Filters Grid */}
        <div className="grid md:grid-cols-3 gap-4 bg-white dark:bg-gray-800/30 p-4 rounded-2xl border border-gray-150 dark:border-white/5 shadow-md">
          {/* Search bar */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone number, address..."
              className="w-full py-3 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-sm"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-sm font-semibold"
            >
              <option value="ALL">Filter by Role (All Roles)</option>
              <option value="MEMBER">Believers / Members</option>
              <option value="PASTOR">Pastors / Preachers</option>
              <option value="ADMIN">Site Administrators</option>
            </select>
          </div>
        </div>

        {/* Members Cards Listing */}
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Querying member databases...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800/20 py-16 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-3xl">
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">No Believers Found</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
              We couldn't find any user profiles matching "{searchTerm || roleFilter}". Try clearing your search parameters or checking other filters.
            </p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredMembers.map((m) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-150 dark:border-white/5 shadow-md p-6 hover:shadow-xl hover:scale-[1.01] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* User Card Header */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-extrabold rounded-2xl flex items-center justify-center shadow-inner uppercase">
                        {(m.name || "U").substring(0, 2)}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-extrabold text-gray-950 dark:text-white leading-tight truncate">
                          {m.name || "Anonymous Member"}
                        </h4>
                        <span className={`inline-flex items-center gap-1 text-[9px] uppercase font-black tracking-widest px-2 py-0.5 mt-1 rounded-full ${
                          m.role === 'ADMIN' 
                            ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30' 
                            : m.role === 'PASTOR' 
                            ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30'
                            : 'bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30'
                        }`}>
                          <Shield className="w-2.5 h-2.5" />
                          {m.role || "MEMBER"}
                        </span>
                      </div>
                    </div>

                    <hr className="border-gray-100 dark:border-white/5" />

                    {/* User Contact Card Details */}
                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <Mail className="w-4 h-4 text-purple-500/70 flex-shrink-0" />
                        <span className="truncate" title={m.email}>{m.email || "No Email Provided"}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-purple-500/70 flex-shrink-0" />
                        <span>{m.phone || "No Phone Provided"}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-purple-500/70 mt-0.5 flex-shrink-0" />
                        <span className="leading-relaxed line-clamp-2">{m.address || "No Address Saved"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Joined Date */}
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Joined
                    </span>
                    <span className="font-semibold">
                      {m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-IN", {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : "Unknown"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

      </div>
    </div>
  );
}
