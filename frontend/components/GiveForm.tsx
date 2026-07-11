"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Building, 
  Smartphone, 
  Heart, 
  Check, 
  ArrowRight, 
  Lock, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  IndianRupee,
  Globe,
  Gift,
  PlusCircle,
  Copy,
  CheckCircle2,
  ShieldAlert,
  ExternalLink,
  Activity,
  RefreshCw,
  Receipt,
  QrCode,
  ArrowLeft,
  CheckCircle,
  Clock
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client";

interface PurposeItem {
  id: string;
  code: string;
  nameEn: string;
  nameTe: string;
  nameHi: string;
  descEn: string;
  descTe: string | null;
  descHi: string | null;
}

interface BranchItem {
  id: string;
  name: string;
}

interface GiveFormProps {
  initialPurposes?: PurposeItem[];
  initialBranches?: BranchItem[];
}

export default function GiveForm({ initialPurposes = [], initialBranches = [] }: GiveFormProps) {
  const { language, t } = useLanguage();
  const { user, getIdToken } = useAuth();
  const pathname = usePathname() || "";
  const isPortalRoute = pathname.startsWith("/member");

  // Steps: 1 = Enter Details, 2 = Scan & Pay
  const [step, setStep] = useState(1);
  
  // Dynamic Lists loaded from DB
  const [purposes, setPurposes] = useState<PurposeItem[]>(initialPurposes);
  const [branches, setBranches] = useState<BranchItem[]>(initialBranches);
  const [loadingLists, setLoadingLists] = useState(initialPurposes.length === 0 || initialBranches.length === 0);

  // Form Inputs
  const [amount, setAmount] = useState<string>("1000");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedPurpose, setSelectedPurpose] = useState<string>(
    initialPurposes.length > 0 ? initialPurposes[0].code : "TITHE"
  );
  const [selectedBranch, setSelectedBranch] = useState<string>(
    initialBranches.length > 0 ? initialBranches[0].id : ""
  );
  const [donorName, setDonorName] = useState<string>("");
  const [donorEmail, setDonorEmail] = useState<string>("");
  const [donorPhone, setDonorPhone] = useState<string>("");

  // Payment Session State
  const [sessionId, setSessionId] = useState<string>("");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [upiUri, setUpiUri] = useState<string>("");
  const [upiId, setUpiId] = useState<string>("kcm.kristhraj2004-1@okicici");
  const [churchName, setChurchName] = useState<string>("Kingdom of Christ Ministries");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Statuses
  const [actionLoading, setActionLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // History sync
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [lastHistorySynced, setLastHistorySynced] = useState<Date | null>(null);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string } | null>(null);
  
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<any>(null);

  // Prevent SSR mismatch
  useEffect(() => { setMounted(true); }, []);

  const showToast = (msg: string) => {
    setToast({ msg });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Fetch Purposes and Branches on Mount
  useEffect(() => {
    if (!mounted) return;

    // Skip client-side fetch if initial lists are already populated via SSR
    if (initialPurposes.length > 0 && initialBranches.length > 0) {
      setLoadingLists(false);
      return;
    }

    async function loadFormMetadata() {
      try {
        const [purposesRes, branchesRes] = await Promise.all([
          fetch("/api/donations/purposes"),
          fetch("/api/branches")
        ]);

        if (purposesRes.ok) {
          const purposesData = await purposesRes.json();
          if (purposesData.success) {
            setPurposes(purposesData.purposes);
            if (purposesData.purposes.length > 0) {
              setSelectedPurpose(purposesData.purposes[0].code);
            }
          }
        }

        if (branchesRes.ok) {
          const branchesData = await branchesRes.json();
          if (branchesData.success) {
            setBranches(branchesData.branches);
            if (branchesData.branches.length > 0) {
              setSelectedBranch(branchesData.branches[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load giving form configuration details:", err);
      } finally {
        setLoadingLists(false);
      }
    }

    loadFormMetadata();
  }, [mounted, initialPurposes, initialBranches]);

  // 2. Fetch Logged-in User Profile to Prefill Form
  useEffect(() => {
    if (!mounted || !user) return;

    // Prefill immediately from current auth context to avoid layout shifting
    setDonorName((prev) => prev || user.name || "");
    setDonorEmail((prev) => prev || user.email || "");

    const currentUserId = user.uid;
    const currentUserName = user.name || "";
    const currentUserEmail = user.email || "";

    async function fetchUserProfile() {
      try {
        const res = await fetch(`/api/member/profile?userId=${currentUserId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setDonorName(data.user.name || "");
            setDonorEmail(data.user.email || "");
            setDonorPhone(data.user.phone || "");
          }
        }
      } catch (err) {
        // Fallback to basic auth user info
        setDonorName(currentUserName);
        setDonorEmail(currentUserEmail);
      }
    }

    fetchUserProfile();
  }, [mounted, user]);

  // 3. Load giving history
  const loadHistory = useCallback(async (silent = false) => {
    if (!user?.uid) return;
    if (!silent) setHistoryLoading(true);
    try {
      const res = await fetch(`/api/donations/history?userId=${user.uid}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setHistory(data.donations || []);
          setLastHistorySynced(new Date());
        }
      }
    } catch (err) {
      console.error("Failed to load giving history", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      loadHistory();
    }
  }, [user, loadHistory]);

  // QR Code Expiration Countdown Timer
  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const difference = expiresAt.getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft("EXPIRED");
        setErrorMessage("Payment QR code has expired. Please restart the donation.");
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }

      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [expiresAt]);

  // 4. Polling Fallback status check
  const startStatusPolling = useCallback((sid: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const token = getIdToken ? await getIdToken() : null;
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`/api/donations/status/${sid}`, {
          headers
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.status === "COMPLETED") {
            // Success! Stop polling & redirect to receipt
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            window.location.href = `/give/receipt/${data.donationId}`;
          }
        }
      } catch (err) {
        console.warn("Status polling error:", err);
      }
    }, 5000);
  }, [getIdToken]);

  // 5. Connect Socket.IO for real-time success listener
  const connectSocket = useCallback((sid: string) => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[PAYMENT_SOCKET] Connected to realtime gateway room.");
      // Join targeted room
      socket.emit("join", `member:${user?.uid || "guest"}`);
    });

    // Listen for verified payment
    socket.on("donation.success", (data: any) => {
      if (data.sessionId === sid || data.referenceNumber === referenceNumber) {
        showToast("Payment verified! Redirecting...");
        setTimeout(() => {
          window.location.href = `/give/receipt/${data.donationId}`;
        }, 1000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, referenceNumber]);

  // Cleanup connections
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const getFinalAmount = () => customAmount ? customAmount : amount;

  const validateDetails = () => {
    const finalAmt = getFinalAmount();
    if (!finalAmt || isNaN(Number(finalAmt)) || Number(finalAmt) <= 0) {
      setErrorMessage("Please enter a valid donation amount.");
      return false;
    }
    if (!donorName.trim()) {
      setErrorMessage("Please enter your name.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!donorEmail || !emailRegex.test(donorEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  // Generate Donation Session + Dynamic UPI QR Code
  const handleGeneratePaymentSession = async () => {
    if (!validateDetails()) return;
    setActionLoading(true);
    setErrorMessage("");

    try {
      const token = getIdToken ? await getIdToken() : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Step A: Create Secure Session
      const sessionRes = await fetch("/api/donations/session", {
        method: "POST",
        headers,
        body: JSON.stringify({
          amount: Number(getFinalAmount()),
          purposeCode: selectedPurpose,
          branchId: selectedBranch || null,
          donorName,
          donorEmail,
          donorPhone: donorPhone || null,
        }),
      });

      const sessionData = await sessionRes.json();
      if (!sessionRes.ok || !sessionData.success) {
        throw new Error(sessionData.error || "Failed to initialize payment session.");
      }

      const sid = sessionData.session.id;
      setSessionId(sid);
      setReferenceNumber(sessionData.session.referenceNumber);
      setExpiresAt(new Date(sessionData.session.expiresAt));

      // Step B: Generate Dynamic UPI QR Code for this session
      const qrRes = await fetch("/api/donations/generate-qr", {
        method: "POST",
        headers,
        body: JSON.stringify({ sessionId: sid }),
      });

      const qrData = await qrRes.json();
      if (!qrRes.ok || !qrData.success) {
        throw new Error(qrData.error || "Failed to generate dynamic QR code.");
      }

      setQrCodeData(qrData.qrCode);
      setUpiUri(qrData.upiUri);
      setUpiId(qrData.upiId);
      setChurchName(qrData.churchName);

      // Transition to QR step
      setStep(2);

      // Start socket connection and polling fallback
      connectSocket(sid);
      startStatusPolling(sid);
    } catch (err: any) {
      console.error("Payment session generation failed:", err);
      setErrorMessage(err.message || "Failed to connect with payment gateway. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Manual payment verification query fallback
  const handleVerifyPayment = async () => {
    setVerificationLoading(true);
    setErrorMessage("");

    try {
      const token = getIdToken ? await getIdToken() : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers,
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Manual verification query returned unpaid.");
      }

      window.location.href = `/give/receipt/${data.donation.id}`;
    } catch (err: any) {
      console.error("Manual verification error:", err);
      setErrorMessage(err.message || "We could not verify your transfer immediately. Please double check that you completed the transaction in your app, wait a few seconds and try again.");
    } finally {
      setVerificationLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2500);
  };

  const openPaymentApp = (appUrl: string, storeFallback: string) => {
    window.location.href = appUrl;
    setTimeout(() => {
      if (!document.hidden) {
        window.location.href = storeFallback;
      }
    }, 1800);
  };

  const activePurposeObj = purposes.find((p) => p.code === selectedPurpose);
  const getLanguagePurposeName = (p: PurposeItem) => {
    if (language === 'te' && p.nameTe) return p.nameTe;
    if (language === 'hi' && p.nameHi) return p.nameHi;
    return p.nameEn;
  };
  const getLanguagePurposeDesc = (p: PurposeItem) => {
    if (language === 'te' && p.descTe) return p.descTe;
    if (language === 'hi' && p.descHi) return p.descHi;
    return p.descEn;
  };

  if (!mounted) return null;

  return (
    <>
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-20 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-semibold border bg-purple-900 text-white border-purple-400/30 max-w-sm"
          >
            <Activity className="w-4 h-4 text-purple-200 animate-bounce" />
            <div>{toast.msg}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <section className="relative py-24 bg-gradient-to-br from-gradient-start via-slate-950 to-gradient-end overflow-hidden border-b border-gray-250 dark:border-gray-800/40">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(var(--primary))]/20 rounded-full filter blur-3xl opacity-20 transform translate-x-20 -translate-y-20 animate-pulse pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm mb-6 shadow-sm"
            >
              <Heart className="h-4 w-4 text-pink-350 animate-pulse" />
              <span className="font-medium tracking-wide">
                {language === 'te' ? 'దాతృత్వము' : language === 'hi' ? 'उदार दान' : 'Generous Giving'}
              </span>
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight font-heading"
            >
              {t.pages.give.title}
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed font-medium"
            >
              {t.pages.give.subtitle}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Main Interactive Grid */}
      <section className="py-20 -mt-10 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loadingLists ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
              <p className="text-gray-500 font-semibold">{language === 'te' ? 'కానుక ఎంపికలను లోడ్ చేస్తోంది...' : language === 'hi' ? 'दान विकल्प लोड हो रहे हैं...' : 'Loading giving options...'}</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-6 lg:gap-12 max-w-6xl mx-auto items-start">
              
              {/* Left Column: Instant UPI payment card */}
              <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-4 sm:p-8 border border-gray-100 dark:border-gray-700/50">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      {language === 'te' ? 'తక్షణ UPI కానుక' : language === 'hi' ? 'त्वरित यूपीआई दान' : 'Instant UPI Giving'}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
                      {language === 'te' ? 'డైనమిక్ QR కోడ్‌లను ఉపయోగించి సురక్షితమైన నిజ-సమయ బ్యాంక్ బదిలీలు' : language === 'hi' ? 'डायनेमिक क्यूआर कोड का उपयोग करके सुरक्षित वास्तविक समय बैंक ट्रांसफर' : 'Secure real-time bank transfers using dynamic QR codes'}
                    </p>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/30 px-2.5 py-1 rounded-full text-purple-700 dark:text-purple-400 text-[10px] sm:text-xs font-semibold">
                      <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      Secure Session
                    </div>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center gap-2 mb-8">
                  <div className={`h-2 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-purple-600' : 'bg-gray-200'}`} />
                  <div className={`h-2 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'}`} />
                </div>

                {/* Error messages */}
                {errorMessage && (
                  <div className="mb-6 p-4 bg-red-55 dark:bg-red-950/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 text-sm rounded-lg flex items-start gap-2">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    // STEP 1: Enter Details
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Amount presets */}
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-bold mb-3">
                          {t.pages.give.presetsTitle}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {["500", "1000", "2500", "5000", "10000"].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => {
                                setAmount(preset);
                                setCustomAmount("");
                              }}
                              className={`py-3.5 px-4 rounded-xl border text-center font-bold text-lg transition-all ${
                                preset === "10000" ? "col-span-2 sm:col-span-1" : ""
                              } ${
                                amount === preset && !customAmount
                                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 border-transparent text-white shadow-lg shadow-purple-600/20"
                                  : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
                            >
                              ₹{preset}
                            </button>
                          ))}
                          <div className="relative col-span-2 sm:col-span-1">
                            <input
                              type="number"
                              placeholder={t.pages.give.customPlaceholder}
                              value={customAmount}
                              onChange={(e) => {
                                setCustomAmount(e.target.value);
                                setAmount("");
                              }}
                              className={`w-full py-3.5 px-3 sm:px-4 pl-6 sm:pl-8 rounded-xl border font-bold text-sm sm:text-lg bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all ${
                                customAmount 
                                  ? "border-purple-600 ring-2 ring-purple-600/20" 
                                  : "border-gray-200 dark:border-gray-700"
                              }`}
                            />
                            <span className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm sm:text-lg">₹</span>
                          </div>
                        </div>
                      </div>

                      {/* Purpose selector */}
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-bold mb-3">
                          {t.pages.give.purposeLabel}
                        </label>
                        <div className="grid md:grid-cols-2 gap-3">
                          {purposes.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setSelectedPurpose(p.code)}
                              className={`p-4 rounded-xl border text-left cursor-pointer select-none transition-all flex items-start gap-3 w-full ${
                                selectedPurpose === p.code
                                  ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/20 ring-2 ring-purple-600/25"
                                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                              }`}
                            >
                              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900 mt-0.5">
                                <IndianRupee className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <span className="block font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                                  {getLanguagePurposeName(p)}
                                </span>
                                <span className="block text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                                  {getLanguagePurposeDesc(p)}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Branch selector */}
                      <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-bold mb-3">
                          {language === 'te' ? 'చర్చి బ్రాంచ్' : language === 'hi' ? 'चर्च शाखा' : 'Church Branch'}
                        </label>
                        <select
                          value={selectedBranch}
                          onChange={(e) => setSelectedBranch(e.target.value)}
                          className="w-full py-3.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-none font-semibold"
                        >
                          {branches.map((b) => (
                            <option key={b.id} value={b.id}>
                              ⛪ {b.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Donor Contact info */}
                      <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">
                          {t.pages.give.contactTitle}
                        </h3>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                              {t.pages.give.fullNameLabel}
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder={t.pages.give.fullNamePlaceholder}
                                value={donorName}
                                onChange={(e) => setDonorName(e.target.value)}
                                className="w-full py-3 px-4 pl-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                              />
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                              {t.pages.give.emailLabel}
                            </label>
                            <div className="relative">
                              <input
                                type="email"
                                placeholder={t.pages.give.emailPlaceholder}
                                value={donorEmail}
                                onChange={(e) => setDonorEmail(e.target.value)}
                                className="w-full py-3 px-4 pl-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                              />
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                              {t.pages.give.phoneLabel}
                            </label>
                            <div className="relative">
                              <input
                                type="tel"
                                placeholder={t.pages.give.phonePlaceholder}
                                value={donorPhone}
                                onChange={(e) => setDonorPhone(e.target.value)}
                                className="w-full py-3 px-4 pl-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-55 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                              />
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleGeneratePaymentSession}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all shadow-purple-600/10 active:scale-[0.99] disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {language === 'te' ? 'QR కోడ్‌ని రూపొందిస్తోంది...' : language === 'hi' ? 'क्यूआर कोड जनरेट किया जा रहा है...' : 'Generating QR Code...'}
                          </>
                        ) : (
                          <>
                            {language === 'te' ? 'డైనమిక్ UPI QR కోడ్‌ను రూపొందించండి' : language === 'hi' ? 'डायनेमिक यूपीआई क्यूआर कोड जनरेट करें' : 'Generate Dynamic UPI QR Code'}
                            <ArrowRight className="h-5 w-5" />
                          </>
                        )}
                      </button>
                    </motion.div>
                  ) : (
                    // STEP 2: Scan & Pay
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-center space-y-6 text-center"
                    >
                      {/* Countdown Timer */}
                      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-full text-xs font-semibold border border-amber-250/20">
                        <Clock className="w-4 h-4" />
                        <span>{language === 'te' ? 'QR గడువు ముగిసే సమయం: ' : language === 'hi' ? 'क्यूआर समाप्त होने में समय: ' : 'QR Expires in: '}</span>
                        <span className="font-mono font-bold text-sm">{timeLeft}</span>
                      </div>

                      {/* Dynamic QR Container */}
                      <div className="bg-gray-50 dark:bg-gray-900/60 p-6 rounded-3xl border border-gray-200 dark:border-gray-700/60 shadow-inner flex flex-col items-center max-w-sm w-full mx-auto relative">
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                          {language === 'te' ? 'డైనమిక్ QR' : language === 'hi' ? 'डायनेमिक क्यूआर' : 'Dynamic QR'}
                        </div>

                        {/* Renders base64 image returned from API */}
                        <div className="relative w-64 h-64 bg-white rounded-2xl overflow-hidden shadow-md flex items-center justify-center border border-gray-100/50 mt-4">
                          {qrCodeData ? (
                            <img
                              src={qrCodeData}
                              alt="Dynamic UPI QR Code"
                              className="w-full h-full object-contain p-2"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                            </div>
                          )}
                        </div>

                        {/* UPI Address copying block */}
                        <div className="mt-5 w-full bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-750 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs font-semibold">
                          <div className="text-left font-mono">
                            <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider">{t.pages.give.upiIdLabel}</span>
                            <span className="text-gray-800 dark:text-gray-200 font-bold select-all">{upiId}</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => copyToClipboard(upiId, "UPI ID")}
                            className="p-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-purple-600 transition-all border border-gray-200 dark:border-gray-700"
                          >
                            {copiedLabel === "UPI ID" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Launch apps in mobile */}
                      <div className="w-full max-w-sm">
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                          {language === 'te' ? '— మీ ఇష్టమైన యాప్‌తో నేరుగా చెల్లించండి —' : language === 'hi' ? '— अपने पसंदीदा ऐप से सीधे भुगतान करें —' : '— Pay directly with your favourite app —'}
                        </p>

                        {/* Payment App Quick-Launch Grid */}
                        <div className="grid grid-cols-5 gap-2 mb-3">
                          <button
                            type="button"
                            title="Open in Google Pay"
                            onClick={() => openPaymentApp(`tez://upi/pay?${upiUri.split("?")[1] || ""}`, "https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user")}
                            className="flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-2xl border-2 border-[#4285F4]/25 bg-[#4285F4]/6 hover:bg-[#4285F4]/15 active:scale-90 transition-all shadow-sm group cursor-pointer"
                          >
                            <img
                              src="https://upload.wikimedia.org/wikipedia/commons/e/ef/Google_Pay_Acceptance_Mark.svg"
                              className="w-8 h-8 object-contain rounded-lg group-hover:scale-105 transition-transform"
                              alt="Google Pay"
                            />
                            <span className="text-[9px] font-bold text-[#4285F4] tracking-tight">GPay</span>
                          </button>

                          <button
                            type="button"
                            title="Open in PhonePe"
                            onClick={() => openPaymentApp(`phonepe://pay?${upiUri.split("?")[1] || ""}`, "https://play.google.com/store/apps/details?id=com.phonepe.app")}
                            className="flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-2xl border-2 border-[#5f259f]/25 bg-[#5f259f]/6 hover:bg-[#5f259f]/15 active:scale-90 transition-all shadow-sm group cursor-pointer"
                          >
                            <img
                              src="https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg"
                              className="w-8 h-8 object-contain rounded-lg group-hover:scale-105 transition-transform"
                              alt="PhonePe"
                            />
                            <span className="text-[9px] font-bold text-[#5f259f] tracking-tight">PhonePe</span>
                          </button>

                          <button
                            type="button"
                            title="Open in Paytm"
                            onClick={() => openPaymentApp(`paytmmp://upi/pay?${upiUri.split("?")[1] || ""}`, "https://play.google.com/store/apps/details?id=net.one97.paytm")}
                            className="flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-2xl border-2 border-[#00BAF2]/25 bg-[#00BAF2]/6 hover:bg-[#00BAF2]/15 active:scale-90 transition-all shadow-sm group cursor-pointer"
                          >
                            <img
                              src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg"
                              className="w-8 h-8 object-contain rounded-lg group-hover:scale-105 transition-transform"
                              alt="Paytm"
                            />
                            <span className="text-[9px] font-bold text-[#00BAF2] tracking-tight">Paytm</span>
                          </button>

                          <button
                            type="button"
                            title="Open in BHIM"
                            onClick={() => openPaymentApp(`upi://pay?${upiUri.split("?")[1] || ""}`, "https://play.google.com/store/apps/details?id=in.org.npci.upiapp")}
                            className="flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-2xl border-2 border-[#FF6B00]/25 bg-[#FF6B00]/6 hover:bg-[#FF6B00]/15 active:scale-90 transition-all shadow-sm group cursor-pointer"
                          >
                            <img
                              src="https://upload.wikimedia.org/wikipedia/commons/6/65/BHIM_logo.svg"
                              className="w-8 h-8 object-contain rounded-lg group-hover:scale-105 transition-transform"
                              alt="BHIM"
                            />
                            <span className="text-[9px] font-bold text-[#FF6B00] tracking-tight">BHIM</span>
                          </button>

                          <button
                            type="button"
                            title="Open in FamPay"
                            onClick={() => openPaymentApp(`fampay://upi/pay?${upiUri.split("?")[1] || ""}`, "https://play.google.com/store/apps/details?id=com.fampay.in")}
                            className="flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-2xl border-2 border-[#FFCB47]/35 bg-[#FFCB47]/10 hover:bg-[#FFCB47]/25 active:scale-90 transition-all shadow-sm group cursor-pointer"
                          >
                            <img
                              src="https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/fampay.svg"
                              className="w-8 h-8 object-contain rounded-lg group-hover:scale-105 transition-transform"
                              style={{ filter: 'brightness(0) saturate(100%) invert(56%) sepia(85%) saturate(350%) hue-rotate(5deg) brightness(98%) contrast(90%)' }}
                              alt="FamPay"
                            />
                            <span className="text-[9px] font-bold text-[#b8860b] tracking-tight font-mono">Fam</span>
                          </button>
                        </div>

                        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mb-3">
                          {language === 'te' ? 'మీ యాప్‌ను తెరవడానికి నొక్కండి — చెల్లింపు వివరాలు ముందే నింపబడి ఉంటాయి' : language === 'hi' ? 'अपने ऐप को खोलने के लिए टैप करें — भुगतान विवरण पहले से भरा हुआ है' : 'Tap to open your app — pre-filled with payment details'}
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => openPaymentApp(upiUri, upiUri)}
                            className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border-2 border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 text-purple-700 dark:text-purple-400 font-bold text-sm transition-all active:scale-95 shadow-sm cursor-pointer"
                          >
                            <Smartphone className="w-4 h-4" />
                            {language === 'te' ? 'UPI యాప్‌లో తెరవండి' : language === 'hi' ? 'यूपीआई ऐप में खोलें' : 'Open in UPI App'}
                          </button>

                          <button
                            type="button"
                            onClick={() => copyToClipboard(upiUri, "URI")}
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm transition-all active:scale-95"
                          >
                            {copiedLabel === "URI" ? (
                              <>
                                <Check className="w-4 h-4 text-green-500" />
                                {language === 'te' ? 'లింక్ కాపీ చేయబడింది' : language === 'hi' ? 'लिंक कॉपी हो गया' : 'Copied Link'}
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                {language === 'te' ? 'లింక్ కాపీ చేయండి' : language === 'hi' ? 'लिंक कॉपी करें' : 'Copy Link'}
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                          {language === 'te' ? `UPI యాప్‌లు గ్రహీత పేరు, ఉద్దేశ్య సూచన మరియు ఖచ్చితమైన మొత్తం ₹${Number(getFinalAmount()).toLocaleString('en-IN')} ఆటో-ఫిల్ చేస్తాయి.` : language === 'hi' ? `यूपीआई ऐप्स आदाता का नाम, उद्देश्य संदर्भ और सटीक राशि ₹${Number(getFinalAmount()).toLocaleString('en-IN')} स्वचालित रूप से भर देते हैं।` : `UPI apps auto-fill payee name, purpose reference, and exact amount ₹${Number(getFinalAmount()).toLocaleString('en-IN')}.`}
                        </p>
                      </div>

                      <div className="space-y-1.5 max-w-md pt-2">
                        <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{language === 'te' ? 'నిజ-సమయ ధృవీకరణ సక్రియంగా ఉంది' : language === 'hi' ? 'वास्तविक समय सत्यापन सक्रिय है' : 'Real-time verification active'}</p>
                        <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
                          {language === 'te' ? 'మీ యాప్‌లో చెల్లింపు పూర్తయిన తర్వాత, మా సర్వర్ స్వయంచాలకంగా నిజ-సమయంలో ధృవీకరిస్తుంది. అది వెంటనే కాకపోతే, క్రింది "ఇప్పుడే ధృవీకరించు" క్లిక్ చేయండి.' : language === 'hi' ? 'आपके ऐप में भुगतान पूरा होने के बाद, हमारा सर्वर स्वचालित रूप से वास्तविक समय में सत्यापित करेगा। यदि यह तुरंत पुनर्निर्देशित नहीं होता है, तो नीचे "अभी सत्यापित करें" पर क्लिक करें।' : 'Once payment is completed in your app, our server will automatically verify the ledger in real-time. If it doesn\'t redirect immediately, click "Verify Now" below.'}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                        <button
                          type="button"
                          onClick={() => {
                            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                            if (socketRef.current) socketRef.current.disconnect();
                            setStep(1);
                          }}
                          className="py-4 px-6 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 active:scale-98"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          {t.pages.give.backBtn}
                        </button>
                        
                        <button
                          type="button"
                          disabled={verificationLoading || timeLeft === "EXPIRED"}
                          onClick={handleVerifyPayment}
                          className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all shadow-green-500/10 active:scale-[0.99] disabled:opacity-75"
                        >
                          {verificationLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              {language === 'te' ? 'ధృవీకరిస్తోంది...' : language === 'hi' ? 'सत्यापित किया जा रहा है...' : 'Verifying Payment...'}
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-5 w-5" />
                              {language === 'te' ? 'నేను చెల్లించాను — ఇప్పుడే ధృవీకరించు' : language === 'hi' ? 'मैंने भुगतान कर दिया — अभी सत्यापित करें' : "I've Paid — Verify Now"}
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Column: Gift Summary & Live History */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Payment Summary Box */}
                <div className="bg-gradient-to-br from-purple-800 to-indigo-900 text-white rounded-3xl shadow-xl p-6 sm:p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full filter blur-xl transform translate-x-10 -translate-y-10" />
                  
                  <h3 className="font-bold text-lg uppercase tracking-wider text-purple-200 mb-6 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-purple-300" />
                    {t.pages.give.summaryTitle}
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-white/10 pb-4">
                      <span className="text-purple-200">{t.pages.give.summaryType}</span>
                      <span className="font-bold bg-white/10 px-3 py-1 rounded-full text-xs tracking-wider uppercase">
                        {activePurposeObj ? getLanguagePurposeName(activePurposeObj) : selectedPurpose}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-4">
                      <span className="text-purple-200">{t.pages.give.summaryMethod}</span>
                      <span className="font-semibold flex items-center gap-1.5 text-purple-100">
                        <QrCode className="w-4 h-4 text-purple-300" />
                        {language === 'te' ? 'డైనమిక్ UPI QR' : language === 'hi' ? 'डायनेमिक यूपीआई क्यूआर' : 'Dynamic UPI QR'}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-4">
                      <span className="text-purple-200">{t.pages.give.summaryTax}</span>
                      <span className="font-semibold text-green-300">{t.pages.give.summaryTaxValue}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-2xl font-semibold text-purple-200 align-middle">{t.pages.give.summaryTotal}</span>
                      <span className="text-3xl font-extrabold flex items-center gap-1">
                        <IndianRupee className="w-6 h-6 stroke-[2.5]" />
                        {Number(getFinalAmount() || "0").toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Members Live History sync section */}
                {mounted && user && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/50 rounded-3xl p-6 shadow-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-purple-600 animate-pulse" />
                          {t.pages.give.liveHistoryTitle}
                        </h4>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">{t.pages.give.liveHistorySubtitle}</p>
                      </div>

                      <button 
                        onClick={() => loadHistory()} 
                        disabled={historyLoading}
                        className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-400 hover:text-purple-600 transition-all border border-gray-200 dark:border-gray-700"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? "animate-spin" : ""}`} />
                      </button>
                    </div>

                    {historyLoading && history.length === 0 ? (
                      <div className="py-8 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                      </div>
                    ) : history.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                        <Receipt className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-1.5" />
                        <p className="text-xs text-gray-400 font-bold">{t.pages.give.noRecords}</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {history.map((item) => (
                          <div 
                             key={item.id}
                             className="p-3 bg-gray-50/50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700/50 rounded-xl flex items-center justify-between text-xs hover:border-purple-600/35 transition-all"
                          >
                             <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-gray-800 dark:text-gray-200 uppercase text-[10px]">
                                  {item.purposeRelation?.nameEn || item.purpose}
                                </span>
                                <span className="text-[9px] text-gray-400">
                                  {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                </span>
                              </div>
                              <span className="block text-[9px] text-gray-400 font-mono leading-none">UTR: {item.razorpayPaymentId || "Pending"}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="font-black text-gray-900 dark:text-white">
                                ₹{item.amount.toLocaleString("en-IN")}
                              </span>
                              <a 
                                href={`/give/receipt/${item.id}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-1 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-all font-semibold"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {lastHistorySynced && (
                      <div className="text-[9px] text-gray-400 dark:text-gray-500 flex items-center justify-between font-mono border-t border-gray-100 dark:border-gray-700 pt-2">
                        <span>{t.pages.give.syncActive}</span>
                        <span>{t.pages.give.updatedAt}: {lastHistorySynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Church statement card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700/50">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm sm:text-base">
                    <Check className="h-5 w-5 text-green-500 bg-green-50 dark:bg-green-900/30 rounded-full p-1" />
                    {t.pages.give.malachiTitle}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed italic">
                    {t.pages.give.malachiDesc}
                  </p>
                </div>

                {/* Help & Support Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700/50">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base mb-2">{t.pages.give.helpTitle}</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3">
                    {t.pages.give.helpDesc}
                  </p>
                  <div className="space-y-1.5 text-xs sm:text-sm">
                    <p className="text-purple-600 dark:text-purple-400 font-semibold">
                      Email: <a href="mailto:kingofchristministries23@gmail.com" className="hover:underline">kingofchristministries23@gmail.com</a>
                    </p>
                    <p className="text-purple-600 dark:text-purple-400 font-semibold">
                      Phone: <a href="tel:+919704090069" className="hover:underline">+91 97040 90069</a> | <a href="tel:+919640943777" className="hover:underline">+91 96409 43777</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Why We Give */}
      <section className="py-16 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {t.pages.give.whyHeading}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              {t.pages.give.whySubtitle}
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              {t.pages.give.whyItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-100 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ways to Give */}
      <section className="py-16 bg-gradient-to-br from-[hsl(var(--accent)_/_0.4)] to-[hsl(var(--accent)_/_0.2)] dark:from-[hsl(var(--accent)_/_0.05)] dark:to-[hsl(var(--accent)_/_0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              {language === 'te' ? 'కానుకలు ఇవ్వడానికి ఇతర మార్గాలు' : language === 'hi' ? 'दान करने के अन्य तरीके' : 'Other Ways to Give'}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Bank Transfer Card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 dark:border-gray-700/30 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-[hsl(var(--primary)_/_0.1)] dark:bg-[hsl(var(--primary)_/_0.15)] rounded-2xl flex items-center justify-center mb-6">
                    <Building className="h-7 w-7 text-[hsl(var(--primary))] dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {language === 'te' ? 'బ్యాంక్ బదిలీ / NEFT / IMPS' : language === 'hi' ? 'बैंक ट्रांसफर / NEFT / IMPS' : 'Bank Transfer / NEFT / IMPS'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {language === 'te' ? 'మా అధికారిక చర్చి ఖాతాకు నేరుగా బ్యాంక్ బదిలీ. పెద్ద దశమభాగాలకు అనుకూలమైనది.' : language === 'hi' ? 'हमारे आधिकारिक चर्च खाते में सीधे बैंक ट्रांसफर। बड़े दान के लिए बिल्कुल सही।' : 'Direct bank transfer to our official church account. Perfect for larger tithings.'}
                  </p>
                </div>
                <div className="text-left bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5 space-y-2.5 text-xs sm:text-sm border border-gray-100 dark:border-gray-800">
                  <p className="text-gray-700 dark:text-gray-300 flex justify-between">
                    <span className="font-semibold">{language === 'te' ? 'ఖాతాదారుని పేరు:' : language === 'hi' ? 'खाता धारक का नाम:' : 'Account Name:'}</span>
                    <span>Kingdom of Christ Ministries</span>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 flex justify-between border-t border-gray-200 dark:border-gray-800 pt-2">
                    <span className="font-semibold">{language === 'te' ? 'ఖాతా సంఖ్య:' : language === 'hi' ? 'खाता संख्या:' : 'Account Number:'}</span>
                    <span className="font-mono text-purple-700 dark:text-purple-400 font-bold">12041203940129</span>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 flex justify-between border-t border-gray-200 dark:border-gray-800 pt-2">
                    <span className="font-semibold">{language === 'te' ? 'IFSC కోడ్:' : language === 'hi' ? 'IFSC कोड:' : 'IFSC Code:'}</span>
                    <span className="font-mono text-purple-700 dark:text-purple-400 font-bold">UTIB0001092</span>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 flex justify-between border-t border-gray-200 dark:border-gray-800 pt-2">
                    <span className="font-semibold">{language === 'te' ? 'బ్యాంక్ బ్రాంచ్:' : language === 'hi' ? 'बैंक स्थान:' : 'Bank Location:'}</span>
                    <span>Axis Bank, Jeedimetla</span>
                  </p>
                </div>
              </div>

              {/* Envelope Giving Card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 dark:border-gray-700/30 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center mb-6">
                    <Smartphone className="h-7 w-7 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {language === 'te' ? 'వ్యక్తిగతంగా ఎన్వలప్ కానుక' : language === 'hi' ? 'व्यक्तिगत लिफाफा दान' : 'In-Person Envelope Giving'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {language === 'te' ? 'మా చర్చిలలో జరిగే ఆరాధనల సమయంలో నగదు లేదా చెక్కులను కానుకల కవరులో ఉంచండి.' : language === 'hi' ? 'हमारे किसी भी चर्च स्थान पर पूजा सेवा के दौरान नकद या चेक लिफाफे में रखकर अर्पित करें।' : 'Place cash or checks in the offering envelope during any regular worship service at our locations.'}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs font-bold">
                  {branches.map((b) => (
                    <button 
                      key={b.id}
                      type="button"
                      onClick={() => {
                        window.location.href = "/#contact";
                      }}
                      className="bg-gradient-to-br from-[hsl(var(--accent)_/_0.6)] to-[hsl(var(--accent)_/_0.2)] dark:from-[hsl(var(--accent)_/_0.15)] dark:to-[hsl(var(--accent)_/_0.05)] text-[hsl(var(--primary))] p-3.5 rounded-2xl border border-[hsl(var(--primary)_/_0.15)] dark:border-[hsl(var(--primary)_/_0.25)] shadow-sm hover:shadow-md hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer w-full"
                    >
                      <span className="text-xl">⛪</span>
                      <span className="truncate max-w-full">{b.name.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
