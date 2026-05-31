"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, facebookProvider, twitterProvider } from "@/lib/firebase";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ChevronLeft } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import LanguageToggle from "@/components/LanguageToggle";

export default function LoginPage() {
  const router = useRouter();
  const { mounted, status } = useAuth();
  const { t, language } = useLanguage();
  const loginT = t.pages.login;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Instantly redirect if already authenticated
  useEffect(() => {
    if (mounted && status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [mounted, status, router]);
  
  // Resolve localized error dynamically so it changes instantly when language toggles
  const getLocalizedError = (errStr: string) => {
    if (!errStr) return "";
    
    // Map of raw codes or exact English strings to their translated keys
    const errorMap: Record<string, string> = {
      "auth/invalid-credential": loginT.errors.invalidCredential,
      "auth/user-not-found": loginT.errors.userNotFound,
      "auth/wrong-password": loginT.errors.wrongPassword,
      "auth/too-many-requests": loginT.errors.tooManyRequests,
      "auth/operation-not-allowed": loginT.errors.operationNotAllowed,
      "auth/popup-blocked": loginT.errors.popupBlocked,
      "auth/cancelled-popup-request": loginT.errors.popupClosed,
      "auth/popup-closed-by-user": loginT.errors.popupClosed,
      "auth/network-request-failed": loginT.errors.networkFailed,
      "social-redirect-failed": loginT.errors.socialFailed,
      "social-generic-failed": loginT.errors.socialFailed,
      "sign-in-failed": loginT.errors.genericFailed,
    };

    if (errorMap[errStr]) return errorMap[errStr];
    
    const msgMap: Record<string, string> = {
      "Invalid email or password. Please try again.": loginT.errors.invalidCredential,
      "No account found with this email.": loginT.errors.userNotFound,
      "Incorrect password.": loginT.errors.wrongPassword,
      "Too many attempts. Please wait a moment.": loginT.errors.tooManyRequests,
      "Social login redirect failed. Please try again.": loginT.errors.socialFailed,
      "Sign-in failed. Please check your connection.": loginT.errors.genericFailed,
    };

    if (msgMap[errStr]) return msgMap[errStr];
    
    if (errStr.includes("sign-in failed")) {
      return loginT.errors.socialFailed;
    }
    if (errStr.includes("Google login is not enabled")) {
      return loginT.errors.operationNotAllowed;
    }

    return errStr;
  };

  // Handle social redirect result (popup fallbacks/compatibility)
  useEffect(() => {
    if (mounted) {
      const handleRedirectResult = async () => {
        try {
          if (!auth || typeof auth.onIdTokenChanged !== "function") return;
          const { getRedirectResult } = await import("firebase/auth");
          const result = await getRedirectResult(auth);
          if (result) {
            console.info("[AUTH] Redirect sign-in successful for:", result.user?.email);
          }
        } catch (err: any) {
          console.error("[AUTH] Redirect sign-in error:", err);
          if (err.code === "auth/operation-not-allowed") {
            setError("auth/operation-not-allowed");
          } else {
            setError("social-redirect-failed");
          }
        }
      };
      handleRedirectResult();
    }
  }, [mounted]);

  const handleSocialLogin = async (provider: any, name: string) => {
    setSocialLoading(name);
    setError("");
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.warn(`[AUTH] ${name} Popup sign-in warning (might be blocked or policy mismatch):`, err.code || err);
      
      const fallbackErrors = [
        "auth/popup-blocked",
        "auth/cancelled-popup-request",
        "auth/popup-closed-by-user",
        "auth/network-request-failed"
      ];
      
      if (fallbackErrors.includes(err.code) || err.message?.includes("COOP")) {
        console.info(`[AUTH] Attempting robust ${name} redirect fallback...`);
        try {
          const { signInWithRedirect } = await import("firebase/auth");
          await signInWithRedirect(auth, provider);
        } catch (redirectErr: any) {
          console.error(`[AUTH] ${name} Redirect Fallback Error:`, redirectErr);
          setError("auth/popup-blocked");
          setSocialLoading(null);
        }
      } else if (err.code === "auth/operation-not-allowed") {
        setError("auth/operation-not-allowed");
        setSocialLoading(null);
      } else {
        setError(err.code || "social-generic-failed");
        setSocialLoading(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.code || "sign-in-failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row">
      {/* ── Left Branding Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gradient-start via-slate-950 to-gradient-end" />
        {/* Decorative Circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[hsl(var(--primary))]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-end/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-start/10 rounded-full blur-2xl" />
        {/* Cross Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none">
          <span className="text-white font-bold" style={{ fontSize: "40rem", lineHeight: 1 }}>✝</span>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <ChevronLeft className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
            <span className="text-white/60 text-sm group-hover:text-white transition-colors">{loginT.backToHome}</span>
          </Link>
        </div>

        <div className="relative z-10 text-white">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-2xl">✝</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{loginT.churchName}</h1>
              <p className="text-white/80 text-sm">{loginT.ministries}</p>
            </div>
          </div>

          <blockquote className="text-3xl font-light leading-relaxed text-white/90 mb-6">
            "{loginT.quote}"
          </blockquote>
          <cite className="text-gradient-start text-sm font-semibold filter brightness-150">{loginT.author}</cite>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/60 text-sm">{loginT.footerTicker}</span>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-12 bg-gradient-to-br from-gradient-start via-slate-950 to-gradient-end lg:from-transparent lg:via-transparent lg:to-transparent lg:bg-none lg:bg-white lg:dark:bg-gray-950 relative overflow-hidden">
        {/* Background Decorative Circles (Mobile Only) */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[hsl(var(--primary))]/20 rounded-full blur-3xl lg:hidden pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-end/20 rounded-full blur-3xl lg:hidden pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-start/10 rounded-full blur-2xl lg:hidden pointer-events-none" />
        
        {/* Cross Watermark (Mobile Only) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none lg:hidden">
          <span className="text-white font-bold" style={{ fontSize: "30rem", lineHeight: 1 }}>✝</span>
        </div>

        {/* Language Selection */}
        <div className="absolute top-6 right-6 z-20">
          <LanguageToggle />
        </div>

        {/* Mobile Header / Back Button */}
        <div className="absolute top-6 left-6 lg:hidden z-20">
          <Link href="/" className="flex items-center gap-2 text-white/90 hover:text-white transition-colors bg-white/10 dark:bg-white/5 border border-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-xs font-medium">{loginT.backToHome}</span>
          </Link>
        </div>

        <div className="w-full max-w-md mt-12 lg:mt-0 bg-white/90 dark:bg-gray-950/90 lg:bg-transparent lg:dark:bg-transparent p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-white/5 backdrop-blur-xl lg:border-none lg:shadow-none lg:backdrop-blur-none lg:p-0 z-10 animate-fade-in-up">
          {/* Mobile Branding (Visible only on smaller screens) */}
          <div className="lg:hidden flex flex-col items-center mb-8 text-center animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-[hsl(var(--primary))/0.08] dark:bg-[hsl(var(--primary))/0.15] border border-[hsl(var(--primary))/0.15] dark:border-[hsl(var(--primary))/0.3] flex items-center justify-center mb-3 shadow-sm">
              <span className="text-2xl text-[hsl(var(--primary))]">✝</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gradient-start to-gradient-end bg-clip-text text-transparent tracking-tight">
              {loginT.churchName}
            </h1>
            <p className={`text-gray-500 dark:text-gray-400 font-bold mt-0.5 leading-normal ${
              language === "en" ? "text-[10px] uppercase tracking-widest" : "text-xs tracking-normal"
            }`}>{loginT.ministries}</p>
            
            {/* Glassmorphic Mobile Scripture Quote */}
            <div className="mt-4 px-4 py-3 rounded-xl bg-[hsl(var(--primary))/0.03] dark:bg-[hsl(var(--primary))/0.08] border border-[hsl(var(--primary))/0.1] dark:border-[hsl(var(--primary))/0.2] backdrop-blur-sm max-w-sm mx-auto shadow-sm">
              <p className="text-xs italic text-gray-600 dark:text-gray-300 font-light leading-relaxed">
                "{loginT.quote}"
              </p>
              <p className="text-[10px] text-[hsl(var(--primary))] font-medium mt-1 text-right">
                {loginT.author}
              </p>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
              {loginT.title}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {loginT.subtitle}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
              <span className="text-red-500 text-lg mt-0.5">⚠</span>
              <p className="text-red-700 dark:text-red-300 text-sm">{getLocalizedError(error)}</p>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {loginT.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-600"
                  placeholder={loginT.emailPlaceholder}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {loginT.password}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[hsl(var(--primary))] hover:opacity-85 font-medium transition-colors"
                >
                  {loginT.forgotPassword}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-600"
                  placeholder={loginT.passwordPlaceholder}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gradient-start to-gradient-end text-white font-semibold shadow-lg shadow-[hsl(var(--primary))/0.25] hover:shadow-[hsl(var(--primary))/0.4] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {loginT.signingIn}
                </>
              ) : (
                <>{loginT.signInBtn} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white dark:bg-gray-950 text-sm text-gray-400">{loginT.orContinueWith}</span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-3 gap-3">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialLogin(googleProvider, "Google")}
              disabled={!!socialLoading}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm disabled:opacity-60 group"
              title={loginT.googleSignIn}
            >
              {socialLoading === "Google" ? (
                <svg className="animate-spin w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleSocialLogin(facebookProvider, "Facebook")}
              disabled={!!socialLoading}
              className="flex items-center justify-center py-3 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white transition-all shadow-sm disabled:opacity-60"
              title={loginT.facebookSignIn}
            >
              {socialLoading === "Facebook" ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v2.277h-1.55c-2.006 0-2.327.945-2.327 2.308v2.675h4.417l-.59 3.667h-3.827v7.98h-4.59Z" />
                </svg>
              )}
            </button>

            {/* X / Twitter */}
            <button
              type="button"
              onClick={() => handleSocialLogin(twitterProvider, "X")}
              disabled={!!socialLoading}
              className="flex items-center justify-center py-3 rounded-xl bg-black hover:bg-gray-800 text-white transition-all shadow-sm disabled:opacity-60"
              title={loginT.twitterSignIn}
            >
              {socialLoading === "X" ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              )}
            </button>
          </div>

          {/* Register Link */}
          <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
            {loginT.newToMinistry}{" "}
            <Link href="/register" className="text-[hsl(var(--primary))] font-semibold hover:underline">
              {loginT.createAccountLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
