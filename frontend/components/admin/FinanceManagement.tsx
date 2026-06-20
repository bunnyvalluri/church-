"use client";

import React, { useState } from "react";
import { 
  DollarSign, 
  Heart, 
  CreditCard, 
  Layers, 
  Printer, 
  Plus, 
  Search, 
  FileText, 
  TrendingUp, 
  CheckCircle, 
  X, 
  Calendar,
  AlertCircle,
  ChevronDown
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { adminTranslations } from "@/components/admin/adminTranslations";

interface FinanceManagementProps {
  donations: any[];
  users: any[];
  pledges?: any[];
  transactions?: any[];
  accounts?: any[];
  onAddDonation: (donation: any) => void;
  onAddPledge?: (pledge: any) => Promise<void>;
  onAddTransaction?: (transaction: any) => Promise<void>;
  onOpenAddDonation?: () => void;
  activeSubTab?: "donations" | "pledges" | "transactions" | "accounts";
}

interface Pledge {
  id: string;
  donorName: string;
  donorEmail: string;
  committedAmount: number;
  paidAmount: number;
  targetDate: string;
  purpose: string;
  status: "PENDING" | "ACTIVE" | "FULFILLED";
}

interface Transaction {
  id: string;
  type: "INFLOW" | "OUTFLOW";
  amount: number;
  category: string;
  description: string;
  date: string;
  account: string;
}

export default function FinanceManagement({ 
  donations, 
  users, 
  pledges: pledgesProp = [],
  transactions: transactionsProp = [],
  accounts: accountsProp = [],
  onAddDonation, 
  onAddPledge,
  onAddTransaction,
  onOpenAddDonation,
  activeSubTab = "donations" 
}: FinanceManagementProps) {
  const { language } = useLanguage();
  const t = adminTranslations[language || "en"].finance;

  const getCategoryTranslation = (cat: string) => {
    const key = cat.toLowerCase();
    if (key.includes("utility")) return t.utility;
    if (key.includes("salary") || key.includes("salaries")) return t.salary;
    if (key.includes("maintenance")) return t.maintenance;
    if (key.includes("outreach")) return t.outreach;
    if (key.includes("charity") || key.includes("benevolence")) return t.charity;
    if (key.includes("tithe")) return t.tithe;
    if (key.includes("offering")) return t.offering;
    if (key.includes("building")) return t.buildingFund;
    if (key.includes("mission")) return t.missions;
    if (key.includes("other")) return t.other;
    return cat;
  };

  const getAccountNameTranslation = (name: string) => {
    if (name.includes("General")) return language === "te" ? "సాధారణ నిధి" : language === "hi" ? "सामान्य कोष" : "General Fund";
    if (name.includes("Building")) return t.buildingFund;
    if (name.includes("Missions") || name.includes("Mission")) return t.missions;
    if (name.includes("Charity")) return language === "te" ? "ధర్మకార్యాల నిధి" : language === "hi" ? "दान कोष" : "Charity Fund";
    return name;
  };
  
  const [subView, setSubView] = useState<"donations" | "pledges" | "transactions" | "accounts">(activeSubTab);
  React.useEffect(() => {
    setSubView(activeSubTab);
  }, [activeSubTab]);
  const [isPledgeOpen, setIsPledgeOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  
  const [donationFilter, setDonationFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Manual States
  const [newPledge, setNewPledge] = useState({ donorName: "", donorEmail: "", committedAmount: "", targetDate: "", purpose: "BUILDING" });
  const [newTx, setNewTx] = useState({ type: "OUTFLOW" as "INFLOW" | "OUTFLOW", amount: "", category: "Utilities", description: "", account: "General Fund" });

  // Synchronized lists from props
  const pledges = pledgesProp;
  const transactions = transactionsProp;
  const accounts = accountsProp;

  // Calculations
  const totalFinancials = donations
    .filter(d => d.status === "COMPLETED")
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const completedDonations = donations.filter(d => d.status === "COMPLETED");

  const filteredDonations = completedDonations.filter(d => {
    const matchesSearch = 
      (d.donorName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.donorEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.razorpayPaymentId || d.stripeId || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPurpose = donationFilter === "ALL" || d.purpose === donationFilter;
    return matchesSearch && matchesPurpose;
  });

  const handleAddPledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPledge.donorName || !newPledge.committedAmount) return;
    const added = {
      donorName: newPledge.donorName,
      donorEmail: newPledge.donorEmail || "pledger@email.com",
      committedAmount: Number(newPledge.committedAmount),
      targetDate: newPledge.targetDate ? new Date(newPledge.targetDate).toISOString() : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      purpose: newPledge.purpose === "BUILDING" ? "Building Fund" : "Missions Fund",
    };
    if (onAddPledge) {
      await onAddPledge(added);
    }
    setNewPledge({ donorName: "", donorEmail: "", committedAmount: "", targetDate: "", purpose: "BUILDING" });
    setIsPledgeOpen(false);
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.amount || !newTx.description) return;
    const added = {
      type: newTx.type,
      amount: Number(newTx.amount),
      category: newTx.category,
      description: newTx.description,
      account: newTx.account,
      date: new Date().toISOString()
    };
    if (onAddTransaction) {
      await onAddTransaction(added);
    }
    setNewTx({ type: "OUTFLOW", amount: "", category: "Utilities", description: "", account: "General Fund" });
    setIsTransactionOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* ─── Sub Navigation Tabs ─── */}
      <div className="p-1 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.04] rounded-2xl flex gap-1 items-center w-max max-w-full overflow-x-auto select-none scrollbar-none shadow-sm">
        {[
          { id: "donations", label: t.donations, icon: DollarSign },
          { id: "pledges", label: t.pledges, icon: Heart },
          { id: "transactions", label: t.transactions, icon: CreditCard },
          { id: "accounts", label: t.accounts, icon: Layers }
        ].map((tab) => {
          const isSelected = subView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubView(tab.id as any)}
              className={`py-2 px-4 rounded-xl flex items-center gap-2 text-xs font-bold transition-all ${
                isSelected
                  ? "bg-white dark:bg-white/[0.06] text-[#6366F1] dark:text-indigo-400 shadow-sm border border-slate-200/50 dark:border-white/[0.02]"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 hover:bg-slate-50/50 dark:hover:bg-white/[0.01]"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ────────────────── SUB-VIEW: DONATIONS ────────────────── */}
      {subView === "donations" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-500/10 transition-all duration-300">
              <div>
                <span className="text-slate-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider">{t.totalTithes}</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{formatCurrency(totalFinancials)}</h3>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl shrink-0 shadow-sm">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            
            <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-500/10 transition-all duration-300">
              <div>
                <span className="text-slate-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider">{t.completedTx}</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{completedDonations.length}</h3>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-450 border border-blue-100 dark:border-blue-500/20 rounded-2xl shrink-0 shadow-sm">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-500/10 transition-all duration-300">
              <div className="w-full">
                <span className="text-slate-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider block">{language === "te" ? "లెడ్జర్ వడపోత" : language === "hi" ? "बहीखाता फ़िल्टर" : "Ledger Filters"}</span>
                <div className="flex gap-2 mt-2.5 relative items-center">
                  <select
                    value={donationFilter}
                    onChange={(e) => setDonationFilter(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-slate-50 dark:bg-[#16172D]/60 border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-gray-300 rounded-xl text-[10px] font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500"
                  >
                    <option value="ALL">{t.filterAll}</option>
                    <option value="TITHE">{t.tithe}</option>
                    <option value="OFFERING">{t.offering}</option>
                    <option value="MISSIONS">{t.missions}</option>
                    <option value="BUILDING">{t.buildingFund}</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Table Control */}
          <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
              <input 
                type="text" 
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-[#16172D]/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all font-semibold"
              />
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => window.print()} 
                className="py-2.5 px-4 bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Printer className="w-4 h-4 text-[#6366F1]" /> {language === "te" ? "ప్రింట్" : language === "hi" ? "प्रिंट" : "Print"}
              </button>
              <button 
                onClick={onOpenAddDonation} 
                className="py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/10 transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" /> {t.logContribution}
              </button>
            </div>
          </div>

          <div className="border border-slate-100 dark:border-white/[0.05] bg-white dark:bg-[#121324]/40 backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.015)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/[0.04] text-[10px] font-bold text-slate-450 dark:text-gray-550 uppercase tracking-wider bg-slate-50/50 dark:bg-white/[0.01]">
                    <th className="py-4.5 px-6">{t.tableDonor}</th>
                    <th className="py-4.5 px-6">{t.tableMethod} & {t.tableUtr}</th>
                    <th className="py-4.5 px-6">{t.purpose}</th>
                    <th className="py-4.5 px-6">{t.tableAmount}</th>
                    <th className="py-4.5 px-6">{t.tableDate}</th>
                    <th className="py-4.5 px-6 text-center">{t.tableReceipt}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03] text-xs font-semibold text-slate-700 dark:text-gray-300">
                  {filteredDonations.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/35 dark:hover:bg-[#16172D]/20 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-extrabold text-slate-900 dark:text-white block">{d.donorName || (language === "te" ? "అనామక కానుకదారుడు" : language === "hi" ? "गुमनाम दाता" : "Anonymous Giver")}</span>
                        <span className="text-[10px] text-slate-400 dark:text-gray-500 block mt-0.5">{d.donorEmail || (language === "te" ? "ఈమెయిల్ లేదు" : language === "hi" ? "कोई ईमेल नहीं" : "No email")}</span>
                      </td>
                      <td className="py-4 px-6 font-mono text-[9px] text-slate-400 space-y-0.5">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border bg-indigo-50/50 dark:bg-indigo-950/20 text-[#6366F1] dark:text-indigo-400 border-indigo-100/30 dark:border-indigo-900/30">
                          {d.paymentMethod}
                        </span>
                        <span className="block mt-1 font-bold">{d.razorpayPaymentId || d.stripeId || "OFFLINE_RECORD"}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-0.5 bg-green-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-100/50 dark:border-emerald-500/20 rounded-full text-[9px] uppercase tracking-wider font-bold">
                          {getCategoryTranslation(d.purpose)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(d.amount)}
                      </td>
                      <td className="py-4 px-6 text-slate-400 dark:text-gray-500">
                        {new Date(d.createdAt).toLocaleDateString(language === "te" ? "te-IN" : language === "hi" ? "hi-IN" : "en-IN")}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Link href={`/give/receipt/${d.id}`} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] hover:border-indigo-300 dark:hover:border-indigo-500/30 rounded-lg text-[#6366F1] dark:text-indigo-400 font-bold text-[9px] uppercase hover:bg-indigo-50/20 transition-all active:scale-95">
                          <FileText className="w-3.5 h-3.5" /> {language === "te" ? "రశీదు చూడండి" : language === "hi" ? "रसीद देखें" : "View Receipt"}
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredDonations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-xs text-slate-450 dark:text-gray-500 font-semibold">{t.noRecords}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── SUB-VIEW: PLEDGES ────────────────── */}
      {subView === "pledges" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-955 dark:text-white tracking-tight uppercase">{t.pledges}</h2>
              <p className="text-xs text-slate-450 dark:text-gray-500 mt-1.5 font-medium">{language === "te" ? "చర్చి అభివృద్ధి ప్రాజెక్టుల కొరకు విశ్వాసులు చేసిన ఆర్థిక వాగ్దానాల ట్రాకింగ్." : language === "hi" ? "प्रमुख विकास परियोजनाओं के लिए विश्वासियों द्वारा की गई वित्तीय प्रतिबद्धताओं को ट्रैक करें।" : "Track financial commitments made by believers for major development projects."}</p>
            </div>
            <button 
              onClick={() => setIsPledgeOpen(true)} 
              className="py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/10 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4.5 h-4.5" /> {t.makePledge}
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pledges.map(p => {
              const progress = (p.paidAmount / p.committedAmount) * 100;
              return (
                <div key={p.id} className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-150/40 dark:hover:border-indigo-500/10 transition-all duration-300 group">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-[#6366F1] dark:text-indigo-400 rounded-lg text-[8px] font-bold uppercase tracking-wider border border-indigo-100/50 dark:border-indigo-500/20">{getCategoryTranslation(p.purpose)}</span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-2.5">{p.donorName}</h4>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 font-semibold">{p.donorEmail}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase border ${
                        p.status === "FULFILLED" 
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-450 border-emerald-100 dark:border-emerald-500/20" 
                          : p.status === "ACTIVE" 
                          ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-455 border-blue-100 dark:border-blue-500/20" 
                          : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-450 border-amber-100 dark:border-amber-500/20"
                      }`}>{p.status === "FULFILLED" ? t.fulfilledStatus : p.status === "ACTIVE" ? t.activeStatus : t.pendingStatus}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-700 dark:text-gray-300">
                        <span>{t.paidAmount}: {formatCurrency(p.paidAmount)}</span>
                        <span>{t.committedAmount}: {formatCurrency(p.committedAmount)}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-white/[0.04] rounded-full overflow-hidden border border-slate-200/50 dark:border-white/[0.02]">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-[9px] font-extrabold text-slate-400 dark:text-gray-550 flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> {progress.toFixed(0)}% {language === "te" ? "పూర్తయింది" : language === "hi" ? "पूरा" : "Completed"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-white/[0.03] flex justify-between text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase">
                    <span>{t.targetDate}</span>
                    <span>{formatDate(p.targetDate)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ────────────────── SUB-VIEW: TRANSACTIONS ────────────────── */}
      {subView === "transactions" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-955 dark:text-white tracking-tight uppercase">{t.transactions}</h2>
              <p className="text-xs text-slate-455 dark:text-gray-500 mt-1.5 font-medium">{language === "te" ? "చర్చి ఆదాయ, వ్యయాల వివరాలను నమోదు చేసే అధికారిక జర్నల్ డైరీ." : language === "hi" ? "बिजली बिल, ग्रामीण मिशन खर्च और दशमांश प्राप्तियों को ट्रैक करने वाली बहीखाता डायरी।" : "Double-entry accounting diary tracking utility bills, rural missions expenses, and tithe inflows."}</p>
            </div>
            <button 
              onClick={() => setIsTransactionOpen(true)} 
              className="py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/10 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4.5 h-4.5" /> {t.recordTransaction}
            </button>
          </div>

          <div className="border border-slate-100 dark:border-white/[0.05] bg-white dark:bg-[#121324]/40 backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.015)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/[0.04] text-[10px] font-bold text-slate-450 dark:text-gray-550 uppercase tracking-wider bg-slate-50/50 dark:bg-white/[0.01]">
                    <th className="py-4.5 px-6">{language === "te" ? "లావాదేవీ ID" : language === "hi" ? "लेनदेन ID" : "Transaction ID"}</th>
                    <th className="py-4.5 px-6">{t.txType}</th>
                    <th className="py-4.5 px-6">{t.txAccount}</th>
                    <th className="py-4.5 px-6">{t.txCategory}</th>
                    <th className="py-4.5 px-6">{t.txDescription}</th>
                    <th className="py-4.5 px-6">{t.tableAmount}</th>
                    <th className="py-4.5 px-6">{t.tableDate}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03] text-xs font-semibold text-slate-700 dark:text-gray-300">
                  {transactions.map((tRow) => (
                    <tr key={tRow.id} className="hover:bg-slate-50/35 dark:hover:bg-[#16172D]/20 transition-all">
                      <td className="py-4 px-6 font-mono text-[9px] text-slate-400 dark:text-gray-550 font-bold">{tRow.id}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                          tRow.type === "INFLOW" 
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-450 border-emerald-100 dark:border-emerald-500/20" 
                            : "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-455 border-rose-100 dark:border-rose-500/20"
                        }`}>{tRow.type === "INFLOW" ? t.inflow : t.outflow}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-gray-400">{getAccountNameTranslation(tRow.account)}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-0.5 bg-slate-50 dark:bg-white/[0.03] text-slate-500 dark:text-gray-400 rounded-lg text-[9px] font-bold border border-slate-150 dark:border-white/[0.06]">{getCategoryTranslation(tRow.category)}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 dark:text-gray-400 max-w-[200px] truncate" title={tRow.description}>{tRow.description}</td>
                      <td className={`py-4 px-6 text-sm font-extrabold ${tRow.type === "INFLOW" ? "text-emerald-600 dark:text-emerald-450" : "text-rose-650 dark:text-rose-455"}`}>
                        {tRow.type === "INFLOW" ? "+" : "-"}{formatCurrency(tRow.amount)}
                      </td>
                      <td className="py-4 px-6 text-slate-400 dark:text-gray-500">{formatDate(tRow.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── SUB-VIEW: ACCOUNTS ────────────────── */}
      {subView === "accounts" && (
        <div className="grid md:grid-cols-2 gap-6">
          {accounts.map((acc, idx) => (
            <div key={idx} className="bg-white dark:bg-[#121324]/60 border border-slate-100 dark:border-white/[0.05] p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.015)] backdrop-blur-xl flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-150/40 dark:hover:border-indigo-500/10 transition-all duration-300 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-extrabold text-slate-950 dark:text-white text-sm uppercase tracking-tight">{getAccountNameTranslation(acc.name)}</h4>
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 text-[#6366F1] dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Layers className="w-4.5 h-4.5" />
                  </div>
                </div>
                <hr className="border-t border-slate-100 dark:border-white/[0.03]" />
                <p className="text-xs text-slate-450 dark:text-gray-400 leading-relaxed font-semibold">
                  {language === "te" 
                    ? (acc.name === "General Fund" ? "రోజువారీ ఖర్చులు, విద్యుత్ బిల్లులు మరియు సిబ్బంది జీతాలు." : acc.name === "Building Fund" ? "చర్చి మందిర విస్తరణ ప్రాజెక్టుల కొరకు సేకరించిన నిధులు." : acc.name === "Missions Fund" ? "గ్రామీణ సువార్త సేవ, పాస్టర్ల మద్దతు మరియు సేవా కార్యక్రమాల కొరకు." : "అత్యవసర సహాయం, విశ్వాసుల విద్యా నిధి మరియు ఉచిత ఆహార పంపిణీ.") 
                    : language === "hi" 
                    ? (acc.name === "General Fund" ? "दैनिक परिचालन व्यय, बिजली-पानी बिल और स्टाफ वेतन।" : acc.name === "Building Fund" ? "चर्च भवन विस्तार परियोजनाओं के लिए पूंजीगत संग्रह।" : acc.name === "Missions Fund" ? "ग्रामीण सुसमाचार मिशन, पादरियों की सहायता और सेवा कार्यक्रमों के लिए।" : "आपातकालीन राहत, विश्वासी शिक्षा सहायता और खाद्य वितरण।") 
                    : acc.description}
                </p>
              </div>

              <div className="mt-6 pt-3.5 border-t border-slate-100 dark:border-white/[0.03] flex justify-between items-baseline">
                <span className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase">{language === "te" ? "నికర నిల్వ" : language === "hi" ? "कुल शेष" : "Settled Balance"}</span>
                <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(acc.balance)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Modal: Record Pledge ─── */}
      {isPledgeOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/40 dark:bg-white/[0.01]">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-tight">Record Believer Development Pledge</h3>
              <button 
                onClick={() => setIsPledgeOpen(false)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-xl transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddPledge} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">Pledger Full Name</label>
                <input 
                  type="text" required placeholder="e.g. Sarah Johnson" value={newPledge.donorName}
                  onChange={(e) => setNewPledge({ ...newPledge, donorName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">Email Address</label>
                <input 
                  type="email" placeholder="e.g. sarah@email.com" value={newPledge.donorEmail}
                  onChange={(e) => setNewPledge({ ...newPledge, donorEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">Pledged Target Amount (INR)</label>
                <input 
                  type="number" required placeholder="e.g. 50000" value={newPledge.committedAmount}
                  onChange={(e) => setNewPledge({ ...newPledge, committedAmount: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">Project Target / Purpose</label>
                <div className="relative flex items-center">
                  <select 
                    value={newPledge.purpose}
                    onChange={(e) => setNewPledge({ ...newPledge, purpose: e.target.value })}
                    className="w-full pl-3.5 pr-8 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50 dark:bg-[#16172D]/60 text-slate-700 dark:text-gray-300 font-bold cursor-pointer appearance-none"
                  >
                    <option value="BUILDING" className="dark:bg-[#121324]">Building Fund Project</option>
                    <option value="MISSIONS" className="dark:bg-[#121324]">Rural Gospel Outreach</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">Completion Deadline Date</label>
                <input 
                  type="date" value={newPledge.targetDate}
                  onChange={(e) => setNewPledge({ ...newPledge, targetDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 font-semibold"
                />
              </div>
              <div className="pt-3 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsPledgeOpen(false)} 
                  className="flex-1 py-3 border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-xl font-bold text-xs uppercase transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs uppercase transition-all shadow-md shadow-indigo-500/10 active:scale-[0.98]"
                >
                  Record Pledge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal: Add Transaction ─── */}
      {isTransactionOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/40 dark:bg-white/[0.01]">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-tight">Write Journal Ledger Entry</h3>
              <button 
                onClick={() => setIsTransactionOpen(false)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-xl transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">Ledger Flow Direction</label>
                <div className="flex gap-6 mt-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-gray-300 cursor-pointer">
                    <input 
                      type="radio" name="txType" checked={newTx.type === "OUTFLOW"} 
                      onChange={() => setNewTx({ ...newTx, type: "OUTFLOW" })} 
                      className="w-4.5 h-4.5 text-[#6366F1] border-slate-350 dark:border-white/[0.08] focus:ring-0"
                    /> Debit / Expense (Outflow)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-gray-300 cursor-pointer">
                    <input 
                      type="radio" name="txType" checked={newTx.type === "INFLOW"} 
                      onChange={() => setNewTx({ ...newTx, type: "INFLOW" })} 
                      className="w-4.5 h-4.5 text-[#6366F1] border-slate-350 dark:border-white/[0.08] focus:ring-0"
                    /> Credit / Revenue (Inflow)
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">Amount (INR)</label>
                <input 
                  type="number" required placeholder="e.g. 3500" value={newTx.amount}
                  onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">Account Wallet</label>
                <div className="relative flex items-center">
                  <select 
                    value={newTx.account}
                    onChange={(e) => setNewTx({ ...newTx, account: e.target.value })}
                    className="w-full pl-3.5 pr-8 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50 dark:bg-[#16172D]/60 text-slate-700 dark:text-gray-300 font-bold cursor-pointer appearance-none"
                  >
                    <option value="General Fund" className="dark:bg-[#121324]">General Fund</option>
                    <option value="Building Fund" className="dark:bg-[#121324]">Building Fund</option>
                    <option value="Missions Fund" className="dark:bg-[#121324]">Missions Fund</option>
                    <option value="Charity Fund" className="dark:bg-[#121324]">Charity Fund</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">Transaction Class / Category</label>
                <div className="relative flex items-center">
                  <select 
                    value={newTx.category}
                    onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                    className="w-full pl-3.5 pr-8 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50 dark:bg-[#16172D]/60 text-slate-700 dark:text-gray-300 font-bold cursor-pointer appearance-none"
                  >
                    <option value="Utilities" className="dark:bg-[#121324]">Utilities (Bills)</option>
                    <option value="Salaries" className="dark:bg-[#121324]">Staff Salaries</option>
                    <option value="Missions" className="dark:bg-[#121324]">Outreach / Missions</option>
                    <option value="Charity" className="dark:bg-[#121324]">Charity / Help</option>
                    <option value="Tithe" className="dark:bg-[#121324]">Tithe (Inflow)</option>
                    <option value="Other" className="dark:bg-[#121324]">Other Expenses</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">Description details</label>
                <input 
                  type="text" required placeholder="e.g. Paid Electricity for Subhash Nagar" value={newTx.description}
                  onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#6366F1]/15 focus:border-[#6366F1] transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 font-semibold"
                />
              </div>
              <div className="pt-3 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsTransactionOpen(false)} 
                  className="flex-1 py-3 border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white rounded-xl font-bold text-xs uppercase transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs uppercase transition-all shadow-md shadow-indigo-500/10 active:scale-[0.98]"
                >
                  Submit Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
