"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowRight, ChevronLeft, CheckCircle2, Loader2 } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useLanguage } from "@/components/providers/LanguageProvider";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";

const forgotPasswordTranslations = {
  en: {
    backToSignIn: "Back to Sign In",
    churchName: "Kingdom of Christ",
    ministries: "Ministries",
    scriptureQuote: "“I am the resurrection and the life. Whoever believes in me, though he die, yet shall he live.”",
    secureRecovery: "Secure Password Recovery",
    steps: [
      "Enter your registered email address",
      "We'll send a secure reset link",
      "Click the link in your email",
      "Set a new strong password",
    ],
    title: "Reset your password",
    subtitle: "Enter your registered email and we'll send you a secure reset link.",
    emailLabel: "Email Address",
    emailPlaceholder: "your.email@example.com",
    sendBtn: "Send Reset Link",
    sendingBtn: "Sending Reset Link...",
    rememberPrompt: "Remember your password?",
    signInLink: "Sign In",
    successTitle: "Check your inbox",
    successDesc1: "If this email is registered with KCM, you'll receive a password reset link shortly.",
    successDesc2: "Don't see it? Check your spam or junk folder. The link expires in 1 hour.",
    tryDifferentEmail: "Try a different email",
    errors: {
      userNotFound: "If an account exists with this email, a reset link has been sent.",
      invalidEmail: "Please enter a valid email address.",
      tooManyRequests: "Too many attempts. Please wait a few minutes and try again.",
      networkFailed: "Network unavailable. Please check your connection and try again.",
      missingEmail: "Please enter your email address.",
      offline: "You are offline. Please check your internet connection.",
      notReady: "Authentication service is temporarily unavailable. Please try again.",
      generic: "An error occurred. Please try again.",
    },
  },
  te: {
    backToSignIn: "లాగిన్‌కు తిరిగి వెళ్లండి",
    churchName: "కింగ్‌డమ్ ఆఫ్ క్రైస్ట్",
    ministries: "మినిస్ట్రీస్",
    scriptureQuote: "“పునరుత్థానమును జీవమును నేనే; నాయందు విశ్వాసముంచువాడు చనిపోయినను జీవించును.”",
    secureRecovery: "సురక్షిత పాస్‌వర్డ్ పునరుద్ధరణ",
    steps: [
      "మీ నమోదిత ఈమెయిల్ చిరునామాను నమోదు చేయండి",
      "మేము సురక్షిత రీసెట్ లింక్‌ను పంపుతాము",
      "మీ ఈమెయిల్‌లోని లింక్‌పై క్లిక్ చేయండి",
      "కొత్త బలమైన పాస్‌వర్డ్‌ను సెట్ చేయండి",
    ],
    title: "పాస్‌వర్డ్ రీసెట్ చేయండి",
    subtitle: "మీ నమోదిత ఈమెయిల్‌ను నమోదు చేయండి, మేము మీకు రీసెట్ లింక్ పంపుతాము.",
    emailLabel: "ఈమెయిల్ చిరునామా",
    emailPlaceholder: "your.email@example.com",
    sendBtn: "రీసెట్ లింక్ పంపండి",
    sendingBtn: "లింక్ పంపబడుతోంది...",
    rememberPrompt: "పాస్‌వర్డ్ గుర్తుందా?",
    signInLink: "లాగిన్ అవ్వండి",
    successTitle: "మీ ఈమెయిల్ ఇన్‌బాక్స్‌ను తనిఖీ చేయండి",
    successDesc1: "ఈ ఈమెయిల్ KCM లో నమోదై ఉంటే, మీకు రీసెట్ లింక్ అందుతుంది.",
    successDesc2: "కనిపించలేదా? స్పామ్ లేదా జంక్ ఫోల్డర్‌ను తనిఖీ చేయండి. లింక్ 1 గంటలో ముగుస్తుంది.",
    tryDifferentEmail: "వేరే ఈమెయిల్‌తో ప్రయత్నించండి",
    errors: {
      userNotFound: "ఈ ఈమెయిల్‌తో ఖాతా ఉంటే, రీసెట్ లింక్ పంపబడింది.",
      invalidEmail: "దయచేసి సరైన ఈమెయిల్ చిరునామాను నమోదు చేయండి.",
      tooManyRequests: "చాలా ప్రయత్నాలు జరిగాయి. దయచేసి కాసేపు ఆగి మళ్ళీ ప్రయత్నించండి.",
      networkFailed: "నెట్‌వర్క్ అందుబాటులో లేదు. ఇంటర్నెట్ కనెక్షన్ తనిఖీ చేయండి.",
      missingEmail: "దయచేసి మీ ఈమెయిల్ చిరునామాను నమోదు చేయండి.",
      offline: "మీరు ఆఫ్‌లైన్‌లో ఉన్నారు. ఇంటర్నెట్ కనెక్షన్ తనిఖీ చేయండి.",
      notReady: "ధృవీకరణ సేవ తాత్కాలికంగా అందుబాటులో లేదు.",
      generic: "లోపం సంభవించింది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
    },
  },
  hi: {
    backToSignIn: "साइन इन पर वापस जाएं",
    churchName: "किंगडम ऑफ क्राइस्ट",
    ministries: "मिनिस्ट्रीज",
    scriptureQuote: "“पुनरुत्थान और जीवन मैं ही हूँ; जो कोई मुझ पर विश्वास करता है वह यदि मर भी जाए, तौभी जीएगा।”",
    secureRecovery: "सुरक्षित पासवर्ड पुनर्प्राप्ति",
    steps: [
      "अपना पंजीकृत ईमेल दर्ज करें",
      "हम एक सुरक्षित रीसेट लिंक भेजेंगे",
      "अपने ईमेल में दिए गए लिंक पर क्लिक करें",
      "एक नया मजबूत पासवर्ड सेट करें",
    ],
    title: "अपना पासवर्ड रीसेट करें",
    subtitle: "अपना पंजीकृत ईमेल दर्ज करें और हम आपको एक सुरक्षित रीसेट लिंक भेजेंगे।",
    emailLabel: "ईमेल पता",
    emailPlaceholder: "your.email@example.com",
    sendBtn: "रीसेट लिंक भेजें",
    sendingBtn: "रीसेट लिंक भेजा जा रहा है...",
    rememberPrompt: "अपना पासवर्ड याद है?",
    signInLink: "साइन इन करें",
    successTitle: "अपना इनबॉक्स जांचें",
    successDesc1: "यदि यह ईमेल KCM में पंजीकृत है, तो आपको शीघ्र ही पासवर्ड रीसेट लिंक प्राप्त होगा।",
    successDesc2: "दिखाई नहीं दे रहा? स्पैम या जंक फ़ोल्डर जांचें। लिंक 1 घंटे में समाप्त हो जाएगा।",
    tryDifferentEmail: "दूसरा ईमेल आज़माएं",
    errors: {
      userNotFound: "यदि इस ईमेल से कोई खाता मौजूद है, तो रीसेट लिंक भेज दिया गया है।",
      invalidEmail: "कृपया एक मान्य ईमेल पता दर्ज करें।",
      tooManyRequests: "बहुत सारे प्रयास। कृपया कुछ क्षण प्रतीक्षा करें और पुनः प्रयास करें।",
      networkFailed: "नेटवर्क अनुपलब्ध है। कृपया अपना कनेक्शन जांचें।",
      missingEmail: "कृपया अपना ईमेल पता दर्ज करें।",
      offline: "आप ऑफ़लाइन हैं। कृपया इंटरनेट कनेक्शन जांचें।",
      notReady: "प्रमाणीकरण सेवा अस्थायी रूप से अनुपलब्ध है।",
      generic: "एक त्रुटि उत्पन्न हुई। कृपया पुनः प्रयास करें।",
    },
  },
};

