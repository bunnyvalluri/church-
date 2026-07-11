"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Building, 
  Smartphone, 
  Heart, 
  Check, 
  ArrowRight, 
  Lock, 
  Loader2, 
  Sparkles, 
  User, 
  Mail, 
  Phone, 
  IndianRupee,
  Globe,
  Gift,
  PlusCircle,
  Copy,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  ExternalLink,
  Activity,
  RefreshCw,
  Receipt,
  QrCode,
  ArrowLeft,
  CheckCircle
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const getPurposeIcon = (pId: string) => {
  switch (pId) {
    case "TITHE": return <IndianRupee className="w-5 h-5 text-indigo-500" />;
    case "OFFERING": return <Gift className="w-5 h-5 text-rose-500" />;
    case "BUILDING": return <Building className="w-5 h-5 text-amber-500" />;
    case "MISSIONS": return <Globe className="w-5 h-5 text-blue-500" />;
    case "CHARITY": return <Heart className="w-5 h-5 text-emerald-500" />;
    default: return <PlusCircle className="w-5 h-5 text-purple-500" />;
  }
};

export default function GiveForm() {
  const { language, t } = useLanguage();
  const { user, getIdToken } = useAuth();
  const pathname = usePathname() || "";
  const isPortalRoute = pathname.startsWith("/member");
  const gt = t.pages.give;
  const pageT = gt;

  // Donation Wizard Steps: 
  // 1 = Enter Details (Amount, Purpose, Donor Info)
  // 2 = Scan & Pay (Displays UPI QR Code, Deep links, "I've Paid")
  const [step, setStep] = useState(1);
  
  // Input fields
  const [amount, setAmount] = useState<string>("1000");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("TITHE");
  const [donorName, setDonorName] = useState<string>("");
  const [donorEmail, setDonorEmail] = useState<string>("");
  const [donorPhone, setDonorPhone] = useState<string>("");

  // API generated session state
  const [donationId, setDonationId] = useState<string>("");
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [upiUri, setUpiUri] = useState<string>("");
  const [upiId, setUpiId] = useState<string>("kcm.kristhraj2004-1@okicici");
  const [churchName, setChurchName] = useState<string>("Kingdom of Christ Ministries");

  // Execution states
  const [initLoading, setInitLoading] = useState(true);
  const [initError, setInitError] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Live Updates states
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [lastHistorySynced, setLastHistorySynced] = useState<Date | null>(null);
  const [pingTime, setPingTime] = useState<number | null>(null);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string } | null>(null);
  
  const [mounted, setMounted] = useState(false);
  const historyInterval = useRef<NodeJS.Timeout | null>(null);
  const prevHistoryCount = useRef<number>(0);

  // Prevent SSR/client hydration mismatch
  useEffect(() => { setMounted(true); }, []);

  const showToast = (msg: string) => {
    setToast({ msg });
    setTimeout(() => setToast(null), 4000);
  };

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setDonorName(user.name || "");
      setDonorEmail(user.email || "");
    }
  }, [user]);

  // 1. Initialize Donation Session on page load
  const initializeSession = useCallback(async () => {
    setInitLoading(true);
    setInitError(false);
    setErrorMessage("");

    try {
      const token = getIdToken ? await getIdToken() : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/donations/session/init", {
        method: "POST",
        headers,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Session initialization failed.");
      }

      setDonationId(data.donationId);
    } catch (err: any) {
      console.error("Failed to initialize donation session:", err);
      setInitError(true);
      setErrorMessage(err.message || "Unable to establish secure connection for payments. Please refresh and try again.");
    } finally {
      setInitLoading(false);
    }
  }, [getIdToken]);

  useEffect(() => {
    if (mounted) {
      initializeSession();
    }
  }, [mounted, initializeSession]);

  // Load giving history for authenticated member
  const loadHistory = useCallback(async (silent = false) => {
    if (!user?.uid) return;
    if (!silent) setHistoryLoading(true);
    const start = performance.now();
    try {
      const res = await fetch(`/api/donations/history?userId=${user.uid}&t=${Date.now()}`);
      const duration = performance.now() - start;
      setPingTime(Math.round(duration));
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const fresh = data.donations || [];
          if (prevHistoryCount.current && fresh.length > prevHistoryCount.current) {
            const diff = fresh.length - prevHistoryCount.current;
            showToast(`Thank you! Received ${diff} new donation receipt(s)`);
          }
          prevHistoryCount.current = fresh.length;
          setHistory(fresh);
          setLastHistorySynced(new Date());
        }
      }
    } catch (err) {
      console.error("Failed to load giving history", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [user]);

  // Measure public gateway latency if guest
  const pingGateway = useCallback(async () => {
    if (user?.uid) return;
    const start = performance.now();
    try {
      await fetch(`/api/donations/history?userId=guest_ping&t=${Date.now()}`);
      const duration = performance.now() - start;
      setPingTime(Math.round(duration));
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      loadHistory();
      historyInterval.current = setInterval(() => loadHistory(true), 30000);
    } else {
      pingGateway();
      historyInterval.current = setInterval(() => pingGateway(), 30000);
    }
    return () => {
      if (historyInterval.current) clearInterval(historyInterval.current);
    };
  }, [user, loadHistory, pingGateway]);

  const getFinalAmount = () => {
    return customAmount ? customAmount : amount;
  };

  const validateDetails = () => {
    const finalAmt = getFinalAmount();
    if (!finalAmt || isNaN(Number(finalAmt)) || Number(finalAmt) <= 0) {
      setErrorMessage(gt.errors.validAmount);
      return false;
    }
    if (!donorName.trim()) {
      setErrorMessage(gt.errors.enterName);
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(donorEmail)) {
      setErrorMessage(gt.errors.enterEmail);
      return false;
    }
    setErrorMessage("");
    return true;
  };

  // 2. Submit details to update session and generate dynamic UPI QR code
  const handleGenerateQrCode = async () => {
    if (!validateDetails()) return;
    setActionLoading(true);
    setErrorMessage("");

    try {
      const token = getIdToken ? await getIdToken() : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/donations/session/update", {
        method: "POST",
        headers,
        body: JSON.stringify({
          donationId,
          amount: Number(getFinalAmount()),
          purpose,
          donorName,
          donorEmail,
          donorPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate dynamic payment details.");
      }

      setQrCodeData(data.qrCode);
      setUpiUri(data.upiUri);
      setUpiId(data.upiId);
      setChurchName(data.churchName);

      setStep(2);
    } catch (err: any) {
      console.error("Error generating dynamic QR:", err);
      setErrorMessage(err.message || "Failed to set up payment. Please check your network connection and try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Confirm payment server-side
  const handleVerifyPayment = async () => {
    setVerificationLoading(true);
    setErrorMessage("");

    try {
      const token = getIdToken ? await getIdToken() : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/donations/session/verify", {
        method: "POST",
        headers,
        body: JSON.stringify({ donationId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Server-side payment verification failed.");
      }

      // Redirect to the receipt page
      window.location.href = `/give/receipt/${donationId}`;
    } catch (err: any) {
      console.error("Verification error:", err);
      setErrorMessage(err.message || "We could not automatically verify your transfer right now. Please wait a few seconds and try again, or contact our support team.");
    } finally {
      setVerificationLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2500);
  };

  // Build the query-string portion of the UPI URI (pa, pn, am, cu, tn, tr)
  const getUpiParams = () => (upiUri.includes("?") ? upiUri.split("?")[1] : "");

  /**
   * Opens a UPI payment app via its custom URL scheme.
   * On mobile the OS will switch directly to the installed app.
   * If the app is not installed, the user lands on the Play/App-Store fallback
   * after a short delay.
   */
  const openPaymentApp = (appUrl: string, storeFallback: string) => {
    // window.location.href triggers the deep link immediately
    window.location.href = appUrl;
    // If the deep link didn't open (app not installed), redirect to store
    setTimeout(() => {
      if (!document.hidden) {
        window.location.href = storeFallback;
      }
    }, 1800);
  };

  const formattedPingTime = pingTime !== null ? `${pingTime}ms` : "checking...";

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
            className="fixed top-20 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-semibold border bg-[hsl(var(--primary))] text-white border-purple-400/30 max-w-sm"
          >
            <Activity className="w-4 h-4 text-purple-200 animate-bounce" />
            <div>{toast.msg}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <section className="relative py-24 bg-gradient-to-br from-gradient-start via-slate-950 to-gradient-end overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[hsl(var(--primary))]/20 rounded-full filter blur-3xl opacity-20 transform translate-x-20 -translate-y-20 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm mb-6"
            >
              <Heart className="h-4 w-4 text-pink-300 animate-pulse" />
              <span className="font-medium tracking-wide">
                {language === 'en' ? 'Generous Giving' : language === 'te' ? 'దాతృత్వము' : 'ఉदार दान'}
              </span>
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight"
            >
              {pageT.title}
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed"
            >
              {pageT.subtitle}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Main Interactive Grid */}
      <section className="py-20 -mt-10 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-12 max-w-6xl mx-auto items-start">
            
            {/* Left Column: Instant UPI payment card */}
            <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-4 sm:p-8 border border-gray-100 dark:border-gray-700/50">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-[hsl(var(--primary))]" />
                    Instant UPI Giving
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
                    Secure real-time bank transfers using dynamic QR codes
                  </p>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-1.5 bg-[hsl(var(--accent))] dark:bg-[hsl(var(--accent))]/30 px-2.5 py-1 rounded-full text-[hsl(var(--primary))] text-[10px] sm:text-xs font-semibold">
                    <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    {language === 'en' ? 'Secure' : language === 'te' ? 'భద్రమైనది' : 'सुरक्षित'}
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-mono text-gray-400 dark:text-gray-500">
                    Ping: {formattedPingTime}
                  </span>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center gap-2 mb-8">
                <div className={`h-2 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-[hsl(var(--primary))]' : 'bg-gray-200'}`} />
                <div className={`h-2 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-[hsl(var(--primary))]' : 'bg-gray-200'}`} />
              </div>

              {/* Error messages */}
              {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 text-sm rounded-lg flex items-start gap-2">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Initial Session Loading state */}
              {initLoading ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-10 h-10 text-[hsl(var(--primary))] animate-spin" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">Establishing secure donation session...</p>
                </div>
              ) : initError ? (
                <div className="py-12 text-center space-y-4">
                  <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm max-w-sm mx-auto">
                    {errorMessage || "Connection error. We couldn't establish a payment session."}
                  </p>
                  <button
                    onClick={initializeSession}
                    className="px-6 py-2.5 bg-[hsl(var(--primary))] text-white font-bold rounded-xl shadow-md hover:shadow-lg active:scale-98 transition-all"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : (
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
                          {gt.presetsTitle}
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
                                  ? "bg-gradient-to-r from-gradient-start to-gradient-end border-transparent text-white shadow-lg shadow-[hsl(var(--primary))]/20"
                                  : "bg-gray-55 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
                            >
                              ₹{preset}
                            </button>
                          ))}
                          <div className="relative col-span-2 sm:col-span-1">
                            <input
                              type="number"
                              placeholder={gt.customPlaceholder}
                              value={customAmount}
                              onChange={(e) => {
                                setCustomAmount(e.target.value);
                                setAmount("");
                              }}
                              className={`w-full py-3.5 px-3 sm:px-4 pl-6 sm:pl-8 rounded-xl border font-bold text-sm sm:text-lg bg-gray-55 dark:bg-gray-700/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all ${
                                customAmount 
                                  ? "border-[hsl(var(--primary))] ring-2 ring-[hsl(var(--primary))]/20" 
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
                          {gt.purposeLabel}
                        </label>
                        <div className="grid md:grid-cols-2 gap-3">
                          {Object.entries(gt.purposes).map(([id, item]) => (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setPurpose(id)}
                              className={`p-4 rounded-xl border text-left cursor-pointer select-none transition-all flex items-start gap-3 w-full ${
                                purpose === id
                                  ? "border-[hsl(var(--primary))] bg-[hsl(var(--accent))]/50 dark:bg-[hsl(var(--accent))]/20 ring-2 ring-[hsl(var(--primary))]/25"
                                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-650"
                              }`}
                            >
                              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900 mt-0.5">
                                {getPurposeIcon(id)}
                              </div>
                              <div>
                                <span className="block font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                                  {item.name}
                                </span>
                                <span className="block text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                                  {item.desc}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Donor Contact info */}
                      <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">
                          {gt.contactTitle}
                        </h3>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-650 dark:text-gray-405 mb-1">
                              {gt.fullNameLabel}
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder={gt.fullNamePlaceholder}
                                value={donorName}
                                onChange={(e) => setDonorName(e.target.value)}
                                className="w-full py-3 px-4 pl-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-55 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-[hsl(var(--primary))] focus:outline-none"
                              />
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-450 w-4.5 h-4.5" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-650 dark:text-gray-450 mb-1">
                              {gt.emailLabel}
                            </label>
                            <div className="relative">
                              <input
                                type="email"
                                placeholder={gt.emailPlaceholder}
                                value={donorEmail}
                                onChange={(e) => setDonorEmail(e.target.value)}
                                className="w-full py-3 px-4 pl-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-55 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-[hsl(var(--primary))] focus:outline-none"
                              />
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-450 w-4.5 h-4.5" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-650 dark:text-gray-450 mb-1">
                              {gt.phoneLabel}
                            </label>
                            <div className="relative">
                              <input
                                type="tel"
                                placeholder={gt.phonePlaceholder}
                                value={donorPhone}
                                onChange={(e) => setDonorPhone(e.target.value)}
                                className="w-full py-3 px-4 pl-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-55 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-[hsl(var(--primary))] focus:outline-none"
                              />
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-450 w-4.5 h-4.5" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleGenerateQrCode}
                        className="w-full py-4 bg-gradient-to-r from-gradient-start to-gradient-end text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all shadow-[hsl(var(--primary))]/10 active:scale-[0.99] disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating QR Code...
                          </>
                        ) : (
                          <>
                            Generate Dynamic UPI QR Code
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
                      {/* Dynamic QR Container */}
                      <div className="bg-gray-50 dark:bg-gray-900/60 p-6 rounded-3xl border border-gray-200 dark:border-gray-700/60 shadow-inner flex flex-col items-center max-w-sm w-full mx-auto relative">
                        <div className="absolute top-3 left-3 flex items-center gap-1 bg-green-150 dark:bg-green-950/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <CheckCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                          Dynamic QR
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
                              <Loader2 className="w-8 h-8 text-[hsl(var(--primary))] animate-spin" />
                            </div>
                          )}
                        </div>

                        {/* UPI Address copying block */}
                        <div className="mt-5 w-full bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-750 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs font-semibold">
                          <div className="text-left font-mono">
                            <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider">Payee UPI ID</span>
                            <span className="text-gray-800 dark:text-gray-200 font-bold select-all">{upiId}</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => copyToClipboard(upiId, "UPI ID")}
                            className="p-2 bg-gray-55 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-[hsl(var(--primary))] transition-all border border-gray-200 dark:border-gray-700"
                          >
                            {copiedLabel === "UPI ID" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Launch apps in mobile */}
                      <div className="w-full max-w-sm">
                        <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                          — Pay directly with your favourite app —
                        </p>

                        {/* Payment App Quick-Launch Grid */}
                        <div className="grid grid-cols-5 gap-2 mb-3">

                          {/* ── Google Pay ── */}
                          <button
                            type="button"
                            title="Open in Google Pay"
                            onClick={() =>
                              openPaymentApp(
                                `tez://upi/pay?${getUpiParams()}`,
                                "https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user"
                              )
                            }
                            className="flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-2xl border-2 border-[#4285F4]/25 bg-[#4285F4]/6 hover:bg-[#4285F4]/15 active:scale-90 transition-all shadow-sm group cursor-pointer"
                          >
                            {/* Google Pay wordmark "G" in four colours */}
                            <svg viewBox="0 0 24 24" className="w-7 h-7 group-hover:scale-110 transition-transform" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="12" fill="white"/>
                              <path d="M17.64 12.2c0-.38-.03-.74-.09-1.09H12v2.07h3.17c-.14.74-.54 1.37-1.15 1.79v1.49h1.86c1.09-1 1.76-2.47 1.76-4.26z" fill="#4285F4"/>
                              <path d="M12 18c1.59 0 2.92-.53 3.89-1.43l-1.86-1.49c-.53.36-1.21.57-2.03.57-1.56 0-2.88-1.06-3.35-2.48H6.73v1.53A5.999 5.999 0 0012 18z" fill="#34A853"/>
                              <path d="M8.65 13.17A3.59 3.59 0 018.46 12c0-.41.07-.81.19-1.17V9.3H6.73A6.003 6.003 0 006 12c0 .97.23 1.88.73 2.7l1.92-1.53z" fill="#FBBC05"/>
                              <path d="M12 8.35c.88 0 1.67.3 2.29.9l1.71-1.72C14.92 6.53 13.59 6 12 6a5.999 5.999 0 00-5.27 3.3l1.92 1.53c.47-1.42 1.79-2.48 3.35-2.48z" fill="#EA4335"/>
                            </svg>
                            <span className="text-[9px] font-bold text-[#4285F4] tracking-tight">GPay</span>
                          </button>

                          {/* ── PhonePe ── */}
                          <button
                            type="button"
                            title="Open in PhonePe"
                            onClick={() =>
                              openPaymentApp(
                                `phonepe://pay?${getUpiParams()}`,
                                "https://play.google.com/store/apps/details?id=com.phonepe.app"
                              )
                            }
                            className="flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-2xl border-2 border-[#5f259f]/25 bg-[#5f259f]/6 hover:bg-[#5f259f]/15 active:scale-90 transition-all shadow-sm group cursor-pointer"
                          >
                            <svg viewBox="0 0 24 24" className="w-7 h-7 group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="12" fill="#5f259f"/>
                              <text x="12" y="16.5" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white" fontFamily="Arial">₱</text>
                            </svg>
                            <span className="text-[9px] font-bold text-[#5f259f] tracking-tight">PhonePe</span>
                          </button>

                          {/* ── Paytm ── */}
                          <button
                            type="button"
                            title="Open in Paytm"
                            onClick={() =>
                              openPaymentApp(
                                `paytmmp://upi/pay?${getUpiParams()}`,
                                "https://play.google.com/store/apps/details?id=net.one97.paytm"
                              )
                            }
                            className="flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-2xl border-2 border-[#00BAF2]/25 bg-[#00BAF2]/6 hover:bg-[#00BAF2]/15 active:scale-90 transition-all shadow-sm group cursor-pointer"
                          >
                            <svg viewBox="0 0 24 24" className="w-7 h-7 group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="12" fill="#00BAF2"/>
                              <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="900" fill="white" fontFamily="Arial">PAY</text>
                            </svg>
                            <span className="text-[9px] font-bold text-[#00BAF2] tracking-tight">Paytm</span>
                          </button>

                          {/* ── SuperMoney ── */}
                          <button
                            type="button"
                            title="Open in SuperMoney"
                            onClick={() =>
                              openPaymentApp(
                                `supermoney://upi/pay?${getUpiParams()}`,
                                "https://play.google.com/store/apps/details?id=in.supermoney.android"
                              )
                            }
                            className="flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-2xl border-2 border-[#FF6B00]/25 bg-[#FF6B00]/6 hover:bg-[#FF6B00]/15 active:scale-90 transition-all shadow-sm group cursor-pointer"
                          >
                            <svg viewBox="0 0 24 24" className="w-7 h-7 group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="12" fill="#FF6B00"/>
                              <text x="12" y="16.5" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white" fontFamily="Arial">$</text>
                            </svg>
                            <span className="text-[9px] font-bold text-[#FF6B00] tracking-tight leading-tight text-center">Super<br/>Money</span>
                          </button>

                          {/* ── FamPay ── */}
                          <button
                            type="button"
                            title="Open in FamPay"
                            onClick={() =>
                              openPaymentApp(
                                `fampay://upi/pay?${getUpiParams()}`,
                                "https://play.google.com/store/apps/details?id=com.fampay.in"
                              )
                            }
                            className="flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-2xl border-2 border-[#FFCB47]/35 bg-[#FFCB47]/10 hover:bg-[#FFCB47]/25 active:scale-90 transition-all shadow-sm group cursor-pointer"
                          >
                            <svg viewBox="0 0 24 24" className="w-7 h-7 group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="12" cy="12" r="12" fill="#FFCB47"/>
                              <text x="12" y="16" textAnchor="middle" fontSize="10" fontWeight="900" fill="#333" fontFamily="Arial">FAM</text>
                            </svg>
                            <span className="text-[9px] font-bold text-[#b8860b] tracking-tight">FamPay</span>
                          </button>

                        </div>

                        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mb-3">
                          Tap to open your app — pre-filled with payment details
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                          {/* Generic UPI deep-link */}
                          <button
                            type="button"
                            onClick={() => openPaymentApp(upiUri, upiUri)}
                            className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border-2 border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 text-purple-700 dark:text-purple-400 font-bold text-sm transition-all active:scale-95 shadow-sm cursor-pointer"
                          >
                            <Smartphone className="w-4 h-4" />
                            Open in UPI App
                          </button>

                          <button
                            type="button"
                            onClick={() => copyToClipboard(upiUri, "URI")}
                            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm transition-all active:scale-95"
                          >
                            {copiedLabel === "URI" ? (
                              <>
                                <Check className="w-4 h-4 text-green-500" />
                                Copied Link
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                Copy Payment Link
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-450 dark:text-gray-500 mt-2">
                          UPI apps auto-fill payee name, purpose reference, and exact amount ₹{Number(getFinalAmount()).toLocaleString('en-IN')}.
                        </p>
                      </div>

                      <div className="space-y-1.5 max-w-md pt-2">
                        <p className="font-bold text-sm text-gray-800 dark:text-gray-200">After payment, verify to receive receipt</p>
                        <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
                          Please complete the payment in your mobile app, then click the verification button below to register your donation and generate your official tax-exemption receipt.
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="py-4 px-6 bg-gray-105 hover:bg-gray-150 dark:bg-gray-700 dark:hover:bg-gray-650 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 active:scale-98"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          {gt.backBtn}
                        </button>
                        
                        <button
                          type="button"
                          disabled={verificationLoading}
                          onClick={handleVerifyPayment}
                          className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all shadow-green-500/10 active:scale-[0.99] disabled:opacity-75"
                        >
                          {verificationLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Verifying Payment...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-5 w-5" />
                              I've Paid — Verify Now
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>

            {/* Right Column: Gift Summary & Live History */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Payment Summary Box */}
              <div className="bg-gradient-to-br from-gradient-start to-gradient-end text-white rounded-3xl shadow-xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full filter blur-xl transform translate-x-10 -translate-y-10" />
                
                <h3 className="font-bold text-lg uppercase tracking-wider text-purple-200 mb-6 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-purple-300" />
                  {gt.summaryTitle}
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/10 pb-4">
                    <span className="text-purple-200">{gt.summaryType}</span>
                    <span className="font-bold bg-white/10 px-3 py-1 rounded-full text-xs tracking-wider uppercase">
                      {purpose.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-4">
                    <span className="text-purple-200">{gt.summaryMethod}</span>
                    <span className="font-semibold flex items-center gap-1.5 text-purple-100">
                      <QrCode className="w-4 h-4 text-purple-300" />
                      Dynamic UPI QR
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-4">
                    <span className="text-purple-200">{gt.summaryTax}</span>
                    <span className="font-semibold text-green-300">{gt.summaryTaxValue}</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-2xl font-semibold text-purple-200 align-middle">{gt.summaryTotal}</span>
                    <span className="text-3xl font-extrabold flex items-center gap-1">
                      <IndianRupee className="w-6 h-6 stroke-[2.5]" />
                      {Number(getFinalAmount() || "0").toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Members Live History sync section — only render after hydration */}
              {mounted && user && (
                <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/50 rounded-3xl p-6 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-[hsl(var(--primary))] animate-pulse" />
                        {gt.liveHistoryTitle}
                      </h4>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500">{gt.liveHistorySubtitle}</p>
                    </div>

                    <button 
                      onClick={() => loadHistory()} 
                      disabled={historyLoading}
                      className="p-1.5 rounded-lg bg-gray-55 dark:bg-gray-900 text-gray-400 hover:text-[hsl(var(--primary))] transition-all border border-gray-200 dark:border-gray-700"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? "animate-spin" : ""}`} />
                    </button>
                  </div>

                  {historyLoading && history.length === 0 ? (
                    <div className="py-8 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-[hsl(var(--primary))] animate-spin" />
                    </div>
                  ) : history.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                      <Receipt className="w-6 h-6 text-gray-300 dark:text-gray-650 mx-auto mb-1.5" />
                      <p className="text-xs text-gray-400 font-bold">{gt.noRecords}</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {history.slice(0, 4).map((item) => (
                        <div 
                           key={item.id}
                           className="p-3 bg-gray-55/50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700/50 rounded-xl flex items-center justify-between text-xs hover:border-[hsl(var(--primary))]/35 transition-all"
                        >
                           <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-gray-800 dark:text-gray-200 uppercase text-[10px]">
                                {item.purpose}
                              </span>
                              <span className="text-[9px] text-gray-400">
                                {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                              </span>
                            </div>
                            <span className="block text-[9px] text-gray-400 font-mono leading-none">ID: {item.id.substring(0, 8)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="font-black text-gray-900 dark:text-white">
                              ₹{item.amount.toLocaleString("en-IN")}
                            </span>
                            <a 
                              href={`/give/receipt/${item.id}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-1 rounded bg-[hsl(var(--accent))] dark:bg-[hsl(var(--accent))]/40 text-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))]/80 dark:hover:bg-[hsl(var(--accent))]/60 transition-all font-semibold"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {lastHistorySynced && (
                    <div className="text-[9px] text-gray-450 dark:text-gray-500 flex items-center justify-between font-mono">
                      <span>{gt.syncActive}</span>
                      <span>{gt.updatedAt} {lastHistorySynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Church statement card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700/50">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <Check className="h-5 w-5 text-green-500 bg-green-50 dark:bg-green-900/30 rounded-full p-1" />
                  {gt.malachiTitle}
                </h4>
                <p className="text-gray-650 dark:text-gray-400 text-xs sm:text-sm leading-relaxed italic">
                  {gt.malachiDesc}
                </p>
              </div>

              {/* Help & Support Card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700/50">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base mb-2">{gt.helpTitle}</h4>
                <p className="text-gray-650 dark:text-gray-400 text-xs sm:text-sm mb-3">
                  {gt.helpDesc}
                </p>
                <div className="space-y-1.5 text-xs sm:text-sm">
                  <p className="text-[hsl(var(--primary))] dark:text-purple-400 font-semibold">
                    {gt.helpEmail}: <a href="mailto:kingofchristministries23@gmail.com" className="hover:underline">kingofchristministries23@gmail.com</a>
                  </p>
                  <p className="text-[hsl(var(--primary))] dark:text-purple-400 font-semibold">
                    {gt.helpPhone}: <a href="tel:+919704090069" className="hover:underline">+91 97040 90069</a> | <a href="tel:+919640943777" className="hover:underline">+91 96409 43777</a> | <a href="tel:+917396433856" className="hover:underline">+91 73964 33856</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Give */}
      <section className="py-16 border-t border-gray-150 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {gt.whyHeading}
            </h2>
            <p className="text-xl text-gray-750 dark:text-gray-300 leading-relaxed mb-8">
              {gt.whySubtitle}
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              {gt.whyItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-55 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300">
                  <div className="w-6 h-6 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ways to Give: Other methods */}
      <section className="py-16 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 dark:from-purple-900/10 dark:to-indigo-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Other Ways to Give
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Bank Transfer Card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 dark:border-gray-700/30 flex flex-col justify-between">
                <div>
                  <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6">
                    <Building className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Bank Transfer / NEFT / IMPS
                  </h3>
                  <p className="text-gray-655 dark:text-gray-400 mb-6">
                    Direct bank transfer to our official church account. Perfect for larger tithings.
                  </p>
                </div>
                <div className="text-left bg-gray-55 dark:bg-gray-900/50 rounded-2xl p-5 space-y-2.5 text-xs sm:text-sm border border-gray-100 dark:border-gray-800">
                  <p className="text-gray-700 dark:text-gray-300 flex justify-between">
                    <span className="font-semibold">Account Name:</span>
                    <span>Kingdom of Christ Ministries</span>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 flex justify-between border-t border-gray-200 dark:border-gray-800 pt-2">
                    <span className="font-semibold">Account Number:</span>
                    <span className="font-mono text-purple-650 dark:text-purple-400 font-bold">12041203940129</span>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 flex justify-between border-t border-gray-200 dark:border-gray-800 pt-2">
                    <span className="font-semibold">IFSC Code:</span>
                    <span className="font-mono text-purple-650 dark:text-purple-400 font-bold">UTIB0001092</span>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 flex justify-between border-t border-gray-200 dark:border-gray-800 pt-2">
                    <span className="font-semibold">Bank Location:</span>
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
                    In-Person Envelope Giving
                  </h3>
                  <p className="text-gray-655 dark:text-gray-400 mb-6">
                    Place cash or checks in the offering envelope during any regular worship service at our locations.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs font-bold">
                  <button 
                    type="button"
                    onClick={() => {
                      sessionStorage.setItem("pending-contact-branch", "shapur");
                      window.location.href = "/#contact";
                    }}
                    className="bg-gradient-to-br from-purple-50 to-indigo-50/50 dark:from-purple-950/20 dark:to-indigo-950/10 text-purple-700 dark:text-purple-300 p-3.5 rounded-2xl border border-purple-100 dark:border-purple-900/30 shadow-sm hover:shadow-md hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer w-full"
                  >
                    <span className="text-xl">⛪</span>
                    <span>Shapur</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      sessionStorage.setItem("pending-contact-branch", "subhash");
                      window.location.href = "/#contact";
                    }}
                    className="bg-gradient-to-br from-rose-50 to-pink-50/50 dark:from-rose-950/20 dark:to-pink-950/10 text-rose-700 dark:text-rose-350 p-3.5 rounded-2xl border border-rose-100 dark:border-rose-900/30 shadow-sm hover:shadow-md hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer w-full"
                  >
                    <span className="text-xl">⛪</span>
                    <span>Subhash Nagar</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      sessionStorage.setItem("pending-contact-branch", "bahadur");
                      window.location.href = "/#contact";
                    }}
                    className="bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/10 text-emerald-700 dark:text-emerald-350 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm hover:shadow-md hover:scale-[1.03] hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-center justify-center gap-1.5 cursor-pointer w-full"
                  >
                    <span className="text-xl">⛪</span>
                    <span>Bahadurpally</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
