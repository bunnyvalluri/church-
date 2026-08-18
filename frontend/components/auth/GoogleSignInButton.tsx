"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, RefreshCw, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  loadGoogleGsiScript,
  resetGoogleGsiScriptPromise,
  getGoogleClientId,
  logGoogleAuthDiagnostic,
} from "@/lib/googleAuth";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface GoogleSignInButtonProps {
  onError?: (errorMessage: string) => void;
  className?: string;
}

type ButtonState = "IDLE" | "LOADING_GOOGLE" | "AUTHENTICATING" | "ERROR";

export default function GoogleSignInButton({ onError, className = "" }: GoogleSignInButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateUser } = useAuth();
  const { language } = useLanguage();

  const [state, setState] = useState<ButtonState>("IDLE");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCancelHint, setShowCancelHint] = useState(false);

  const stateRef = useRef<ButtonState>("IDLE");
  stateRef.current = state;

  const isAuthenticatingRef = useRef(false);
  const isMountedRef = useRef(true);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cancelHintTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
    if (cancelHintTimeoutRef.current) {
      clearTimeout(cancelHintTimeoutRef.current);
      cancelHintTimeoutRef.current = null;
    }
    setShowCancelHint(false);
  };

  // Multilingual translations for button states and errors
  const getLocalizedText = useCallback(
    (key:
      | "signInWithGoogle"
      | "loadingGoogle"
      | "authenticating"
      | "unavailable"
      | "networkError"
      | "popupBlocked"
      | "cancelled"
      | "authFailed"
      | "serverError"
      | "retry"
      | "cancel"
    ) => {
      const texts = {
        en: {
          signInWithGoogle: "Sign in with Google",
          loadingGoogle: "Connecting to Google...",
          authenticating: "Signing in with Google...",
          unavailable: "Google Sign-In is temporarily unavailable. Please try again.",
          networkError: "Unable to connect to Google. Please check your internet connection.",
          popupBlocked: "Google popup was blocked. Please allow popups and try again.",
          cancelled: "Google Sign-In was cancelled.",
          authFailed: "Google authentication failed. Please try again.",
          serverError: "Unable to complete Google Sign-In. Please try again.",
          retry: "Try Again",
          cancel: "Cancel",
        },
        te: {
          signInWithGoogle: "Google తో సైన్ ఇన్ చేయండి",
          loadingGoogle: "Google తో కనెక్ట్ అవుతోంది...",
          authenticating: "Google తో సైన్ ఇన్ అవుతోంది...",
          unavailable: "Google సైన్-ఇన్ ప్రస్తుతం అందుబాటులో లేదు. దయచేసి మళ్ళీ ప్రయత్నించండి.",
          networkError: "Google తో కనెక్ట్ కాలేదు. దయచేసి మీ ఇంటర్నెట్ కనెక్షన్‌ని తనిఖీ చేయండి.",
          popupBlocked: "Google పాపప్ నిరోధించబడింది. దయచేసి పాపప్‌లను అనుమతించండి.",
          cancelled: "Google సైన్-ఇన్ రద్దు చేయబడింది.",
          authFailed: "Google ప్రమాణీకరణ విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
          serverError: "Google సైన్-ఇన్ పూర్తి కాలేదు. దయచేసి మళ్ళీ ప్రయత్నించండి.",
          retry: "మళ్ళీ ప్రయత్నించండి",
          cancel: "రద్దు చేయి",
        },
        hi: {
          signInWithGoogle: "गूगल से साइन इन करें",
          loadingGoogle: "गूगल से कनेक्ट हो रहा है...",
          authenticating: "गूगल से साइन इन हो रहा है...",
          unavailable: "गूगल साइन-इन अस्थायी रूप से अनुपलब्ध है। कृपया पुनः प्रयास करें।",
          networkError: "गूगल से कनेक्ट नहीं हो सका। कृपया अपना इंटरनेट कनेक्शन जांचें।",
          popupBlocked: "गूगल पॉपअप अवरुद्ध हो गया। कृपया पॉपअप की अनुमति दें।",
          cancelled: "गूगल साइन-इन रद्द कर दिया गया।",
          authFailed: "गूगल प्रमाणीकरण विफल रहा। कृपया पुनः प्रयास करें।",
          serverError: "गूगल साइन-इन पूरा नहीं हो सका। कृपया पुनः प्रयास करें।",
          retry: "पुनः प्रयास करें",
          cancel: "रद्द करें",
        },
      };

      const langKey = language === "te" || language === "hi" ? language : "en";
      return texts[langKey][key] || texts.en[key];
    },
    [language]
  );

  // Send non-blocking login notification email
  const sendLoginNotification = (email: string, name: string) => {
    if (!email) return;
    fetch("/api/auth/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "LOGIN", email, name, method: "google" }),
    }).catch(() => {});
  };

  // Safe cookie setter with SameSite and HTTPS Secure attributes
  const setAuthCookies = (uid: string, role: string) => {
    if (typeof document === "undefined") return;
    const maxAge = 7 * 24 * 60 * 60; // 7 days
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    const secureFlag = isHttps ? "; Secure" : "";
    document.cookie = `__kcm_session_uid=${uid}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
    document.cookie = `__kcm_session_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
  };

  // Verification request to backend with token payload
  const verifyWithBackend = useCallback(
    async (payload: { accessToken?: string; credential?: string; idToken?: string }) => {
      if (!isMountedRef.current) return;
      if (isAuthenticatingRef.current) return;
      isAuthenticatingRef.current = true;

      setState("AUTHENTICATING");
      setErrorMessage(null);
      logGoogleAuthDiagnostic("CREDENTIAL_CALLBACK_RECEIVED");

      const abortController = new AbortController();
      const fetchTimeout = setTimeout(() => abortController.abort(), 10000);

      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: abortController.signal,
        });

        clearTimeout(fetchTimeout);
        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.success) {
          throw new Error(data?.error || getLocalizedText("serverError"));
        }

        logGoogleAuthDiagnostic("BACKEND_VERIFICATION_SUCCESS", {
          userId: data.user?.id,
          role: data.user?.role,
        });

        clearTimers();

        // 1. Set presence session cookies
        if (data.user?.id && data.user?.role) {
          setAuthCookies(data.user.id, data.user.role);
        }

        // 2. Update client AuthProvider context
        if (updateUser && data.user) {
          updateUser({
            uid: data.user.id,
            email: data.user.email || "",
            name: data.user.name || "Member",
            image: data.user.image || null,
            role: data.user.role as any,
          });
        }

        // 3. Send non-blocking login email
        if (data.user?.email) {
          sendLoginNotification(data.user.email, data.user.name || "Member");
        }

        // 4. Determine final destination (honoring safe ?next= param if present)
        let targetPath = data.redirectTo || "/member";
        const nextParam = searchParams?.get("next");
        if (
          nextParam &&
          nextParam.startsWith("/") &&
          !nextParam.startsWith("//") &&
          !nextParam.includes(":")
        ) {
          const userRole = (data.user?.role || "MEMBER").toUpperCase();
          const isAdminRoute = nextParam.startsWith("/admin") || nextParam.startsWith("/pastor");
          if (!isAdminRoute || userRole === "ADMIN" || userRole === "SUPER_ADMIN" || userRole === "PASTOR") {
            targetPath = nextParam;
          }
        }

        // 5. Navigate to member portal
        router.replace(targetPath);
      } catch (err: any) {
        clearTimeout(fetchTimeout);
        clearTimers();
        logGoogleAuthDiagnostic("BACKEND_VERIFICATION_FAILED", {
          error: err?.message || String(err),
        });
        if (isMountedRef.current) {
          isAuthenticatingRef.current = false;
          setState("ERROR");
          const msg = err?.name === "AbortError" 
            ? getLocalizedText("networkError") 
            : err?.message || getLocalizedText("serverError");
          setErrorMessage(msg);
          onError?.(msg);
        }
      }
    },
    [getLocalizedText, onError, router, searchParams, updateUser]
  );

  // Fallback to Firebase Google popup if GIS SDK is blocked or unavailable
  const triggerFirebaseGooglePopup = async () => {
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");
      if (!auth) {
        throw new Error(getLocalizedText("unavailable"));
      }
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      await verifyWithBackend({ idToken });
    } catch (firebaseErr: any) {
      clearTimers();
      isAuthenticatingRef.current = false;
      if (
        firebaseErr?.code === "auth/popup-closed-by-user" ||
        firebaseErr?.code === "auth/cancelled-popup-request"
      ) {
        setState("IDLE");
        return;
      }
      if (firebaseErr?.code === "auth/popup-blocked") {
        setState("ERROR");
        const msg = getLocalizedText("popupBlocked");
        setErrorMessage(msg);
        onError?.(msg);
        return;
      }
      setState("ERROR");
      const msg = firebaseErr?.message || getLocalizedText("authFailed");
      setErrorMessage(msg);
      onError?.(msg);
    }
  };

  const handleCancel = useCallback(() => {
    clearTimers();
    isAuthenticatingRef.current = false;
    setState("IDLE");
    setErrorMessage(null);
  }, []);

  // Main Google Sign-In Click Handler
  const handleGoogleSignInClick = async () => {
    if (state === "AUTHENTICATING" || state === "LOADING_GOOGLE") return;

    const clientId = getGoogleClientId();

    // Check offline status
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      logGoogleAuthDiagnostic("CLICK_OFFLINE");
      setState("ERROR");
      const msg = getLocalizedText("networkError");
      setErrorMessage(msg);
      onError?.(msg);
      return;
    }

    setState("LOADING_GOOGLE");
    setErrorMessage(null);

    // Setup safety timeout: automatically reset if stuck for 12 seconds
    clearTimers();
    cancelHintTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) setShowCancelHint(true);
    }, 3500);

    safetyTimeoutRef.current = setTimeout(() => {
      if (
        isMountedRef.current &&
        (stateRef.current === "LOADING_GOOGLE" || stateRef.current === "AUTHENTICATING")
      ) {
        console.warn("[GOOGLE_AUTH] Safety timeout reached, resetting state to IDLE");
        handleCancel();
      }
    }, 12000);

    // Preload GIS script
    const loaded = await loadGoogleGsiScript(5000);

    // If GIS OAuth2 client is available and client ID is configured, use GIS Token Client
    if (loaded && window.google?.accounts?.oauth2 && clientId) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "openid email profile",
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              clearTimers();
              isAuthenticatingRef.current = false;
              if (tokenResponse.error === "access_denied") {
                // User closed popup or cancelled
                setState("IDLE");
                return;
              }
              setState("ERROR");
              const msg = tokenResponse.error_description || getLocalizedText("authFailed");
              setErrorMessage(msg);
              onError?.(msg);
              return;
            }

            if (tokenResponse.access_token) {
              await verifyWithBackend({ accessToken: tokenResponse.access_token });
            } else {
              clearTimers();
              setState("IDLE");
            }
          },
          error_callback: (err) => {
            console.warn("[GIS_TOKEN_ERROR]", err);
            // Fallback to Firebase popup if GIS token client had an error
            triggerFirebaseGooglePopup();
          },
        });

        // Request access token with account selection prompt
        tokenClient.requestAccessToken({ prompt: "select_account" });
        return;
      } catch (gisErr) {
        console.warn("[GIS_CLIENT_INIT_FAIL] Fallback to Firebase Auth:", gisErr);
      }
    }

    // Fallback to Firebase Auth Google popup
    await triggerFirebaseGooglePopup();
  };

  const handleRetry = () => {
    clearTimers();
    isAuthenticatingRef.current = false;
    resetGoogleGsiScriptPromise();
    setState("IDLE");
    setErrorMessage(null);
  };

  useEffect(() => {
    isMountedRef.current = true;
    // Pre-load GIS script in the background silently
    loadGoogleGsiScript(4000).catch(() => {});
    return () => {
      isMountedRef.current = false;
      clearTimers();
    };
  }, []);

  const isLoading = state === "LOADING_GOOGLE" || state === "AUTHENTICATING";

  return (
    <div className={`w-full flex flex-col items-center justify-center gap-2 ${className}`}>
      {/* ── Error Banner if any ── */}
      {state === "ERROR" && (
        <div className="w-full flex flex-col gap-2 mb-1">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-200 text-xs font-medium shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span className="flex-1 leading-relaxed">{errorMessage || getLocalizedText("serverError")}</span>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="self-center inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors cursor-pointer border border-purple-200 dark:border-purple-800/50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{getLocalizedText("retry")}</span>
          </button>
        </div>
      )}

      {/* ── High-Fidelity Google Sign-In Button with Continuous Branding ── */}
      <button
        type="button"
        onClick={handleGoogleSignInClick}
        disabled={isLoading}
        aria-label={getLocalizedText("signInWithGoogle")}
        className={`relative overflow-hidden w-full h-[48px] flex items-center justify-center px-4 rounded-xl border font-semibold text-xs sm:text-sm shadow-xs transition-all duration-300 cursor-pointer select-none active:scale-[0.99] disabled:cursor-not-allowed ${
          isLoading
            ? "border-purple-400/60 dark:border-purple-600/60 bg-purple-50/60 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100 shadow-md shadow-purple-500/10"
            : "border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-md hover:shadow-purple-500/5"
        }`}
      >
        {/* Animated glossy shimmer bar during loading */}
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/15 dark:via-purple-400/25 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        )}

        <div className="relative z-10 flex items-center justify-center gap-3 w-full">
          {/* Always-visible official 4-color Google G Icon */}
          <div className="relative flex items-center justify-center shrink-0 w-5 h-5">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>

            {/* Glowing active spinner ring overlay when connecting */}
            {isLoading && (
              <span className="absolute -inset-1 rounded-full border-2 border-purple-500/30 border-t-purple-600 dark:border-t-purple-400 animate-spin" />
            )}
          </div>

          {/* Button Text with Smooth Transition */}
          <span className="truncate font-semibold tracking-wide">
            {isLoading ? (
              <span className="inline-flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600 dark:text-purple-400 shrink-0" />
                <span>
                  {state === "AUTHENTICATING"
                    ? getLocalizedText("authenticating")
                    : getLocalizedText("loadingGoogle")}
                </span>
              </span>
            ) : (
              getLocalizedText("signInWithGoogle")
            )}
          </span>
        </div>
      </button>

      {/* ── Cancel recovery option if popup is taking a moment ── */}
      <AnimatePresence>
        {isLoading && showCancelHint && (
          <motion.button
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline font-medium transition-colors cursor-pointer pt-0.5"
          >
            <X className="w-3 h-3" />
            <span>{getLocalizedText("cancel")}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
