"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
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
  ChevronDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Trash2,
  X
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
  onDeletePledge?: (id: string) => Promise<void>;
  onAddTransaction?: (transaction: any) => Promise<void>;
  onDeleteTransaction?: (id: string) => Promise<void>;
  onOpenAddDonation?: () => void;
  activeSubTab?: "donations" | "pledges" | "transactions" | "accounts" | "config";
}

export default function FinanceManagement({ 
  donations = [], 
  users = [], 
  pledges: pledgesProp = [],
  transactions: transactionsProp = [],
  accounts: accountsProp = [],
  onAddDonation, 
  onDeleteDonation,
  onAddPledge,
  onDeletePledge,
  onAddTransaction,
  onDeleteTransaction,
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

  // Real-time optimistic deletion tracking (0ms UI latency)
  const [deletedDonationIds, setDeletedDonationIds] = useState<Set<string>>(new Set());
  const [deletedPledgeIds, setDeletedPledgeIds] = useState<Set<string>>(new Set());
  const [deletedTransactionIds, setDeletedTransactionIds] = useState<Set<string>>(new Set());
  const [deletingDonationId, setDeletingDonationId] = useState<string | null>(null);
  const [isPurging, setIsPurging] = useState(false);

  const activePledges = useMemo(() => pledgesProp.filter(p => !deletedPledgeIds.has(p.id)), [pledgesProp, deletedPledgeIds]);
  const activeTransactions = useMemo(() => transactionsProp.filter(t => !deletedTransactionIds.has(t.id)), [transactionsProp, deletedTransactionIds]);
  const activeAccounts = useMemo(() => accountsProp, [accountsProp]);

  const [subView, setSubView] = useState<"donations" | "pledges" | "transactions" | "accounts" | "config">(activeSubTab);

  React.useEffect(() => {
    if (activeSubTab) {
      setSubView(activeSubTab);
    }
  }, [activeSubTab]);
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isPledgeOpen, setIsPledgeOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);

  // Prevent background scroll and support ESC key when any modal is open
  useEffect(() => {
    if (isDonationOpen || isPledgeOpen || isTransactionOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsDonationOpen(false);
          setIsPledgeOpen(false);
          setIsTransactionOpen(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isDonationOpen, isPledgeOpen, isTransactionOpen]);
  
  const [donationFilter, setDonationFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [refundingId, setRefundingId] = useState<string | null>(null);

  const [newDonation, setNewDonation] = useState({
    donorName: "",
    donorEmail: "",
    amount: "",
    purpose: "TITHE",
    paymentMethod: "UPI",
    status: "COMPLETED"
  });
  const [newPledge, setNewPledge] = useState({ donorName: "", donorEmail: "", committedAmount: "", targetDate: "", purpose: "BUILDING" });
  const [newTx, setNewTx] = useState({ type: "OUTFLOW" as "INFLOW" | "OUTFLOW", amount: "", category: "UTILITIES", description: "", account: "General Fund" });

  const [amountsList] = useState([500, 1000, 2500, 5000, 10000]);

  // Metrics Calculations (reacts instantaneously to deletions)
  const completedDonations = useMemo(() => {
    return donations.filter(d => !deletedDonationIds.has(d.id) && d.status === "COMPLETED");
  }, [donations, deletedDonationIds]);

  const totalFinancials = useMemo(() => {
    return completedDonations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  }, [completedDonations]);

  const filteredDonations = useMemo(() => {
    return donations.filter(d => {
      if (deletedDonationIds.has(d.id)) return false;
      const matchesSearch = 
        (d.donorName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.donorEmail || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.donorPhone || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.razorpayPaymentId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.razorpayOrderId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.id || "").toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPurpose = donationFilter === "ALL" || d.purpose === donationFilter;
      const matchesStatus = statusFilter === "ALL" || d.status === statusFilter;
      return matchesSearch && matchesPurpose && matchesStatus;
    });
  }, [donations, deletedDonationIds, searchQuery, donationFilter, statusFilter]);

  const handleRefund = async (donationId: string, amount: number) => {
    const confirmMsg = isTe
      ? `₹${amount} మొత్తాన్ని రీఫండ్ చేయాలని ఖచ్చితంగా అనుకుంటున్నారా?`
      : isHi
      ? `क्या आप वाकई ₹${amount} की राशि वापस (रिफंड) करना चाहते हैं?`
      : `Are you sure you want to issue an official gateway refund of ₹${amount} for this donation?`;

    if (!confirm(confirmMsg)) return;

    setRefundingId(donationId);
    try {
      const res = await fetch("/api/admin/payments/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationId, amount, reason: "Admin requested refund" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Refund processed successfully.");
        window.location.reload();
      } else {
        alert(data.error || "Failed to process refund.");
      }
    } catch (err: any) {
      alert("Network error processing refund.");
    } finally {
      setRefundingId(null);
    }
  };

  // Instant 0ms optimistic permanent delete
  const handleDeleteDonationInternal = async (id: string) => {
    const confirmMsg = isTe
      ? "మీరు ఖచ్చితంగా ఈ కానుక రికార్డును శాశ్వతంగా తొలగించాలనుకుంటున్నారా? ఇది తిరిగి పొందలేరు."
      : isHi
      ? "क्या आप वाकई इस दान रिकॉर्ड को स्थायी रूप से हटाना चाहते हैं? यह पूर्ववत नहीं किया जा सकता है।"
      : "Are you sure you want to permanently delete this donation record? This action cannot be undone.";

    if (!window.confirm(confirmMsg)) return;

    // 0ms instant UI removal: row disappears right now
    setDeletedDonationIds(prev => new Set(prev).add(id));
    setDeletingDonationId(id);

    try {
      if (onDeleteDonation) {
        await onDeleteDonation(id);
      }
    } catch (err) {
      console.error("[FinanceManagement] Delete donation failed:", err);
      // Revert if server failed
      setDeletedDonationIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      alert(isTe ? "రికార్డు తొలగించడం విఫలమైంది" : isHi ? "रिकॉर्ड हटाना विफल रहा" : "Failed to permanently delete record.");
    } finally {
      setDeletingDonationId(null);
    }
  };

  const handleDeletePledgeInternal = async (id: string) => {
    const confirmMsg = isTe ? "ఈ వాగ్దానాన్ని శాశ్వతంగా తొలగించాలనుకుంటున్నారా?" : isHi ? "क्या आप इस वादे को स्थायी रूप से हटाना चाहते हैं?" : "Are you sure you want to permanently delete this pledge?";
    if (!window.confirm(confirmMsg)) return;
    setDeletedPledgeIds(prev => new Set(prev).add(id));
    try {
      if (onDeletePledge) await onDeletePledge(id);
    } catch (err) {
      setDeletedPledgeIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDeleteTransactionInternal = async (id: string) => {
    const confirmMsg = isTe ? "ఈ లావాదేవీని శాశ్వతంగా తొలగించాలనుకుంటున్నారా?" : isHi ? "क्या आप इस लेनदेन को स्थायी रूप से हटाना चाहते हैं?" : "Are you sure you want to permanently delete this transaction?";
    if (!window.confirm(confirmMsg)) return;
    setDeletedTransactionIds(prev => new Set(prev).add(id));
    try {
      if (onDeleteTransaction) await onDeleteTransaction(id);
    } catch (err) {
      setDeletedTransactionIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Clean all fake and pending test records in one tap
  const handlePurgeTestRecords = async () => {
    const confirmMsg = isTe
      ? "అన్ని పెండింగ్ మరియు డమ్మీ/టెస్ట్ కానుక రికార్డులను శాశ్వతంగా శుభ్రం చేయాలనుకుంటున్నారా?"
      : isHi
      ? "क्या आप सभी लंबित और परीक्षण दान रिकॉर्ड को स्थायी रूप से हटाना चाहते हैं?"
      : "Are you sure you want to permanently purge all test and pending records?";

    if (!window.confirm(confirmMsg)) return;

    setIsPurging(true);
    try {
      const testNames = new Set([
        'Church Member', 'Emmanuel Reddy', 'Anonymous Donor', 'Mary Sunitha',
        'John Babu', 'Grace Priya', 'Anonymous Giver', 'Test User', 'Bunny',
        'Rahul Gamer', 'valluri Rahul', 'Double Submit Test Donor', 'Status Query Test', 'Signature Test'
      ]);
      const toRemove = donations
        .filter(d => (Number(d.amount) <= 10) || d.status === 'PENDING' || d.status === 'FAILED' || d.id?.startsWith('don_') || testNames.has(d.donorName))
        .map(d => d.id);
      
      setDeletedDonationIds(prev => {
        const next = new Set(prev);
        toRemove.forEach(id => next.add(id));
        return next;
      });

      const res = await fetch("/api/admin/donations?cleanAllFake=true", { method: "DELETE" });
      const result = await res.json();
      if (res.ok && result.success) {
        alert(isTe ? `విజయవంతంగా ${result.deletedCount || toRemove.length} టెస్ట్ రికార్డులు తొలగించబడ్డాయి` : isHi ? `सफलतापूर्वक ${result.deletedCount || toRemove.length} परीक्षण रिकॉर्ड हटा दिए गए` : `Successfully purged ${result.deletedCount || toRemove.length} test records permanently.`);
      }
    } catch (err) {
      console.error("[FinanceManagement] Purge failed:", err);
    } finally {
      setIsPurging(false);
    }
  };

  const handleAddDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDonation.amount) return;
    const added = {
      donorName: newDonation.donorName || "Anonymous Giver",
      donorEmail: newDonation.donorEmail || null,
      amount: Number(newDonation.amount),
      purpose: newDonation.purpose,
      paymentMethod: newDonation.paymentMethod,
      status: newDonation.status,
    };
    if (onAddDonation) {
      await onAddDonation(added);
    }
    setNewDonation({ donorName: "", donorEmail: "", amount: "", purpose: "TITHE", paymentMethod: "UPI", status: "COMPLETED" });
    setIsDonationOpen(false);
  };

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
    <div className="space-y-4 sm:space-y-6 w-full max-w-7xl mx-auto overflow-x-hidden animate-in fade-in duration-300">
      
      {/* ─── Top Overview Metric Bar — 2-col on mobile, 4-col on desktop ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="min-w-0 pr-1">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
              {t.totalTithes}
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 sm:mt-1 tracking-tight truncate">{formatCurrency(totalFinancials)}</h3>
          </div>
          <div className="p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl flex-shrink-0">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="min-w-0 pr-1">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
              {t.completedTx}
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 sm:mt-1 tracking-tight">{completedDonations.length}</h3>
          </div>
          <div className="p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex-shrink-0">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="min-w-0 pr-1">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
              {isTe ? "వాగ్దాన నిధుల లక్ష్యం" : isHi ? "प्रतिबद्धता लक्ष्य" : "Pledged Target"}
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 sm:mt-1 tracking-tight truncate">
              {formatCurrency(activePledges.reduce((s, p) => s + (p.committedAmount || 0), 0))}
            </h3>
          </div>
          <div className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 rounded-2xl flex-shrink-0">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="min-w-0 pr-1">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
              {isTe ? "ఖాతాల నిల్వ" : isHi ? "कुल बैंक शेष" : "Liquid Funds"}
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5 sm:mt-1 tracking-tight truncate">
              {formatCurrency(activeAccounts.reduce((s, a) => s + (a.balance || 0), 0))}
            </h3>
          </div>
          <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 rounded-2xl flex-shrink-0">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* ─── Sub Navigation Tabs Bar ─── */}
      <div className="p-1 sm:p-1.5 bg-slate-100/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex gap-1 sm:gap-1.5 items-center w-full overflow-x-auto select-none scrollbar-none flex-nowrap -mx-1 px-1 shadow-xs">
        {[
          { 
            id: "donations", 
            label: t.donations, 
            icon: DollarSign,
            activeStyle: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25",
            inactiveStyle: "text-slate-700 dark:text-slate-200 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:text-violet-600 dark:hover:text-violet-300",
            iconColor: "text-violet-600 dark:text-violet-400"
          },
          { 
            id: "pledges", 
            label: t.pledges, 
            icon: Heart,
            activeStyle: "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/25",
            inactiveStyle: "text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-300",
            iconColor: "text-rose-600 dark:text-rose-400"
          },
          { 
            id: "transactions", 
            label: t.transactions, 
            icon: CreditCard,
            activeStyle: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25",
            inactiveStyle: "text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-600 dark:hover:text-emerald-300",
            iconColor: "text-emerald-600 dark:text-emerald-400"
          },
          { 
            id: "accounts", 
            label: t.accounts, 
            icon: Layers,
            activeStyle: "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/25",
            inactiveStyle: "text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-300",
            iconColor: "text-blue-600 dark:text-blue-400"
          },
          { 
            id: "config", 
            label: "Donation CMS", 
            icon: Settings,
            activeStyle: "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25",
            inactiveStyle: "text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-600 dark:hover:text-amber-300",
            iconColor: "text-amber-600 dark:text-amber-400"
          }
        ].map((tab) => {
          const isSelected = subView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubView(tab.id as any)}
              className={`py-2 px-3 sm:px-4 rounded-xl flex items-center gap-1.5 sm:gap-2 text-xs font-black transition-all whitespace-nowrap flex-shrink-0 active:scale-95 ${
                isSelected
                  ? tab.activeStyle
                  : tab.inactiveStyle
              }`}
            >
              <tab.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSelected ? "text-white" : tab.iconColor}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ────────────────── SUB-VIEW: DONATIONS ────────────────── */}
      {subView === "donations" && (
        <div className="space-y-4 sm:space-y-6">
          {/* Controls Bar: Search, Dropdowns, Action Buttons */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 rounded-2xl shadow-sm space-y-3">
            {/* Top row: Search input */}
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input 
                type="text" 
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Bottom row: Filter Dropdowns + Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2.5 flex-1">
                <div className="relative">
                  <select
                    value={donationFilter}
                    onChange={(e) => setDonationFilter(e.target.value)}
                    className="w-full pl-3 pr-7 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate"
                  >
                    <option value="ALL">{t.filterAll}</option>
                    <option value="TITHE">{t.tithe}</option>
                    <option value="OFFERING">{t.offering}</option>
                    <option value="MISSIONS">{t.missions}</option>
                    <option value="BUILDING">{t.buildingFund}</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-3 pr-7 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate"
                  >
                    <option value="ALL">{isTe ? "అన్ని స్థితులు" : isHi ? "सभी स्थितियां" : "All Status"}</option>
                    <option value="COMPLETED">{isTe ? "పూర్తయినవి" : isHi ? "सफल" : "Completed"}</option>
                    <option value="PENDING">{isTe ? "పెండింగ్" : isHi ? "लंबित" : "Pending"}</option>
                    <option value="FAILED">{isTe ? "విఫలమైనవి" : isHi ? "विफल" : "Failed"}</option>
                    <option value="REFUNDED">{isTe ? "రీఫండ్ అయినవి" : isHi ? "रिफंड" : "Refunded"}</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto flex-shrink-0">
                <button 
                  onClick={handlePurgeTestRecords}
                  disabled={isPurging}
                  className="flex-1 sm:flex-none py-2 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
                  title="Purge pending and test records permanently"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>{isPurging ? (isTe ? "తొలగిస్తోంది..." : isHi ? "हटा रहा है..." : "Purging...") : (isTe ? "టెస్ట్ డేటా శుభ్రం" : isHi ? "टेस्ट डेटा हटाएं" : "Clean Test Records")}</span>
                </button>
                <button 
                  onClick={() => window.print()} 
                  className="flex-1 sm:flex-none py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>{isTe ? "ప్రింట్" : isHi ? "प्रिंट" : "Print"}</span>
                </button>
                <button 
                  onClick={() => {
                    if (onOpenAddDonation) onOpenAddDonation();
                    else setIsDonationOpen(true);
                  }} 
                  className="w-full sm:w-auto py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.logContribution}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Donations Listing Container */}
          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
            {filteredDonations.length === 0 ? (
              <div className="text-center py-12 sm:py-16 px-4 max-w-sm mx-auto flex flex-col items-center justify-center space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 shadow-sm">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">{t.noRecords}</h4>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isTe ? "కానుకల వివరాలు ఇక్కడ కనిపిస్తాయి." : isHi ? "दान रिकॉर्ड यहाँ प्रदर्शित होंगे।" : "Online gateway and offline recorded contributions will appear here."}
                </p>
              </div>
            ) : (
              <>
                {/* MOBILE CARDS VIEW (Visible only on small screens < md) */}
                <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDonations.map((d) => (
                    <div key={d.id} className="p-3.5 space-y-2.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      {/* Top row: Donor Name & Amount */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 pr-1">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {d.donorName || (isTe ? "అనామక కానుకదారుడు" : isHi ? "गुमनाम दाता" : "Anonymous Giver")}
                          </h4>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate block font-medium">
                            {d.donorEmail || (isTe ? "ఈమెయిల్ లేదు" : isHi ? "कोई ईमेल नहीं" : "No email")}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-base font-black text-slate-900 dark:text-emerald-400 font-mono">
                            {formatCurrency(d.amount)}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            {new Date(d.createdAt).toLocaleDateString(isTe ? "te-IN" : isHi ? "hi-IN" : "en-IN")}
                          </span>
                        </div>
                      </div>

                      {/* Method, UTR & Purpose Badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                          d.paymentMethod === "UPI" 
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                            : d.paymentMethod === "RAZORPAY" || d.paymentMethod === "STRIPE"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800"
                        }`}>
                          {d.paymentMethod}
                        </span>

                        <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-extrabold border ${
                          d.purpose === "TITHE"
                            ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800"
                            : d.purpose === "OFFERING"
                            ? "bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-300 dark:border-teal-800"
                            : d.purpose === "BUILDING"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800"
                        }`}>
                          {getCategoryTranslation(d.purpose)}
                        </span>

                        <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-extrabold border ml-auto ${
                          d.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                            : d.status === "REFUNDED"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800"
                            : d.status === "FAILED"
                            ? "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border-red-300 dark:border-red-800"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                        }`}>
                          {d.status}
                        </span>
                      </div>

                      {/* UTR Reference Line */}
                      <div className="p-2 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200/60 dark:border-slate-800/60 font-mono text-[10px] text-slate-600 dark:text-slate-400 truncate">
                        Ref: {d.razorpayPaymentId || d.razorpayOrderId || d.stripeId || "OFFLINE_RECORD"}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        {d.status === "COMPLETED" && (
                          <Link 
                            href={`/give/receipt/${d.id}`} 
                            className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-xl transition-all text-center flex items-center justify-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{isTe ? "రశీదు" : isHi ? "रसीद" : "Receipt"}</span>
                          </Link>
                        )}
                        {d.status === "COMPLETED" && (
                          <button
                            onClick={() => handleRefund(d.id, d.amount)}
                            disabled={refundingId === d.id}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 font-bold text-xs rounded-xl transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
                          >
                            {refundingId === d.id ? "Refunding..." : "Refund"}
                          </button>
                        )}
                        {onDeleteDonation && (
                          <button
                            onClick={() => handleDeleteDonationInternal(d.id)}
                            disabled={deletingDonationId === d.id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                            title={isTe ? "శాశ్వతంగా తొలగించండి" : isHi ? "स्थायी रूप से हटाएं" : "Permanently Delete Record"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* DESKTOP TABLE VIEW (Visible on >= md screens) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap min-w-[750px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider bg-slate-100/90 dark:bg-slate-800/80">
                        <th className="py-4 px-6">{t.tableDonor}</th>
                        <th className="py-4 px-6">{t.tableMethod} & {t.tableUtr}</th>
                        <th className="py-4 px-6">{t.purpose}</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6">{t.tableAmount}</th>
                        <th className="py-4 px-6">{t.tableDate}</th>
                        <th className="py-4 px-6 text-center">Actions & {t.tableReceipt}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {filteredDonations.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-4 px-6">
                            <span className="font-bold text-slate-900 dark:text-white block text-sm">{d.donorName || (isTe ? "అనామక కానుకదారుడు" : isHi ? "గుమनाम दाता" : "Anonymous Giver")}</span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 font-medium">{d.donorEmail || (isTe ? "ఈమెయిల్ లేదు" : isHi ? "कोई ईमेल नहीं" : "No email")}</span>
                          </td>
                          <td className="py-4 px-6 space-y-1">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                              d.paymentMethod === "UPI" 
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                                : d.paymentMethod === "RAZORPAY" || d.paymentMethod === "STRIPE"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800"
                                : "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800"
                            }`}>
                              {d.paymentMethod}
                            </span>
                            <span className="block font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">{d.razorpayPaymentId || d.razorpayOrderId || d.stripeId || "OFFLINE_RECORD"}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold border ${
                              d.purpose === "TITHE"
                                ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800"
                                : d.purpose === "OFFERING"
                                ? "bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-300 dark:border-teal-800"
                                : d.purpose === "BUILDING"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800"
                            }`}>
                              {getCategoryTranslation(d.purpose)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold border ${
                              d.status === "COMPLETED"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                                : d.status === "REFUNDED"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800"
                                : d.status === "FAILED"
                                ? "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border-red-300 dark:border-red-800"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                            }`}>
                              {d.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-base font-black text-slate-900 dark:text-emerald-400 font-mono">
                            {formatCurrency(d.amount)}
                          </td>
                          <td className="py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
                            {new Date(d.createdAt).toLocaleDateString(isTe ? "te-IN" : isHi ? "hi-IN" : "en-IN")}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {d.status === "COMPLETED" && (
                                <Link href={`/give/receipt/${d.id}`} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 font-bold text-xs rounded-lg transition-all active:scale-95">
                                  <FileText className="w-3.5 h-3.5" /> {isTe ? "రశీదు" : isHi ? "रसीद" : "Receipt"}
                                </Link>
                              )}
                              {d.status === "COMPLETED" && (
                                <button
                                  onClick={() => handleRefund(d.id, d.amount)}
                                  disabled={refundingId === d.id}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-600 hover:text-white dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 font-bold text-xs rounded-lg transition-all active:scale-95 disabled:opacity-50"
                                  title="Process Razorpay Refund"
                                >
                                  {refundingId === d.id ? "Refunding..." : "Refund"}
                                </button>
                              )}
                              {onDeleteDonation && (
                                <button
                                  onClick={() => handleDeleteDonationInternal(d.id)}
                                  disabled={deletingDonationId === d.id}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-lg transition-all active:scale-95 disabled:opacity-50"
                                  title={isTe ? "శాశ్వతంగా తొలగించండి" : isHi ? "स्थायी रूप से हटाएं" : "Permanently Delete Record"}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ────────────────── SUB-VIEW: PLEDGES ────────────────── */}
      {subView === "pledges" && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-wider uppercase">{t.pledges}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 sm:mt-1 font-semibold">
                {isTe ? "చర్చి అభివృద్ధి ప్రాజెక్టుల కొరకు విశ్వాసులు చేసిన ఆర్థిక వాగ్దానాల ట్రాకింగ్." : isHi ? "प्रमुख विकास परियोजनाओं के लिए विश्वासियों द्वारा की गई वित्तीय प्रतिबद्धताओं को ट्रैक करें।" : "Track financial commitments made by believers for major development projects."}
              </p>
            </div>
            <button 
              onClick={() => setIsPledgeOpen(true)} 
              className="w-full sm:w-auto py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 flex-shrink-0"
            >
              <Plus className="w-4 h-4" /> {t.makePledge}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {activePledges.map(p => {
              const progress = Math.min(100, (p.paidAmount / (p.committedAmount || 1)) * 100);
              return (
                <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-300 space-y-4">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 pr-1">
                        <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 rounded-lg text-[9px] font-extrabold uppercase tracking-wider">{getCategoryTranslation(p.purpose)}</span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-2 truncate">{p.donorName}</h4>
                        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{p.donorEmail}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border flex-shrink-0 ${
                        p.status === "FULFILLED" 
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800" 
                          : p.status === "ACTIVE" 
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800" 
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                      }`}>{p.status === "FULFILLED" ? t.fulfilledStatus : p.status === "ACTIVE" ? t.activeStatus : t.pendingStatus}</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span>{t.paidAmount}: {formatCurrency(p.paidAmount)}</span>
                        <span>{t.committedAmount}: {formatCurrency(p.committedAmount)}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" /> {progress.toFixed(0)}% {isTe ? "పూర్తయింది" : isHi ? "पूरा" : "Completed"}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                    <div>
                      <span>{t.targetDate}: </span>
                      <span>{formatDate(p.targetDate)}</span>
                    </div>
                    {onDeletePledge && (
                      <button
                        onClick={() => handleDeletePledgeInternal(p.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-lg transition-all active:scale-95"
                        title={isTe ? "వాగ్దానాన్ని శాశ్వతంగా తొలగించండి" : isHi ? "वादे को स्थायी रूप से हटाएं" : "Delete Pledge Permanently"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {activePledges.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 shadow-sm">
                  <Heart className="w-6 h-6" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {isTe ? "ఇంకా ఎలాంటి ఆర్థిక వాగ్దానాలు నమోదు కాలేదు" : isHi ? "अभी तक कोई वित्तीय प्रतिबद्धता दर्ज नहीं की गई है" : "No active pledges recorded yet"}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs font-medium">
                  {isTe ? "విశ్వాస అభివృద్ధి వాగ్దానాన్ని జోడించడానికి '+ వాగ్దానం చేయండి' క్లిక్ చేయండి." : isHi ? "नया रिकॉर्ड जोड़ने के लिए '+ वादा करें' पर क्लिक करें।" : "Click '+ Make Pledge' above to record a new development commitment."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────── SUB-VIEW: TRANSACTIONS ────────────────── */}
      {subView === "transactions" && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-wider uppercase">{t.transactions}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 sm:mt-1 font-semibold">
                {isTe ? "చర్చి ఆదాయ, వ్యయాల వివరాలను నమోదు చేసే అధికారిక జర్నల్ డైరీ." : isHi ? "बिजली बिल, ग्रामीण मिशन खर्च और दशमांश प्राप्तियों को ट्रैक करने वाली बहीखाता डायरी।" : "Double-entry accounting diary tracking utility bills, rural missions expenses, and tithe inflows."}
              </p>
            </div>
            <button 
              onClick={() => setIsTransactionOpen(true)} 
              className="w-full sm:w-auto py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 flex-shrink-0"
            >
              <Plus className="w-4 h-4" /> {t.recordTransaction}
            </button>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
            {activeTransactions.length === 0 ? (
              <div className="text-center py-12 sm:py-16 px-4 max-w-sm mx-auto flex flex-col items-center justify-center space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800 shadow-sm">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {isTe ? "ఖాతా వివరాల జర్నల్‌లో ఎలాంటి లావాదేవీలు లేవు" : isHi ? "लेनदेन बहीखाते में कोई रिकॉर्ड दर्ज नहीं है" : "No journal transactions recorded yet"}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isTe ? "కొత్త లావాదేవీని జోడించడానికి '+ లావాదేవీ రికార్డు చేయండి' క్లిక్ చేయండి." : isHi ? "नया रिकॉर्ड जोड़ने के लिए ऊपर '+ लेनदेन दर्ज करें' पर क्लिक करें।" : "Click '+ Record Transaction' above to log your first income or expense record."}
                </p>
              </div>
            ) : (
              <>
                {/* MOBILE CARDS VIEW */}
                <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {activeTransactions.map((tRow) => (
                    <div key={tRow.id} className="p-3.5 space-y-2 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                          tRow.type === "INFLOW" 
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800" 
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800"
                        }`}>
                          {tRow.type === "INFLOW" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {tRow.type === "INFLOW" ? t.inflow : t.outflow}
                        </span>

                        <span className={`text-sm sm:text-base font-black font-mono ${tRow.type === "INFLOW" ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
                          {tRow.type === "INFLOW" ? "+" : "-"}{formatCurrency(tRow.amount)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-900 dark:text-white">
                        <span>{getAccountNameTranslation(tRow.account)}</span>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[9px] font-extrabold border border-slate-300 dark:border-slate-700">
                          {getCategoryTranslation(tRow.category)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 break-words">{tRow.description}</p>

                      <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400 font-mono">
                        <span>ID: {tRow.id}</span>
                        <div className="flex items-center gap-2">
                          <span>{formatDate(tRow.date)}</span>
                          {onDeleteTransaction && (
                            <button
                              onClick={() => handleDeleteTransactionInternal(tRow.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title="Delete Transaction Permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* DESKTOP TABLE VIEW */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider bg-slate-100/90 dark:bg-slate-800/80">
                        <th className="py-4 px-6">{isTe ? "లావాదేవీ ID" : isHi ? "लेनदेन ID" : "Transaction ID"}</th>
                        <th className="py-4 px-6">{t.txType}</th>
                        <th className="py-4 px-6">{t.txAccount}</th>
                        <th className="py-4 px-6">{t.txCategory}</th>
                        <th className="py-4 px-6">{t.txDescription}</th>
                        <th className="py-4 px-6">{t.tableAmount}</th>
                        <th className="py-4 px-6">{t.tableDate}</th>
                        <th className="py-4 px-6 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {activeTransactions.map((tRow) => (
                        <tr key={tRow.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                          <td className="py-4 px-6 font-mono text-xs text-slate-600 dark:text-slate-400 font-bold">{tRow.id}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                              tRow.type === "INFLOW" 
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800" 
                                : "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800"
                            }`}>
                              {tRow.type === "INFLOW" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {tRow.type === "INFLOW" ? t.inflow : t.outflow}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{getAccountNameTranslation(tRow.account)}</td>
                          <td className="py-4 px-6">
                            <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-extrabold border border-slate-300 dark:border-slate-700">
                              {getCategoryTranslation(tRow.category)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-600 dark:text-slate-400 max-w-[240px] truncate" title={tRow.description}>{tRow.description}</td>
                          <td className={`py-4 px-6 text-base font-black font-mono ${tRow.type === "INFLOW" ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"}`}>
                            {tRow.type === "INFLOW" ? "+" : "-"}{formatCurrency(tRow.amount)}
                          </td>
                          <td className="py-4 px-6 text-xs font-semibold text-slate-600 dark:text-slate-400">{formatDate(tRow.date)}</td>
                          <td className="py-4 px-6 text-center">
                            {onDeleteTransaction && (
                              <button
                                onClick={() => handleDeleteTransactionInternal(tRow.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-lg transition-all active:scale-95"
                                title="Delete Transaction Permanently"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ────────────────── SUB-VIEW: ACCOUNTS ────────────────── */}
      {subView === "accounts" && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-wider uppercase">{t.accounts}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 sm:mt-1 font-semibold">
                {isTe ? "చర్చి అధికారిక బ్యాంక్ ఖాతాలు, రిజర్వు నిధులు మరియు సాధారణ ఖాతా నిల్వలు." : isHi ? "चर्च के आधिकारिक बैंक खाते, आरक्षित निधियां और सामान्य बहीखाता शेष।" : "Official ministry bank accounts, reserve funds, and general ledger allocations."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-6">
            {activeAccounts.map((acc, idx) => (
              <div key={acc.id || idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-300 space-y-4">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wider">{getAccountNameTranslation(acc.name)}</h4>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 rounded-xl flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <hr className="border-t border-slate-200 dark:border-slate-800" />
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                    {isTe 
                      ? (acc.name === "General Fund" ? "రోజువారీ ఖర్చులు, విద్యుత్ బిల్లులు మరియు సిబ్బంది జీతాలు." : acc.name === "Building Fund" ? "చర్చి మందిర విస్తరణ ప్రాజెక్టుల కొరకు సేకరించిన నిధులు." : acc.name === "Missions Fund" ? "గ్రామీణ సువార్త సేవ, పాస్టర్ల మద్దతు మరియు సేవా కార్యక్రమాల కొరకు." : "అత్యవసర సహాయం, విశ్వాసుల విద్యా నిధి మరియు ఉచిత ఆహార పంపిణీ.") 
                      : isHi 
                      ? (acc.name === "General Fund" ? "दैनिक परिचालन व्यय, बिजली-पानी बिल और स्टाफ वेतन।" : acc.name === "Building Fund" ? "चर्च भवन विस्तार परियोजनाओं के लिए पूंजीगत संग्रह।" : acc.name === "Missions Fund" ? "ग्रामीण सुसमाचार मिशन, पादरियों की सहायता और सेवा कार्यक्रमों के लिए।" : "आपातकालीन राहत, विश्वासी शिक्षा सहायता और खाद्य वितरण।") 
                      : acc.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                  <span className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase">{isTe ? "నికర నిల్వ" : isHi ? "कुल शेष" : "Settled Balance"}</span>
                  <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight font-mono">{formatCurrency(acc.balance)}</span>
                </div>
              </div>
            ))}

            {activeAccounts.length === 0 && (
              <div className="col-span-full py-12 sm:py-16 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 gap-3 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800 shadow-sm">
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {isTe ? "ఖాతా రికార్డులు కనుగొనబడలేదు" : isHi ? "कोई खाता रिकॉर्ड नहीं मिला" : "No Ledger Accounts Found"}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs font-medium">
                  {isTe ? "ఖాతాల వివరాలు ఆటోమేటిక్‌గా డేటాబేస్ నుండి లోడ్ చేయబడతాయి." : isHi ? "खाते का विवरण स्वचालित रूप से लोड किया जाता है।" : "Ledger and fund balance allocations will appear here when configured in the database."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────── SUB-VIEW: CMS CONFIG ────────────────── */}
      {subView === "config" && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              {isTe ? "కానుకల పేజీ అమరికలు" : isHi ? "दान पृष्ठ सेटिंग्स" : "Donation CMS Configuration"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
              {isTe ? "కానుకల పేజీలో కనిపించే సూచించిన మొత్తాలు మరియు ఫారమ్ ఫీల్డ్‌లను నిర్వహించండి." : isHi ? "दान पृष्ठ पर प्रदर्शित सुझाई गई राशियों को प्रबंधित करें।" : "Manage predefined donation amounts displayed on the public giving portal."}
            </p>

            <div className="pt-1 sm:pt-2 flex flex-wrap gap-2">
              {amountsList.map((amt) => (
                <span key={amt} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-black font-mono">
                  {formatCurrency(amt)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

            {/* ─── MODAL: RECORD DONATION ─── */}
      {isDonationOpen && mounted && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 z-[10005] flex items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDonationOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-white dark:bg-slate-900 w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-md rounded-none sm:rounded-3xl border-0 sm:border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-950/80 backdrop-blur-sm flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    {isTe ? "కానుక రికార్డు చేయండి" : isHi ? "दान दर्ज करें" : "Record Contribution"}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {isTe ? "కానుక లేదా దశమభాగం వివరాలు నమోదు చేయండి" : isHi ? "दान या भेंट विवरण दर्ज करें" : "Log offline or direct contribution"}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsDonationOpen(false)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition active:scale-95 flex-shrink-0"
                aria-label="Close modal"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Modal Body & Form */}
            <form onSubmit={handleAddDonationSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 pb-[max(1.5rem,env(safe-area-inset-bottom))] custom-scrollbar flex flex-col">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  {isTe ? "కానుకదారుని పూర్తి పేరు" : isHi ? "दाता का पूरा नाम" : "Donor Full Name"} *
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder={isTe ? "ఉదా: కానుకదారుని పేరు" : isHi ? "उदा: दाता का नाम" : "e.g. Full Name"} 
                  value={newDonation.donorName}
                  onChange={(e) => setNewDonation({ ...newDonation, donorName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  {isTe ? "ఈమెయిల్ చిరునామా" : isHi ? "ईमेल पता" : "Email Address"}
                </label>
                <input 
                  type="email" 
                  placeholder="e.g. donor@email.com" 
                  value={newDonation.donorEmail}
                  onChange={(e) => setNewDonation({ ...newDonation, donorEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  {isTe ? "మొత్తం (రూపాయలలో)" : isHi ? "राशि (INR)" : "Amount (INR)"} *
                </label>
                <input 
                  type="number" 
                  required 
                  placeholder="e.g. 1000" 
                  value={newDonation.amount} 
                  min="1"
                  onChange={(e) => setNewDonation({ ...newDonation, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 font-semibold font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    {t.purpose}
                  </label>
                  <div className="relative flex items-center">
                    <select 
                      value={newDonation.purpose}
                      onChange={(e) => setNewDonation({ ...newDonation, purpose: e.target.value })}
                      className="w-full pl-3.5 pr-8 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold appearance-none cursor-pointer"
                    >
                      <option value="TITHE">{t.tithe}</option>
                      <option value="OFFERING">{t.offering}</option>
                      <option value="MISSIONS">{t.missions}</option>
                      <option value="BUILDING">{t.buildingFund}</option>
                    </select>
                    <ChevronDown className="absolute right-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                    {t.tableMethod}
                  </label>
                  <div className="relative flex items-center">
                    <select 
                      value={newDonation.paymentMethod}
                      onChange={(e) => setNewDonation({ ...newDonation, paymentMethod: e.target.value })}
                      className="w-full pl-3.5 pr-8 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold appearance-none cursor-pointer"
                    >
                      <option value="UPI">UPI</option>
                      <option value="CASH">Cash / Offline</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="RAZORPAY">Razorpay</option>
                    </select>
                    <ChevronDown className="absolute right-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="pt-3 sm:pt-4 flex gap-3 mt-auto flex-shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsDonationOpen(false)} 
                  className="flex-1 py-3 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold text-xs uppercase transition-colors"
                >
                  {isTe ? "రద్దు" : isHi ? "रद्द करें" : "Cancel"}
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase transition-all shadow-sm active:scale-95"
                >
                  {isTe ? "సేవ్ చేయండి" : isHi ? "सुरक्षित करें" : "Save Contribution"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ─── MODAL: RECORD PLEDGE ─── */}
      {isPledgeOpen && mounted && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 z-[10005] flex items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPledgeOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-white dark:bg-slate-900 w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-md rounded-none sm:rounded-3xl border-0 sm:border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-950/80 backdrop-blur-sm flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">{isTe ? "అభివృద్ధి వాగ్దానాన్ని నమోదు చేయండి" : isHi ? "विकास प्रतिबद्धता दर्ज करें" : "Record Development Pledge"}</h3>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{isTe ? "మందిర ప్రాజెక్టుల కొరకు విశ్వాసి వాగ్దాన వివరాలు" : isHi ? "मंत्रालय परियोजना प्रतिबद्धता विवरण" : "Log ministry project commitment"}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsPledgeOpen(false)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition active:scale-95 flex-shrink-0"
                aria-label="Close modal"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Modal Body & Form */}
            <form onSubmit={handleAddPledge} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 pb-[max(1.5rem,env(safe-area-inset-bottom))] custom-scrollbar flex flex-col">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">{isTe ? "వాగ్దానదారుని పూర్తి పేరు" : isHi ? "प्रतिबद्धताकर्ता का पूरा नाम" : "Pledger Full Name"} *</label>
                <input 
                  type="text" 
                  required 
                  placeholder={isTe ? "ఉదా: వాగ్దానదారుని పేరు" : isHi ? "उदा: दानकर्ता का नाम" : "e.g. Full Name"} 
                  value={newPledge.donorName}
                  onChange={(e) => setNewPledge({ ...newPledge, donorName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">{isTe ? "ఈమెయిల్ చిరునామా" : isHi ? "ईमेल पता" : "Email Address"}</label>
                <input 
                  type="email" 
                  placeholder="e.g. pledger@email.com" 
                  value={newPledge.donorEmail}
                  onChange={(e) => setNewPledge({ ...newPledge, donorEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">{isTe ? "వాగ్దాన మొత్తం (రూపాయలలో)" : isHi ? "प्रतिबद्ध राशि (INR)" : "Pledged Target Amount (INR)"} *</label>
                <input 
                  type="number" 
                  required 
                  placeholder="e.g. 50000" 
                  value={newPledge.committedAmount}
                  onChange={(e) => setNewPledge({ ...newPledge, committedAmount: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 font-semibold font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">{isTe ? "ప్రాజెక్ట్ లక్ష్యం / ప్రయోజనం" : isHi ? "परियोजना उद्देश्य" : "Project Target / Purpose"}</label>
                <div className="relative flex items-center">
                  <select 
                    value={newPledge.purpose}
                    onChange={(e) => setNewPledge({ ...newPledge, purpose: e.target.value })}
                    className="w-full pl-3.5 pr-8 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold appearance-none cursor-pointer"
                  >
                    <option value="BUILDING">Building Fund Project</option>
                    <option value="MISSIONS">Rural Gospel Outreach</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="pt-3 sm:pt-4 flex gap-3 mt-auto flex-shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsPledgeOpen(false)} 
                  className="flex-1 py-3 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold text-xs uppercase transition-colors"
                >
                  {isTe ? "రద్దు" : isHi ? "रद्द करें" : "Cancel"}
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase transition-all shadow-sm active:scale-95"
                >
                  {isTe ? "వాగ్దానం సేవ్ చేయండి" : isHi ? "प्रतिबद्धता सुरक्षित करें" : "Save Pledge"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ─── MODAL: RECORD TRANSACTION ─── */}
      {isTransactionOpen && mounted && typeof document !== "undefined" && createPortal(
        <div 
          className="fixed inset-0 z-[10005] flex items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsTransactionOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-white dark:bg-slate-900 w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:max-w-md rounded-none sm:rounded-3xl border-0 sm:border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-950/80 backdrop-blur-sm flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    {isTe ? "ఖాతా లావాదేవీ రికార్డు చేయండి" : isHi ? "खाता लेन-देन दर्ज करें" : "Record Accounting Journal Log"}
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {isTe ? "ఆదాయం మరియు వ్యయ ప్రవాహాల ట్రాకింగ్" : isHi ? "आय और व्यय का संतुलन ट्रैक करें" : "Track balance inflows & outflows"}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsTransactionOpen(false)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition active:scale-95 flex-shrink-0"
                aria-label="Close modal"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Modal Body & Form */}
            <form onSubmit={handleAddTransaction} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 pb-[max(1.5rem,env(safe-area-inset-bottom))] custom-scrollbar flex flex-col">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  {isTe ? "లావాదేవీ ప్రవాహ రకం" : isHi ? "लेन-देन का प्रकार" : "Transaction Flow Type"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button" 
                    onClick={() => setNewTx({ ...newTx, type: "INFLOW" })}
                    className={`py-2.5 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-1.5 border transition-all ${
                      newTx.type === "INFLOW" 
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-sm" 
                        : "bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" /> {isTe ? "ఆదాయం (+)" : isHi ? "आवक (+)" : "Inflow (+)"}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setNewTx({ ...newTx, type: "OUTFLOW" })}
                    className={`py-2.5 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-1.5 border transition-all ${
                      newTx.type === "OUTFLOW" 
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800 shadow-sm" 
                        : "bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" /> {isTe ? "వ్యయం (-)" : isHi ? "जावक (-)" : "Outflow (-)"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  {isTe ? "మొత్తం (రూపాయలలో)" : isHi ? "राशि (INR)" : "Amount (INR)"} *
                </label>
                <input 
                  type="number" 
                  required 
                  placeholder={isTe ? "ఉదా: 4500" : isHi ? "उदा: 4500" : "e.g. 4500"} 
                  value={newTx.amount}
                  onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 font-semibold font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  {isTe ? "ఖాతా నిధి" : isHi ? "खाता निधि" : "Account Fund"}
                </label>
                <div className="relative flex items-center">
                  <select 
                    value={newTx.account}
                    onChange={(e) => setNewTx({ ...newTx, account: e.target.value })}
                    className="w-full pl-3.5 pr-8 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold appearance-none cursor-pointer"
                  >
                    <option value="General Fund">{isTe ? "సాధారణ నిర్వహణ నిధి" : isHi ? "सामान्य संचालन निधि" : "General Operating Fund"}</option>
                    <option value="Building Fund">{isTe ? "చర్చి భవన నిర్మాణ నిధి" : isHi ? "भवन निर्माण निधि" : "Sanctuary Building Fund"}</option>
                    <option value="Missions Fund">{isTe ? "సువార్త సేవా నిధి" : isHi ? "मिशन और प्रचार निधि" : "Missions & Outreach Fund"}</option>
                    <option value="Charity Fund">{isTe ? "సేవా సహాయ నిధి" : isHi ? "धर्मार्थ सहायता निधि" : "Charity Relief Fund"}</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                  {isTe ? "వివరణ మరియు ప్రయోజనం" : isHi ? "विवरण और उद्देश्य" : "Description & Purpose"} *
                </label>
                <input 
                  type="text" 
                  required 
                  placeholder={isTe ? "ఉదా: చర్చి విద్యుత్ బిల్లు" : isHi ? "उदा: चर्च बिजली बिल" : "e.g. Sanctuary Electricity Bill"} 
                  value={newTx.description}
                  onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 font-semibold"
                />
              </div>

              <div className="pt-3 sm:pt-4 flex gap-3 mt-auto flex-shrink-0">
                <button 
                  type="button" 
                  onClick={() => setIsTransactionOpen(false)} 
                  className="flex-1 py-3 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold text-xs uppercase transition-colors"
                >
                  {isTe ? "రద్దు" : isHi ? "रद्द करें" : "Cancel"}
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase transition-all shadow-sm active:scale-95"
                >
                  {isTe ? "లావాదేవీ నమోదు చేయండి" : isHi ? "प्रविष्टि सुरक्षित करें" : "Record Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}


    </div>
  );
}
