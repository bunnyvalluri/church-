"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
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
  ArrowLeft,
  Calendar,
  ExternalLink,
  Activity,
  Server,
  Bell,
  RefreshCw,
  Receipt
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";

export default function GivePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const pageT = t.pages.give;

  // Form states
  const [step, setStep] = useState(1); // 1: Amount & Purpose, 2: Donor Info, 3: Secure Checkout
  const [amount, setAmount] = useState<string>("1000");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("TITHE");
  const [donorName, setDonorName] = useState<string>("");
  const [donorEmail, setDonorEmail] = useState<string>("");
  const [donorPhone, setDonorPhone] = useState<string>("");

  // Payment states
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
  
  const historyInterval = useRef<NodeJS.Timeout | null>(null);
  const prevHistoryCount = useRef<number>(0);

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

  // Load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
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

  const getFinalAmount = () => {
    return customAmount ? customAmount : amount;
  };

  const validateStep1 = () => {
    const finalAmt = getFinalAmount();
    if (!finalAmt || isNaN(Number(finalAmt)) || Number(finalAmt) <= 0) {
      setErrorMessage("Please select or enter a valid amount greater than 0");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const validateStep2 = () => {
    if (!donorName.trim()) {
      setErrorMessage("Please enter your name");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(donorEmail)) {
      setErrorMessage("Please enter a valid email address");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleInitiatePayment();
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
            color: "#6366f1",
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
      setErrorMessage(err.message || "Simulated payment failed.");
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2500);
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

  const formattedPingTime = pingTime !== null ? `${pingTime}ms` : "checking...";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-20">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-20 right-4 sm:right-6 z-50 flex items-center gap-2.5 px-4.5 py-3.5 rounded-2xl shadow-2xl text-xs font-semibold border bg-indigo-600 text-white border-indigo-400/30 max-w-sm"
          >
            <Bell className="w-4 h-4 text-indigo-200 animate-bounce" />
            <div>{toast.msg}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Gradient Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/30 dark:from-indigo-950/20 dark:via-slate-950 dark:to-purple-950/15">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Glow Spheres */}
        <div className="absolute top-12 left-1/4 w-72 h-72 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full filter blur-3xl" />
        <div className="absolute top-8 right-1/4 w-80 h-80 bg-purple-400/10 dark:bg-purple-600/10 rounded-full filter blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-5">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold"
            >
              <Heart className="h-3.5 w-3.5 fill-indigo-500/20 text-indigo-500" />
              <span>Generous Giving Portal</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-950 to-indigo-900 dark:from-white dark:via-indigo-100 dark:to-purple-200"
            >
              {pageT.title || "Worship with Your Giving"}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
            >
              {pageT.subtitle || "Honor the Lord with your wealth and with the firstfruits of all your crops."}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <section className="container mx-auto px-4 -mt-4 relative z-20">
        <div className="max-w-6xl mx-auto">
          
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Hand: The Giving Form */}
            <div className="lg:col-span-8 bg-white dark:bg-gray-900 border border-slate-100 dark:border-slate-800/70 shadow-xl rounded-3xl p-6 md:p-8 space-y-8">
              
              {/* Top Form Header with Secure Indicator */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/60">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    Online Offerings & Tithes
                  </h2>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
                    Select your amount and details to worship securely.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-[11px] font-mono">{formattedPingTime}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>256-bit SSL</span>
                  </div>
                </div>
              </div>

              {/* Step Navigation Indicators */}
              <div className="flex items-center justify-between max-w-md mx-auto relative px-4">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 z-0" />
                <div 
                  className="absolute top-1/2 left-0 h-0.5 bg-indigo-500 -translate-y-1/2 z-0 transition-all duration-300"
                  style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%" }}
                />

                {[
                  { s: 1, label: "Amount & Purpose" },
                  { s: 2, label: "Donor Details" },
                  { s: 3, label: "Secure Payment" }
                ].map((item) => {
                  const isCompleted = step > item.s;
                  const isActive = step === item.s;
                  return (
                    <div key={item.s} className="relative z-10 flex flex-col items-center gap-1.5">
                      <button
                        onClick={() => {
                          if (item.s === 1) setStep(1);
                          if (item.s === 2 && validateStep1()) setStep(2);
                        }}
                        disabled={item.s === 3}
                        className={`w-9 h-9 rounded-full flex items-center justify-center border font-bold text-xs transition-all ${
                          isCompleted
                            ? "bg-indigo-600 text-white border-transparent"
                            : isActive
                            ? "bg-white dark:bg-slate-900 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-4 ring-indigo-500/10"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : item.s}
                      </button>
                      <span className={`text-[10px] font-bold uppercase tracking-wider hidden sm:block ${
                        isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
                      }`}>{item.label}</span>
                    </div>
                  );
                })}
              </div>

              {errorMessage && (
                <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="font-semibold">{errorMessage}</span>
                </div>
              )}

              {/* Form Content Steps */}
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                    {/* Amount Selection presets */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Select Offering Amount (₹)
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                        {["500", "1000", "2000", "5000", "10000"].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              setAmount(preset);
                              setCustomAmount("");
                            }}
                            className={`py-3 px-3 rounded-xl border text-center font-extrabold text-sm transition-all duration-200 ${
                              amount === preset && !customAmount
                                ? "bg-indigo-600 text-white border-transparent shadow-md shadow-indigo-600/15"
                                : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                            }`}
                          >
                            ₹{Number(preset).toLocaleString("en-IN")}
                          </button>
                        ))}

                        {/* Custom amount wrapper */}
                        <div className="relative col-span-3 sm:col-span-1 border rounded-xl flex items-center bg-slate-50/50 dark:bg-slate-800/40 overflow-hidden border-slate-200/60 dark:border-slate-800 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                          <span className="pl-3 text-slate-400 font-extrabold text-sm">₹</span>
                          <input
                            type="number"
                            placeholder="Custom"
                            value={customAmount}
                            onChange={(e) => {
                              setCustomAmount(e.target.value);
                              setAmount("");
                            }}
                            className="w-full bg-transparent py-3 pl-1 pr-3 font-extrabold text-sm outline-none text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Purpose Selection Cards Grid */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                        Purpose of Giving
                      </label>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          { id: "TITHE", name: "Tithe (పదియవ భాగం)", desc: "10% of monthly income" },
                          { id: "OFFERING", name: "Online Offering (ఆరాధన కానుక)", desc: "General offerings to the Lord" },
                          { id: "BUILDING", name: "Building Fund (భవన నిధి)", desc: "Church expansion projects" },
                          { id: "MISSIONS", name: "Missions (మిషన్స్ నిధి)", desc: "Local and global outreach" },
                          { id: "CHARITY", name: "Benevolence (ధర్మకార్యాలు)", desc: "Supporting the poor & widows" },
                          { id: "OTHER", name: "Other Specific Offering", desc: "Special vow or pledge gifts" }
                        ].map((item) => {
                          const isSelected = purpose === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => setPurpose(item.id)}
                              className={`p-4 rounded-2xl border cursor-pointer select-none transition-all flex items-start gap-3.5 ${
                                isSelected
                                  ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 ring-4 ring-indigo-500/5"
                                  : "border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-900/40"
                              }`}
                            >
                              <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                                isSelected ? "bg-indigo-500/10 text-indigo-500" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                              }`}>
                                {getPurposeIcon(item.id)}
                              </div>
                              <div className="space-y-0.5">
                                <span className="block font-bold text-slate-900 dark:text-white text-[13px] leading-tight">
                                  {item.name}
                                </span>
                                <span className="block text-slate-400 dark:text-slate-500 text-[11px]">
                                  {item.desc}
                                </span>
                              </div>
                              
                              {isSelected && (
                                <div className="ml-auto w-4.5 h-4.5 bg-indigo-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all shadow-indigo-600/10 active:scale-[0.99] text-xs uppercase tracking-wider"
                    >
                      Continue to Details
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        Donor Contact Information
                      </h3>
                      <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
                        Receipts will be sent directly to this address.
                      </p>
                    </div>

                    {/* Quick Login Invite if guest */}
                    {!user && (
                      <div className="p-4 bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/20 rounded-2xl flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <span className="block font-bold text-slate-900 dark:text-white text-xs">Logged-in Members Track Giving</span>
                          <span className="block text-slate-500 dark:text-slate-400 text-[10px]">Log in to automatically save and track your donation histories.</span>
                        </div>
                        <Link 
                          href="/login?redirect=/give" 
                          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold whitespace-nowrap transition-all"
                        >
                          Sign In
                        </Link>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Full Name *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Enter your full name"
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            className="w-full py-3 px-4 pl-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all font-semibold"
                          />
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Email Address *
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              placeholder="example@email.com"
                              value={donorEmail}
                              onChange={(e) => setDonorEmail(e.target.value)}
                              className="w-full py-3 px-4 pl-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all font-semibold"
                            />
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Phone Number (Optional)
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              placeholder="10-digit mobile number"
                              value={donorPhone}
                              onChange={(e) => setDonorPhone(e.target.value)}
                              className="w-full py-3 px-4 pl-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all font-semibold"
                            />
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-all border border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleNextStep}
                        className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all shadow-indigo-600/10 active:scale-[0.99] disabled:opacity-50 text-xs uppercase tracking-wider"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4.5 h-4.5 animate-spin" />
                            Initializing...
                          </>
                        ) : (
                          <>
                            Pay Securely (₹{Number(getFinalAmount()).toLocaleString("en-IN")})
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Hand: Summary & Dynamic History */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Gift Receipt Invoice Box */}
              <div className="bg-white dark:bg-gray-900 border border-slate-200/60 dark:border-slate-800 shadow-xl rounded-3xl p-6 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600" />
                
                <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-500" />
                  Donation Summary
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <span className="text-slate-400">Giving Type</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md border border-indigo-100/40 dark:border-indigo-900/30">
                      {purpose.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <span className="text-slate-400">Gateway Provider</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">Razorpay India</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <span className="text-slate-400">Tax Deductible</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md">80G Approved</span>
                  </div>

                  {/* Cutoff design element */}
                  <div className="border-t border-dashed border-slate-200 dark:border-slate-800 my-2 pt-2" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Total Gift</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-0.5">
                      <span className="text-base font-extrabold">₹</span>
                      {Number(getFinalAmount() || "0").toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Members Live History sync section */}
              {user && (
                <div className="bg-white dark:bg-gray-900 border border-slate-100 dark:border-slate-800 shadow-lg rounded-3xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-indigo-500" />
                        Live Giving History
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Auto-polls every 30s</p>
                    </div>

                    <button 
                      onClick={() => loadHistory()} 
                      disabled={historyLoading}
                      className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-all border border-slate-200/50 dark:border-slate-700"
                    >
                      <RefreshCw className={`w-3 h-3 ${historyLoading ? "animate-spin" : ""}`} />
                    </button>
                  </div>

                  {historyLoading && history.length === 0 ? (
                    <div className="py-8 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                    </div>
                  ) : history.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      <Receipt className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
                      <p className="text-[11px] text-slate-400 font-bold">No recent giving records</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {history.slice(0, 4).map((item) => (
                        <div 
                          key={item.id}
                          className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs hover:border-indigo-100/50 dark:hover:border-indigo-900/30 transition-all"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px]">
                                {item.purpose}
                              </span>
                              <span className="text-[9px] text-slate-400">
                                {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                              </span>
                            </div>
                            <span className="block text-[9px] text-slate-400 font-mono leading-none">ID: {item.id.substring(0, 8)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 dark:text-white">
                              ₹{item.amount.toLocaleString("en-IN")}
                            </span>
                            <a 
                              href={`/give/receipt/${item.id}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-1 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {lastHistorySynced && (
                    <div className="text-[9px] text-slate-400 flex items-center justify-between">
                      <span>Sync active</span>
                      <span>Updated {lastHistorySynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Bible Verse block */}
              <div className="bg-white dark:bg-gray-900 border border-slate-100 dark:border-slate-800 shadow-md rounded-3xl p-5 flex items-start gap-3.5">
                <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-xl flex-shrink-0">
                  <Heart className="w-4.5 h-4.5 fill-rose-500/20 text-rose-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs leading-none">cheerful Giver (2 Cor 9:7)</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed italic">
                    "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Give Statement Cards */}
      <section className="container mx-auto px-4 mt-20">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">
              {pageT.why || "Impact of Your Generosity"}
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Your financial contributions directly support local outreach, global missions, and the building of God's house.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { title: "Spread the Gospel", desc: "Funding local crusades, village missions, and street outreach campaigns across India.", icon: Globe, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30" },
              { title: "Community Welfare", desc: "Supporting orphans, helping poor widows, and feeding underprivileged families with essentials.", icon: Heart, color: "text-rose-500 bg-rose-50 dark:bg-rose-950/30" },
              { title: "Facility & Ministry", desc: "Maintaining church worship centers and training upcoming spiritual leaders and pastors.", icon: Building, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30" },
            ].map((card, i) => (
              <div 
                key={i} 
                className="bg-white dark:bg-gray-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-100/50 dark:hover:border-indigo-900/30 rounded-2xl p-5 space-y-4 transition-all"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-slate-900 dark:text-white text-[13px]">{card.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alternative Ways to Give */}
      <section className="container mx-auto px-4 mt-20">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">Other Ways to Give</h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              If you prefer to make offline donations, we support direct bank transfers and envelope giving.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Bank Transfer */}
            <div className="bg-white dark:bg-gray-900 border border-slate-100 dark:border-slate-800 shadow-lg rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 rounded-2xl flex items-center justify-center">
                  <Building className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bank Transfer / NEFT / IMPS</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                    Make a direct transaction from your bank account to the church's official bank ledger.
                  </p>
                </div>
              </div>

              {/* Bank Metadata detail list */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4.5 space-y-3.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Account Name</span>
                  <span className="font-bold text-slate-900 dark:text-white">Kingdom of Christ Ministries</span>
                </div>
                
                <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  <span className="text-slate-400 font-medium">Account Number</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">12041203940129</span>
                    <button 
                      onClick={() => copyToClipboard("12041203940129", "Account Number")}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  <span className="text-slate-400 font-medium">IFSC Code</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">UTIB0001092</span>
                    <button 
                      onClick={() => copyToClipboard("UTIB0001092", "IFSC Code")}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/80 pt-3">
                  <span className="text-slate-400 font-medium">Bank Name</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Axis Bank, Jeedimetla</span>
                </div>
              </div>
              
              {copiedLabel && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-xl text-center">
                  Successfully copied {copiedLabel} to clipboard!
                </div>
              )}
            </div>

            {/* In-Person Envelope */}
            <div className="bg-white dark:bg-gray-900 border border-slate-100 dark:border-slate-800 shadow-lg rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/30 text-rose-500 rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">In-Person Envelope Giving</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                    Place your physical tithe and cash offerings in envelopes during any regular Sunday services.
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Service Locations</h4>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  {["Shapur", "Subhash Nagar", "Bahadurpally"].map((loc) => (
                    <div 
                      key={loc} 
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 p-3.5 rounded-xl"
                    >
                      {loc}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed bg-slate-50/50 dark:bg-slate-950/25 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                Contact the parish ledger desk at the main hall if you require a physical signed society receipt booklet for your ledger files.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Simulated Credit Card Payment Modal */}
      <AnimatePresence>
        {showSimulatedModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 dark:border-slate-800 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
              
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400">
                <Server className="w-6 h-6 animate-pulse" />
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                Simulated Sandbox Payment
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 leading-relaxed max-w-xs mx-auto">
                No live payment credentials detected. This transaction is operating on local mock logs.
              </p>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl p-4.5 mb-6 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Donor Name</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{donorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Exemption Purpose</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">{purpose}</span>
                </div>
                
                <div className="border-t border-slate-150 dark:border-slate-850 pt-2 flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-900 dark:text-white">Amount Due</span>
                  <span className="text-indigo-600 dark:text-indigo-400">₹{Number(getFinalAmount()).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleSimulatePaymentSuccess}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Simulate Payment Success
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSimulatedModal(false);
                    setLoading(false);
                  }}
                  className="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-all active:scale-[0.98] text-xs uppercase tracking-wider border border-slate-200 dark:border-slate-705"
                >
                  Cancel Order
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
