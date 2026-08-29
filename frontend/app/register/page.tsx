"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, getFirebaseAuth } from "@/lib/firebase";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";

const passwordStrength = (pw: string) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
};

const strengthColor = ["bg-gray-200", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];

export default function RegisterPage() {
  const router = useRouter();
  const { mounted, status, user } = useAuth();
  const { t } = useLanguage();
  const registerT = t.pages.register;
  const loginT = t.pages.login;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (mounted && status === "authenticated" && user && !isRegistering) {
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        router.replace("/admin/dashboard");
      } else if (user.role === "PASTOR") {
        router.replace("/pastor/main/dashboard");
      } else {
        router.replace("/member");
      }
    }
  }, [mounted, status, user, router, isRegistering]);

  const pwScore = useMemo(() => passwordStrength(formData.password), [formData.password]);

  const getStrengthLabel = useCallback((score: number) => {
    const labels = [
      registerT.tooShort,
      registerT.weak,
      registerT.fair,
      registerT.good,
      registerT.strong
    ];
    return labels[score] || "";
  }, [registerT]);

  const extractFirebaseCode = (msg?: string): string | null => {
    if (!msg) return null;
    const match = msg.match(/\(auth\/[^)]+\)/);
    if (match) return match[0].replace(/[()]/g, "");
    return null;
  };

  const getLocalizedError = (errStr: string) => {
    if (!errStr) return "";
    
    const errorMap: Record<string, string> = {
      "passwords-mismatch": registerT.errors.mismatch,
      "password-too-short": registerT.errors.tooShort,
      "invalid-email-format": registerT.errors.invalidEmail,
      "terms-required": "Please accept the Terms of Service to continue.",
      "auth/email-already-in-use": registerT.errors.emailInUse,
      "auth/weak-password": registerT.errors.weakPassword,
      "auth/invalid-email": registerT.errors.invalidEmail,
      "auth/operation-not-allowed": "Registration is currently unavailable. Please contact support.",
      "auth/network-request-failed": "Network connection failed. Please check your internet connection.",
      "auth/too-many-requests": "Too many requests. Please wait a moment and try again.",
      "auth/api-key-not-valid": "Authentication configuration issue. Please contact support.",
      "auth/invalid-api-key": "Authentication configuration issue. Please contact support.",
      "auth-not-ready": "Authentication service is initializing. Please try again in a moment.",
      "registration-failed": registerT.errors.genericFailed,
    };

    if (errorMap[errStr]) return errorMap[errStr];

    const extracted = extractFirebaseCode(errStr);
    if (extracted && errorMap[extracted]) return errorMap[extracted];
    if (errStr.startsWith("auth/")) return registerT.errors.genericFailed;
    
    const msgMap: Record<string, string> = {
      "Passwords do not match.": registerT.errors.mismatch,
      "Password must be at least 8 characters.": registerT.errors.tooShort,
      "This email is already registered. Try signing in.": registerT.errors.emailInUse,
      "Password is too weak. Please choose a stronger one.": registerT.errors.weakPassword,
      "Please enter a valid email address.": registerT.errors.invalidEmail,
      "Registration failed. Please try again.": registerT.errors.genericFailed,
    };

    if (msgMap[errStr]) return msgMap[errStr];

    return errStr;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError("invalid-email-format");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("passwords-mismatch");
      return;
    }

    if (formData.password.length < 8) {
      setError("password-too-short");
      return;
    }

    if (!formData.termsAccepted) {
      setError("terms-required");
      return;
    }

    setIsLoading(true);
    setIsRegistering(true);

    try {
      const activeAuth = getFirebaseAuth() || auth;
      if (!activeAuth || typeof activeAuth.onAuthStateChanged !== "function") {
        setError("auth-not-ready");
        setIsLoading(false);
        setIsRegistering(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(activeAuth, formData.email.trim(), formData.password);
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
      const u = userCredential.user;

      if (u) {
        await updateProfile(u, { displayName: fullName }).catch(() => {});
      }

      try {
        const { db } = await import("@/lib/firebase");
        if (db) {
          const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
          await setDoc(doc(db, "users", u.uid), {
            uid: u.uid,
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.toLowerCase().trim(),
            phone: formData.phone.trim() || null,
            role: "member",
            status: "active",
            photoURL: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true });
        }
      } catch (fsErr) {
        console.warn("[AUTH] Firestore profile write:", fsErr);
      }

      try {
        await fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: u.uid,
            email: formData.email.toLowerCase().trim(),
            name: fullName,
            photoURL: null,
            phoneNumber: formData.phone.trim() || null,
          }),
        });
      } catch (syncErr) {
        console.warn("[AUTH] Server sync warning:", syncErr);
      }

      fetch('/api/auth/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'REGISTER',
          name: fullName,
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone.trim() || '',
        }),
      }).catch(() => {});

      const { signOut } = await import("firebase/auth");
      await signOut(auth);

      if (typeof document !== "undefined") {
        document.cookie = "__kcm_session_uid=; path=/; max-age=0; SameSite=Lax";
        document.cookie = "__kcm_session_role=; path=/; max-age=0; SameSite=Lax";
      }

      router.replace("/login?registered=true");
    } catch (err: any) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[FIREBASE_REGISTER_DIAGNOSTIC]", {
          code: err?.code,
          message: err?.message,
          name: err?.name,
        });
      } else {
        console.error("[AUTH] Registration error:", err?.code || err?.name || "registration-failed");
      }
      const errCode = err?.code || extractFirebaseCode(err?.message) || "registration-failed";
      setError(errCode);
      setIsLoading(false);
      setIsRegistering(false);
    }
  };

  const inputClass =
    "w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-100/70 dark:bg-slate-950/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-colors placeholder-slate-400 dark:placeholder-gray-500 text-xs sm:text-sm";

  return (
    <div className="min-h-[100dvh] flex flex-col lg:grid lg:grid-cols-2 bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-gray-100 selection:bg-purple-500 selection:text-white relative overflow-x-hidden transition-colors duration-200">
      {/* ── Left Branding Panel ── */}
      <div className="hidden lg:flex relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#7c3aed] via-[#3b0764] to-[#09051d] border-r border-white/10">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-500 shadow-[0_0_12px_rgba(192,132,252,0.8)]" />
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.35),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.25),transparent_55%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Ambient Hardware-Accelerated Glow Orbs */}
        <div 
          className="absolute -top-24 -left-24 w-[28rem] h-[28rem] bg-purple-500/25 rounded-full blur-[80px] pointer-events-none transform-gpu animate-pulse" 
          style={{ willChange: "transform, opacity" }}
        />
        <div 
          className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none transform-gpu" 
          style={{ willChange: "transform, opacity" }}
        />

        <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none select-none">
          <svg className="w-[36rem] h-[36rem] text-white" viewBox="0 0 100 100" fill="currentColor">
            <rect x="42" y="6" width="16" height="88" rx="2" />
            <rect x="14" y="28" width="72" height="16" rx="2" />
          </svg>
        </div>

        {/* Header Back Link */}
        <div className="relative z-10">
          <Link href="/login" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-white/90 hover:text-white hover:bg-white/20 text-xs font-semibold tracking-wide transition-colors group shadow-md">
            <ChevronLeft className="w-4 h-4 text-purple-300 group-hover:-translate-x-1 transition-transform" />
            <span>{registerT.backToSignIn}</span>
          </Link>
        </div>

        {/* Central Identity & Benefits */}
        <div className="relative z-10 text-white max-w-xl my-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 backdrop-blur-md shadow-2xl bg-white/10 p-1 shrink-0">
              <Image
                src="/logo.png"
                alt="Kingdom of Christ Ministries Logo"
                width={64}
                height={64}
                className="object-cover"
                priority
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                {loginT.churchName}
              </h1>
              <p className="text-purple-200/80 text-xs font-bold tracking-widest uppercase mt-0.5">{loginT.ministries}</p>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-normal leading-relaxed text-white/95 tracking-tight mb-8">
            {registerT.quote}
          </h2>

          {/* Benefits Grid */}
          <div className="space-y-3 p-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-xl">
            {[
              registerT.benefit1,
              registerT.benefit2,
              registerT.benefit3,
              registerT.benefit4,
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-white/90 text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Status Ticker */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            <span className="text-white/90 text-xs font-semibold tracking-wide">{registerT.footerTicker}</span>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col justify-start lg:justify-center items-center p-3 sm:p-6 lg:p-12 w-full min-w-0 bg-slate-50 dark:bg-slate-950 relative overflow-y-auto min-h-[100dvh] lg:min-h-0 transition-colors duration-200">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        {/* Top Controls Bar */}
        <div className="hidden lg:flex items-center gap-3 absolute top-6 right-6 z-20">
          <LanguageToggle />
          <ThemeToggle />
        </div>

        {/* Mobile Top Header Bar */}
        <div className="w-full max-w-lg flex items-center justify-between pb-2 px-1 lg:hidden z-20 shrink-0">
          <Link href="/login" className="flex items-center gap-1 text-slate-800 dark:text-white/90 hover:text-slate-950 dark:hover:text-white transition-colors bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/15 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md text-[11px] font-semibold shrink-0">
            <ChevronLeft className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300" />
            <span>{registerT.backToSignIn}</span>
          </Link>
          <div className="flex items-center gap-1.5 shrink-0">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* Form Container Card */}
        <div className="w-full max-w-lg mx-auto bg-white/95 dark:bg-slate-900/90 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-slate-200/90 dark:border-white/10 backdrop-blur-md z-10 min-w-0 box-border relative overflow-hidden transition-colors duration-200 my-auto">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 opacity-80" />

          {/* Header */}
          <div className="mb-3 sm:mb-4 text-center lg:text-left">
            <h2 className="text-lg sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {registerT.title}
            </h2>
            <p className="text-slate-600 dark:text-gray-400 text-[11px] sm:text-sm font-medium mt-0.5">
              {registerT.subtitle}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 flex items-start gap-2 shadow-md">
              <span className="text-red-600 dark:text-red-400 text-sm mt-0.5">⚠</span>
              <p className="text-red-700 dark:text-red-200 text-xs font-medium">{getLocalizedError(error)}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div className="space-y-1">
                <label htmlFor="firstName" className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-gray-300">
                  {registerT.firstName}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-gray-400" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="John"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="lastName" className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-gray-300">
                  {registerT.lastName}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-gray-400" />
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            {/* Email & Phone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className="space-y-1">
                <label htmlFor="email" className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-gray-300">
                  {registerT.email}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className={inputClass}
                    placeholder={registerT.emailPlaceholder}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="phone" className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-gray-300">
                  {registerT.phone}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-gray-400" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="+91 1234567890"
                  />
                </div>
              </div>
            </div>

            {/* Password & Confirm Password Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className="space-y-1">
                <label htmlFor="password" className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-gray-300">
                  {registerT.password}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    className={`${inputClass} pr-9`}
                    placeholder={registerT.passwordPlaceholder}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {/* Password Strength Meter */}
                {formData.password && (
                  <div className="pt-0.5 space-y-0.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-0.5 flex-1 rounded-full transition-colors duration-150 ${
                            i <= pwScore ? strengthColor[pwScore] : "bg-slate-200 dark:bg-gray-800"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-[9px] sm:text-xs font-medium ${pwScore <= 1 ? "text-red-500 dark:text-red-400" : pwScore <= 2 ? "text-orange-500 dark:text-orange-400" : pwScore <= 3 ? "text-amber-500 dark:text-yellow-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                      {registerT.strengthLabel} {getStrengthLabel(pwScore)}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-gray-300">
                  {registerT.confirmPassword}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    className={`${inputClass} pr-9 ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? "border-red-500 focus:ring-red-500"
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? "border-emerald-500 focus:ring-emerald-500"
                        : ""
                    }`}
                    placeholder={registerT.confirmPasswordPlaceholder}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer p-1"
                  >
                    {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-[9px] sm:text-xs text-red-500 dark:text-red-400">{registerT.mismatch}</p>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 py-0.5">
              <input
                id="terms"
                name="termsAccepted"
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={handleChange}
                required
                className="w-3.5 h-3.5 mt-0.5 accent-purple-600 rounded bg-white dark:bg-slate-950 border-slate-300 dark:border-gray-800"
              />
              <label htmlFor="terms" className="text-[11px] sm:text-xs text-slate-600 dark:text-gray-400 leading-tight">
                {registerT.agreeTo}{" "}
                <Link href="/terms" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold">{registerT.terms}</Link>
                {" "}{registerT.and}{" "}
                <Link href="/privacy" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold">{registerT.privacy}</Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative overflow-hidden w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 border border-purple-400/20 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {registerT.creating}
                </>
              ) : (
                <>{registerT.createBtn} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>

            {/* Login Link */}
            <p className="text-center pt-1 text-xs sm:text-sm text-slate-600 dark:text-gray-400 font-medium">
              {registerT.alreadyHaveAccount}{" "}
              <Link href="/login" className="text-purple-600 dark:text-purple-400 font-bold hover:text-purple-700 dark:hover:text-purple-300 hover:underline transition-colors">
                {registerT.signInLink}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
