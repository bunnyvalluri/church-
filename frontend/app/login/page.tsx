"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ChevronLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/lib/translations";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 1, y: 0 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
    },
  },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegisteredSuccess = searchParams?.get("registered") === "true";

  const authContext = useAuth();
  const mounted = authContext?.mounted ?? false;
  const status = authContext?.status ?? "unauthenticated";
  const user = authContext?.user ?? null;
  const updateUser = authContext?.updateUser;

  // ── Language context — hooks cannot be inside try/catch (Rules of Hooks) ──
  const langContext = useLanguage();
  const t = langContext?.t ?? translations.en;
  const language = langContext?.language ?? "en";

  const loginT = t?.pages?.login || translations.en.pages.login;

  const sendLoginEmail = (email: string, name: string, method: string) => {
    if (!email) return;
    fetch('/api/auth/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'LOGIN', email, name, method }),
    }).catch(() => {});
  };


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ── Photo upload state (used after Google sign-in for new users) ───────────
  const [pendingUid, setPendingUid] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoDone, setPhotoDone] = useState(false);

  // Compress image to JPEG base64 (max 800px, 0.82 quality)
  const compressImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX = 800;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = url;
    });
  }, []);


  useEffect(() => {
    setError("");
    // Instant prefetch of dashboard routes for 0ms page transitions
    router.prefetch("/member");
    router.prefetch("/admin/dashboard");
    router.prefetch("/pastor/main/dashboard");
    router.prefetch("/event-manager");

    // Redirect 127.0.0.1 to localhost to prevent Firebase auth/unauthorized-domain error
    if (typeof window !== "undefined" && window.location.hostname === "127.0.0.1") {
      const newUrl = window.location.href.replace("127.0.0.1", "localhost");
      window.location.replace(newUrl);
    }
  }, [router]);

  // Redirect already-authenticated users
  useEffect(() => {
    if (mounted && status === "authenticated" && user && !isLoggingIn) {
      let target = "/member";
      switch (user.role) {
        case "ADMIN":
        case "SUPER_ADMIN":
          target = "/admin/dashboard";
          break;
        case "PASTOR":
          target = "/pastor/main/dashboard";
          break;
        case "EVENT_MANAGER":
        case "FIELD_VOLUNTEER":
          target = "/event-manager";
          break;
        default:
          target = "/member";
          break;
      }
      if (typeof window !== "undefined") {
        window.location.replace(target);
      } else {
        router.replace(target);
      }
    }
  }, [mounted, status, user, router, isLoggingIn]);

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

  // Extract clean Firebase error code from raw SDK message strings.
  // Firebase SDK sometimes throws: "Firebase: Error (auth/invalid-credential)."
  const extractFirebaseCode = (msg?: string): string | null => {
    if (!msg) return null;
    const match = msg.match(/\(auth\/[^)]+\)/);
    if (match) return match[0].replace(/[()]/g, "");
    return null;
  };

  // Resolve localized error dynamically so it changes instantly when language toggles
  const getLocalizedError = (errStr: string) => {
    if (!errStr) return "";
    if (
      errStr === "auth/popup-closed-by-user" ||
      errStr === "auth/user-cancelled" ||
      errStr === "auth/cancelled-popup-request"
    ) {
      return "";
    }
    
    // Map of standard Firebase error codes to translated user-friendly messages
    const errorMap: Record<string, string> = {
      "auth/invalid-credential": loginT.errors.invalidCredential,
      "auth/invalid-login-credentials": loginT.errors.invalidCredential,
      "auth/user-not-found": loginT.errors.userNotFound,
      "auth/wrong-password": loginT.errors.wrongPassword,
      "auth/user-disabled": "Your account has been disabled. Please contact the church administrator.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/email-already-in-use": "An account already exists with this email address.",
      "auth/weak-password": "Password is too weak. Please use a stronger password.",
      "auth/too-many-requests": loginT.errors.tooManyRequests,
      "auth/operation-not-allowed": loginT.errors.operationNotAllowed,
      "auth/popup-blocked": loginT.errors.popupBlocked,
      "auth/network-request-failed": loginT.errors.networkFailed,
      "auth/unauthorized-domain": loginT.errors.unauthorizedDomain || "This domain is not authorized for authentication in Firebase Console. Please add your domain to Authorized Domains.",
      "auth/auth-domain-config-required": loginT.errors.unauthorizedDomain || "Authentication domain configuration required.",
      "auth/account-exists-with-different-credential": "An account already exists with this email using a different sign-in method.",
      "auth/api-key-not-valid": "Authentication configuration issue. Please contact support.",
      "auth/invalid-api-key": "Authentication configuration issue. Please contact support.",
      "auth/app-not-authorized": "This application domain is not authorized. Please contact the administrator.",
      "auth/internal-error": loginT.errors.genericFailed,
      "auth/configuration-not-found": "Authentication service not configured. Please contact support.",
      "social-redirect-failed": loginT.errors.socialFailed,
      "social-generic-failed": loginT.errors.socialFailed,
      "sign-in-failed": loginT.errors.genericFailed,
      "network-offline": "You are offline. Please check your internet connection and try again.",
      "auth-not-ready": "Authentication service is initializing. Please try again in a moment.",
    };

    if (errorMap[errStr]) return errorMap[errStr];
    
    // Try to extract auth/ code from raw Firebase error messages
    const extracted = extractFirebaseCode(errStr);
    if (extracted && errorMap[extracted]) return errorMap[extracted];
    
    // Check for message string matches
    const msgMap: Record<string, string> = {
      "Invalid email or password. Please try again.": loginT.errors.invalidCredential,
      "No account found with this email.": loginT.errors.userNotFound,
      "No account exists with this email address.": loginT.errors.userNotFound,
      "Incorrect password.": loginT.errors.wrongPassword,
      "Too many attempts. Please wait a moment.": loginT.errors.tooManyRequests,
      "Social login redirect failed. Please try again.": loginT.errors.socialFailed,
      "Sign-in failed. Please verify your credentials and try again.": loginT.errors.genericFailed,
    };

    if (msgMap[errStr]) return msgMap[errStr];
    
    if (errStr.startsWith("auth/")) {
      return loginT.errors.genericFailed;
    }

    return errStr;
  };


  const redirectForRole = (targetRole: string) => {
    // ── Determine role-based default destination ─────────────────────────────
    const normalized = (targetRole || "MEMBER").toUpperCase();
    let targetPath = "/member";
    switch (normalized) {
      case "ADMIN":
      case "SUPER_ADMIN":
        targetPath = "/admin/dashboard";
        break;
      case "PASTOR":
        targetPath = "/pastor/main/dashboard";
        break;
      case "EVENT_MANAGER":
      case "FIELD_VOLUNTEER":
        targetPath = "/event-manager";
        break;
      default:
        targetPath = "/member";
        break;
    }

    // ── Honor ?next= param only if it is same-origin and a protected path ────
    // Prevents open-redirect attacks. Only allow paths the user's role permits.
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const nextParam = params.get("next");
      if (
        nextParam &&
        nextParam.startsWith("/") &&
        !nextParam.startsWith("//") && // block protocol-relative redirects
        !nextParam.includes(":")       // block javascript: and data: URIs
      ) {
        // Role-guard the next param so members can't bypass to /admin
        const isAdminNext = nextParam.startsWith("/admin") || nextParam.startsWith("/pastor");
        if (!isAdminNext || normalized === "ADMIN" || normalized === "SUPER_ADMIN" || normalized === "PASTOR") {
          targetPath = nextParam;
        }
      }
    }

    // ── Direct full-page navigation for reliable session cookie pickup ─────────
    if (typeof window !== "undefined") {
      window.location.replace(targetPath);
      setTimeout(() => {
        router.replace(targetPath);
      }, 500);
    } else {
      router.replace(targetPath);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // ── Client-side validation ────────────────────────────────────────────────
    const sanitizedEmail = (email || "").toLowerCase().trim();
    if (!sanitizedEmail || !password) {
      setError("auth/invalid-credential");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      setError("auth/invalid-email");
      return;
    }

    // ── Pre-flight: network check ─────────────────────────────────────────────
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError("network-offline");
      return;
    }

    // ── Pre-flight: verify Firebase is configured with valid credentials ───────
    if (!isFirebaseConfigured()) {
      setError("auth/api-key-not-valid");
      return;
    }

    // ── Pre-flight: ensure Firebase Auth is initialised ───────────────────────
    const activeAuth = getFirebaseAuth() || auth;
    if (!activeAuth || typeof activeAuth.onAuthStateChanged !== "function") {
      setError("auth-not-ready");
      return;
    }

    setIsLoading(true);
    setIsLoggingIn(true);

    try {
      const credential = await signInWithEmailAndPassword(activeAuth, sanitizedEmail, password);
      const u = credential.user;

      if (!u) {
        throw new Error("auth/invalid-credential");
      }

      // 1. Authoritative database sync to fetch assigned role
      let role = "MEMBER";
      try {
        const syncRes = await fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: u.uid,
            email: u.email || sanitizedEmail,
            name: u.displayName || sanitizedEmail.split("@")[0],
            photoURL: u.photoURL,
            phoneNumber: u.phoneNumber || null,
          }),
        });
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          if (syncData?.success && syncData?.user?.role) {
            role = syncData.user.role;
          }
        }
      } catch (syncErr) {
        console.warn("[AUTH] Sync error:", syncErr);
      }

      // 2. Server session is already established via /api/auth/sync HttpOnly cookie

      // 3. Update client AuthProvider state
      if (updateUser) {
        updateUser({
          uid: u.uid,
          email: u.email || sanitizedEmail,
          name: u.displayName || sanitizedEmail.split("@")[0],
          image: u.photoURL || null,
          role: role as any,
        });
      }

      // 4. Non-blocking login email notification
      sendLoginEmail(u.email || sanitizedEmail, u.displayName || sanitizedEmail.split("@")[0], "email");

      // 5. Role-based redirect
      redirectForRole(role);
    } catch (err: any) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[FIREBASE_AUTH_DIAGNOSTIC]", {
          code: err?.code,
          message: err?.message,
          name: err?.name,
        });
      } else {
        console.error("[AUTH] Login error:", err?.code || err?.name || "auth/invalid-credential");
      }
      setIsLoading(false);
      setIsLoggingIn(false);
      // Extract clean error code — avoid exposing raw Firebase SDK message strings
      const errCode = err?.code || extractFirebaseCode(err?.message) || "auth/invalid-credential";
      setError(errCode);
    }
  };

  // ── Removed to prevent hydration mismatch

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
        <motion.div 
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.35, 0.5, 0.35],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-24 -left-24 w-[30rem] h-[30rem] bg-purple-500/30 rounded-full blur-[90px] pointer-events-none" 
        />
        <motion.div 
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.4, 0.25],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] bg-indigo-600/25 rounded-full blur-[90px] pointer-events-none" 
        />

        {/* Centered Large Solid Cross Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] pointer-events-none select-none">
          <svg className="w-[36rem] h-[36rem] text-white" viewBox="0 0 100 100" fill="currentColor">
            <rect x="42" y="6" width="16" height="88" rx="2" />
            <rect x="14" y="28" width="72" height="16" rx="2" />
          </svg>
        </div>

        {/* Header Back Link */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-white/90 hover:text-white hover:bg-white/20 text-xs font-semibold tracking-wide transition-all group shadow-md">
            <ChevronLeft className="w-4 h-4 text-purple-300 group-hover:-translate-x-1 transition-transform" />
            <span>{loginT.backToHome}</span>
          </Link>
        </div>

        {/* Central Quote & Identity */}
        <div className="relative z-10 text-white max-w-xl my-auto">
          {/* Identity Header with Official Logo */}
          <div className="flex items-center gap-4 mb-8">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 backdrop-blur-md shadow-2xl bg-white/10 p-1 flex-shrink-0 group hover:border-purple-300 transition-all duration-300">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Kingdom of Christ Ministries Logo"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-purple-100 to-purple-200 bg-clip-text text-transparent">
                {loginT.churchName}
              </h1>
              <p className="text-purple-200/80 text-xs font-bold tracking-widest uppercase mt-0.5">{loginT.ministries}</p>
            </div>
          </div>

          {/* Clean Quote Display matching requested image */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="p-6 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl pointer-events-none" />
            <blockquote className="text-xl sm:text-2xl font-normal leading-relaxed text-white/95 tracking-tight italic">
              "{loginT.quote}"
            </blockquote>
            <p className="text-purple-200 text-sm font-semibold pt-3 not-italic">
              — {loginT.author}
            </p>
          </motion.div>
        </div>

        {/* Footer Status Ticker */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
            <span className="text-white/90 text-xs font-semibold tracking-wide">{loginT.footerTicker}</span>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col justify-start lg:justify-center items-center p-3 sm:p-6 lg:p-12 w-full min-w-0 bg-slate-50 dark:bg-slate-950 relative overflow-y-auto min-h-[100dvh] lg:min-h-0 transition-colors duration-300">
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

        {/* Mobile Header Bar */}
        <div className="w-full max-w-md flex items-center justify-between pb-2 px-1 lg:hidden z-20 shrink-0">
          <Link href="/" className="flex items-center gap-1 text-slate-800 dark:text-white/90 hover:text-slate-950 dark:hover:text-white transition-all duration-300 bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/15 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-md text-[11px] sm:text-xs font-semibold shrink-0">
            <ChevronLeft className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300" />
            <span>{loginT.backToHome}</span>
          </Link>
          <div className="flex items-center gap-1.5 shrink-0">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* Form Container Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md mx-auto bg-white/95 dark:bg-slate-900/90 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-slate-200/90 dark:border-white/10 backdrop-blur-2xl z-10 min-w-0 box-border relative overflow-hidden transition-colors duration-300 my-auto"
        >
          {/* Subtle glowing card accent border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 opacity-80" />

          {/* Form Header */}
          <div className="mb-3 sm:mb-4 text-center lg:text-left">
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {loginT.title}
            </h2>
            <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm font-medium mt-0.5">
              {loginT.subtitle}
            </p>
          </div>

          {/* Registration Success Alert */}
          {isRegisteredSuccess && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3 shadow-md"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-bold">
                  {language === "te"
                    ? "ఖాతా విజయవంతంగా సృష్టించబడింది. దయచేసి సైన్ ఇన్ చేయండి."
                    : language === "hi"
                    ? "खाता सफलतापूर्वक बनाया गया। कृपया साइन इन करें।"
                    : "Account created successfully. Please sign in."}
                </p>
              </div>
            </motion.div>
          )}

          {/* Error Alert */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 flex items-start gap-3 shadow-md"
            >
              <span className="text-red-600 dark:text-red-400 text-lg mt-0.5">⚠</span>
              <p className="text-red-700 dark:text-red-200 text-sm font-medium">{getLocalizedError(error)}</p>
            </motion.div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-5"
            >
              {/* Email Input */}
              <motion.div variants={itemVariants} className="space-y-1.5 group">
                <label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-gray-300 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors duration-300">
                  {loginT.email}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-400 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors duration-300" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-100/70 dark:bg-slate-950/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 placeholder-slate-400 dark:placeholder-gray-500 text-sm"
                    placeholder={loginT.emailPlaceholder}
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div variants={itemVariants} className="space-y-1.5 group">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-gray-300 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors duration-300">
                    {loginT.password}
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-semibold transition-colors"
                  >
                    {loginT.forgotPassword}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-400 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400 transition-colors duration-300" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-100/70 dark:bg-slate-950/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 placeholder-slate-400 dark:placeholder-gray-500 text-sm"
                    placeholder={loginT.passwordPlaceholder}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`relative overflow-hidden w-full py-3.5 rounded-xl font-bold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer select-none active:scale-[0.99] disabled:cursor-not-allowed ${
                    isLoading
                      ? "bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white shadow-purple-600/35 border border-purple-400/40"
                      : "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.01] border border-purple-400/20"
                  }`}
                >
                  {/* Gloss sheen overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                  
                  {/* Shimmer sweep while loading */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-[shimmer_2s_infinite]" />
                  )}

                  {isLoading ? (
                    <div className="relative z-10 flex items-center justify-center gap-2.5">
                      <Loader2 className="animate-spin w-4 h-4 text-purple-200" />
                      <span className="tracking-wide text-sm font-semibold text-purple-100">{loginT.signingIn}</span>
                    </div>
                  ) : (
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loginT.signInBtn} 
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  )}
                </button>
              </motion.div>

              {/* Divider */}
              <motion.div variants={itemVariants} className="relative my-6 pt-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white dark:bg-slate-900 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">{loginT.orContinueWith}</span>
                </div>
              </motion.div>

              {/* Google Sign-In via official Google Identity Services */}
              <motion.div variants={itemVariants} className="w-full">
                <GoogleSignInButton />
              </motion.div>

              {/* Register Link */}
              <motion.p variants={itemVariants} className="text-center pt-2 text-sm text-slate-600 dark:text-gray-400 font-medium">
                {loginT.newToMinistry}{" "}
                <Link href="/register" className="text-purple-600 dark:text-purple-400 font-bold hover:text-purple-700 dark:hover:text-purple-300 hover:underline transition-all">
                  {loginT.createAccountLink}
                </Link>
              </motion.p>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-400" />
            <p className="text-xs text-slate-500 font-medium">Loading login portal...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

