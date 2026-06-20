"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Heart, CreditCard, QrCode, Lock, ShieldAlert, Loader2, ArrowRight, Copy, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/lib/translations";

export default function NgoDonationsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  const [paymentMode, setPaymentMode] = useState<"GATEWAY" | "UPI">("GATEWAY");
  const [step, setStep] = useState(1);
  const [upiStep, setUpiStep] = useState(1);
  
  const [amount, setAmount] = useState("1000");
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [upiTransactionRef, setUpiTransactionRef] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ngoT = mounted ? t.ngo : translations.en.ngo;

  useEffect(() => {
    if (user) {
      setDonorName(user.name || "");
      setDonorEmail(user.email || "");
    }
  }, [user]);

  const getFinalAmount = () => customAmount ? customAmount : amount;

  const validateStep1 = () => {
    const finalAmt = getFinalAmount();
    if (!finalAmt || isNaN(Number(finalAmt)) || Number(finalAmt) <= 0) {
      setErrorMessage(ngoT.donationsPage.validationAmount);
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const validateStep2 = () => {
    if (!donorName.trim()) {
      setErrorMessage(ngoT.donationsPage.validationName);
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(donorEmail)) {
      setErrorMessage(ngoT.donationsPage.validationEmail);
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const handleNextStep = () => {
    if (paymentMode === "GATEWAY") {
      if (step === 1 && validateStep1()) setStep(2);
      else if (step === 2 && validateStep2()) handleInitiatePayment();
    } else {
      if (upiStep === 1 && validateStep1()) setUpiStep(2);
      else if (upiStep === 2 && validateStep2()) handleRegisterUPI();
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
          purpose: "CHARITY", // Map to CHARITY for NGO
          donorName,
          donorEmail,
          donorPhone,
          userId: user?.uid || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to initialize payment order.");
      }

      // Automatically complete order via simulated mock if key is mock
      if (data.isMock) {
        const mockPayId = `pay_mock_${Math.random().toString(36).substring(2, 10)}`;
        const verifyRes = await fetch("/api/donations/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpayOrderId: data.orderId,
            razorpayPaymentId: mockPayId,
            razorpaySignature: "",
            donationId: data.donationId,
            amount: Number(finalAmt),
            purpose: "CHARITY",
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
          throw new Error(verifyData.error || "Payment verification failed.");
        }
      } else {
        // Load Razorpay Script dynamically
        const rzpScript = document.createElement("script");
        rzpScript.src = "https://checkout.razorpay.com/v1/checkout.js";
        rzpScript.async = true;
        rzpScript.onload = () => {
          const options = {
            key: data.keyId,
            amount: data.amount,
            currency: data.currency,
            name: "Kingdom of Christ Ministries NGO",
            description: "Donation for Social Services & Hospital Camps",
            order_id: data.orderId,
            prefill: {
              name: donorName,
              email: donorEmail,
              contact: donorPhone,
            },
            theme: { color: "#9333ea" },
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
                    purpose: "CHARITY",
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
                setErrorMessage(err.message || "Verification failed");
                setLoading(false);
              }
            },
            modal: {
              ondismiss: () => setLoading(false)
            }
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        };
        document.body.appendChild(rzpScript);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleRegisterUPI = async () => {
    setLoading(true);
    setErrorMessage("");

    if (!upiTransactionRef.trim() || upiTransactionRef.length < 8) {
      setErrorMessage(ngoT.donationsPage.validationUtr);
      setLoading(false);
      return;
    }

    try {
      const finalAmt = getFinalAmount();
      
      const res = await fetch("/api/donations/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(finalAmt),
          purpose: "CHARITY",
          donorName,
          donorEmail,
          donorPhone,
          userId: user?.uid || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to initialize UPI order.");
      }

      const verifyRes = await fetch("/api/donations/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpayOrderId: data.orderId,
          razorpayPaymentId: upiTransactionRef.trim(),
          razorpaySignature: "",
          donationId: data.donationId,
          amount: Number(finalAmt),
          purpose: "CHARITY",
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
        throw new Error(verifyData.error || "UPI Verification failed");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save UPI record.");
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2500);
  };

  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-12 gap-12 max-w-5xl mx-auto items-start">
          
          {/* Left Column: Info */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 dark:border-red-500/30 text-red-600 dark:text-red-300 text-xs font-semibold uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 fill-current text-red-500 dark:text-red-400" />
              {ngoT.donationsPage.tag}
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-purple-600 dark:from-white dark:to-purple-400 bg-clip-text text-transparent">
              {ngoT.donationsPage.title}
            </h1>

            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              {ngoT.donationsPage.desc}
            </p>

            <div className="p-5 border border-slate-200 dark:border-white/5 rounded-2xl bg-slate-100/40 dark:bg-slate-900/40 text-xs space-y-2 text-slate-600 dark:text-slate-400">
              <p>{ngoT.donationsPage.beneficiaries}</p>
              <p>{ngoT.donationsPage.secure}</p>
            </div>
          </div>

          {/* Right Column: Donation Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-lg dark:shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{ngoT.donationsPage.formTitle}</h3>
              <div className="flex items-center gap-1 bg-purple-500/10 text-purple-600 dark:text-purple-300 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <Lock className="w-3 h-3" /> {ngoT.donationsPage.secureTag}
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-white/5 mb-6">
              <button
                type="button"
                onClick={() => setPaymentMode("GATEWAY")}
                className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  paymentMode === "GATEWAY"
                    ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 border border-slate-200 dark:border-white/5 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{ngoT.donationsPage.cardTab}</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode("UPI")}
                className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  paymentMode === "UPI"
                    ? "bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-300 border border-slate-200 dark:border-white/5 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{ngoT.donationsPage.upiTab}</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-left text-sm text-red-600 dark:text-red-300">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-500 dark:text-red-450 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Wizard step render */}
            {paymentMode === "GATEWAY" ? (
              <div>
                {step === 1 ? (
                  <div className="space-y-6 text-left">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{ngoT.donationsPage.amountLabel}</label>
                      <div className="grid grid-cols-3 gap-3">
                        {["500", "1000", "2000", "5000", "10000"].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                               setAmount(preset);
                               setCustomAmount("");
                            }}
                            className={`py-3 rounded-xl border font-bold text-sm sm:text-base transition-all ${
                              amount === preset && !customAmount
                                ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/10"
                                : "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                            }`}
                          >
                            ₹{preset}
                          </button>
                        ))}
                        <div className="relative">
                          <input
                            type="number"
                            placeholder={ngoT.donationsPage.customPlaceholder}
                            value={customAmount}
                            onChange={(e) => {
                              setCustomAmount(e.target.value);
                              setAmount("");
                            }}
                            className="w-full py-3 pl-5 pr-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-xs sm:text-sm font-bold focus:outline-none focus:border-purple-500"
                          />
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs">₹</span>
                        </div>
                      </div>
                    </div>
 
                    <button
                      onClick={handleNextStep}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-1 hover:scale-[1.01] active:scale-[0.99] transition-all"
                    >
                      <span>{ngoT.donationsPage.continueBtn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-550 dark:text-slate-400 mb-1.5">{ngoT.donationsPage.nameLabel}</label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder={ngoT.donationsPage.nameLabel}
                        className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-550 dark:text-slate-400 mb-1.5">{ngoT.donationsPage.emailLabel}</label>
                      <input
                        type="email"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        placeholder={ngoT.donationsPage.emailLabel}
                        className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-550 dark:text-slate-400 mb-1.5">{ngoT.donationsPage.phoneLabel}</label>
                      <input
                        type="tel"
                        value={donorPhone}
                        onChange={(e) => setDonorPhone(e.target.value)}
                        placeholder={ngoT.donationsPage.phoneLabel}
                        className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="flex gap-4 pt-2">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-white/5 font-bold rounded-xl text-xs"
                      >
                        {ngoT.donationsPage.backBtn}
                      </button>
                      <button
                        onClick={handleNextStep}
                        disabled={loading}
                        className="flex-[2] py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{ngoT.donationsPage.processing}</span>
                          </>
                        ) : (
                          <>
                            <span>{ngoT.donationsPage.paySecurely} ₹{Number(getFinalAmount()).toLocaleString("en-IN")}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {upiStep === 1 ? (
                  <div className="space-y-6 flex flex-col items-center">
                    {/* Amount field */}
                    <div className="w-full text-left">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{ngoT.donationsPage.amountLabel}</label>
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        {["500", "1000", "2000", "5000", "10000"].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              setAmount(preset);
                              setCustomAmount("");
                            }}
                            className={`py-3 rounded-xl border font-bold text-xs sm:text-sm transition-all ${
                              amount === preset && !customAmount
                                ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/10"
                                : "bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                            }`}
                          >
                            ₹{preset}
                          </button>
                        ))}
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="Custom"
                            value={customAmount}
                            onChange={(e) => {
                              setCustomAmount(e.target.value);
                              setAmount("");
                            }}
                            className="w-full py-3 pl-5 pr-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-955 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-xs font-bold focus:outline-none focus:border-purple-500"
                          />
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs">₹</span>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Container */}
                    <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-3xl flex flex-col items-center w-full max-w-sm">
                      <div className="relative w-48 aspect-square bg-white rounded-2xl p-2 border border-slate-200/50 dark:border-white/10 flex items-center justify-center">
                        <Image
                          src="/upi_qr.png"
                          alt="GPay QR code"
                          fill unoptimized
                          className="object-contain p-2"
                        />
                      </div>
                      <div className="mt-4 w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 px-4 py-2.5 rounded-xl flex items-center justify-between text-[10px] sm:text-xs">
                        <span className="text-slate-600 dark:text-slate-400 font-bold font-mono">UPI ID: kcm@gpay</span>
                        <button
                          onClick={() => copyToClipboard("kcm@gpay", "upi")}
                          className="text-purple-600 dark:text-purple-400 font-bold hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedLabel === "upi" ? ngoT.donationsPage.copiedBtn : ngoT.donationsPage.copyBtn}</span>
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleNextStep}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-1"
                    >
                      <span>{ngoT.donationsPage.scanPaidBtn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 text-left">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-555 dark:text-slate-400 mb-1.5">{ngoT.donationsPage.nameLabel}</label>
                      <input
                        type="text"
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder={ngoT.donationsPage.nameLabel}
                        className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-555 dark:text-slate-400 mb-1.5">{ngoT.donationsPage.emailLabel}</label>
                      <input
                        type="email"
                        value={donorEmail}
                        onChange={(e) => setDonorEmail(e.target.value)}
                        placeholder={ngoT.donationsPage.emailLabel}
                        className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-555 dark:text-slate-400 mb-1.5">{ngoT.donationsPage.utrLabel}</label>
                      <input
                        type="text"
                        value={upiTransactionRef}
                        onChange={(e) => setUpiTransactionRef(e.target.value)}
                        placeholder={ngoT.donationsPage.utrPlaceholder}
                        className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="flex gap-4 pt-2">
                      <button
                        onClick={() => setUpiStep(1)}
                        className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-white/5 font-bold rounded-xl text-xs"
                      >
                        {ngoT.donationsPage.backBtn}
                      </button>
                      <button
                        onClick={handleNextStep}
                        disabled={loading}
                        className="flex-[2] py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{ngoT.donationsPage.submittingRecordBtn}</span>
                          </>
                        ) : (
                          <>
                            <span>{ngoT.donationsPage.submitRecordBtn}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
