"use client";

import { useState, useEffect } from "react";
import { 
  Receipt, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2,
  Calendar,
  Building,
  Heart
} from "lucide-react";

export interface DonationHistoryRecord {
  id: string;
  amount: number;
  currency: string;
  purpose: string;
  purposeName?: string;
  branchName?: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  receiptNumber?: string;
}

export default function MemberGivingHistory() {
  const [history, setHistory] = useState<DonationHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/donations/history");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.donations)) {
            setHistory(data.donations);
          }
        }
      } catch (err) {
        console.error("[MEMBER_GIVING_HISTORY] Failed to load:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      (item.purposeName || item.purpose || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.branchName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.receiptNumber || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === "ALL" || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-5">
        <div>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            Your Giving History & Tax Receipts
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            Track all your contributions, view tax exemption certificates, and download official 80G PDF receipts.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search receipts..."
              className="pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-600"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-600 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-gray-500">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
          <p className="text-xs mt-2 font-medium">Fetching giving history...</p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="py-12 text-center text-gray-500 dark:text-slate-400">
          <Heart className="w-12 h-12 text-violet-300 dark:text-violet-700 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-700 dark:text-slate-200">No giving records found.</p>
          <p className="text-xs mt-1">Your giving history will appear here after your first contribution.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-800 text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Purpose / Cause</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">80G Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
              {filteredHistory.map((item) => {
                const dateStr = new Date(item.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                const isCompleted = item.status === "COMPLETED";

                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 text-gray-600 dark:text-slate-400 text-xs whitespace-nowrap">
                      {dateStr}
                    </td>
                    <td className="py-3.5 px-4 text-gray-900 dark:text-white font-bold">
                      {item.purposeName || item.purpose}
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-slate-400 text-xs">
                      {item.branchName || "Main Church"}
                    </td>
                    <td className="py-3.5 px-4 font-black text-gray-900 dark:text-white">
                      ₹{item.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                          <Clock className="w-3 h-3" /> {item.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isCompleted ? (
                        <a
                          href={`/api/donations/receipt/${item.id}?format=html`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/40 border border-violet-200 dark:border-violet-800 text-xs font-bold transition"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF Receipt
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400 font-normal">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
