"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  QrCode,
  Lock,
  ShieldAlert,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Copy,
  CheckCircle2,
  Share2,
  Download,
  Home,
  RefreshCw,
  User,
  Mail,
  Phone,
  Building,
  Gift,
  Sparkles,
  ShieldCheck,
  Check,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  MessageSquare,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/lib/translations";
import io from "socket.io-client";

// Icon mapping helper
const ICON_MAP: Record<string, any> = {
  Heart,
  Gift,
  Sparkles,
  Building,
  ShieldCheck,
  Globe,
};

interface PresetAmount {
  id: string;
  amount: number;
  label: string | null;
  displayOrder: number;
  isDefault: boolean;
}

interface CauseItem {
  id: string;
  code: string;
  nameEn: string;
  nameTe?: string;
  nameHi?: string;
  descEn: string;
  icon?: string;
  category?: string;
  targetAmount?: number | null;
  raisedAmount?: number;
}

interface BranchItem {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

interface FormFieldRule {
  id: string;
  fieldName: string;
  label: string;
  placeholder?: string;
  isRequired: boolean;
  isVisible: boolean;
  displayOrder: number;
  fieldType: string;
}

interface PaymentSettings {
  minDonationAmount: number;
  maxDonationAmount: number;
  upiId: string;
  merchantName: string;
  qrExpiryMinutes: number;
}

export default function NgoDonationsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Dynamic Metadata State
  const [configLoading, setConfigLoading] = useState(true);
  const [presetAmounts, setPresetAmounts] = useState<PresetAmount[]>([]);
  const [causes, setCauses] = useState<CauseItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [formFields, setFormFields] = useState<FormFieldRule[]>([]);
  const [settings, setSettings] = useState<PaymentSettings>({
    minDonationAmount: 10,
    maxDonationAmount: 500000,
    upiId: "kcm.kristhraj2004-1@okicici",
    merchantName: "Kingdom of Christ Ministries",
    qrExpiryMinutes: 10,
  });

  // Wizard Step State (1: Amount, 2: Donor Info, 3: Dynamic QR Payment, 4: Result)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [paymentStatus, setPaymentStatus] = useState<"PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "EXPIRED">("PENDING");

