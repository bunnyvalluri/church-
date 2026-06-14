"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  CreditCard, 
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
  Calendar,
  ExternalLink,
  Activity,
  Server,
  Bell,
  RefreshCw,
  Receipt,
  QrCode
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Load Razorpay script dynamically outside the component
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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
  const { user } = useAuth();
  const pathname = usePathname() || "";
  const isPortalRoute = pathname.startsWith("/member");
  const gt = t.pages.give;
  const pageT = gt;

  // Payment mode selector: "GATEWAY" (Razorpay) or "UPI" (Google Pay Scanner)
  const [paymentMode, setPaymentMode] = useState<"GATEWAY" | "UPI">("GATEWAY");

  // Form states (shared between modes)
  const [step, setStep] = useState(1); // Gateway steps: 1 (Amount/Purpose), 2 (Donor Details)
  const [upiStep, setUpiStep] = useState(1); // UPI steps: 1 (Scan & Pay), 2 (Submit Details)
  
  const [amount, setAmount] = useState<string>("1000");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("TITHE");
  const [donorName, setDonorName] = useState<string>("");
  const [donorEmail, setDonorEmail] = useState<string>("");
  const [donorPhone, setDonorPhone] = useState<string>("");
  const [upiTransactionRef, setUpiTransactionRef] = useState<string>("");

  // Payment backend execution states
  const [loading, setLoading] = useState(false);
  const [showSimulatedModal, setShowSimulatedModal] = useState(false);
  const [pendingDonationId, setPendingDonationId] = useState("");
  const [pendingOrderId, setPendingOrderId] = useState("");
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

  // Prevent SSR/client hydration mismatch from user-dependent rendering
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

  // loadRazorpayScript is moved to module scope (above)

  const getFinalAmount = () => {
    return customAmount ? customAmount : amount;
  };

  const validateStep1 = () => {
    const finalAmt = getFinalAmount();
    if (!finalAmt || isNaN(Number(finalAmt)) || Number(finalAmt) <= 0) {
      setErrorMessage(gt.errors.validAmount);
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const validateStep2 = () => {
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

  const handleNextStep = () => {
    if (paymentMode === "GATEWAY") {
      if (step === 1 && validateStep1()) {
        setStep(2);
      } else if (step === 2 && validateStep2()) {
        handleInitiatePayment();
      }
    } else {
      if (upiStep === 1 && validateStep1()) {
        setUpiStep(2);
      } else if (upiStep === 2 && validateStep2()) {
        handleRegisterUPI();
      }
    }
  };

  const handleInitiatePayment = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const finalAmt = getFinalAmount();
      const res = await fetch("/api/donations/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(finalAmt),
          purpose,
          donorName,
          donorEmail,
          donorPhone,
          userId: user?.uid || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Initialization failed");
      }

      setPendingDonationId(data.donationId);
      setPendingOrderId(data.orderId);

      // If mock keys are active, open the simulated credit card interface
      if (data.isMock) {
        setShowSimulatedModal(true);
        setLoading(false);
      } else {
        // Try real Razorpay checkout
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
          throw new Error("Razorpay payment gateway failed to load. Please check your internet connection.");
        }

        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: "Kingdom of Christ Ministries",
          description: `Donation for ${purpose.replace('_', ' ')}`,
          order_id: data.orderId,
          prefill: {
            name: donorName,
            email: donorEmail,
            contact: donorPhone,
          },
          theme: {
            color: "#8B5CF6", // purple matching the church theme
          },
          handler: async function (response: any) {
            setLoading(true);
            try {
              const verifyRes = await fetch("/api/donations/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  donationId: data.donationId,
                  amount: Number(finalAmt),
                  purpose,
                  donorName,
                  donorEmail,
                  donorPhone,
                  userId: user?.uid || null,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                window.location.href = `/give/receipt/${data.donationId}`;
              } else {
                throw new Error(verifyData.error || "Verification failed");
              }
            } catch (err: any) {
              setErrorMessage(err.message || "Payment verification failed. Please contact support.");
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
              console.log("Payment canceled");
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  // Submit manual UPI details for backend record auditing
  const handleRegisterUPI = async () => {
    setLoading(true);
    setErrorMessage("");

    if (!validateStep1() || !validateStep2()) {
      setLoading(false);
      return;
    }

    if (!upiTransactionRef.trim()) {
      setErrorMessage(gt.errors.enterUtr);
      setLoading(false);
      return;
    }

    if (upiTransactionRef.trim().length < 8) {
      setErrorMessage(gt.errors.validUtr);
      setLoading(false);
      return;
    }

    try {
      const finalAmt = getFinalAmount();
      
      // Step 1: Create a pending order
      const res = await fetch("/api/donations/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(finalAmt),
          purpose,
          donorName,
          donorEmail,
          donorPhone,
          userId: user?.uid || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "UPI registration initialization failed.");
      }

      // Step 2: Verify the payment using the entered UTR number directly (bypasses signature check in mock/manual fallback)
      const verifyRes = await fetch("/api/donations/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpayOrderId: data.orderId,
          razorpayPaymentId: upiTransactionRef.trim(), // Stores UPI UTR as Payment ID
          razorpaySignature: "", // falsy signature signals simulated/manual check
          donationId: data.donationId,
          amount: Number(finalAmt),
          purpose,
          donorName,
          donorEmail,
          donorPhone,
          userId: user?.uid || null,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        window.location.href = `/give/receipt/${data.donationId}`;
      } else {
        throw new Error(verifyData.error || "Simulated UPI Verification failed.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || gt.errors.recordUpiFailed);
      setLoading(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    setLoading(true);
    setShowSimulatedModal(false);
    const finalAmt = getFinalAmount();

    try {
      const mockPayId = `pay_mock_${Math.random().toString(36).substring(2, 10)}`;
      const verifyRes = await fetch("/api/donations/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpayOrderId: pendingOrderId,
          razorpayPaymentId: mockPayId,
          razorpaySignature: "", // simulated
          donationId: pendingDonationId,
          amount: Number(finalAmt),
          purpose,
          donorName,
          donorEmail,
          donorPhone,
          userId: user?.uid || null,
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        window.location.href = `/give/receipt/${pendingDonationId}`;
      } else {
        throw new Error(verifyData.error || "Simulation verification failed");
      }
    } catch (err: any) {
      setErrorMessage(err.message || gt.errors.paymentFailed);
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2500);
  };

  // getPurposeIcon is moved to module scope (above)

  const formattedPingTime = pingTime !== null ? `${pingTime}ms` : "checking...";

  if (!mounted) return null;

  const innerContent = (
    <>
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-20 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-4.5 py-3.5 rounded-2xl shadow-2xl text-xs font-semibold border bg-[hsl(var(--primary))] text-white border-purple-400/30 max-w-sm"
          >
            <Bell className="w-4 h-4 text-purple-200 animate-bounce" />
            <div>{toast.msg}</div>
          </motion.div>
        )}
      </AnimatePresence>

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
                {language === 'en' ? 'Generous Giving' : language === 'te' ? 'దాతృత్వము' : 'उदार दान'}
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

      {/* Main Interactive Segment (Matches 2-column layout width of previous version) */}
      <section className="py-20 -mt-10 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-12 max-w-6xl mx-auto items-start">
            
            {/* Left Column: Giving Form */}
            <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-4 sm:p-8 border border-gray-100 dark:border-gray-700/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-[hsl(var(--primary))]" />
                    {gt.formTitle}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
                    {gt.formSubtitle}
                  </p>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 bg-gray-55/65 dark:bg-gray-900/60 sm:bg-transparent sm:dark:bg-transparent p-2 sm:p-0 rounded-xl w-full sm:w-auto">
                  <div className="flex items-center gap-1.5 bg-[hsl(var(--accent))] dark:bg-[hsl(var(--accent))]/30 px-2.5 py-1 rounded-full text-[hsl(var(--primary))] text-[10px] sm:text-xs font-semibold">
                    <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    {language === 'en' ? 'Secure' : language === 'te' ? 'భద్రమైనది' : 'सुरक्षित'}
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-mono text-gray-400 dark:text-gray-500">Ping: {formattedPingTime}</span>
                </div>
              </div>

              {/* Payment Mode Selector Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-750 mb-8">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMode("GATEWAY");
                  }}
                  className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    paymentMode === "GATEWAY"
                      ? "bg-white dark:bg-gray-800 text-[hsl(var(--primary))] shadow-md border border-gray-100 dark:border-gray-700"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{gt.cardTab}</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMode("UPI");
                  }}
                  className={`py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    paymentMode === "UPI"
                      ? "bg-white dark:bg-gray-800 text-[hsl(var(--primary))] shadow-md border border-gray-100 dark:border-gray-700"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>{gt.qrTab}</span>
                </button>
              </div>

              {/* Steps Indicator */}
              {paymentMode === "GATEWAY" ? (
                <div className="flex items-center gap-2 mb-8">
                  <div className={`h-2 flex-1 rounded-full transition-all duration-300`} style={{ backgroundColor: step >= 1 ? 'hsl(var(--primary))' : '#E5E7EB' }} />
                  <div className={`h-2 flex-1 rounded-full transition-all duration-300`} style={{ backgroundColor: step >= 2 ? 'hsl(var(--primary))' : '#E5E7EB' }} />
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-8">
                  <div className={`h-2 flex-1 rounded-full transition-all duration-300`} style={{ backgroundColor: upiStep >= 1 ? 'hsl(var(--primary))' : '#E5E7EB' }} />
                  <div className={`h-2 flex-1 rounded-full transition-all duration-300`} style={{ backgroundColor: upiStep >= 2 ? 'hsl(var(--primary))' : '#E5E7EB' }} />
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 text-sm rounded-lg flex items-start gap-2">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <AnimatePresence mode="wait">
                {paymentMode === "GATEWAY" ? (
                  // GATEWAY WIZARD
                  <div key="gateway-wizard">
                    {step === 1 ? (
                      <motion.div
                        key="gateway-step-1"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        {/* Amount Selection */}
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

                        {/* Purpose Selection */}
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
                                className={`p-4 rounded-xl border text-left cursor-pointer select-none transition-all flex flex-col justify-between w-full ${
                                  purpose === id
                                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--accent))]/50 dark:bg-[hsl(var(--accent))]/20 ring-2 ring-[hsl(var(--primary))]/25"
                                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-650"
                                }`}
                              >
                                <div>
                                  <span className="block font-bold text-gray-900 dark:text-white text-base">
                                    {item.name}
                                  </span>
                                  <span className="block text-gray-500 dark:text-gray-400 text-xs mt-1">
                                    {item.desc}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleNextStep}
                          className="w-full py-4 bg-gradient-to-r from-gradient-start to-gradient-end text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all shadow-[hsl(var(--primary))]/10 active:scale-[0.99]"
                        >
                          {gt.continueBtn}
                          <ArrowRight className="h-5 w-5" />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="gateway-step-2"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                            {gt.contactTitle}
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            {gt.contactSubtitle}
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-all"
                          >
                            {gt.backBtn}
                          </button>
                          <button
                            type="button"
                            disabled={loading}
                            onClick={handleNextStep}
                            className="flex-[2] py-4 bg-gradient-to-r from-[hsl(var(--primary-gradient-start))] to-[hsl(var(--primary-gradient-end))] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all shadow-[hsl(var(--primary))]/10 active:scale-[0.99] disabled:opacity-50"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {gt.initializing}
                              </>
                            ) : (
                              <>
                                {gt.paySecurely} (₹{Number(getFinalAmount()).toLocaleString("en-IN")})
                                <ArrowRight className="h-5 w-5" />
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  // UPI QR CODE WIZARD
                  <div key="upi-wizard">
                    {upiStep === 1 ? (
                      <motion.div
                        key="upi-step-1"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        className="flex flex-col items-center space-y-6 text-center"
                      >
                        {/* QR Code container */}
                        <div className="bg-gray-55 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-inner flex flex-col items-center max-w-sm w-full mx-auto">
                          <div className="relative w-56 h-80 bg-white rounded-2xl overflow-hidden shadow-md flex items-center justify-center border border-gray-100">
                            <Image
                              src="/upi_qr.png"
                              alt="UPI Google Pay Scanner"
                              fill unoptimized
                              className="object-contain p-2"
                            />
                          </div>

                          {/* UPI Copy block */}
                          <div className="mt-5 w-full bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-750 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs font-semibold">
                            <div className="text-left font-mono">
                              <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-wider">{gt.upiIdLabel}</span>
                              <span className="text-gray-800 dark:text-gray-200 font-bold select-all">kcm.kristhraj2004-1@okicici</span>
                            </div>
                            <button 
                              type="button"
                              onClick={() => copyToClipboard("kcm.kristhraj2004-1@okicici", "UPI ID")}
                              className="p-2 bg-gray-55 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-[hsl(var(--primary))] transition-all border border-gray-200 dark:border-gray-700"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 max-w-md">
                          <p className="font-bold text-gray-800 dark:text-gray-200">{gt.scanTitle}</p>
                          <p className="text-xs text-gray-500 leading-relaxed max-w-xs mx-auto">
                            {gt.scanDesc}
                          </p>
                        </div>

                        {copiedLabel === "UPI ID" && (
                          <div className="w-full max-w-sm py-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl">
                            {gt.copiedToast}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setUpiStep(2)}
                          className="w-full py-4 bg-gradient-to-r from-gradient-start to-gradient-end text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all shadow-[hsl(var(--primary))]/10 active:scale-[0.99]"
                        >
                          {gt.scannedPaidBtn}
                          <ArrowRight className="h-5 w-5" />
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="upi-step-2"
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        className="space-y-5"
                      >
                        {/* Amount presets & inputs */}
                        <div>
                          <label className="block text-gray-700 dark:text-gray-300 font-bold mb-3">
                            {gt.presetsTitleUpi}
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

                        {/* Purpose Selection */}
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
                                className={`p-4 rounded-xl border text-left cursor-pointer select-none transition-all flex flex-col justify-between w-full ${
                                  purpose === id
                                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--accent))]/50 dark:bg-[hsl(var(--accent))]/20 ring-2 ring-[hsl(var(--primary))]/25"
                                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-650"
                                }`}
                              >
                                <div>
                                  <span className="block font-bold text-gray-900 dark:text-white text-base">
                                    {item.name}
                                  </span>
                                  <span className="block text-gray-500 dark:text-gray-400 text-xs mt-1">
                                    {item.desc}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4 pt-4 border-t border-gray-150 dark:border-gray-700">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                              {gt.fullNameLabel}
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder={gt.fullNamePlaceholder}
                                value={donorName}
                                onChange={(e) => setDonorName(e.target.value)}
                                className="w-full py-3 px-4 pl-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-55 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-[hsl(var(--primary))] focus:outline-none font-semibold"
                              />
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            </div>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                {gt.emailLabel}
                              </label>
                              <div className="relative">
                                <input
                                  type="email"
                                  placeholder={gt.emailPlaceholder}
                                  value={donorEmail}
                                  onChange={(e) => setDonorEmail(e.target.value)}
                                  className="w-full py-3 px-4 pl-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-55 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-[hsl(var(--primary))] focus:outline-none font-semibold"
                                />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
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
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                              </div>
                            </div>
                          </div>

                          {/* UPI Transaction Ref */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                              {gt.utrLabel}
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                maxLength={16}
                                placeholder={gt.utrPlaceholder}
                                value={upiTransactionRef}
                                onChange={(e) => setUpiTransactionRef(e.target.value)}
                                className="w-full py-3 px-4 pl-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-55 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-[hsl(var(--primary))] focus:outline-none font-mono font-bold text-[hsl(var(--primary))] tracking-wider"
                              />
                              <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {gt.utrDesc}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => setUpiStep(1)}
                            className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-all"
                          >
                            {gt.backToQrBtn}
                          </button>
                          
                          <button
                            type="button"
                            disabled={loading}
                            onClick={handleNextStep}
                            className="flex-[2] py-4 bg-gradient-to-r from-gradient-start to-gradient-end text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all shadow-[hsl(var(--primary))]/10 active:scale-[0.99] disabled:opacity-50"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Registering...
                              </>
                            ) : (
                              <>
                                Submit UPI Record & Get Receipt
                                <ArrowRight className="h-5 w-5" />
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column: Dynamic summary & Why Give context */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Payment Summary Box */}
              <div className="bg-gradient-to-br from-gradient-start to-gradient-end text-white rounded-3xl shadow-xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full filter blur-xl transform translate-x-10 -translate-y-10" />
                
                <h3 className="font-bold text-lg uppercase tracking-wider text-purple-200 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-300" />
                  {gt.summaryTitle}
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/10 pb-4">
                    <span className="text-purple-200">{gt.summaryType}</span>
                    <span className="font-bold bg-white/10 px-3 py-1 rounded-full text-xs tracking-wider">
                      {purpose.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-4">
                    <span className="text-purple-200">{gt.summaryMethod}</span>
                    <span className="font-semibold">
                      {paymentMode === "UPI" ? gt.summaryMethodUpi : gt.summaryMethodReal}
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
                    <div className="text-[9px] text-gray-450 dark:text-gray-500 flex items-center justify-between">
                      <span>{gt.syncActive}</span>
                      <span>{gt.updatedAt} {lastHistorySynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Church statement card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700/50">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500 bg-green-50 dark:bg-green-900/30 rounded-full p-1" />
                  {gt.malachiTitle}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed italic">
                  {gt.malachiDesc}
                </p>
              </div>

              {/* Help & Support Card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700/50">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">{gt.helpTitle}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  {gt.helpDesc}
                </p>
                <div className="space-y-1.5 text-sm">
                  <p className="text-[hsl(var(--primary))] dark:text-purple-400 font-semibold">
                    {gt.helpEmail}: <a href="mailto:kingofchristministries23@gmail.com" className="hover:underline">kingofchristministries23@gmail.com</a>
                  </p>
                  <p className="text-[hsl(var(--primary))] dark:text-purple-400 font-semibold">
                    {gt.helpPhone}: <a href="tel:+919640943777" className="hover:underline">+91 96409 43777</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Give (Full width bottom section matching previous layout) */}
      <section className="py-16 border-t border-gray-150 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {gt.whyHeading}
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              {gt.whySubtitle}
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              {gt.whyItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300">
                  <div className="w-6 h-6 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">{item}</p>
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
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Direct bank transfer to our official church account. Perfect for larger tithings.
                  </p>
                </div>
                <div className="text-left bg-gray-55 dark:bg-gray-900/50 rounded-2xl p-5 space-y-2.5 text-sm border border-gray-100 dark:border-gray-800">
                  <p className="text-gray-700 dark:text-gray-300 flex justify-between">
                    <span className="font-semibold">Account Name:</span>
                    <span>Kingdom of Christ Ministries</span>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 flex justify-between border-t border-gray-200 dark:border-gray-800 pt-2">
                    <span className="font-semibold">Account Number:</span>
                    <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">12041203940129</span>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 flex justify-between border-t border-gray-200 dark:border-gray-800 pt-2">
                    <span className="font-semibold">IFSC Code:</span>
                    <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">UTIB0001092</span>
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
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Place cash or checks in the offering envelope during any regular worship service at our locations.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs sm:text-sm font-bold">
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

      {/* Simulated Credit Card payment modal overlay */}
      <AnimatePresence>
        {showSimulatedModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-700 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-purple-500 to-indigo-600" />
              
              <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-600 dark:text-purple-400">
                <Sparkles className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Simulated Payment Gateway
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                You are currently in **Test Mode** (no live keys detected). Click below to authorize the mock payment securely.
              </p>

              <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900 rounded-2xl p-5 mb-8 text-left space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Donor:</span> {donorName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Purpose:</span> {purpose}
                </p>
                <p className="text-lg font-bold text-purple-700 dark:text-purple-300 border-t border-purple-100 dark:border-purple-900 pt-2 flex justify-between">
                  <span>Amount due:</span>
                  <span>₹{getFinalAmount()}</span>
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleSimulatePaymentSuccess}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Simulate Payment Success
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSimulatedModal(false);
                    setLoading(false);
                  }}
                  className="w-full py-3.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all active:scale-[0.98]"
                >
                  Cancel Order
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );

  return innerContent;
}
