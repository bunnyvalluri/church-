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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 110,
      damping: 15,
    },
  },
};

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
          if (result?.user) {
            console.info("[AUTH] Redirect sign-in successful for:", result.user?.email);
            const u = result.user;
            const maxAge = 7 * 24 * 60 * 60; // 7 days

            if (typeof document !== "undefined") {
              document.cookie = `__kcm_session_uid=${u.uid}; path=/; max-age=${maxAge}; SameSite=Lax`;
              document.cookie = `__kcm_session_role=MEMBER; path=/; max-age=${maxAge}; SameSite=Lax`;
            }

            if (updateUser) {
              updateUser({
                uid: u.uid,
                email: u.email,
                name: u.displayName || "Member",
                image: u.photoURL || null,
                role: "MEMBER",
              });
            }

            // Background database sync
            fetch("/api/auth/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                uid: u.uid,
                email: u.email,
                name: u.displayName,
                photoURL: u.photoURL,
                phoneNumber: u.phoneNumber,
              }),
            })
              .then((res) => res.json())
              .then((syncData) => {
                if (syncData?.success && syncData?.user?.role) {
                  const role = syncData.user.role;
                  if (typeof document !== "undefined") {
                    document.cookie = `__kcm_session_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
                  }
                  if (updateUser) updateUser({ role });
                }
              })
              .catch(() => {});

            // Instant redirect
            window.location.href = "/member";
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
  }, [mounted, updateUser]);

  const handleSocialLogin = async (provider: any, name: string) => {
    setSocialLoading(name);
    setError("");
    setIsLoggingIn(true);
    try {
      const credential = await signInWithPopup(auth, provider);
      if (credential?.user) {
        const u = credential.user;
        const maxAge = 7 * 24 * 60 * 60; // 7 days

        // 1. Instantly set session cookies so middleware & AuthProvider recognize state immediately
        if (typeof document !== "undefined") {
          document.cookie = `__kcm_session_uid=${u.uid}; path=/; max-age=${maxAge}; SameSite=Lax`;
          document.cookie = `__kcm_session_role=MEMBER; path=/; max-age=${maxAge}; SameSite=Lax`;
        }

        // 2. Instantly update client-side AuthProvider state
        if (updateUser) {
          updateUser({
            uid: u.uid,
            email: u.email,
            name: u.displayName || "Member",
            image: u.photoURL || null,
            role: "MEMBER",
          });
        }

        // 3. Fire-and-forget: background database sync
        fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: u.uid,
            email: u.email,
            name: u.displayName,
            photoURL: u.photoURL,
            phoneNumber: u.phoneNumber,
          }),
        })
          .then((res) => res.json())
          .then((syncData) => {
            if (syncData?.success && syncData?.user?.role) {
              const role = syncData.user.role;
              if (typeof document !== "undefined") {
                document.cookie = `__kcm_session_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
              }
              if (updateUser) updateUser({ role });
            }
          })
          .catch(() => {});

        // 4. Non-blocking login email notification
        fetch('/api/auth/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'LOGIN',
            email: u.email,
            name: u.displayName || u.email,
            method: 'google',
          }),
        }).catch(() => {});

        // 5. INSTANT HARD NAVIGATION (prevents middleware state caching issues)
        window.location.href = "/member";
      }
    } catch (err: any) {
      console.warn(`[AUTH] ${name} Popup sign-in warning:`, err.code || err);
      setIsLoggingIn(false);
      setSocialLoading(null);
      
      const fallbackErrors = [
        "auth/popup-blocked",
        "auth/cancelled-popup-request",
        "auth/popup-closed-by-user",
        "auth/network-request-failed"
      ];
      
      if (err.code === "auth/popup-blocked" || err.message?.includes("COOP")) {
        console.info(`[AUTH] Attempting robust ${name} redirect fallback...`);
        try {
          const { signInWithRedirect } = await import("firebase/auth");
          await signInWithRedirect(auth, provider);
        } catch (redirectErr: any) {
          console.error(`[AUTH] ${name} Redirect Fallback Error:`, redirectErr);
          setError("auth/popup-blocked");
        }
      } else if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        // User voluntarily closed popup — don't show alarming error message
        setError("");
      } else if (err.code === "auth/operation-not-allowed" || err.code === "auth/configuration-not-found") {
        setError("auth/operation-not-allowed");
      } else {
        setError(err.code || "social-generic-failed");
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
      const u = credential.user;
      const maxAge = 7 * 24 * 60 * 60; // 7 days

      // 1. Instantly set session cookies
      if (typeof document !== "undefined") {
        document.cookie = `__kcm_session_uid=${u.uid}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `__kcm_session_role=MEMBER; path=/; max-age=${maxAge}; SameSite=Lax`;
      }

      // 2. Instantly update client-side AuthProvider state
      if (updateUser) {
        updateUser({
          uid: u.uid,
          email: u.email,
          name: u.displayName || email.split('@')[0],
          image: u.photoURL || null,
          role: "MEMBER",
        });
      }

      // 3. Fire-and-forget: background database sync
      fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: u.uid,
          email: u.email,
          name: u.displayName,
          photoURL: u.photoURL,
          phoneNumber: u.phoneNumber,
        }),
      })
        .then((res) => res.json())
        .then((syncData) => {
          if (syncData?.success && syncData?.user?.role) {
            const role = syncData.user.role;
            if (typeof document !== "undefined") {
              document.cookie = `__kcm_session_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax`;
            }
            if (updateUser) updateUser({ role });
          }
        })
        .catch(() => {});

      // 4. Non-blocking login email notification
      sendLoginEmail(u.email || email, u.displayName || email.split('@')[0], 'email');

      // 5. INSTANT REDIRECT
      window.location.href = "/member";
    } catch (err: any) {
      console.error("[AUTH] Login error:", err);
      setError(err.code || "sign-in-failed");
      setIsLoading(false);
      setIsLoggingIn(false);
    }
  };

  // ── Removed to prevent hydration mismatch

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row bg-slate-950">
      {/* ── Left Branding Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        {/* Modern dark gradient backdrop */}
        <div className="absolute inset-0 bg-slate-950" />
        
        {/* Layered glowing mesh gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.12),transparent_45%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        
        {/* Ambient Animated Orbs */}
        <motion.div 
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.25, 0.35, 0.25],
            y: [0, -10, 0]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-[hsl(var(--primary))]/20 rounded-full blur-[90px] pointer-events-none" 
        />
        <motion.div 
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.18, 0.25, 0.18],
            x: [0, 15, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
          className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-gradient-end/15 rounded-full blur-[90px] pointer-events-none" 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-start/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Dash-Outline Cross Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
          <svg className="w-[36rem] h-[36rem] text-white" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2 3">
            <path d="M50,12 L50,88 M32,36 L68,36" strokeLinecap="round" />
          </svg>
        </div>

        {/* Header Back Link */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 group px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 backdrop-blur-md transition-all duration-300">
            <ChevronLeft className="w-4 h-4 text-white/70 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-white/80 text-xs font-semibold tracking-wide">{loginT.backToHome}</span>
          </Link>
        </div>

        {/* Central Quote & Identity */}
        <div className="relative z-10 text-white max-w-xl my-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-white/10 backdrop-blur-md shadow-2xl p-1 bg-white/5 group hover:border-white/30 transition-all duration-300">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Kingdom of Christ Ministries Logo"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">{loginT.churchName}</h1>
              <p className="text-white/60 text-xs font-medium tracking-widest uppercase mt-0.5">{loginT.ministries}</p>
            </div>
          </div>

          {/* Premium Glassmorphic Quote Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
            className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-lg shadow-2xl overflow-hidden group hover:border-white/25 transition-all duration-500"
          >
            {/* Gloss sheen animate overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
            <div className="absolute top-2 right-6 opacity-[0.08] text-white font-serif text-[10rem] select-none pointer-events-none leading-none">
              ”
            </div>
            <blockquote className="text-xl font-light leading-relaxed text-white/90 mb-5 italic relative z-10 pr-4">
              "{loginT.quote}"
            </blockquote>
            <div className="flex items-center gap-3 relative z-10">
              <span className="w-8 h-[1px] bg-gradient-start" />
              <cite className="text-gradient-start text-xs font-semibold not-italic tracking-widest uppercase filter brightness-125">
                {loginT.author}
              </cite>
            </div>
          </motion.div>
        </div>

        {/* Footer Status */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
            <span className="text-white/60 text-xs font-medium tracking-wide">{loginT.footerTicker}</span>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-10 sm:px-12 bg-gradient-to-br from-gradient-start via-slate-950 to-gradient-end lg:from-transparent lg:via-transparent lg:to-transparent lg:bg-none lg:bg-white lg:dark:bg-gray-950 relative overflow-hidden">
        {/* Subtle grid pattern background (visible on desktop) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none hidden lg:block" />
        
        {/* Ambient glow spots */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-gradient-start/[0.03] dark:bg-gradient-start/[0.08] rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-96 h-96 bg-gradient-end/[0.03] dark:bg-gradient-end/[0.08] rounded-full blur-[90px] pointer-events-none" />
        
        {/* Background Decorative Circles (Mobile Only) */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[hsl(var(--primary))]/15 rounded-full blur-3xl lg:hidden pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-end/15 rounded-full blur-3xl lg:hidden pointer-events-none" />
        
        {/* Cross Watermark (Mobile Only) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none lg:hidden">
          <span className="text-white font-bold" style={{ fontSize: "30rem", lineHeight: 1 }}>✝</span>
        </div>

        {/* Language Selection */}
        <div className="absolute top-6 right-6 z-20">
          <LanguageToggle />
        </div>

        {/* Mobile Header / Back Button */}
        <div className="absolute top-6 left-6 lg:hidden z-20">
          <Link href="/" className="flex items-center gap-2 text-white/90 hover:text-white transition-all duration-300 bg-white/10 dark:bg-white/5 border border-white/10 hover:border-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-xs font-semibold tracking-wide">{loginT.backToHome}</span>
          </Link>
        </div>

        {/* Form Container */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md mt-10 lg:mt-0 bg-white/80 dark:bg-gray-950/80 lg:bg-transparent lg:dark:bg-transparent p-4 sm:p-10 rounded-3xl shadow-2xl border border-white/20 dark:border-white/5 backdrop-blur-xl lg:border-none lg:shadow-none lg:backdrop-blur-none lg:p-0 z-10"
        >
          {/* Mobile Branding (Visible only on smaller screens) */}
          <div className="lg:hidden flex flex-col items-center mb-8 text-center animate-fade-in-up">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-200 dark:border-gray-800 mb-3 shadow-md bg-white dark:bg-gray-900 p-0.5">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Kingdom of Christ Ministries Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gradient-start to-gradient-end bg-clip-text text-transparent tracking-tight">
              {loginT.churchName}
            </h1>
            <p className={`text-gray-500 dark:text-gray-400 font-bold mt-0.5 leading-normal ${
              language === "en" ? "text-[10px] uppercase tracking-widest" : "text-xs tracking-normal"
            }`}>{loginT.ministries}</p>
            
            {/* Glassmorphic Mobile Scripture Quote */}
            <div className="mt-4 px-5 py-3.5 rounded-2xl bg-white/50 dark:bg-white/[0.02] border border-black/5 dark:border-white/10 backdrop-blur-sm max-w-sm mx-auto shadow-sm">
              <p className="text-xs italic text-gray-600 dark:text-gray-300 font-light leading-relaxed">
                "{loginT.quote}"
              </p>
              <p className="text-[10px] text-[hsl(var(--primary))] font-semibold mt-1.5 text-right uppercase tracking-wider">
                {loginT.author}
              </p>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
              {loginT.title}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              {loginT.subtitle}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-3 shadow-sm"
            >
              <span className="text-red-500 text-lg mt-0.5">⚠</span>
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">{getLocalizedError(error)}</p>
            </motion.div>
          )}

          {/* Email/Password Form with stagger animations */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-5"
            >
              {/* Email */}
              <motion.div variants={itemVariants} className="space-y-1.5 group">
                <label htmlFor="email" className="text-xs font-semibold text-gray-500 dark:text-gray-400 group-focus-within:text-[hsl(var(--primary))] transition-colors duration-300">
                  {loginT.email}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[hsl(var(--primary))] transition-colors duration-300" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[hsl(var(--primary))]/10 focus:border-[hsl(var(--primary))] focus:bg-white dark:focus:bg-gray-950 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-600 text-sm"
                    placeholder={loginT.emailPlaceholder}
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants} className="space-y-1.5 group">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-semibold text-gray-500 dark:text-gray-400 group-focus-within:text-[hsl(var(--primary))] transition-colors duration-300">
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
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[hsl(var(--primary))] transition-colors duration-300" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-[hsl(var(--primary))]/10 focus:border-[hsl(var(--primary))] focus:bg-white dark:focus:bg-gray-950 transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-600 text-sm"
                    placeholder={loginT.passwordPlaceholder}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5 animate-pulse" /> : <Eye className="w-5 h-5 animate-pulse" />}
                  </button>
                </div>
              </motion.div>

              {/* Submit */}
              <motion.div variants={itemVariants} className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative overflow-hidden w-full py-3.5 rounded-xl bg-gradient-to-r from-gradient-start to-gradient-end text-white font-semibold shadow-lg shadow-[hsl(var(--primary))]/15 hover:shadow-[hsl(var(--primary))]/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 group"
                >
                  {/* Gloss sheen overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                  
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      {loginT.signingIn}
                    </>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {loginT.signInBtn} 
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  )}
                </button>
              </motion.div>

              {/* Divider */}
              <motion.div variants={itemVariants} className="relative my-6 pt-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white dark:bg-gray-950 text-xs font-semibold text-gray-400 uppercase tracking-wider">{loginT.orContinueWith}</span>
                </div>
              </motion.div>

              {/* Google Button */}
              <motion.div variants={itemVariants} className="w-full">
                <motion.button
                  type="button"
                  onClick={() => handleSocialLogin(googleProvider, "Google")}
                  disabled={!!socialLoading}
                  whileHover={!socialLoading ? { scale: 1.01, y: -0.5 } : {}}
                  whileTap={!socialLoading ? { scale: 0.99 } : {}}
                  className="relative flex items-center justify-center gap-3 py-3.5 w-full rounded-xl border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900/30 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-85 disabled:cursor-wait group overflow-hidden"
                  title={loginT.googleSignIn}
                >
                  <AnimatePresence>
                    {socialLoading === "Google" && (
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        exit={{ opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/30 dark:via-white/5 to-transparent skew-x-12 pointer-events-none"
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
                        className="flex items-center justify-center gap-3"
                      >
                        <svg className="w-5 h-5 flex-shrink-0 group-hover:scale-105 transition-transform duration-300" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                          {loginT.googleSignIn}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>

              {/* Register Link */}
              <motion.p variants={itemVariants} className="text-center pt-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                {loginT.newToMinistry}{" "}
                <Link href="/register" className="text-[hsl(var(--primary))] font-bold hover:underline transition-all">
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
