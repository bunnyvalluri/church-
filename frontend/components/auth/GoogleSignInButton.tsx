"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import {
  loadGoogleGsiScript,
  getGoogleClientId,
  logGoogleAuthDiagnostic,
  GoogleCredentialResponse,
} from "@/lib/googleAuth";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";

interface GoogleSignInButtonProps {
  onError?: (errorMessage: string) => void;
  className?: string;
}

export default function GoogleSignInButton({ onError, className = "" }: GoogleSignInButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updateUser } = useAuth();
  const { language } = useLanguage();

  const [sdkState, setSdkState] = useState<"INITIALIZING" | "READY" | "AUTHENTICATING" | "ERROR">("INITIALIZING");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isInitializedRef = useRef(false);
  const isRenderedRef = useRef(false);
  const isAuthenticatingRef = useRef(false);

  // Translations for button states
  const getLocalizedText = useCallback(
    (key: "initializing" | "authenticating" | "error" | "retry" | "unavailable" | "configMissing") => {
      const texts = {
        en: {
          initializing: "Loading Google Sign-In...",
          authenticating: "Signing in with Google...",
          error: "Google Sign-In failed. Please try again.",
          retry: "Try Again",
          unavailable: "Google Sign-In is temporarily unavailable. Please try again.",
          configMissing: "Google Sign-In is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID.",
        },
        te: {
          initializing: "Google సైన్-ఇన్ లోడ్ అవుతోంది...",
          authenticating: "Google తో సైన్ ఇన్ అవుతోంది...",
          error: "Google సైన్-ఇన్ విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
          retry: "మళ్ళీ ప్రయత్నించండి",
          unavailable: "Google సైన్-ఇన్ ప్రస్తుతం అందుబాటులో లేదు. దయచేసి కాసేపటి తర్వాత ప్రయత్నించండి.",
          configMissing: "Google సైన్-ఇన్ కాన్ఫిగర్ చేయబడలేదు.",
        },
        hi: {
          initializing: "गूगल साइन-इन लोड हो रहा है...",
          authenticating: "गूगल से साइन इन हो रहा है...",
          error: "गूगल साइन-इन विफल रहा। कृपया पुनः प्रयास करें।",
          retry: "पुनः प्रयास करें",
          unavailable: "गूगल साइन-इन अस्थायी रूप से अनुपलब्ध है। कृपया पुनः प्रयास करें।",
          configMissing: "गूगल साइन-इन कॉन्फ़िगर नहीं है।",
        },
      };

      const langKey = (language === "te" || language === "hi") ? language : "en";
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

  // Cookie setter with Secure attribute for mobile HTTPS compatibility
  const setAuthCookies = (uid: string, role: string) => {
    if (typeof document === "undefined") return;
    const maxAge = 7 * 24 * 60 * 60; // 7 days
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    const secureFlag = isHttps ? "; Secure" : "";
    document.cookie = `__kcm_session_uid=${uid}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
    document.cookie = `__kcm_session_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
  };

  // Handle Google Credential Callback
  const handleGoogleCredentialResponse = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response?.credential) {
        logGoogleAuthDiagnostic("CREDENTIAL_CALLBACK_EMPTY");
        setSdkState("ERROR");
        const msg = getLocalizedText("error");
        setErrorMessage(msg);
        onError?.(msg);
        return;
      }

      // Prevent duplicate concurrent requests
      if (isAuthenticatingRef.current) return;
      isAuthenticatingRef.current = true;

      setSdkState("AUTHENTICATING");
      setErrorMessage(null);
      logGoogleAuthDiagnostic("CREDENTIAL_CALLBACK_RECEIVED");

      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.success) {
          throw new Error(data?.error || getLocalizedText("error"));
        }

        logGoogleAuthDiagnostic("BACKEND_VERIFICATION_SUCCESS", {
          userId: data.user?.id,
          role: data.user?.role,
        });

        // 1. Set local presence cookies
        if (data.user?.id && data.user?.role) {
          setAuthCookies(data.user.id, data.user.role);
        }

        // 2. Update AuthProvider Context
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

        // 5. Navigate to authenticated portal
        router.replace(targetPath);
      } catch (err: any) {
        logGoogleAuthDiagnostic("BACKEND_VERIFICATION_FAILED", {
          error: err?.message || String(err),
        });
        isAuthenticatingRef.current = false;
        setSdkState("ERROR");
        const msg = err?.message || getLocalizedText("error");
        setErrorMessage(msg);
        onError?.(msg);
      }
    },
    [getLocalizedText, onError, router, searchParams, updateUser]
  );

  // Initialize and Render GIS Button
  const initAndRenderGoogleButton = useCallback(async () => {
    const clientId = getGoogleClientId();

    if (!clientId) {
      logGoogleAuthDiagnostic("MISSING_CLIENT_ID");
      setSdkState("ERROR");
      setErrorMessage(getLocalizedText("configMissing"));
      return;
    }

    setSdkState("INITIALIZING");
    setErrorMessage(null);

    const loaded = await loadGoogleGsiScript();
    if (!loaded || !window.google?.accounts?.id) {
      logGoogleAuthDiagnostic("SDK_INIT_FAILED_TO_LOAD");
      setSdkState("ERROR");
      setErrorMessage(getLocalizedText("unavailable"));
      return;
    }

    if (!containerRef.current) {
      return;
    }

    try {
      // 1. Initialize Google Identity Services (only once)
      if (!isInitializedRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: "signin",
          ux_mode: "popup",
        });
        isInitializedRef.current = true;
        logGoogleAuthDiagnostic("GIS_INITIALIZED_SUCCESS");
      }

      // 2. Render Google Button into dedicated container
      containerRef.current.innerHTML = "";
      const containerWidth = containerRef.current.offsetWidth || 340;
      const targetWidth = Math.min(Math.max(containerWidth, 240), 400);

      window.google.accounts.id.renderButton(containerRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: targetWidth,
      });

      isRenderedRef.current = true;
      setSdkState("READY");
      logGoogleAuthDiagnostic("GIS_BUTTON_RENDERED", { targetWidth });
    } catch (err: any) {
      logGoogleAuthDiagnostic("GIS_RENDER_EXCEPTION", { error: err?.message || String(err) });
      setSdkState("ERROR");
      setErrorMessage(getLocalizedText("error"));
    }
  }, [getLocalizedText, handleGoogleCredentialResponse]);

  useEffect(() => {
    initAndRenderGoogleButton();

    // Re-render on window resize if container width changes significantly
    const handleResize = () => {
      if (isInitializedRef.current && containerRef.current && window.google?.accounts?.id) {
        const containerWidth = containerRef.current.offsetWidth || 340;
        const targetWidth = Math.min(Math.max(containerWidth, 240), 400);
        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: targetWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [initAndRenderGoogleButton]);

  const handleRetry = () => {
    isInitializedRef.current = false;
    isRenderedRef.current = false;
    isAuthenticatingRef.current = false;
    initAndRenderGoogleButton();
  };

  return (
    <div className={`w-full flex flex-col items-center justify-center ${className}`}>
      {/* ── 1. Authenticating State: Spinner + localized text ── */}
      {sdkState === "AUTHENTICATING" && (
        <div className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 dark:border-gray-800 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 shadow-sm animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin text-purple-600 dark:text-purple-400 shrink-0" />
          <span className="text-sm font-semibold">{getLocalizedText("authenticating")}</span>
        </div>
      )}

      {/* ── 2. Error State: Clear alert with actionable retry button ── */}
      {sdkState === "ERROR" && (
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-200 text-xs font-medium shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span className="flex-1">{errorMessage || getLocalizedText("error")}</span>
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

      {/* ── 3. Initializing / Loading Skeleton Placeholder ── */}
      {sdkState === "INITIALIZING" && (
        <div className="w-full h-[44px] flex items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-gray-400 shadow-xs">
          <Loader2 className="w-4 h-4 animate-spin text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-medium">{getLocalizedText("initializing")}</span>
        </div>
      )}

      {/* ── 4. Official Google GIS Button Container ── */}
      <div
        id="google-signin-button"
        ref={containerRef}
        className={`w-full flex justify-center items-center min-h-[44px] ${
          sdkState === "READY" ? "block" : "hidden"
        }`}
      />
    </div>
  );
}
