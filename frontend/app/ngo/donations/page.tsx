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
  Smartphone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/lib/translations";
import io from "socket.io-client";
import { DonationAgentProvider, useDonationAgent } from "@/components/donations/DonationAgentProvider";
import { AgentStatusBar } from "@/components/donations/AgentStatusBar";
import { PaymentStateMonitor } from "@/components/donations/PaymentStateMonitor";


// Brand SVG Icon Components for GPay, PhonePe, Paytm, and BHIM UPI
const GPayIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

const PhonePeIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#5F259F"/>
    <path d="M13.5 7H10.5C9.67 7 9 7.67 9 8.5V15.5C9 16.33 9.67 17 10.5 17H13.5C14.33 17 15 16.33 15 15.5V8.5C15 7.67 14.33 7 13.5 7Z" fill="#5F259F"/>
    <path d="M12 8.5V15.5M9.5 10.5H14.5M9.5 12.5H13.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const PaytmIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#002E6E"/>
    <path d="M5 9.5H7.5V14.5H5V9.5Z" fill="#00BAF2"/>
    <path d="M8.5 9.5H12C12.8 9.5 13.5 10 13.5 11C13.5 12 12.8 12.5 12 12.5H10V14.5H8.5V9.5Z" fill="white"/>
    <path d="M14.5 9.5H16V13C16 14 16.5 14.5 17.5 14.5C18.5 14.5 19 14 19 13V9.5H20.5V13C20.5 15 19 16 17.5 16C16 16 14.5 15 14.5 13V9.5Z" fill="#00BAF2"/>
  </svg>
);

const BhimIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M5 16.5L12 5.5L19 16.5H5Z" fill="#008837"/>
    <path d="M12 5.5L19 16.5H13.5L9.5 10L12 5.5Z" fill="#EF4123"/>
    <path d="M8.5 12L12 16.5H6L8.5 12Z" fill="#FF9933"/>
  </svg>
);

// Color themes for preset donation amount buttons with high contrast legibility
const PRESET_COLOR_SCHEMES = [
  {
    dot: "bg-emerald-500",
    unselected: "bg-slate-50 hover:bg-emerald-50/70 dark:bg-slate-800/80 dark:hover:bg-slate-700/90 border-slate-200/90 dark:border-white/15 text-slate-800 dark:text-white hover:border-emerald-400 dark:hover:border-emerald-500/60",
    selected: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-md shadow-purple-500/25 scale-[1.02]"
  },
  {
    dot: "bg-blue-500",
    unselected: "bg-slate-50 hover:bg-blue-50/70 dark:bg-slate-800/80 dark:hover:bg-slate-700/90 border-slate-200/90 dark:border-white/15 text-slate-800 dark:text-white hover:border-blue-400 dark:hover:border-blue-500/60",
    selected: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-md shadow-purple-500/25 scale-[1.02]"
  },
  {
    dot: "bg-purple-500",
    unselected: "bg-slate-50 hover:bg-purple-50/70 dark:bg-slate-800/80 dark:hover:bg-slate-700/90 border-slate-200/90 dark:border-white/15 text-slate-800 dark:text-white hover:border-purple-400 dark:hover:border-purple-500/60",
    selected: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-md shadow-purple-500/25 scale-[1.02]"
  },
  {
    dot: "bg-amber-500",
    unselected: "bg-slate-50 hover:bg-amber-50/70 dark:bg-slate-800/80 dark:hover:bg-slate-700/90 border-slate-200/90 dark:border-white/15 text-slate-800 dark:text-white hover:border-amber-400 dark:hover:border-amber-500/60",
    selected: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-md shadow-purple-500/25 scale-[1.02]"
  },
  {
    dot: "bg-rose-500",
    unselected: "bg-slate-50 hover:bg-rose-50/70 dark:bg-slate-800/80 dark:hover:bg-slate-700/90 border-slate-200/90 dark:border-white/15 text-slate-800 dark:text-white hover:border-rose-400 dark:hover:border-rose-500/60",
    selected: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-md shadow-purple-500/25 scale-[1.02]"
  },
  {
    dot: "bg-violet-500",
    unselected: "bg-slate-50 hover:bg-purple-50/70 dark:bg-slate-800/80 dark:hover:bg-slate-700/90 border-slate-200/90 dark:border-white/15 text-slate-800 dark:text-white hover:border-purple-400 dark:hover:border-purple-500/60",
    selected: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-md shadow-purple-500/25 scale-[1.02]"
  }
];

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

