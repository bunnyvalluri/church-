"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ChevronLeft, Upload, X, CheckCircle2, Loader2, SkipForward, User } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import LanguageToggle from "@/components/LanguageToggle";
import { motion, AnimatePresence } from "framer-motion";

// ── Client-side image compressor (canvas, 300×300, 75% JPEG) ────────────────
const compressImage = (file: File, maxPx = 300): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (ev) => {
      const img = new window.Image();
      img.src = ev.target?.result as string;
      img.onload = () => {
        const scale = Math.min(maxPx / img.width, maxPx / img.height, 1);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.75));
        } else {
          resolve(ev.target?.result as string);
        }
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });

export default function LoginPage() {
  const router = useRouter();
  const { mounted, status, user, updateUser } = useAuth();
  const { t, language } = useLanguage();
  const loginT = t.pages.login;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // ── Passport photo upload step ─────────────────────────────────────────────
  const [showPhotoStep, setShowPhotoStep] = useState(false);
  const [pendingUid, setPendingUid] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoDone, setPhotoDone] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(true);
    // Redirect 127.0.0.1 to localhost to prevent Firebase auth/unauthorized-domain error
    if (typeof window !== "undefined" && window.location.hostname === "127.0.0.1") {
      const newUrl = window.location.href.replace("127.0.0.1", "localhost");
      window.location.replace(newUrl);
    }
  }, []);

  // Redirect already-authenticated users (skip photo step for returning sessions)
  useEffect(() => {
    if (mounted && status === "authenticated" && user && !showPhotoStep && !isLoggingIn) {
      switch (user.role) {
        case "SUPER_ADMIN": router.replace("/portal-select"); break;
        case "ADMIN":       router.replace("/admin");          break;
        case "PASTOR":      router.replace("/pastor");         break;
        case "EVENT_MANAGER":
        case "FIELD_VOLUNTEER": router.replace("/event-manager"); break;
        default:            router.replace("/member");
      }
    }
  }, [mounted, status, user, router, showPhotoStep, isLoggingIn]);

  // ── Photo upload helpers ───────────────────────────────────────────────────
  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    try {
      const compressed = await compressImage(file);
      setPhotoPreview(compressed);
    } catch {
      /* silent */ 
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handlePhotoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const savePhotoAndContinue = async () => {
    if (!pendingUid || !photoPreview) return;
    setPhotoUploading(true);
    try {
      await fetch("/api/member/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: pendingUid, image: photoPreview }),
      });
      if (updateUser) updateUser({ image: photoPreview });
      setPhotoDone(true);
      setTimeout(() => router.replace("/member"), 700);
    } catch {
      router.replace("/member");
    } finally {
      setPhotoUploading(false);
    }
  };

  const skipPhotoAndContinue = () => router.replace("/member");
  
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
      "auth/unauthorized-domain": loginT.errors.unauthorizedDomain || "This domain is not authorized. Please add this domain to the Authorized Domains list in Firebase Console.",
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
    if (errStr.startsWith("auth/operation-not-allowed")) {
      const parts = errStr.split(":");
      const provider = parts[1] || "Google";
      return loginT.errors.operationNotAllowed.replace("Google", provider);
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
          } else if (err.code === "auth/unauthorized-domain") {
            setError("auth/unauthorized-domain");
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
    setIsLoggingIn(true);
    try {
      const credential = await signInWithPopup(auth, provider);
      if (credential?.user) {
        // Send login notification to admin (non-blocking)
        fetch('/api/auth/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'LOGIN',
            email: credential.user.email,
            name: credential.user.displayName || credential.user.email,
            method: 'google',
          }),
        }).catch(() => {});

        // Perform database sync immediately
        const syncRes = await fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: credential.user.uid,
            email: credential.user.email,
            name: credential.user.displayName,
            photoURL: credential.user.photoURL,
            phoneNumber: credential.user.phoneNumber,
          }),
        });
        const syncData = await syncRes.json();
        const dbUser = syncData.success ? syncData.user : null;
        const role = dbUser?.role || "MEMBER";

        // Instantly set session cookies for middleware and client-side AuthProvider
        if (typeof document !== "undefined") {
          const maxAge = 60 * 60;
          document.cookie = `__kcm_session_uid=${credential.user.uid}; path=/; max-age=${maxAge}; SameSite=Strict`;
          document.cookie = `__kcm_session_role=${role}; path=/; max-age=${maxAge}; SameSite=Strict`;
        }

        // Update AuthProvider state
        if (updateUser && dbUser) {
          updateUser({
            uid: credential.user.uid,
            email: credential.user.email,
            name: dbUser.name || credential.user.displayName || "Member",
            image: dbUser.image || credential.user.photoURL || null,
            role: role,
          });
        }

        // Redirect immediately to the correct portal
        switch (role) {
          case "SUPER_ADMIN": router.replace("/portal-select"); break;
          case "ADMIN":       router.replace("/admin");          break;
          case "PASTOR":      router.replace("/pastor");         break;
          case "EVENT_MANAGER":
          case "FIELD_VOLUNTEER": router.replace("/event-manager"); break;
          default:            router.replace("/member");
        }
      }
    } catch (err: any) {
      console.warn(`[AUTH] ${name} Popup sign-in warning (might be blocked or policy mismatch):`, err.code || err);
      setIsLoggingIn(false);
      
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
      } else if (err.code === "auth/operation-not-allowed" || err.code === "auth/configuration-not-found") {
        setError("auth/operation-not-allowed");
        setSocialLoading(null);
      } else {
        setError(err.code || "social-generic-failed");
        setSocialLoading(null);
      }
    }
  };

  // Fire-and-forget: send login notification without blocking UI
  const sendLoginEmail = (userEmail: string, userName: string, method = 'email') => {
    fetch('/api/auth/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'LOGIN', email: userEmail, name: userName, method }),
    }).catch(() => {}); // Silently ignore failures — never block the user
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setIsLoggingIn(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      sendLoginEmail(
        credential.user.email || email,
        credential.user.displayName || email.split('@')[0],
        'email'
      );
      
      // Perform database sync immediately to get the user's role
      const syncRes = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: credential.user.uid,
          email: credential.user.email,
          name: credential.user.displayName,
          photoURL: credential.user.photoURL,
          phoneNumber: credential.user.phoneNumber,
        }),
      });
      const syncData = await syncRes.json();
      const dbUser = syncData.success ? syncData.user : null;
      const role = dbUser?.role || "MEMBER";

      // Instantly set session cookies for middleware and client-side AuthProvider
      if (typeof document !== "undefined") {
        const maxAge = 60 * 60;
        document.cookie = `__kcm_session_uid=${credential.user.uid}; path=/; max-age=${maxAge}; SameSite=Strict`;
        document.cookie = `__kcm_session_role=${role}; path=/; max-age=${maxAge}; SameSite=Strict`;
      }

      if (photoPreview) {
        try {
          await fetch("/api/member/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: credential.user.uid, image: photoPreview }),
          });
          if (updateUser) {
            updateUser({ image: photoPreview });
          }
        } catch (uploadErr) {
          console.error("[AUTH] Photo upload error:", uploadErr);
        }
      }

      // Update AuthProvider state
      if (updateUser && dbUser) {
        updateUser({
          uid: credential.user.uid,
          email: credential.user.email,
          name: dbUser.name || credential.user.displayName || "Member",
          image: dbUser.image || credential.user.photoURL || null,
          role: role,
        });
      }

      // Redirect immediately to the correct portal without waiting
      switch (role) {
        case "SUPER_ADMIN": router.replace("/portal-select"); break;
        case "ADMIN":       router.replace("/admin");          break;
        case "PASTOR":      router.replace("/pastor");         break;
        case "EVENT_MANAGER":
        case "FIELD_VOLUNTEER": router.replace("/event-manager"); break;
        default:            router.replace("/member");
      }
    } catch (err: any) {
      console.error("[AUTH] Login error:", err);
      setError(err.code || "sign-in-failed");
      setIsLoading(false);
      setIsLoggingIn(false);
    }
  };

  // ── Removed to prevent hydration mismatch

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
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex flex-col gap-2">
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-lg mt-0.5">⚠</span>
                <p className="text-red-700 dark:text-red-300 text-sm">{getLocalizedError(error)}</p>
              </div>

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

              <div className="w-full">
            {/* Google */}
            <motion.button
              type="button"
              onClick={() => handleSocialLogin(googleProvider, "Google")}
              disabled={!!socialLoading}
              whileHover={!socialLoading ? { scale: 1.01, y: -1 } : {}}
              whileTap={!socialLoading ? { scale: 0.98 } : {}}
              className="relative flex items-center justify-center gap-3 py-3.5 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20 disabled:opacity-80 disabled:cursor-wait group overflow-hidden"
              title={loginT.googleSignIn}
            >
              {/* Moving shimmer background when loading */}
              <AnimatePresence>
                {socialLoading === "Google" && (
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    exit={{ opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/40 dark:via-white/10 to-transparent skew-x-12 pointer-events-none"
                  />
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {socialLoading === "Google" ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-center gap-3"
                  >
                    <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--primary))]" />
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
                      {language === "en" ? "Connecting to Google..." : "கூகுள் கணக்குடன் இணைகிறது..."}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5 flex-shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      {loginT.googleSignIn}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
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
