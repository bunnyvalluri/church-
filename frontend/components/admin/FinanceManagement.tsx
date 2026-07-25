"use client";

import React, { useState, useMemo } from "react";
import { 
  DollarSign, 
  Heart, 
  CreditCard, 
  Layers, 
  Settings, 
  Plus, 
  Search, 
  Printer, 
  FileText, 
  CheckCircle, 
  TrendingUp, 
  X, 
  ChevronDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Trash2,
  Lock,
  QrCode
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { adminTranslations } from "@/components/admin/adminTranslations";

interface FinanceManagementProps {
  donations?: any[];
  users?: any[];
  pledges?: any[];
  transactions?: any[];
  accounts?: any[];
  onAddDonation: (donation: any) => void;
  onDeleteDonation?: (id: string) => Promise<void>;
  onAddPledge?: (pledge: any) => Promise<void>;
  onAddTransaction?: (transaction: any) => Promise<void>;
  onOpenAddDonation?: () => void;
  activeSubTab?: "donations" | "pledges" | "transactions" | "accounts" | "config";
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

const DEFAULT_PLEDGES: Pledge[] = [
  {
    id: "plg_001",
    donorName: "Sarah Thomas",
    donorEmail: "sarah@kcm-church.com",
    committedAmount: 100000,
    paidAmount: 40000,
    targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    purpose: "BUILDING",
    status: "ACTIVE"
  },
  {
    id: "plg_002",
    donorName: "David Raju",
    donorEmail: "david@kcm-church.com",
    committedAmount: 50000,
    paidAmount: 50000,
    targetDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    purpose: "MISSIONS",
    status: "FULFILLED"
  },
  {
    id: "plg_003",
    donorName: "John Babu",
    donorEmail: "john.babu@gmail.com",
    committedAmount: 25000,
    paidAmount: 10000,
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    purpose: "BUILDING",
    status: "ACTIVE"
  }
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: "tx_001",
    type: "INFLOW",
    amount: 25000,
    category: "TITHE",
    description: "Sunday Morning Bilingual Service Tithes & Offerings",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    account: "General Fund"
  },
  {
    id: "tx_002",
    type: "OUTFLOW",
    amount: 4500,
    category: "UTILITIES",
    description: "Jeedimetla Sanctuary Electricity & High-Speed Fiber Internet Bill",
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    account: "General Fund"
  },
  {
    id: "tx_003",
    type: "OUTFLOW",
    amount: 15000,
    category: "CHARITY",
    description: "Slum Outreach Medical Relief & Free Food Distribution",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    account: "Charity Fund"
  },
  {
    id: "tx_004",
    type: "INFLOW",
    amount: 50000,
    category: "BUILDING",
    description: "Building Sanctuary Expansion Member Contribution",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    account: "Building Fund"
  }
];

const DEFAULT_ACCOUNTS = [
  { id: "acc_001", name: "General Fund", balance: 245000, description: "Daily operating expenses, utility payments, and staff salaries." },
  { id: "acc_002", name: "Building Fund", balance: 580000, description: "Capital collections for church sanctuary expansion projects." },
  { id: "acc_003", name: "Missions Fund", balance: 175000, description: "Support for rural gospel missions, pastors support, and outreach programs." },
  { id: "acc_004", name: "Charity Fund", balance: 95000, description: "Emergency relief, believer education supports, and food distributions." }
];

export default function FinanceManagement({ 
  donations = [], 
  users = [], 
  pledges: pledgesProp = [],
  transactions: transactionsProp = [],
  accounts: accountsProp = [],
  onAddDonation, 
  onDeleteDonation,
  onAddPledge,
  onAddTransaction,
  onOpenAddDonation,
  activeSubTab = "donations" 
}: FinanceManagementProps) {
  const { language } = useLanguage();
  const isTe = language === "te";
  const isHi = language === "hi";
  const t = adminTranslations[language || "en"]?.finance || {
    ledgerTitle: "Donation Ledger Workspace",
    ledgerSubtitle: "Record offerings, generate donor tax statements, and manage account ledger balances.",
    donations: "Donations",
    pledges: "Pledges",
    transactions: "Transactions",
    accounts: "Accounts",
    logContribution: "+ Log Contribution",
    makePledge: "+ Make Pledge",
    recordTransaction: "+ Record Transaction",
    totalTithes: "Total Settled Donations",
    completedTx: "Completed Records",
    filterAll: "All Purposes",
    tithe: "Tithe",
    offering: "Offering",
    missions: "Missions",
    buildingFund: "Building Fund",
    searchPlaceholder: "Filter ledger logs...",
    tableDonor: "Donor / Believer",
    tableMethod: "Payment Method",
    tableUtr: "UTR / Reference",
    purpose: "Purpose",
    tableAmount: "Amount",
    tableDate: "Date",
    tableReceipt: "Receipt",
    noRecords: "No financial logs found matching criteria.",
    paidAmount: "Paid Amount",
    committedAmount: "Committed Goal",
    fulfilledStatus: "Fulfilled",
    activeStatus: "Active",
    pendingStatus: "Pending",
    targetDate: "Target Deadline",
    txType: "Type",
    txAccount: "Account",
    txCategory: "Category",
    txDescription: "Description",
    inflow: "INFLOW (+)",
    outflow: "OUTFLOW (-)"
  };

  const getCategoryTranslation = (cat: string) => {
    switch (cat?.toUpperCase()) {
      case "TITHE": return isTe ? "దశమభాగం" : isHi ? "दशमांश" : "Tithe";
      case "OFFERING": case "GENERAL": return isTe ? "సాధారణ కానుక" : isHi ? "सामान्य दान" : "Offering";
      case "MISSIONS": return isTe ? "సువార్త సేవ" : isHi ? "मिशन" : "Missions";
      case "BUILDING": return isTe ? "మందిర నిర్మాణం" : isHi ? "भवन कोष" : "Building Fund";
      case "CHARITY": return isTe ? "సేవా నిధి" : isHi ? "धर्मार्थ" : "Charity";
      case "UTILITIES": return isTe ? "విద్యుత్ / నిర్వహణ" : isHi ? "उपयोगिताएं" : "Utilities";
      default: return cat || "General";
    }
  };

  const getAccountNameTranslation = (name: string) => {
    switch (name) {
      case "General Fund": return isTe ? "సాధారణ నిధి" : isHi ? "सामान्य कोष" : name;
      case "Building Fund": return isTe ? "మందిర నిర్మాణ నిధి" : isHi ? "भवन कोष" : name;
      case "Missions Fund": return isTe ? "సువార్త సేవా నిధి" : isHi ? "मिशन कोष" : name;
      case "Charity Fund": return isTe ? "ధర్మనిధి" : isHi ? "धर्मार्थ कोष" : name;
      default: return name;
    }
  };

  // Synchronized lists with fallbacks
  const activePledges = useMemo(() => {
    return pledgesProp.length > 0 ? pledgesProp : DEFAULT_PLEDGES;
  }, [pledgesProp]);

  const activeTransactions = useMemo(() => {
    return transactionsProp.length > 0 ? transactionsProp : DEFAULT_TRANSACTIONS;
  }, [transactionsProp]);

  const activeAccounts = useMemo(() => {
    return accountsProp.length > 0 ? accountsProp : DEFAULT_ACCOUNTS;
  }, [accountsProp]);

  const [subView, setSubView] = useState<"donations" | "pledges" | "transactions" | "accounts" | "config">(activeSubTab);
  
  // Local state for modals & forms
  const [isPledgeOpen, setIsPledgeOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  
  const [donationFilter, setDonationFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [newPledge, setNewPledge] = useState({ donorName: "", donorEmail: "", committedAmount: "", targetDate: "", purpose: "BUILDING" });
  const [newTx, setNewTx] = useState({ type: "OUTFLOW" as "INFLOW" | "OUTFLOW", amount: "", category: "UTILITIES", description: "", account: "General Fund" });

  // CMS Form fields state
  const [amountsList, setAmountsList] = useState([500, 1000, 2500, 5000, 10000]);
  const [newAmountInput, setNewAmountInput] = useState("");

  // Metrics Calculations
  const completedDonations = useMemo(() => {
    return donations.filter(d => d.status === "COMPLETED");
  }, [donations]);

  const totalFinancials = useMemo(() => {
    return completedDonations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  }, [completedDonations]);

  const filteredDonations = useMemo(() => {
    return completedDonations.filter(d => {
      const matchesSearch = 
        (d.donorName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.donorEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.razorpayPaymentId || d.stripeId || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPurpose = donationFilter === "ALL" || d.purpose === donationFilter;
      return matchesSearch && matchesPurpose;
    });
  }, [completedDonations, searchQuery, donationFilter]);

  const handleAddPledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPledge.donorName || !newPledge.committedAmount) return;
    const added = {
      donorName: newPledge.donorName,
      donorEmail: newPledge.donorEmail || "pledger@email.com",
      committedAmount: Number(newPledge.committedAmount),
      targetDate: newPledge.targetDate ? new Date(newPledge.targetDate).toISOString() : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      purpose: newPledge.purpose,
      status: "ACTIVE"
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
    setNewTx({ type: "OUTFLOW", amount: "", category: "UTILITIES", description: "", account: "General Fund" });
    setIsTransactionOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* ─── Top Overview Metric Bar ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur-xl flex items-center justify-between hover:-translate-y-0.5 transition-all">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {t.totalTithes}
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 tracking-tight">{formatCurrency(totalFinancials)}</h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur-xl flex items-center justify-between hover:-translate-y-0.5 transition-all">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {t.completedTx}
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 tracking-tight">{completedDonations.length}</h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur-xl flex items-center justify-between hover:-translate-y-0.5 transition-all">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {isTe ? "వాగ్దాన నిధుల లక్ష్యం" : isHi ? "प्रतिबद्धता लक्ष्य" : "Pledged Target"}
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
              {formatCurrency(activePledges.reduce((s, p) => s + (p.committedAmount || 0), 0))}
            </h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl">
            <Heart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm backdrop-blur-xl flex items-center justify-between hover:-translate-y-0.5 transition-all">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              {isTe ? "ఖాతాల నిల్వ" : isHi ? "कुल बैंक शेष" : "Liquid Funds"}
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 tracking-tight">
              {formatCurrency(activeAccounts.reduce((s, a) => s + (a.balance || 0), 0))}
            </h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ─── Sub Navigation Tabs Bar ─── */}
      <div className="p-1 bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 rounded-2xl flex gap-1 items-center w-max max-w-full overflow-x-auto select-none scrollbar-none shadow-sm">
        {[
          { id: "donations", label: t.donations, icon: DollarSign },
          { id: "pledges", label: t.pledges, icon: Heart },
          { id: "transactions", label: t.transactions, icon: CreditCard },
          { id: "accounts", label: t.accounts, icon: Layers },
          { id: "config", label: "Donation CMS", icon: Settings }
        ].map((tab) => {
          const isSelected = subView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubView(tab.id as any)}
              className={`py-2 px-4 rounded-xl flex items-center gap-2 text-xs font-black transition-all ${
                isSelected
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]"
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
          {/* Table Control */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-sm backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-[#16172D]/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all font-semibold"
                />
              </div>

              <div className="relative w-44">
                <select
                  value={donationFilter}
                  onChange={(e) => setDonationFilter(e.target.value)}
                  className="w-full pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-[#16172D]/60 border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-gray-300 rounded-xl text-xs font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500"
                >
                  <option value="ALL">{t.filterAll}</option>
                  <option value="TITHE">{t.tithe}</option>
                  <option value="OFFERING">{t.offering}</option>
                  <option value="MISSIONS">{t.missions}</option>
                  <option value="BUILDING">{t.buildingFund}</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => window.print()} 
                className="py-2.5 px-4 bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Printer className="w-4 h-4 text-indigo-500" /> {isTe ? "ప్రింట్" : isHi ? "प्रिंट" : "Print"}
              </button>
              <button 
                onClick={onOpenAddDonation} 
                className="py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/10 transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" /> {t.logContribution}
              </button>
            </div>
          </div>

          <div className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] backdrop-blur-xl rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-150 dark:border-white/[0.04] text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider bg-slate-50/50 dark:bg-white/[0.01]">
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
                    <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-black text-slate-900 dark:text-white block">{d.donorName || (isTe ? "అనామక కానుకదారుడు" : isHi ? "गुमनाम दाता" : "Anonymous Giver")}</span>
                        <span className="text-[10px] text-slate-400 dark:text-gray-500 block mt-0.5 font-medium">{d.donorEmail || (isTe ? "ఈమెయిల్ లేదు" : isHi ? "कोई ईमेल नहीं" : "No email")}</span>
                      </td>
                      <td className="py-4 px-6 font-mono text-[9px] text-slate-400 space-y-0.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20">
                          {d.paymentMethod}
                        </span>
                        <span className="block mt-1 font-bold">{d.razorpayPaymentId || d.stripeId || "OFFLINE_RECORD"}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-full text-[9px] uppercase tracking-wider font-extrabold">
                          {getCategoryTranslation(d.purpose)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm font-black text-slate-900 dark:text-white">
                        {formatCurrency(d.amount)}
                      </td>
                      <td className="py-4 px-6 text-slate-400 dark:text-gray-500">
                        {new Date(d.createdAt).toLocaleDateString(isTe ? "te-IN" : isHi ? "hi-IN" : "en-IN")}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/give/receipt/${d.id}`} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] hover:border-indigo-300 rounded-lg text-indigo-600 dark:text-indigo-400 font-bold text-[9px] uppercase hover:bg-indigo-50/30 transition-all active:scale-95">
                            <FileText className="w-3.5 h-3.5" /> {isTe ? "రశీదు" : isHi ? "रसीद" : "Receipt"}
                          </Link>
                          {onDeleteDonation && (
                            <button
                              onClick={() => {
                                if (confirm(isTe ? "మీరు ఖచ్చితంగా ఈ రికార్డును తొలగించాలనుకుంటున్నారా?" : isHi ? "क्या आप वाकई इस रिकॉर्ड को हटाना चाहते हैं?" : "Are you sure you want to delete this record?")) {
                                  onDeleteDonation(d.id);
                                }
                              }}
                              className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all active:scale-95"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredDonations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-xs text-slate-400 dark:text-gray-500 font-semibold">{t.noRecords}</td>
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
          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-sm backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-wider uppercase">{t.pledges}</h2>
              <p className="text-xs text-slate-450 dark:text-gray-400 mt-1 font-semibold">
                {isTe ? "చర్చి అభివృద్ధి ప్రాజెక్టుల కొరకు విశ్వాసులు చేసిన ఆర్థిక వాగ్దానాల ట్రాకింగ్." : isHi ? "प्रमुख विकास परियोजनाओं के लिए विश्वासियों द्वारा की गई वित्तीय प्रतिबद्धताओं को ट्रैक करें।" : "Track financial commitments made by believers for major development projects."}
              </p>
            </div>
            <button 
              onClick={() => setIsPledgeOpen(true)} 
              className="py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/10 transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" /> {t.makePledge}
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePledges.map(p => {
              const progress = Math.min(100, (p.paidAmount / (p.committedAmount || 1)) * 100);
              return (
                <div key={p.id} className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-sm backdrop-blur-xl flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 group">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[8px] font-black uppercase tracking-wider border border-indigo-100 dark:border-indigo-500/20">{getCategoryTranslation(p.purpose)}</span>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white mt-2.5">{p.donorName}</h4>
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 font-medium">{p.donorEmail}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase border ${
                        p.status === "FULFILLED" 
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" 
                          : p.status === "ACTIVE" 
                          ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20" 
                          : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20"
                      }`}>{p.status === "FULFILLED" ? t.fulfilledStatus : p.status === "ACTIVE" ? t.activeStatus : t.pendingStatus}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold text-slate-700 dark:text-gray-300">
                        <span>{t.paidAmount}: {formatCurrency(p.paidAmount)}</span>
                        <span>{t.committedAmount}: {formatCurrency(p.committedAmount)}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-white/[0.04] rounded-full overflow-hidden border border-slate-200/50 dark:border-white/[0.02]">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-[9px] font-black text-slate-400 flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> {progress.toFixed(0)}% {isTe ? "పూర్తయింది" : isHi ? "पूरा" : "Completed"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-white/[0.04] flex justify-between text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase">
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
          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-sm backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-wider uppercase">{t.transactions}</h2>
              <p className="text-xs text-slate-450 dark:text-gray-400 mt-1 font-semibold">
                {isTe ? "చర్చి ఆదాయ, వ్యయాల వివరాలను నమోదు చేసే అధికారిక జర్నల్ డైరీ." : isHi ? "बिजली बिल, ग्रामीण मिशन खर्च और दशमांश प्राप्तियों को ट्रैक करने वाली बहीखाता डायरी।" : "Double-entry accounting diary tracking utility bills, rural missions expenses, and tithe inflows."}
              </p>
            </div>
            <button 
              onClick={() => setIsTransactionOpen(true)} 
              className="py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/10 transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" /> {t.recordTransaction}
            </button>
          </div>

          <div className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] backdrop-blur-xl rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-150 dark:border-white/[0.04] text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-wider bg-slate-50/50 dark:bg-white/[0.01]">
                    <th className="py-4.5 px-6">{isTe ? "లావాదేవీ ID" : isHi ? "लेनदेन ID" : "Transaction ID"}</th>
                    <th className="py-4.5 px-6">{t.txType}</th>
                    <th className="py-4.5 px-6">{t.txAccount}</th>
                    <th className="py-4.5 px-6">{t.txCategory}</th>
                    <th className="py-4.5 px-6">{t.txDescription}</th>
                    <th className="py-4.5 px-6">{t.tableAmount}</th>
                    <th className="py-4.5 px-6">{t.tableDate}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03] text-xs font-semibold text-slate-700 dark:text-gray-300">
                  {activeTransactions.map((tRow) => (
                    <tr key={tRow.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-all">
                      <td className="py-4 px-6 font-mono text-[9px] text-slate-400 font-bold">{tRow.id}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          tRow.type === "INFLOW" 
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" 
                            : "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20"
                        }`}>
                          {tRow.type === "INFLOW" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {tRow.type === "INFLOW" ? t.inflow : t.outflow}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-800 dark:text-white">{getAccountNameTranslation(tRow.account)}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-gray-300 rounded-lg text-[9px] font-extrabold border border-slate-200/60 dark:border-white/[0.04]">
                          {getCategoryTranslation(tRow.category)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 dark:text-gray-400 max-w-[240px] truncate" title={tRow.description}>{tRow.description}</td>
                      <td className={`py-4 px-6 text-sm font-black ${tRow.type === "INFLOW" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {tRow.type === "INFLOW" ? "+" : "-"}{formatCurrency(tRow.amount)}
                      </td>
                      <td className="py-4 px-6 text-slate-400 dark:text-gray-500">{formatDate(tRow.date)}</td>
                    </tr>
                  ))}

                  {activeTransactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-xs text-slate-400 dark:text-gray-500 font-semibold">
                        {t.noRecords}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────── SUB-VIEW: ACCOUNTS ────────────────── */}
      {subView === "accounts" && (
        <div className="grid md:grid-cols-2 gap-6">
          {activeAccounts.map((acc, idx) => (
            <div key={idx} className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-sm backdrop-blur-xl flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wider">{getAccountNameTranslation(acc.name)}</h4>
                  <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>
                <hr className="border-t border-slate-100 dark:border-white/[0.04]" />
                <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed font-semibold">
                  {isTe 
                    ? (acc.name === "General Fund" ? "రోజువారీ ఖర్చులు, విద్యుత్ బిల్లులు మరియు సిబ్బంది జీతాలు." : acc.name === "Building Fund" ? "చర్చి మందిర విస్తరణ ప్రాజెక్టుల కొరకు సేకరించిన నిధులు." : acc.name === "Missions Fund" ? "గ్రామీణ సువార్త సేవ, పాస్టర్ల మద్దతు మరియు సేవా కార్యక్రమాల కొరకు." : "అత్యవసర సహాయం, విశ్వాసుల విద్యా నిధి మరియు ఉచిత ఆహార పంపిణీ.") 
                    : isHi 
                    ? (acc.name === "General Fund" ? "दैनिक परिचालन व्यय, बिजली-पानी बिल और स्टाफ वेतन।" : acc.name === "Building Fund" ? "चर्च भवन विस्तार परियोजनाओं के लिए पूंजीगत संग्रह।" : acc.name === "Missions Fund" ? "ग्रामीण सुसमाचार मिशन, पादरियों की सहायता और सेवा कार्यक्रमों के लिए।" : "आपातकालीन राहत, विश्वासी शिक्षा सहायता और खाद्य वितरण।") 
                    : acc.description}
                </p>
              </div>

              <div className="mt-6 pt-3.5 border-t border-slate-100 dark:border-white/[0.04] flex justify-between items-baseline">
                <span className="text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase">{isTe ? "నికర నిల్వ" : isHi ? "कुल शेष" : "Settled Balance"}</span>
                <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(acc.balance)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ────────────────── SUB-VIEW: CMS CONFIG ────────────────── */}
      {subView === "config" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 p-6 rounded-2xl shadow-sm backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              {isTe ? "కానుకల పేజీ అమరికలు" : isHi ? "दान पृष्ठ सेटिंग्स" : "Donation CMS Configuration"}
            </h3>
            <p className="text-xs text-slate-450 dark:text-gray-400 font-semibold">
              {isTe ? "కానుకల పేజీలో కనిపించే సూచించిన మొత్తాలు మరియు ఫారమ్ ఫీల్డ్‌లను నిర్వహించండి." : isHi ? "दान पृष्ठ पर प्रदर्शित सुझाई गई राशियों को प्रबंधित करें।" : "Manage predefined donation amounts displayed on the public giving portal."}
            </p>

            <div className="pt-2 flex flex-wrap gap-2">
              {amountsList.map((amt) => (
                <span key={amt} className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 rounded-xl text-xs font-black">
                  {formatCurrency(amt)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: RECORD PLEDGE ─── */}
      {isPledgeOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="font-black text-slate-900 dark:text-white text-base">Record Development Pledge</h3>
              <button 
                onClick={() => setIsPledgeOpen(false)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/[0.08] rounded-xl"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddPledge} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">Pledger Full Name</label>
                <input 
                  type="text" required placeholder="e.g. Sarah Johnson" value={newPledge.donorName}
                  onChange={(e) => setNewPledge({ ...newPledge, donorName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">Email Address</label>
                <input 
                  type="email" placeholder="e.g. sarah@email.com" value={newPledge.donorEmail}
                  onChange={(e) => setNewPledge({ ...newPledge, donorEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">Pledged Target Amount (INR)</label>
                <input 
                  type="number" required placeholder="e.g. 50000" value={newPledge.committedAmount}
                  onChange={(e) => setNewPledge({ ...newPledge, committedAmount: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">Project Target / Purpose</label>
                <div className="relative flex items-center">
                  <select 
                    value={newPledge.purpose}
                    onChange={(e) => setNewPledge({ ...newPledge, purpose: e.target.value })}
                    className="w-full pl-3.5 pr-8 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50 dark:bg-[#16172D]/60 text-slate-700 dark:text-gray-300 font-bold appearance-none cursor-pointer"
                  >
                    <option value="BUILDING">Building Fund Project</option>
                    <option value="MISSIONS">Rural Gospel Outreach</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setIsPledgeOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-white/[0.08] text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl font-bold text-xs uppercase transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs uppercase transition-all shadow-md shadow-indigo-500/10 active:scale-95">Save Pledge</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: RECORD TRANSACTION ─── */}
      {isTransactionOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#121324] rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-white/[0.06] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-white/[0.04] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.01]">
              <h3 className="font-black text-slate-900 dark:text-white text-base">Record Accounting Journal Log</h3>
              <button 
                onClick={() => setIsTransactionOpen(false)} 
                className="text-slate-400 hover:text-slate-700 p-1.5 bg-white dark:bg-[#121324] border border-slate-200 dark:border-white/[0.08] rounded-xl"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">Transaction Flow Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button" 
                    onClick={() => setNewTx({ ...newTx, type: "INFLOW" })}
                    className={`py-2.5 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-1.5 border transition-all ${
                      newTx.type === "INFLOW" 
                        ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-500/30 shadow-sm" 
                        : "bg-slate-50 dark:bg-[#16172D]/60 text-slate-400 border-slate-200 dark:border-white/[0.08]"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" /> Inflow (+)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setNewTx({ ...newTx, type: "OUTFLOW" })}
                    className={`py-2.5 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-1.5 border transition-all ${
                      newTx.type === "OUTFLOW" 
                        ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 border-rose-300 dark:border-rose-500/30 shadow-sm" 
                        : "bg-slate-50 dark:bg-[#16172D]/60 text-slate-400 border-slate-200 dark:border-white/[0.08]"
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" /> Outflow (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">Amount (INR)</label>
                <input 
                  type="number" required placeholder="e.g. 4500" value={newTx.amount}
                  onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">Account Fund</label>
                <div className="relative flex items-center">
                  <select 
                    value={newTx.account}
                    onChange={(e) => setNewTx({ ...newTx, account: e.target.value })}
                    className="w-full pl-3.5 pr-8 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50 dark:bg-[#16172D]/60 text-slate-700 dark:text-gray-300 font-bold appearance-none cursor-pointer"
                  >
                    <option value="General Fund">General Operating Fund</option>
                    <option value="Building Fund">Sanctuary Building Fund</option>
                    <option value="Missions Fund">Missions & Outreach Fund</option>
                    <option value="Charity Fund">Charity Relief Fund</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-450 dark:text-gray-500 uppercase mb-1.5">Description & Purpose</label>
                <input 
                  type="text" required placeholder="e.g. Sanctuary Electricity Bill" value={newTx.description}
                  onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-white/[0.08] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all bg-slate-50/50 dark:bg-[#16172D]/60 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setIsTransactionOpen(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-white/[0.08] text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl font-bold text-xs uppercase transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-650 hover:from-indigo-650 hover:to-violet-700 text-white rounded-xl font-bold text-xs uppercase transition-all shadow-md shadow-indigo-500/10 active:scale-95">Record Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