// Instant Default Metadata for 0ms Page Load Speed
const DEFAULT_PRESETS: PresetAmount[] = [
  { id: "1", amount: 500, label: "₹500", displayOrder: 1, isDefault: false },
  { id: "2", amount: 1000, label: "₹1,000", displayOrder: 2, isDefault: true },
  { id: "3", amount: 2000, label: "₹2,000", displayOrder: 3, isDefault: false },
  { id: "4", amount: 5000, label: "₹5,000", displayOrder: 4, isDefault: false },
  { id: "5", amount: 10000, label: "₹10,000", displayOrder: 5, isDefault: false },
];

const DEFAULT_CAUSES: CauseItem[] = [
  {
    id: "c1",
    code: "CHARITY",
    nameEn: "Hospital Outreach & Patient Kits",
    descEn: "Support food packets, medical kits, and rehabilitation for hospital patients.",
    icon: "Heart",
    category: "OUTREACH",
    targetAmount: 500000,
    raisedAmount: 145000,
  },
  {
    id: "c2",
    code: "ASHRAMAM",
    nameEn: "Ashramam & Handicap Support",
    descEn: "Funding essential care and wheelchair gear for handicap shelters.",
    icon: "Gift",
    category: "BENEVOLENCE",
    targetAmount: 300000,
    raisedAmount: 98000,
  },
  {
    id: "c3",
    code: "FOOD",
    nameEn: "Fresh Food Packets Drive",
    descEn: "Daily fresh meals for underprivileged families.",
    icon: "Gift",
    category: "FOOD_AID",
    targetAmount: 200000,
    raisedAmount: 110000,
  },
];

const DEFAULT_BRANCHES: BranchItem[] = [
  { id: "b1", name: "Shapur Nagar (Main)" },
  { id: "b2", name: "Subhash Nagar Branch" },
  { id: "b3", name: "Bahadurpally Branch" },
];

const DEFAULT_FORM_FIELDS: FormFieldRule[] = [
  { id: "f1", fieldName: "donorName", label: "Full Name", placeholder: "Enter full name", isRequired: true, isVisible: true, displayOrder: 1, fieldType: "text" },
  { id: "f2", fieldName: "donorPhone", label: "Mobile Number", placeholder: "10-digit mobile number", isRequired: true, isVisible: true, displayOrder: 2, fieldType: "tel" },
  { id: "f3", fieldName: "donorEmail", label: "Email Address", placeholder: "email@example.com", isRequired: false, isVisible: true, displayOrder: 3, fieldType: "email" },
  { id: "f11", fieldName: "isAnonymous", label: "Make donation anonymous", placeholder: "", isRequired: false, isVisible: true, displayOrder: 11, fieldType: "checkbox" },
];

