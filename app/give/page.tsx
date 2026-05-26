"use client";

import { useState, useEffect } from "react";
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
  IndianRupee 
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

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setDonorName(user.name || "");
      setDonorEmail(user.email || "");
    }
  }, [user]);

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
                  // fallbacks:
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
      const verifyRes = await fetch("/api/donations/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpayOrderId: pendingOrderId,
          razorpayPaymentId: `pay_mock_${Math.random().toString(36).substring(2, 10)}`,
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-r from-purple-600 to-indigo-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 transform translate-x-20 -translate-y-20 animate-pulse" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm mb-6"
            >
              <Heart className="h-4 w-4 text-pink-300 animate-pulse" />
              <span className="font-medium tracking-wide">Generous Giving</span>
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

      {/* Main Interactive Segment */}
      <section className="py-20 -mt-10 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-12 max-w-6xl mx-auto items-start">
            
            {/* Left Column: Giving Form */}
            <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-purple-500" />
                    Online Offerings & Tithes
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Secure 256-bit encrypted Razorpay payment gateway
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/30 px-3 py-1.5 rounded-full text-purple-700 dark:text-purple-300 text-xs font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  Secure
                </div>
              </div>

              {/* Steps Indicator */}
              <div className="flex items-center gap-2 mb-8">
                <div className={`h-2 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                <div className={`h-2 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 text-sm rounded-lg">
                  {errorMessage}
                </div>
              )}

              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Amount Selection */}
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 font-bold mb-3">
                        Select Donation Amount (₹)
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {["500", "1000", "2500", "5000", "10000"].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              setAmount(preset);
                              setCustomAmount("");
                            }}
                            className={`py-3.5 px-4 rounded-xl border text-center font-bold text-lg transition-all ${
                              amount === preset && !customAmount
                                ? "bg-gradient-to-r from-purple-600 to-indigo-600 border-transparent text-white shadow-lg shadow-purple-500/20"
                                : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                            className={`w-full py-3.5 px-4 pl-8 rounded-xl border font-bold text-lg bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                              customAmount 
                                ? "border-purple-500 ring-2 ring-purple-500/20" 
                                : "border-gray-200 dark:border-gray-700"
                            }`}
                          />
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">₹</span>
                        </div>
                      </div>
                    </div>

                    {/* Purpose Selection */}
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 font-bold mb-3">
                        Purpose of Giving
                      </label>
                      <div className="grid md:grid-cols-2 gap-3">
                        {[
                          { id: "TITHE", name: "Tithe (పదియవ భాగం)", desc: "10% of monthly income" },
                          { id: "OFFERING", name: "Online Offering (ఆరాధన కానుక)", desc: "General offerings to the Lord" },
                          { id: "BUILDING", name: "Building Fund (భవన నిధి)", desc: "Church expansion projects" },
                          { id: "MISSIONS", name: "Missions (మిషన్స్ నిధి)", desc: "Local and global outreach" },
                          { id: "CHARITY", name: "Benevolence (ధర్మకార్యాలు)", desc: "Supporting the poor & widows" },
                          { id: "OTHER", name: "Other Specific Offering", desc: "Special vow or pledge gifts" }
                        ].map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setPurpose(item.id)}
                            className={`p-4 rounded-xl border cursor-pointer select-none transition-all flex flex-col justify-between ${
                              purpose === item.id
                                ? "border-purple-600 bg-purple-50/50 dark:bg-purple-950/20 ring-2 ring-purple-600/25"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
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
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all shadow-purple-500/10 active:scale-[0.99]"
                    >
                      Continue
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                        Donor Contact Information
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Receipts will be sent directly to this address.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Full Name *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Enter your full name"
                            value={donorName}
                            onChange={(e) => setDonorName(e.target.value)}
                            className="w-full py-3 px-4 pl-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Email Address *
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            placeholder="example@email.com"
                            value={donorEmail}
                            onChange={(e) => setDonorEmail(e.target.value)}
                            className="w-full py-3 px-4 pl-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          />
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          Phone Number (Optional)
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            placeholder="10-digit mobile number"
                            value={donorPhone}
                            onChange={(e) => setDonorPhone(e.target.value)}
                            className="w-full py-3 px-4 pl-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
                        Back
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleNextStep}
                        className="flex-[2] py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all shadow-purple-500/10 active:scale-[0.99] disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Initializing...
                          </>
                        ) : (
                          <>
                            Pay Securely (₹{getFinalAmount()})
                            <ArrowRight className="h-5 w-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column: Dynamic summary & Why Give context */}
            <div className="lg:col-span-5 space-y-6">
              {/* Payment Summary Box */}
              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-3xl shadow-xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full filter blur-xl transform translate-x-10 -translate-y-10" />
                
                <h3 className="font-bold text-lg uppercase tracking-wider text-purple-200 mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-300" />
                  Gift Summary
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between border-b border-white/10 pb-4">
                    <span className="text-purple-200">Giving Type</span>
                    <span className="font-bold bg-white/10 px-3 py-1 rounded-full text-xs tracking-wider">
                      {purpose.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-4">
                    <span className="text-purple-200">Gateway Method</span>
                    <span className="font-semibold">Razorpay India</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-4">
                    <span className="text-purple-200">Tax Deductible</span>
                    <span className="font-semibold text-green-300">Yes (Section 80G)</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="text-2xl font-semibold text-purple-200 align-middle">Total Gift</span>
                    <span className="text-3xl font-extrabold flex items-center gap-1">
                      <IndianRupee className="w-6 h-6 stroke-[2.5]" />
                      {getFinalAmount() || "0"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Church statement card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700/50">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500 bg-green-50 dark:bg-green-900/30 rounded-full p-1" />
                  Honorable Tithes (Malachi 3:10)
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed italic">
                  "Bring all the tithes into the storehouse, that there may be food in My house, and try Me now in this," says the Lord of hosts.
                </p>
              </div>

              {/* Help & Support Card */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700/50">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Need Assistance?</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  For issues relating to online payments or tax receipts, contact us at:
                </p>
                <div className="space-y-1.5 text-sm">
                  <p className="text-purple-600 dark:text-purple-400 font-semibold">
                    Email: <a href="mailto:kingofchristministries23@gmail.com" className="hover:underline">kingofchristministries23@gmail.com</a>
                  </p>
                  <p className="text-purple-600 dark:text-purple-400 font-semibold">
                    Phone: <a href="tel:+919640943777" className="hover:underline">+91 96409 43777</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Give */}
      <section className="py-16 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {pageT.why}
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              Giving is an act of worship and obedience to God. Your generosity helps us:
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              {[
                "Spread the Gospel locally and globally",
                "Support ministries and programs",
                "Serve the community with compassion",
                "Build and maintain our facilities",
                "Train and equip leaders",
                "Reach the next generation",
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md border border-gray-50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
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
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Other Ways to Give
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700/30 flex flex-col justify-between">
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
                <div className="text-left bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5 space-y-2.5 text-sm border border-gray-100 dark:border-gray-800">
                  <p className="text-gray-700 dark:text-gray-300 flex justify-between">
                    <span className="font-semibold">Account Name:</span>
                    <span>Kingdom of Christ Ministries</span>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 flex justify-between border-t border-gray-200 dark:border-gray-800 pt-2">
                    <span className="font-semibold">Account Number:</span>
                    <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">[Pending Setup]</span>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 flex justify-between border-t border-gray-200 dark:border-gray-800 pt-2">
                    <span className="font-semibold">IFSC Code:</span>
                    <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">[Pending Setup]</span>
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 flex justify-between border-t border-gray-200 dark:border-gray-800 pt-2">
                    <span className="font-semibold">Bank Location:</span>
                    <span>Jeedimetla, Hyderabad</span>
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700/30 flex flex-col justify-between">
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
                <div className="grid grid-cols-3 gap-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    Shapur
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    Subhash Nagar
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                    Bahadurpally
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* simulated Credit Card payment modal overlay for placeholder key modes */}
      <AnimatePresence>
        {showSimulatedModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-gray-100 dark:border-gray-700 text-center relative overflow-hidden"
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
    </div>
  );
}
