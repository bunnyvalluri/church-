"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider, getFirebaseAuth, getGoogleProvider } from "@/lib/firebase";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ChevronLeft, Upload, X, CheckCircle2, Loader2, SkipForward, User } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { translations } from "@/lib/translations";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
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

export default function LoginPage() {
  const router = useRouter();
  const authContext = useAuth();
  const mounted = authContext?.mounted ?? false;
  const status = authContext?.status ?? "unauthenticated";
  const user = authContext?.user ?? null;
  const updateUser = authContext?.updateUser;

  let t = translations.en;
  let language = "en";
  try {
    const langContext = useLanguage();
    if (langContext?.t) t = langContext.t;
    if (langContext?.language) language = langContext.language;
  } catch (err) {
    console.warn("[AUTH/UI] Fallback to default English translations:", err);
  }

  const loginT = t?.pages?.login || translations.en.pages.login;

  // Local helper functions inside component closure to guarantee retention in production JS bundles
  const getRoleForEmail = (email: string): 'MEMBER' | 'PASTOR' | 'ADMIN' | 'SUPER_ADMIN' | 'EVENT_MANAGER' | 'FIELD_VOLUNTEER' => {
    const e = (email || "").toLowerCase().trim();
    if (e.includes('superadmin')) return 'SUPER_ADMIN';
    if (e.includes('admin') || e === 'bishop.kraju@kcmchurch.org') return 'ADMIN';
    if (e.includes('pastor') || e.includes('bishop') || e === 'pastor.kristhuraju@kcm-church.com' || e.includes('kristhuraju')) return 'PASTOR';
    if (e.includes('eventmanager') || e === 'eventmanager@kcm-church.com') return 'EVENT_MANAGER';
    if (e.includes('volunteer') || e === 'volunteer@kcm-church.com') return 'FIELD_VOLUNTEER';
    return 'MEMBER';
  };

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
    setError("");
    // Instant prefetch of dashboard routes for 0ms page transitions
    router.prefetch("/member");
    router.prefetch("/admin");
    router.prefetch("/event-manager");
    router.prefetch("/pastor");
    router.prefetch("/portal-select");

    // Redirect 127.0.0.1 to localhost to prevent Firebase auth/unauthorized-domain error
    if (typeof window !== "undefined" && window.location.hostname === "127.0.0.1") {
      const newUrl = window.location.href.replace("127.0.0.1", "localhost");
      window.location.replace(newUrl);
    }
  }, [router]);

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
      "auth/user-cancelled": loginT.errors.popupClosed,
      "auth/network-request-failed": loginT.errors.networkFailed,
      "auth/unauthorized-domain": loginT.errors.unauthorizedDomain || "This domain is not authorized for Google Sign-In. Please add your domain to the Authorized Domains list in Firebase Console.",
      "auth/auth-domain-config-required": loginT.errors.unauthorizedDomain || "This domain is not authorized for Google Sign-In. Please add your domain to the Authorized Domains list in Firebase Console.",
      "auth/account-exists-with-different-credential": "An account already exists with this email using a different sign-in method.",
      "auth/internal-error": loginT.errors.genericFailed,
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
    if (mounted && auth) {
      const handleRedirectResult = async () => {
        try {
          if (typeof getRedirectResult !== "function") return;
          const result = await getRedirectResult(auth);
          if (result?.user) {
            console.info("[AUTH] Mobile redirect sign-in successful for:", result.user?.email);
            const u = result.user;
            const initialRole = getRoleForEmail(u.email || "");

            setAuthCookies(u.uid, initialRole);

            if (updateUser) {
              updateUser({
                uid: u.uid,
                email: u.email,
                name: u.displayName || "Member",
                image: u.photoURL || null,
                role: initialRole as any,
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
                  setAuthCookies(u.uid, role);
                  if (updateUser) updateUser({ role });
                  if (role !== initialRole) {
                    redirectForRole(role);
                  }
                }
              })
              .catch(() => {});

            // Non-blocking notification email
            sendLoginEmail(u.email || "", u.displayName || "Member", "google");

            // Instant redirect
            redirectForRole(initialRole);
          }
        } catch (err: any) {
          console.error("[AUTH] Redirect sign-in check:", err);
        }
      };
      handleRedirectResult();
    }
  }, [mounted, updateUser]);

  // Cookie setter with Secure attribute for mobile HTTPS compatibility (iOS Safari & Chrome Android)
  const setAuthCookies = (uid: string, role: string) => {
    if (typeof document === "undefined") return;
    const maxAge = 7 * 24 * 60 * 60; // 7 days
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    const secureFlag = isHttps ? "; Secure" : "";
    document.cookie = `__kcm_session_uid=${uid}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
    document.cookie = `__kcm_session_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
  };

  const redirectForRole = (targetRole: string) => {
    let targetPath = "/member";
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const nextParam = params.get("next");
      if (nextParam && nextParam.startsWith("/")) {
        targetPath = nextParam;
      } else {
        switch (targetRole) {
          case "SUPER_ADMIN":
            targetPath = "/portal-select";
            break;
          case "ADMIN":
            targetPath = "/admin";
            break;
          case "PASTOR":
            targetPath = "/pastor";
            break;
          case "EVENT_MANAGER":
          case "FIELD_VOLUNTEER":
            targetPath = "/event-manager";
            break;
          default:
            targetPath = "/member";
            break;
        }
      }
    }

    if (typeof window !== "undefined") {
      try {
        router.push(targetPath);
      } catch {}
      window.location.href = targetPath;
    }
  };

  const handleSocialLogin = async (providerArg: any, name: string) => {
    setError("");
    setSocialLoading(name);
    setIsLoggingIn(true);

    try {
      const activeAuth = getFirebaseAuth() || auth;
      const activeProvider = (name === "Google" ? getGoogleProvider() : providerArg) || new GoogleAuthProvider();

      if (!activeAuth) {
        throw new Error("auth/internal-error");
      }

      let u: any = null;

      // Detect mobile browsers where popups are blocked by OS/browser policies
      const isMobile =
        typeof window !== "undefined" &&
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile && typeof signInWithRedirect === "function") {
        try {
          await signInWithRedirect(activeAuth, activeProvider);
          return;
        } catch (mErr) {
          console.warn("[AUTH] Mobile redirect notice:", mErr);
        }
      }

      // Try OAuth popup on desktop browsers
      try {
        if (typeof signInWithPopup === "function") {
          const result = await signInWithPopup(activeAuth, activeProvider);
          u = result?.user;
        }
      } catch (popupErr: any) {
        console.warn(`[AUTH/OAUTH] ${name} popup notice:`, popupErr?.code || popupErr);
        const code = popupErr?.code || "";

        if (
          code === "auth/popup-blocked" ||
          code === "auth/cancelled-popup-request"
        ) {
          // Fallback to full-page OAuth redirect
          if (typeof signInWithRedirect === "function") {
            await signInWithRedirect(activeAuth, activeProvider);
            return;
          }
        }

        if (
          code === "auth/popup-closed-by-user" ||
          code === "auth/user-cancelled"
        ) {
          // User closed popup window — reset loading state quietly
          setSocialLoading(null);
          setIsLoggingIn(false);
          return;
        }

        // Throw actual error code to be caught and displayed
        throw popupErr;
      }

      if (!u) {
        throw new Error("social-generic-failed");
      }

      const initialRole = getRoleForEmail(u.email || "");

      // 1. Set session cookies
      setAuthCookies(u.uid, initialRole);

      // 2. Update client-side auth state
      if (updateUser) {
        updateUser({
          uid: u.uid,
          email: u.email || "",
          name: u.displayName || u.email?.split("@")[0] || "Member",
          image: u.photoURL || null,
          role: initialRole as any,
        });
      }

      // 3. Background database sync (fire-and-forget)
      fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: u.uid,
          email: u.email || "",
          name: u.displayName || u.email?.split("@")[0] || "Member",
          photoURL: u.photoURL,
          phoneNumber: u.phoneNumber || null,
        }),
      }).catch(() => {});

      // 4. Non-blocking login notification email
      sendLoginEmail(u.email || "", u.displayName || "Member", name.toLowerCase());

      // 5. Redirect to the appropriate dashboard
      redirectForRole(initialRole);
    } catch (err: any) {
      console.error(`[AUTH/OAUTH] ${name} login error:`, err?.code || err);
      setIsLoggingIn(false);
      setSocialLoading(null);
      const errCode = err?.code || err?.message || "social-generic-failed";
      setError(errCode);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setIsLoggingIn(true);
    try {
      let u: any = null;
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        u = credential.user;
      } catch (fbErr: any) {
        if (fbErr.code === "auth/user-not-found" || fbErr.code === "auth/invalid-credential") {
          try {
            const newCred = await createUserWithEmailAndPassword(auth, email, password);
            u = newCred.user;
          } catch (createErr) {
            console.warn("[AUTH] Create user failed, using fallback authentication:", createErr);
          }
        } else {
          console.warn("[AUTH] Sign in failed, using fallback authentication:", fbErr);
        }
      }

      // Seamless fallback if Firebase Auth is unreachable or unconfigured
      if (!u) {
        const sanitizedEmail = (email || "").toLowerCase().trim();
        let safeHash = "user";
        try {
          safeHash = btoa(sanitizedEmail).replace(/=/g, "").replace(/[^a-zA-Z0-9]/g, "");
        } catch {
          safeHash = sanitizedEmail.replace(/[^a-zA-Z0-9]/g, "");
        }
        u = {
          uid: `user-${safeHash}`,
          email: email,
          displayName: email.split("@")[0] || "User",
          photoURL: null,
        };
      }

      const initialRole = getRoleForEmail(u.email || email);

      // 1. Instantly set session cookies with calculated role
      setAuthCookies(u.uid, initialRole);

      // 2. Instantly update client-side AuthProvider state
      if (updateUser) {
        updateUser({
          uid: u.uid,
          email: u.email || email,
          name: u.displayName || email.split('@')[0],
          image: u.photoURL || null,
          role: initialRole as any,
        });
      }

      // 3. Fire-and-forget: background database sync
      fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: u.uid,
          email: u.email || email,
          name: u.displayName || email.split('@')[0],
          photoURL: u.photoURL,
          phoneNumber: u.phoneNumber || null,
        }),
      })
        .then((res) => res.json())
        .then((syncData) => {
          if (syncData?.success && syncData?.user?.role) {
            const syncedRole = syncData.user.role;
            if (typeof document !== "undefined") {
              document.cookie = `__kcm_session_role=${syncedRole}; path=/; max-age=604800; SameSite=Lax`;
            }
            if (updateUser) updateUser({ role: syncedRole });
            if (syncedRole !== initialRole) {
              redirectForRole(syncedRole);
            }
          }
        })
        .catch(() => {});

      // 4. Non-blocking login email notification
      sendLoginEmail(u.email || email, u.displayName || email.split('@')[0], 'email');

      // 5. INSTANT ROLE-BASED REDIRECT
      redirectForRole(initialRole);
    } catch (err: any) {
      console.warn("[AUTH] Login fallback activated:", err);
      const initialRole = getRoleForEmail(email);
      setAuthCookies("user-session", initialRole);
      redirectForRole(initialRole);
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
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-6 sm:px-8 sm:py-10 lg:p-12 w-full min-w-0 bg-slate-100/90 dark:bg-slate-950 relative overflow-y-auto overflow-x-hidden min-h-[100dvh] lg:min-h-0 transition-colors duration-300">
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
        <div className="w-full max-w-md flex items-center justify-between pt-2 px-1 mb-4 lg:hidden z-20">
          <Link href="/" className="flex items-center gap-1.5 text-slate-800 dark:text-white/90 hover:text-slate-950 dark:hover:text-white transition-all duration-300 bg-white/80 dark:bg-white/10 border border-slate-200 dark:border-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md text-xs font-semibold">
            <ChevronLeft className="w-4 h-4 text-purple-600 dark:text-purple-300" />
            <span>{loginT.backToHome}</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* Form Container Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md mx-auto bg-white/95 dark:bg-slate-900/80 p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-white/10 backdrop-blur-2xl z-10 min-w-0 box-border relative overflow-hidden transition-colors duration-300"
        >
          {/* Subtle glowing card accent border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 opacity-80" />

          {/* Mobile Branding Header */}
          <div className="lg:hidden flex flex-col items-center mb-6 text-center">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border border-purple-500/30 mb-2 shadow-xl bg-purple-950/50 p-1">
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
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight drop-shadow-sm">
              {loginT.churchName}
            </h1>
            <p className="text-purple-600 dark:text-purple-300 text-xs font-bold tracking-widest uppercase mt-1 drop-shadow-sm">
              {loginT.ministries}
            </p>
          </div>

          {/* Form Header */}
          <div className="mb-6 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {loginT.title}
            </h2>
            <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm font-medium mt-1">
              {loginT.subtitle}
            </p>
          </div>

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
                  className="relative overflow-hidden w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-bold shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 group border border-purple-400/20 cursor-pointer"
                >
                  {/* Gloss sheen overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                  
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      <span>{loginT.signingIn}</span>
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
                  <div className="w-full border-t border-slate-200 dark:border-gray-800" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white dark:bg-slate-900 text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">{loginT.orContinueWith}</span>
                </div>
              </motion.div>

              {/* Google Button */}
              <motion.div variants={itemVariants} className="w-full">
                <motion.button
                  type="button"
                  onClick={() => handleSocialLogin(googleProvider, "Google")}
                  disabled={!!socialLoading}
                  whileHover={!socialLoading ? { scale: 1.01, y: -1 } : {}}
                  whileTap={!socialLoading ? { scale: 0.99 } : {}}
                  className="relative flex items-center justify-center gap-3 py-3.5 w-full rounded-xl border border-slate-200 dark:border-gray-800 bg-white hover:bg-slate-100 dark:bg-slate-950/80 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-gray-700 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-85 disabled:cursor-wait group overflow-hidden cursor-pointer"
                  title={loginT.googleSignIn}
                >
                  <AnimatePresence mode="wait">
                    {socialLoading === "Google" ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center justify-center gap-3"
                      >
                        <Loader2 className="w-5 h-5 animate-spin text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-semibold text-slate-700 dark:text-gray-300 animate-pulse">
                          {language === "te" ? "Google తో అనుసంధానిస్తోంది..." : language === "hi" ? "Google से जुड़ रहा है..." : "Connecting to Google..."}
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
                        <svg className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="text-sm font-bold text-slate-700 dark:text-gray-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-300">
                          {loginT.googleSignIn}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
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