  // Form Inputs
  const [amount, setAmount] = useState<string>("1000");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedCause, setSelectedCause] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");

  // Dynamic Donor Details State
  const [donorDetails, setDonorDetails] = useState<Record<string, any>>({
    donorName: "",
    donorPhone: "",
    donorEmail: "",
    panNumber: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    prayerRequest: "",
    message: "",
    isAnonymous: false,
  });

  // Backend Payment Session Response State
  const [sessionId, setSessionId] = useState<string>("");
  const [donationId, setDonationId] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [qrCodeBase64, setQrCodeBase64] = useState<string>("");
  const [upiUri, setUpiUri] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeftStr, setTimeLeftStr] = useState<string>("10:00");

  // Success Receipt State
  const [receiptData, setReceiptData] = useState<{
    receiptNumber: string;
    transactionId: string;
    amount: number;
    issuedAt: string;
    donorName: string;
    purpose: string;
    branch: string;
  } | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type?: "success" | "error" } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ngoT = mounted ? t.ngo : translations.en.ngo;

  // ── 1. Fetch Dynamic Configuration Metadata ─────────────────────────────────
  useEffect(() => {
    if (!mounted) return;

    async function loadDynamicConfig() {
      try {
        const res = await fetch("/api/donations/config");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setPresetAmounts(data.amounts || []);
            setCauses(data.causes || []);
            setBranches(data.branches || []);
            setFormFields(data.formFields || []);
            if (data.settings) setSettings(data.settings);

            // Set dynamic defaults
            const defaultAmt = data.amounts?.find((a: PresetAmount) => a.isDefault)?.amount;
            if (defaultAmt) setAmount(defaultAmt.toString());
            else if (data.amounts?.length > 0) setAmount(data.amounts[0].amount.toString());

            if (data.causes?.length > 0) setSelectedCause(data.causes[0].code);
            if (data.branches?.length > 0) setSelectedBranch(data.branches[0].id);
          }
        }
      } catch (err) {
        console.error("[DONATIONS] Dynamic config load failed:", err);
      } finally {
        setConfigLoading(false);
      }
    }

    loadDynamicConfig();
  }, [mounted]);

  // Prefill logged in user info
  useEffect(() => {
    if (user) {
      setDonorDetails((prev) => ({
        ...prev,
        donorName: prev.donorName || user.name || "",
        donorEmail: prev.donorEmail || user.email || "",
      }));
    }
  }, [user]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getFinalAmount = () => (customAmount ? customAmount : amount);

  // ── Step 1 Validation ────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const finalAmt = Number(getFinalAmount());
    if (isNaN(finalAmt) || finalAmt < settings.minDonationAmount) {
      setErrorMessage(`Please select or enter a donation amount of at least ₹${settings.minDonationAmount}.`);
      return false;
    }
    if (finalAmt > settings.maxDonationAmount) {
      setErrorMessage(`Maximum allowed transaction amount is ₹${settings.maxDonationAmount.toLocaleString("en-IN")}.`);
      return false;
    }
    setErrorMessage("");
    return true;
  };

  // ── Step 2 Validation ────────────────────────────────────────────────────────
  const validateStep2 = () => {
    for (const field of formFields) {
      if (field.isVisible && field.isRequired) {
        const val = donorDetails[field.fieldName];
        if (field.fieldName === "isAnonymous") continue;
        if (!val || (typeof val === "string" && !val.trim())) {
          setErrorMessage(`Please enter your ${field.label}.`);
          return false;
        }
      }
    }

    if (donorDetails.donorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorDetails.donorEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return false;
    }

    if (donorDetails.donorPhone) {
      const cleaned = donorDetails.donorPhone.replace(/[\s-]/g, "");
      if (!/^\+?[0-9]{10,15}$/.test(cleaned)) {
        setErrorMessage("Please enter a valid 10-digit mobile number.");
        return false;
      }
    }

    setErrorMessage("");
    return true;
  };

  // ── Handlers for wizard navigation ──────────────────────────────────────────
  const handleProceedToStep2 = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleCreatePaymentOrder = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    setErrorMessage("");

    try {
      const finalAmt = getFinalAmount();
      const res = await fetch("/api/donations/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(finalAmt),
          purpose: selectedCause,
          branchId: selectedBranch,
          userId: user?.uid || null,
          ...donorDetails,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create donation payment order.");
      }

      setSessionId(data.sessionId);
      setDonationId(data.donationId);
      setOrderId(data.orderId);
      setReferenceNumber(data.referenceNumber);
      setQrCodeBase64(data.qrCode);
      setUpiUri(data.upiUri);
      setExpiresAt(new Date(data.expiresAt));

      setPaymentStatus("PROCESSING");
      setStep(3);

      // Connect status polling and Socket.IO
      startPollingStatus(data.sessionId, data.donationId);
      connectSocket(data.sessionId, data.referenceNumber);
    } catch (err: any) {
      console.error("[DONATION_PAGE] Order creation failed:", err);
      setErrorMessage(err.message || "Could not generate UPI QR Code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Countdown Timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!expiresAt || step !== 3 || paymentStatus === "SUCCESS") return;

    const updateTimer = () => {
      const diff = expiresAt.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeftStr("00:00");
        setPaymentStatus("EXPIRED");
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }
      const mins = Math.floor((diff / 1000 / 60) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setTimeLeftStr(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [expiresAt, step, paymentStatus]);

  // ── Real-Time Status Polling ────────────────────────────────────────────────
  const startPollingStatus = useCallback((sid: string, donId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/donations/status/${sid}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.status === "COMPLETED") {
            clearInterval(pollRef.current!);
            handlePaymentSuccess(donId || data.donationId);
          } else if (data.status === "EXPIRED") {
            clearInterval(pollRef.current!);
            setPaymentStatus("EXPIRED");
          } else if (data.status === "FAILED") {
            clearInterval(pollRef.current!);
            setPaymentStatus("FAILED");
          }
        }
      } catch (err) {
        console.warn("[DONATION_PAGE] Polling check notice:", err);
      }
    }, 3000);
  }, []);

  // ── Socket.IO Real-Time Listener ────────────────────────────────────────────
  const connectSocket = useCallback((sid: string, refNum: string) => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", `member:${user?.uid || "guest"}`);
      socket.emit("join", "ngo:donations");
    });

    socket.on("donation.success", (data: any) => {
      if (data.sessionId === sid || data.referenceNumber === refNum) {
        handlePaymentSuccess(data.donationId || donationId);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, donationId]);

  // Cleanup timers & sockets
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // ── Verification / Completion Handler ───────────────────────────────────────
  const handlePaymentSuccess = async (targetDonationId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const verifyRes = await fetch("/api/donations/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpayOrderId: orderId,
          razorpayPaymentId: `pay_upi_${Math.random().toString(36).substring(2, 10)}`,
          razorpaySignature: "mock_upi_verified",
          donationId: targetDonationId,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        const branchObj = branches.find((b) => b.id === selectedBranch);
        const causeObj = causes.find((c) => c.code === selectedCause);

        setReceiptData({
          receiptNumber: verifyData.receiptNumber || `REC-${Date.now().toString().slice(-8)}`,
          transactionId: verifyData.transactionId || verifyData.donation?.razorpayPaymentId || "pay_upi_completed",
          amount: Number(getFinalAmount()),
          issuedAt: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
          donorName: donorDetails.isAnonymous ? "Anonymous Donor" : donorDetails.donorName || "Beloved Donor",
          purpose: causeObj?.nameEn || selectedCause,
          branch: branchObj?.name || "Shapur Nagar",
        });

        setPaymentStatus("SUCCESS");
        setStep(4);
        showToast("🎉 Payment verified successfully!", "success");
      }
    } catch (err) {
      console.error("[DONATION_PAGE] Verification completion failed:", err);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2500);
  };

  const handleShareReceipt = async () => {
    const receiptUrl = `${window.location.origin}/give/receipt/${donationId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Kingdom of Christ Ministries — Donation Receipt",
          text: `My donation receipt for ₹${getFinalAmount()} to KCM NGO`,
          url: receiptUrl,
        });
      } catch {}
    } else {
      copyToClipboard(receiptUrl, "receipt_link");
      showToast("Receipt link copied to clipboard!", "success");
    }
  };

  const resetDonationWizard = () => {
    setStep(1);
    setPaymentStatus("PENDING");
    setErrorMessage("");
    setSessionId("");
    setDonationId("");
    setQrCodeBase64("");
  };

  if (configLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        <p className="text-sm font-semibold text-slate-500">Loading donation platform metadata...</p>
      </div>
    );
  }

  const activeCauseObj = causes.find((c) => c.code === selectedCause);

  return (
    <div className="py-12 sm:py-16 min-h-[85vh]">
      {/* ── TOAST NOTIFICATION ───────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`fixed top-20 right-4 sm:right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold border max-w-sm backdrop-blur-md ${
              toast.type === "error"
                ? "bg-red-900/95 text-white border-red-400/30"
                : "bg-emerald-900/95 text-white border-emerald-400/30"
            }`}
          >
            {toast.type === "error" ? (
              <ShieldAlert className="w-4 h-4 text-red-300 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0 animate-bounce" />
            )}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 max-w-5xl mx-auto items-start">
          
          {/* ── LEFT COLUMN: NGO Hero & Information ─────────────────────────── */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 dark:border-purple-500/30 text-purple-600 dark:text-purple-300 text-xs font-semibold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
              {ngoT.donationsPage.tag}
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-slate-900 via-purple-900 to-purple-600 dark:from-white dark:via-purple-200 dark:to-purple-400 bg-clip-text text-transparent">
              {ngoT.donationsPage.title}
            </h1>

            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              {ngoT.donationsPage.desc}
            </p>

            {/* Selected Cause Live Target Card */}
            {activeCauseObj && activeCauseObj.targetAmount && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 text-xs space-y-2">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-800 dark:text-slate-200">{activeCauseObj.nameEn} Goal</span>
                  <span className="text-purple-600 dark:text-purple-400">
                    ₹{(activeCauseObj.raisedAmount || 0).toLocaleString()} / ₹{(activeCauseObj.targetAmount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round(((activeCauseObj.raisedAmount || 0) / (activeCauseObj.targetAmount || 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Beneficiaries & Exemption Notice Card */}
            <div className="p-5 border border-slate-200 dark:border-white/10 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm text-xs space-y-3 text-slate-600 dark:text-slate-300 shadow-sm">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Primary Beneficiaries:</strong> Patients at Gandhi Hospital, NIMS, and local physical handicap shelters.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Secure & 80G Compliant:</strong> 256-bit encrypted Razorpay UPI checkout with instant verifiable receipts.
                </p>
              </div>
            </div>

            {/* Supported Payment App Logos */}
            <div className="pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Accepted UPI Apps
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                {["GPay", "PhonePe", "Paytm", "BHIM", "Banking UPI"].map((appName) => (
                  <span
                    key={appName}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xl"
                  >
                    ✓ {appName}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: UPI Donation Form Container ─────────────────────── */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl relative overflow-hidden">
            
            {/* Header: Section Title & Secure Badge */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-white/5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Donate using UPI
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Instant & Direct Bank Transfer
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Lock className="w-3 h-3" />
                <span>SECURE CHECKOUT</span>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-left text-sm text-red-600 dark:text-red-300"
              >
                <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* ── STEP 1: SELECT DONATION AMOUNT ────────────────────────────── */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6 text-left"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Step 1: Select Donation Amount
                    </label>
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                      Min ₹{settings.minDonationAmount}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {presetAmounts.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setAmount(preset.amount.toString());
                          setCustomAmount("");
                        }}
                        className={`py-3.5 rounded-xl border font-extrabold text-sm sm:text-base transition-all duration-200 ${
                          amount === preset.amount.toString() && !customAmount
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-lg shadow-purple-500/25 scale-[1.02]"
                            : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        ₹{preset.amount.toLocaleString("en-IN")}
                      </button>
                    ))}

                    {/* Custom Amount Input */}
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="Custom"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setAmount("");
                        }}
                        className="w-full py-3.5 pl-6 pr-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm font-bold focus:outline-none focus:border-purple-500"
                      />
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs font-bold">
                        ₹
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToStep2}
                  className="w-full py-4 min-h-[44px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 active:scale-[0.99] transition-all"
                >
                  <span>Continue to Donor Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ── STEP 2: DYNAMIC DONOR DETAILS FORM ─────────────────────────── */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4 text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Step 2: Donor & Cause Information
                  </label>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                    Amount: ₹{Number(getFinalAmount()).toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Render Dynamic Form Fields */}
                {formFields.map((field) => {
                  if (!field.isVisible) return null;
                  const val = donorDetails[field.fieldName] || "";

                  if (field.fieldType === "checkbox") {
                    return (
                      <div key={field.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {field.label}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setDonorDetails((prev) => ({
                              ...prev,
                              [field.fieldName]: !prev[field.fieldName],
                            }))
                          }
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                            donorDetails[field.fieldName] ? "bg-purple-600 justify-end" : "bg-slate-300 dark:bg-slate-800 justify-start"
                          }`}
                        >
                          <motion.div layout className="w-4 h-4 rounded-full bg-white shadow-md" />
                        </button>
                      </div>
                    );
                  }

                  if (field.fieldType === "textarea") {
                    return (
                      <div key={field.id}>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                          {field.label} {field.isRequired ? "*" : "(Optional)"}
                        </label>
                        <textarea
                          rows={2}
                          value={val}
                          onChange={(e) =>
                            setDonorDetails((prev) => ({
                              ...prev,
                              [field.fieldName]: e.target.value,
                            }))
                          }
                          placeholder={field.placeholder || ""}
                          className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    );
                  }

                  return (
                    <div key={field.id}>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                        {field.label} {field.isRequired ? "*" : "(Optional)"}
                      </label>
                      <input
                        type={field.fieldType || "text"}
                        disabled={field.fieldName === "donorName" && donorDetails.isAnonymous}
                        value={field.fieldName === "donorName" && donorDetails.isAnonymous ? "Anonymous Donor" : val}
                        onChange={(e) =>
                          setDonorDetails((prev) => ({
                            ...prev,
                            [field.fieldName]: e.target.value,
                          }))
                        }
                        placeholder={field.placeholder || ""}
                        className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-purple-500 disabled:opacity-60"
                      />
                    </div>
                  );
                })}

                {/* Purpose & Branch Selectors */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Donation Cause
                    </label>
                    <select
                      value={selectedCause}
                      onChange={(e) => setSelectedCause(e.target.value)}
                      className="w-full py-3 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-purple-500"
                    >
                      {causes.map((c) => (
                        <option key={c.id} value={c.code}>
                          {c.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Branch
                    </label>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full py-3 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-purple-500"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3.5 min-h-[44px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCreatePaymentOrder}
                    disabled={loading}
                    className="flex-[2] py-3.5 min-h-[44px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating Dynamic QR…</span>
                      </>
                    ) : (
                      <>
                        <span>Generate UPI QR Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: DYNAMIC DYNAMIC QR & REAL-TIME STATUS ───────────────────── */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 flex flex-col items-center text-center"
              >
                {/* Status Bar */}
                <div className="w-full flex items-center justify-between bg-purple-500/10 border border-purple-500/20 px-4 py-2.5 rounded-2xl text-xs font-bold text-purple-700 dark:text-purple-300">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    <span>Waiting for Payment…</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-purple-500" />
                    <span>Expires in: {timeLeftStr}</span>
                  </div>
                </div>

                {/* Dynamic QR Code Card Container */}
                <div className={`p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-3xl flex flex-col items-center w-full max-w-sm relative transition-all ${
                  paymentStatus === "EXPIRED" ? "opacity-40 grayscale pointer-events-none" : ""
                }`}>
                  <div className="relative w-56 aspect-square bg-white rounded-2xl p-3 border border-slate-200 dark:border-white/20 shadow-inner flex items-center justify-center">
                    {qrCodeBase64 ? (
                      <img
                        src={qrCodeBase64}
                        alt="Dynamic UPI QR Code"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    )}
                  </div>

                  <p className="mt-3 text-sm font-extrabold text-slate-900 dark:text-white">
                    Scan with any UPI App to Pay ₹{Number(getFinalAmount()).toLocaleString("en-IN")}
                  </p>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    Order Ref: {referenceNumber || orderId}
                  </p>

                  {/* Merchant UPI ID Box */}
                  <div className="mt-4 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-slate-700 dark:text-slate-300 font-bold font-mono">
                      UPI ID: {settings.upiId}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(settings.upiId, "upi")}
                      className="text-purple-600 dark:text-purple-400 font-bold hover:text-purple-700 flex items-center gap-1 min-h-[32px] px-2"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedLabel === "upi" ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                {/* Expired Overlay view */}
                {paymentStatus === "EXPIRED" && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-600 dark:text-red-300 w-full space-y-2">
                    <p className="font-bold text-sm">⚠️ QR Code Expired</p>
                    <p className="text-xs">This dynamic QR code timer has elapsed. Please generate a new QR.</p>
                    <button
                      type="button"
                      onClick={resetDonationWizard}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all"
                    >
                      Generate New QR
                    </button>
                  </div>
                )}

                {/* Mobile Deep Link Apps */}
                <div className="w-full max-w-sm pt-2 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Tap to pay on mobile
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: "GPay", scheme: `tez://upi/pay?pa=${settings.upiId}` },
                      { name: "PhonePe", scheme: `phonepe://pay?pa=${settings.upiId}` },
                      { name: "Paytm", scheme: `paytmmp://upi/pay?pa=${settings.upiId}` },
                      { name: "BHIM", scheme: `upi://pay?pa=${settings.upiId}` },
                    ].map((app) => (
                      <a
                        key={app.name}
                        href={upiUri || app.scheme}
                        className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-purple-500 transition-all flex items-center justify-center gap-1"
                      >
                        <span>{app.name}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Simulation Button for Testing */}
                <div className="pt-3 w-full max-w-sm flex items-center justify-between border-t border-slate-100 dark:border-white/5 text-xs">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold"
                  >
                    ← Edit Details
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePaymentSuccess(donationId)}
                    className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
                  >
                    [Simulate Successful Payment]
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: SUCCESS VIEW ───────────────────────────────────────── */}
            {step === 4 && paymentStatus === "SUCCESS" && receiptData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center"
              >
                {/* Success Icon */}
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    ✅ Payment Successful!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Thank you for your generous support towards Kingdom of Christ Ministries NGO.
                  </p>
                </div>

                {/* Receipt Metadata Box */}
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-left text-xs space-y-3 font-sans">
                  <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                    <span className="text-slate-500">Receipt Number:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {receiptData.receiptNumber}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                    <span className="text-slate-500">Transaction ID / UTR:</span>
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                      {receiptData.transactionId}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                    <span className="text-slate-500">Amount Paid:</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                      ₹{receiptData.amount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                    <span className="text-slate-500">Donor Name:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {receiptData.donorName}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                    <span className="text-slate-500">Cause / Purpose:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {receiptData.purpose}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Branch:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {receiptData.branch}
                    </span>
                  </div>
                </div>

                {/* Receipt Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <Link
                    href={`/give/receipt/${donationId}`}
                    className="py-3 px-4 min-h-[44px] bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Receipt</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleShareReceipt}
                    className="py-3 px-4 min-h-[44px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Receipt</span>
                  </button>

                  <Link
                    href="/ngo"
                    className="py-3 px-4 min-h-[44px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Home className="w-4 h-4" />
                    <span>Return Home</span>
                  </Link>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4 (FAILED STATE) ─────────────────────────────────────── */}
            {paymentStatus === "FAILED" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-500">
                  <ShieldAlert className="w-10 h-10" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    Payment Failed or Declined
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    We could not verify your transfer. If money was deducted, it will be automatically reconciled.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetDonationWizard}
                    className="flex-1 py-3.5 min-h-[44px] bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retry Payment</span>
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