export default function ForgotPasswordPage() {
  const { language } = useLanguage();
  const t = forgotPasswordTranslations[language as keyof typeof forgotPasswordTranslations] || forgotPasswordTranslations.en;

  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const mapForgotError = (code: string): string => {
    if (code === "auth/user-not-found") return t.errors.userNotFound;
    if (code === "auth/invalid-email") return t.errors.invalidEmail;
    if (code === "auth/too-many-requests") return t.errors.tooManyRequests;
    if (code === "auth/network-request-failed") return t.errors.networkFailed;
    if (code === "auth/missing-email") return t.errors.missingEmail;
    if (code === "network-offline") return t.errors.offline;
    if (code === "auth-not-ready") return t.errors.notReady;
    return t.errors.generic;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("auth/missing-email");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("auth/invalid-email");
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError("network-offline");
      return;
    }

    if (!auth || typeof auth.onAuthStateChanged !== "function") {
      setError("auth-not-ready");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      setIsSubmitted(true);
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/user-not-found") {
        setIsSubmitted(true);
      } else {
        setError(code || "unknown");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col lg:grid lg:grid-cols-2 bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-gray-100 selection:bg-purple-500 selection:text-white relative overflow-x-hidden transition-colors duration-300">

      {/* ── Left Branding Panel ── */}
      <div className="hidden lg:flex relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#7c3aed] via-[#3b0764] to-[#09051d] border-r border-white/10">
        {/* Glowing top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-500 shadow-[0_0_12px_rgba(192,132,252,0.8)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.35),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.25),transparent_55%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-[30rem] h-[30rem] bg-purple-500/30 rounded-full blur-[90px] pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] bg-indigo-600/25 rounded-full blur-[90px] pointer-events-none" />

        {/* Cross watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none select-none">
          <svg className="w-[36rem] h-[36rem] text-white" viewBox="0 0 100 100" fill="currentColor">
            <rect x="42" y="6" width="16" height="88" rx="2" />
            <rect x="14" y="28" width="72" height="16" rx="2" />
          </svg>
        </div>

        {/* Header back link */}
        <div className="relative z-10">
          <Link href="/login" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-white/90 hover:text-white hover:bg-white/20 text-xs font-semibold tracking-wide transition-all group shadow-md">
            <ChevronLeft className="w-4 h-4 text-purple-300 group-hover:-translate-x-1 transition-transform" />
            <span>{t.backToSignIn}</span>
          </Link>
        </div>

        {/* Central copy */}
        <div className="relative z-10 text-white max-w-xl my-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 backdrop-blur-md shadow-2xl bg-white/10 p-1 flex-shrink-0">
              <Image src="/logo.png" alt="KCM Logo" fill className="object-cover" priority />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                {t.churchName}
              </h1>
              <p className="text-purple-200/80 text-xs font-bold tracking-widest uppercase mt-0.5">{t.ministries}</p>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-normal leading-relaxed text-white/95 tracking-tight mb-8">
            {t.scriptureQuote}
          </h2>

          <div className="space-y-4 p-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl shadow-xl">
            {t.steps.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-400/30 border border-purple-300/40 flex items-center justify-center text-purple-200 text-xs font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <span className="text-white/90 text-sm font-medium">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            <span className="text-white/90 text-xs font-semibold tracking-wide">{t.secureRecovery}</span>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col justify-start lg:justify-center items-center p-3 sm:p-6 lg:p-12 w-full min-w-0 bg-slate-50 dark:bg-slate-950 relative overflow-y-auto min-h-[100dvh] lg:min-h-0 transition-colors duration-300">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Controls Bar */}
        <div className="w-full max-w-lg flex items-center justify-between pb-3 px-1 z-20 shrink-0">
          <Link href="/login" className="flex items-center gap-1 text-slate-800 dark:text-white/90 hover:text-slate-950 dark:hover:text-white transition-all duration-300 bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/15 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md text-[11px] font-semibold shrink-0">
            <ChevronLeft className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300" />
            <span>{t.backToSignIn}</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* Card */}
        <div className="w-full max-w-lg mx-auto bg-white/95 dark:bg-slate-900/90 p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-slate-200/90 dark:border-white/10 backdrop-blur-2xl z-10 min-w-0 box-border relative overflow-hidden transition-colors duration-300 my-auto">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 opacity-80" />

          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30 mb-5">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {t.title}
                </h2>
                <p className="text-slate-500 dark:text-gray-400 text-sm font-medium mt-1.5 leading-relaxed">
                  {t.subtitle}
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 flex items-start gap-2.5 shadow-sm">
                  <span className="text-red-500 dark:text-red-400 text-sm mt-0.5 flex-shrink-0">⚠</span>
                  <p className="text-red-700 dark:text-red-200 text-sm font-medium leading-snug">
                    {mapForgotError(error)}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-gray-300 uppercase tracking-wide">
                    {t.emailLabel}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-500" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      autoFocus
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-100/70 dark:bg-slate-950/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all placeholder-slate-400 dark:placeholder-gray-500 text-sm disabled:opacity-60"
                      placeholder={t.emailPlaceholder}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative overflow-hidden w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 border border-purple-400/20 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.sendingBtn}
                    </>
                  ) : (
                    <>
                      {t.sendBtn}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-slate-500 dark:text-gray-400 font-medium pt-1">
                  {t.rememberPrompt}{" "}
                  <Link href="/login" className="text-purple-600 dark:text-purple-400 font-bold hover:text-purple-700 dark:hover:text-purple-300 hover:underline transition-all">
                    {t.signInLink}
                  </Link>
                </p>
              </form>
            </>
          ) : (
            /* ── Success State ── */
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/30">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
                {t.successTitle}
              </h3>
              <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed mb-2">
                {t.successDesc1}
              </p>
              <p className="text-slate-400 dark:text-gray-500 text-xs leading-relaxed mb-8">
                {t.successDesc2}
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => { setIsSubmitted(false); setEmail(""); setError(""); }}
                  className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-gray-800 text-slate-700 dark:text-gray-300 font-semibold text-sm hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all cursor-pointer"
                >
                  {t.tryDifferentEmail}
                </button>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.01] transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t.backToSignIn}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