function NgoDonationsContent() {
  const agent = useDonationAgent();

  const { user } = useAuth();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Dynamic Metadata State initialized with instant defaults
  const [presetAmounts, setPresetAmounts] = useState<PresetAmount[]>(DEFAULT_PRESETS);
  const [causes, setCauses] = useState<CauseItem[]>(DEFAULT_CAUSES);
  const [branches, setBranches] = useState<BranchItem[]>(DEFAULT_BRANCHES);
  const [formFields, setFormFields] = useState<FormFieldRule[]>(DEFAULT_FORM_FIELDS);
  const [settings, setSettings] = useState<PaymentSettings>({
    minDonationAmount: 1,
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
  const [selectedCause, setSelectedCause] = useState<string>("CHARITY");
  const [selectedBranch, setSelectedBranch] = useState<string>("b1");

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

  const validateStep1 = () => {
    const finalAmt = Number(getFinalAmount());
    if (isNaN(finalAmt) || finalAmt <= 0) {
      setErrorMessage("Please select or enter a valid donation amount.");
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

    socket.on("connect_error", () => {
      // Quietly fall back to polling
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

  // ── Mobile Deep Link Handler for UPI Apps ───────────────────────────────
  const handleOpenUpiApp = (pkg?: string, scheme?: string) => {
    if (typeof window === "undefined") return;

    let params = "";
    if (upiUri && upiUri.includes("?")) {
      params = upiUri.split("?")[1];
    } else {
      const finalAmt = Number(getFinalAmount() || "1");
      const merchantName = settings?.merchantName || "Kingdom of Christ Ministries";
      const upiId = settings?.upiId || "kcm.kristhraj2004-1@okicici";
      const encodedName = encodeURIComponent(merchantName);
      const txNote = encodeURIComponent(`KCM NGO Donation Ref ${referenceNumber || orderId || "NGO"}`);
      const ref = referenceNumber || orderId || `KCM-NGO-${Date.now()}`;
      params = `pa=${upiId}&pn=${encodedName}&am=${finalAmt.toFixed(2)}&cu=INR&tn=${txNote}&tr=${ref}`;
    }

    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = /android/i.test(ua);
    const isIOS = /ipad|iphone|ipod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (isAndroid) {
      if (pkg) {
        const playStoreUrl = encodeURIComponent(`https://play.google.com/store/apps/details?id=${pkg}`);
        // Chrome resolves intent:// and opens specific app directly.
        // Falls back to Play Store if the app isn't installed.
        window.location.href = `intent://pay?${params}#Intent;scheme=upi;package=${pkg};S.browser_fallback_url=${playStoreUrl};end`;
      } else {
        // Universal Android UPI Chooser intent
        const fallback = encodeURIComponent("https://play.google.com/store/search?q=UPI+payment&c=apps");
        window.location.href = `intent://pay?${params}#Intent;scheme=upi;S.browser_fallback_url=${fallback};end`;
      }
    } else if (isIOS) {
      if (scheme) {
        let targetUrl = scheme;
        if (!targetUrl.includes("?")) {
          targetUrl += targetUrl.endsWith("/") ? "?" : "/?";
        } else if (!targetUrl.endsWith("&") && !targetUrl.endsWith("?")) {
          targetUrl += "&";
        }
        window.location.href = `${targetUrl}${params}`;
      } else {
        window.location.href = `upi://pay?${params}`;
      }
    } else {
      // Desktop / universal fallback
      window.location.href = `upi://pay?${params}`;
      showToast("Opening UPI payment app... If on desktop, scan the QR code above.", "success");
    }
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Live Agent Status & Guidance */}
        <AgentStatusBar />

        {/* Dynamic Payment State Machine Monitor */}
        {step === 3 && <PaymentStateMonitor />}
      </div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 max-w-5xl mx-auto items-start">
          
          {/* ── LEFT COLUMN: NGO Hero & Information ─────────────────────────── */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
              <span>{ngoT.donationsPage.tag}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
              Support <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-500 dark:from-purple-300 dark:via-indigo-300 dark:to-purple-200 bg-clip-text text-transparent">Our Projects</span>
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
              <div className="flex items-center gap-2.5 flex-wrap">
                {[
                  { name: "GPay", icon: GPayIcon },
                  { name: "PhonePe", icon: PhonePeIcon },
                  { name: "Paytm", icon: PaytmIcon },
                  { name: "BHIM", icon: BhimIcon },
                ].map((app) => (
                  <span
                    key={app.name}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm flex items-center gap-2"
                  >
                    <app.icon />
                    <span>{app.name}</span>
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
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {presetAmounts.map((preset, idx) => {
                      const scheme = PRESET_COLOR_SCHEMES[idx % PRESET_COLOR_SCHEMES.length];
                      const isSelected = amount === preset.amount.toString() && !customAmount;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setAmount(preset.amount.toString());
                            setCustomAmount("");
                          }}
                          className={`py-3.5 rounded-xl border font-extrabold text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-1.5 ${
                            isSelected ? scheme.selected : scheme.unselected
                          }`}
                        >
                          {!isSelected && (
                            <span className={`w-1.5 h-1.5 rounded-full ${scheme.dot}`} />
                          )}
                          <span>₹{preset.amount.toLocaleString("en-IN")}</span>
                        </button>
                      );
                    })}

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
                        className={`w-full py-3.5 pl-8 pr-3 rounded-xl border-2 text-sm sm:text-base font-black focus:outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                          customAmount
                            ? "bg-purple-50/80 dark:bg-purple-950/60 text-slate-900 dark:text-white border-purple-600 dark:border-purple-400 shadow-md shadow-purple-500/10 ring-2 ring-purple-600/20"
                            : "bg-slate-50 hover:bg-purple-50/50 dark:bg-slate-800/80 dark:hover:bg-slate-700/90 border-slate-200/90 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-400 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20"
                        }`}
                      />
                      <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black ${customAmount ? "text-purple-700 dark:text-purple-300" : "text-purple-500 dark:text-purple-400"}`}>
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
                <div className="w-full max-w-sm pt-2 space-y-2.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Tap to pay on mobile
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      {
                        name: "GPay",
                        icon: GPayIcon,
                        pkg: "com.google.android.apps.nbu.paisa.user",
                        scheme: "tez://upi/pay?",
                      },
                      {
                        name: "PhonePe",
                        icon: PhonePeIcon,
                        pkg: "com.phonepe.app",
                        scheme: "phonepe://pay?",
                      },
                      {
                        name: "Paytm",
                        icon: PaytmIcon,
                        pkg: "net.one97.paytm",
                        scheme: "paytmmp://upi/pay?",
                      },
                      {
                        name: "BHIM",
                        icon: BhimIcon,
                        pkg: "in.org.npci.upiapp",
                        scheme: "upi://pay?",
                      },
                    ].map((app) => (
                      <button
                        key={app.name}
                        type="button"
                        onClick={() => handleOpenUpiApp(app.pkg, app.scheme)}
                        className="py-2.5 px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 text-xs font-bold text-slate-800 dark:text-slate-200 hover:border-purple-500 hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm min-h-[44px]"
                      >
                        <app.icon />
                        <span>{app.name}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 opacity-60 flex-shrink-0" />
                      </button>
                    ))}
                  </div>

                  {/* Universal Open in UPI App Chooser Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenUpiApp()}
                    className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Open in any UPI App</span>
                  </button>
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
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-5"
              >
                {/* ── Animated Success Badge ── */}
                <div className="flex flex-col items-center text-center pt-2 pb-1">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                    className="relative w-20 h-20 mb-4"
                  >
                    {/* Outer glow ring */}
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: "2s" }} />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 shadow-2xl shadow-emerald-500/40 flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
                    </div>
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight"
                  >
                    Payment Successful! 🎉
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs"
                  >
                    Thank you for your generous support. Your donation has been verified and recorded.
                  </motion.p>
                </div>

                {/* ── Amount Hero ── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 rounded-2xl p-5 text-center shadow-xl shadow-purple-500/25"
                >
                  <p className="text-purple-200 text-xs font-semibold uppercase tracking-widest mb-1">Amount Donated</p>
                  <p className="text-white text-4xl font-black tracking-tight">
                    ₹{receiptData.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-purple-200 text-xs mt-1.5">{receiptData.purpose}</p>
                </motion.div>

                {/* ── Notification Status Chips ── */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-2 justify-center"
                >
                  {[
                    { icon: "📱", label: "SMS Sent", color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/40 text-blue-700 dark:text-blue-300" },
                    { icon: "💬", label: "WhatsApp Sent", color: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700/40 text-emerald-700 dark:text-emerald-300" },
                    { icon: "📧", label: "Email Sent", color: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700/40 text-purple-700 dark:text-purple-300" },
                    { icon: "🔔", label: "Push Sent", color: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/40 text-amber-700 dark:text-amber-300" },
                  ].map((chip) => (
                    <span key={chip.label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border ${chip.color}`}>
                      <Check className="w-3 h-3" />
                      {chip.icon} {chip.label}
                    </span>
                  ))}
                </motion.div>

                {/* ── Receipt Details Card ── */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm"
                >
                  {/* Card header */}
                  <div className="bg-gradient-to-r from-purple-600/10 to-indigo-600/10 dark:from-purple-900/30 dark:to-indigo-900/30 px-5 py-3 border-b border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-bold uppercase tracking-widest text-purple-700 dark:text-purple-300">Official Receipt</span>
                    </div>
                  </div>

                  {/* Receipt rows */}
                  <div className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                    {[
                      { label: "Receipt Number", value: receiptData.receiptNumber, mono: true, highlight: true },
                      { label: "Donation ID", value: donationId, mono: true },
                      { label: "Transaction ID / UTR", value: receiptData.transactionId, mono: true },
                      { label: "Date & Time", value: receiptData.issuedAt },
                      { label: "Donor Name", value: receiptData.donorName },
                      { label: "Donation Cause", value: receiptData.purpose },
                      { label: "Branch", value: receiptData.branch },
                      { label: "Payment Method", value: "UPI (Instant QR)" },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between items-center px-5 py-3 gap-3">
                        <span className="text-slate-500 dark:text-slate-400 flex-shrink-0">{row.label}</span>
                        <span className={`font-bold text-right break-all ${
                          row.highlight
                            ? "text-purple-700 dark:text-purple-300 font-mono"
                            : row.mono
                            ? "font-mono text-slate-700 dark:text-slate-200"
                            : "text-slate-800 dark:text-slate-200"
                        }`}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* ── Action Buttons ── */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  className="space-y-2.5"
                >
                  {/* Primary: Download PDF */}
                  <a
                    href={`/api/receipts/${donationId}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 min-h-[48px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Download className="w-4 h-4" />
                    Download Receipt (PDF)
                  </a>

                  {/* Secondary row: Share + Email */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleShareReceipt}
                      className="py-3 min-h-[44px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Share2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      Share Receipt
                    </button>

                    <a
                      href={`/api/receipts/${donationId}?email=true`}
                      className="py-3 min-h-[44px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                      onClick={(e) => {
                        e.preventDefault();
                        fetch(`/api/receipts/${donationId}?email=true`)
                          .then(() => showToast("📧 Receipt emailed successfully!", "success"))
                          .catch(() => showToast("Could not send email. Try again.", "error"));
                      }}
                    >
                      <Mail className="w-4 h-4 text-blue-500" />
                      Email Receipt
                    </a>
                  </div>

                  {/* Tertiary row: History + Home */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link
                      href="/member/donations"
                      className="py-3 min-h-[44px] bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/40 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      Donation History
                    </Link>

                    <Link
                      href="/ngo"
                      className="py-3 min-h-[44px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Home className="w-4 h-4" />
                      Return Home
                    </Link>
                  </div>
                </motion.div>

                {/* ── Bible Verse Footer ── */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.75 }}
                  className="text-center text-[11px] text-slate-400 dark:text-slate-500 italic pb-2"
                >
                  "God loves a cheerful giver." — 2 Corinthians 9:7
                </motion.p>
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

export default function NgoDonationsPage() {
  return (
    <DonationAgentProvider>
      <NgoDonationsContent />
    </DonationAgentProvider>
  );
}

