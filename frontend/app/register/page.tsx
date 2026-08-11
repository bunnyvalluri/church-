"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
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
  const { mounted, status, user, updateUser } = useAuth();
  const { t, language } = useLanguage();
  const registerT = t.pages.register;
  const loginT = t.pages.login;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect if already logged in to their authorized page
  useEffect(() => {
    if (mounted && status === "authenticated" && user && !isRegistering) {
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        router.replace("/admin");
      } else if (user.role === "PASTOR") {
        router.replace("/pastor");
      } else {
        router.replace("/member");
      }
    }
  }, [mounted, status, user, router, isRegistering]);

  // Removed to prevent hydration mismatch

  const pwScore = passwordStrength(formData.password);

  const getStrengthLabel = (score: number) => {
    const labels = [
      registerT.tooShort,
      registerT.weak,
      registerT.fair,
      registerT.good,
      registerT.strong
    ];
    return labels[score] || "";
  };

  // Resolve localized error dynamically so it changes instantly when language toggles
  const getLocalizedError = (errStr: string) => {
    if (!errStr) return "";
    
    // Map of raw codes or exact English strings to their translated keys
    const errorMap: Record<string, string> = {
      "passwords-mismatch": registerT.errors.mismatch,
      "password-too-short": registerT.errors.tooShort,
      "auth/email-already-in-use": registerT.errors.emailInUse,
      "auth/weak-password": registerT.errors.weakPassword,
      "auth/invalid-email": registerT.errors.invalidEmail,
      "registration-failed": registerT.errors.genericFailed,
    };

    if (errorMap[errStr]) return errorMap[errStr];
    
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("passwords-mismatch");
      return;
    }
    if (formData.password.length < 8) {
      setError("password-too-short");
      return;
    }

    setIsLoading(true);
    setIsRegistering(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const u = userCredential.user;
      const maxAge = 7 * 24 * 60 * 60; // 7 days

      if (u) {
        updateProfile(u, { displayName: fullName }).catch(() => {});
      }

      // 1. Instantly set session cookies
      if (typeof document !== "undefined") {
        document.cookie = `__kcm_session_uid=${u.uid}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `__kcm_session_role=MEMBER; path=/; max-age=${maxAge}; SameSite=Lax`;
      }

      // 2. Instantly update client-side AuthProvider state
      if (updateUser) {
        updateUser({
          uid: u.uid,
          email: formData.email,
          name: fullName,
          image: null,
          role: "MEMBER",
        });
      }

      // 3. Fire-and-forget: background database sync
      fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: u.uid,
          email: formData.email,
          name: fullName,
          photoURL: null,
          phoneNumber: formData.phone || null,
        }),
      }).catch(() => {});

      // 4. Fire-and-forget: welcome email to member + new member alert to admin
      fetch('/api/auth/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'REGISTER',
          name: fullName,
          email: formData.email,
          phone: formData.phone || '',
        }),
      }).catch(() => {});

      // 5. INSTANT REDIRECT WITHOUT WAIT
      router.replace("/member");
    } catch (err: any) {
      console.error("[AUTH] Registration error:", err);
      setError(err.code || "registration-failed");
      setIsLoading(false);
      setIsRegistering(false);
    }
  };

  const inputClass =
    "w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-100/70 dark:bg-slate-950/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all placeholder-slate-400 dark:placeholder-gray-500 text-xs sm:text-sm";

  return (
    <div className="min-h-[100dvh] flex flex-col lg:grid lg:grid-cols-2 bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-gray-100 selection:bg-purple-500 selection:text-white relative overflow-x-hidden transition-colors duration-300">
      {/* ── Left Branding Panel ── */}
      <div className="hidden lg:flex relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#7c3aed] via-[#3b0764] to-[#09051d] border-r border-white/10">
        {/* Glowing top accent border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-500 shadow-[0_0_12px_rgba(192,132,252,0.8)]" />
        
        {/* Layered glowing radial mesh */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.35),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.25),transparent_55%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Ambient Animated Orbs */}
        <div className="absolute -top-24 -left-24 w-[30rem] h-[30rem] bg-purple-500/30 rounded-full blur-[90px] pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] bg-indigo-600/25 rounded-full blur-[90px] pointer-events-none" />

        {/* Centered Large Solid Cross Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none select-none">
          <svg className="w-[36rem] h-[36rem] text-white" viewBox="0 0 100 100" fill="currentColor">
            <rect x="42" y="6" width="16" height="88" rx="2" />
            <rect x="14" y="28" width="72" height="16" rx="2" />
          </svg>
        </div>

        {/* Header Back Link */}
        <div className="relative z-10">
          <Link href="/login" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-white/90 hover:text-white hover:bg-white/20 text-xs font-semibold tracking-wide transition-all group shadow-md">
            <ChevronLeft className="w-4 h-4 text-purple-300 group-hover:-translate-x-1 transition-transform" />
            <span>{registerT.backToSignIn}</span>
          </Link>
        </div>

        {/* Central Identity & Benefits */}
        <div className="relative z-10 text-white max-w-xl my-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 backdrop-blur-md shadow-2xl bg-white/10 p-1 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Kingdom of Christ Ministries Logo"
                fill
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
          <div className="space-y-4 p-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl shadow-xl">
            {[
              registerT.benefit1,
              registerT.benefit2,
              registerT.benefit3,
              registerT.benefit4,
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
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
      <div className="flex-1 flex flex-col justify-start lg:justify-center items-center px-3 pt-3 pb-16 sm:px-8 sm:py-10 lg:p-12 w-full min-w-0 bg-slate-100/90 dark:bg-slate-950 relative overflow-y-auto min-h-[100dvh] lg:min-h-0 transition-colors duration-300">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        {/* Ambient glow spots */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Top Controls Bar (Desktop Language Toggle & Theme Toggle) */}
        <div className="hidden lg:flex items-center gap-3 absolute top-6 right-6 z-20">
          <LanguageToggle />
          <ThemeToggle />
        </div>

        {/* Mobile Top Header Bar */}
        <div className="w-full max-w-lg flex items-center justify-between pt-1 px-1 mb-2 lg:hidden z-20 shrink-0">
          <Link href="/login" className="flex items-center gap-1 text-slate-800 dark:text-white/90 hover:text-slate-950 dark:hover:text-white transition-all duration-300 bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/15 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md text-[11px] font-semibold shrink-0">
            <ChevronLeft className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300" />
            <span>{registerT.backToSignIn}</span>
          </Link>
          <div className="flex items-center gap-1.5 shrink-0">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* Form Container Card */}
        <div className="w-full max-w-lg mx-auto bg-white/95 dark:bg-slate-900/80 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 dark:border-white/10 backdrop-blur-2xl z-10 min-w-0 box-border relative overflow-hidden transition-colors duration-300 mb-6 lg:my-auto">
          {/* Subtle glowing card accent border */}
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
            {/* Name Row - Always 2 Columns */}
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

            {/* Email & Phone Row on SM, stacked on Mobile */}
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
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
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
                          className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
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
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
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
                type="checkbox"
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
              className="relative overflow-hidden w-full py-2.5 sm:py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 border border-purple-400/20 cursor-pointer"
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
              <Link href="/login" className="text-purple-600 dark:text-purple-400 font-bold hover:text-purple-700 dark:hover:text-purple-300 hover:underline transition-all">
                {registerT.signInLink}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
