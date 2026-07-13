"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Building, 
  Smartphone, 
  Heart, 
  Check, 
  ArrowRight, 
  Lock, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  IndianRupee,
  Globe,
  Gift,
  PlusCircle,
  Copy,
  CheckCircle2,
  ShieldAlert,
  ExternalLink,
  Activity,
  RefreshCw,
  Receipt,
  QrCode,
  ArrowLeft,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Star,
  Zap,
  BookOpen,
  Users,
  Home
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client";

interface PurposeItem {
  id: string;
  code: string;
  nameEn: string;
  nameTe: string;
  nameHi: string;
  descEn: string;
  descTe: string | null;
  descHi: string | null;
}

interface BranchItem {
  id: string;
  name: string;
}

interface GiveFormProps {
  initialPurposes?: PurposeItem[];
  initialBranches?: BranchItem[];
}

// Purpose icon map
const purposeIconMap: Record<string, React.ReactNode> = {
  TITHE: <IndianRupee className="w-5 h-5" />,
  OFFERING: <Gift className="w-5 h-5" />,
  BUILDING_FUND: <Building className="w-5 h-5" />,
  MISSIONS: <Globe className="w-5 h-5" />,
  BENEVOLENCE: <Heart className="w-5 h-5" />,
  SPECIAL: <Star className="w-5 h-5" />,
};

const purposeColorMap: Record<string, string> = {
  TITHE: "from-violet-500 to-purple-600",
  OFFERING: "from-rose-500 to-pink-600",
  BUILDING_FUND: "from-amber-500 to-orange-600",
  MISSIONS: "from-blue-500 to-cyan-600",
  BENEVOLENCE: "from-emerald-500 to-teal-600",
  SPECIAL: "from-fuchsia-500 to-violet-600",
};

const purposeBgMap: Record<string, string> = {
  TITHE: "bg-violet-50 dark:bg-violet-950/20 border-violet-200 dark:border-violet-800/40",
  OFFERING: "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40",
  BUILDING_FUND: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40",
  MISSIONS: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/40",
  BENEVOLENCE: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40",
  SPECIAL: "bg-fuchsia-50 dark:bg-fuchsia-950/20 border-fuchsia-200 dark:border-fuchsia-800/40",
};

export default function GiveForm({ initialPurposes = [], initialBranches = [] }: GiveFormProps) {
  const { language, t } = useLanguage();
  const { user, getIdToken } = useAuth();
  const pathname = usePathname() || "";
  const isPortalRoute = pathname.startsWith("/member");

  // Steps: 1 = Enter Details, 2 = Scan & Pay
  const [step, setStep] = useState(1);
  
  // Dynamic Lists loaded from DB
  const [purposes, setPurposes] = useState<PurposeItem[]>(initialPurposes);
  const [branches, setBranches] = useState<BranchItem[]>(initialBranches);
  const [loadingLists, setLoadingLists] = useState(initialPurposes.length === 0 || initialBranches.length === 0);

  // Form Inputs
  const [amount, setAmount] = useState<string>("1000");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedPurpose, setSelectedPurpose] = useState<string>(
    initialPurposes.length > 0 ? initialPurposes[0].code : "TITHE"
  );
  const [selectedBranch, setSelectedBranch] = useState<string>(
    initialBranches.length > 0 ? initialBranches[0].id : ""
  );
  const [donorName, setDonorName] = useState<string>("");
  const [donorEmail, setDonorEmail] = useState<string>("");
  const [donorPhone, setDonorPhone] = useState<string>("");

  // Payment Session State
  const [sessionId, setSessionId] = useState<string>("");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [upiUri, setUpiUri] = useState<string>("");
  const [upiId, setUpiId] = useState<string>("kcm.kristhraj2004-1@okicici");
  const [churchName, setChurchName] = useState<string>("Kingdom of Christ Ministries");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  // Statuses
  const [actionLoading, setActionLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Payment flow state
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'PENDING' | 'COMPLETED' | 'FAILED' | null>(null);
  const [pollTimeoutReached, setPollTimeoutReached] = useState(false);

  // History sync
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [lastHistorySynced, setLastHistorySynced] = useState<Date | null>(null);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type?: "success" | "error" } | null>(null);
  
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<any>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const scrollToCard = () => {
    if (cardRef.current) {
      const offset = 80; // offset for sticky header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = cardRef.current.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // Prevent SSR mismatch
  useEffect(() => { setMounted(true); }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Fetch Purposes and Branches on Mount
  useEffect(() => {
    if (!mounted) return;

    if (initialPurposes.length > 0 && initialBranches.length > 0) {
      setLoadingLists(false);
      return;
    }

    async function loadFormMetadata() {
      try {
        const [purposesRes, branchesRes] = await Promise.all([
          fetch("/api/donations/purposes"),
          fetch("/api/branches")
        ]);

        if (purposesRes.ok) {
          const purposesData = await purposesRes.json();
          if (purposesData.success) {
            setPurposes(purposesData.purposes);
            if (purposesData.purposes.length > 0) {
              setSelectedPurpose(purposesData.purposes[0].code);
            }
          }
        }

        if (branchesRes.ok) {
          const branchesData = await branchesRes.json();
          if (branchesData.success) {
            setBranches(branchesData.branches);
            if (branchesData.branches.length > 0) {
              setSelectedBranch(branchesData.branches[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load giving form configuration details:", err);
      } finally {
        setLoadingLists(false);
      }
    }

    loadFormMetadata();
  }, [mounted, initialPurposes, initialBranches]);

  // 2. Fetch Logged-in User Profile to Prefill Form
  useEffect(() => {
    if (!mounted || !user) return;

    setDonorName((prev) => prev || user.name || "");
    setDonorEmail((prev) => prev || user.email || "");

    const currentUserId = user.uid;
    const currentUserName = user.name || "";
    const currentUserEmail = user.email || "";

    async function fetchUserProfile() {
      try {
        const res = await fetch(`/api/member/profile?userId=${currentUserId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setDonorName(data.user.name || "");
            setDonorEmail(data.user.email || "");
            setDonorPhone(data.user.phone || "");
          }
        }
      } catch (err) {
        setDonorName(currentUserName);
        setDonorEmail(currentUserEmail);
      }
    }

    fetchUserProfile();
  }, [mounted, user]);

  // 3. Load giving history
  const loadHistory = useCallback(async (silent = false) => {
    if (!user?.uid) return;
    if (!silent) setHistoryLoading(true);
    try {
      const res = await fetch(`/api/donations/history?userId=${user.uid}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setHistory(data.donations || []);
          setLastHistorySynced(new Date());
        }
      }
    } catch (err) {
      console.error("Failed to load giving history", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.uid) {
      loadHistory();
    }
  }, [user, loadHistory]);

  // QR Code Expiration Countdown Timer
  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const difference = expiresAt.getTime() - Date.now();
      if (difference <= 0) {
        setTimeLeft("EXPIRED");
        setErrorMessage("Payment QR code has expired. Please restart the donation.");
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }

      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [expiresAt]);

  // 4. Polling Fallback status check
  const startStatusPolling = useCallback((sid: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const token = getIdToken ? await getIdToken() : null;
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`/api/donations/status/${sid}`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.status === "COMPLETED") {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            window.location.href = `/give/receipt/${data.donationId}`;
          }
        }
      } catch (err) {
        console.warn("Status polling error:", err);
      }
    }, 5000);
  }, [getIdToken]);

  // 5. Connect Socket.IO for real-time success listener
  const connectSocket = useCallback((sid: string) => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "";

    // Skip socket in production if no socket server is configured
    // (polling fallback every 5s will still detect payment completion)
    const isProduction = process.env.NODE_ENV === "production";
    const isLocalhost = socketUrl.includes("localhost") || socketUrl.includes("127.0.0.1");
    if (!socketUrl || (isProduction && (isLocalhost || !socketUrl))) {
      console.info("[Socket] No socket server configured for production — using polling only.");
      return () => {};
    }

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 8000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", `member:${user?.uid || "guest"}`);
    });

    socket.on("donation.success", (data: any) => {
      if (data.sessionId === sid || data.referenceNumber === referenceNumber) {
        showToast("Payment verified! Redirecting...", "success");
        setTimeout(() => {
          window.location.href = `/give/receipt/${data.donationId}`;
        }, 1000);
      }
    });

    socket.on("connect_error", (err: any) => {
      console.warn("[Socket] Connection failed, using polling fallback:", err.message);
      socket.disconnect();
    });

    return () => {
      socket.disconnect();
    };
  }, [user, referenceNumber]);


  // Cleanup connections
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const getFinalAmount = () => customAmount ? customAmount : amount;

  const validateDetails = () => {
    const finalAmt = getFinalAmount();
    if (!finalAmt || isNaN(Number(finalAmt)) || Number(finalAmt) <= 0) {
      setErrorMessage("Please enter a valid donation amount.");
      return false;
    }
    if (!donorName.trim()) {
      setErrorMessage("Please enter your name.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!donorEmail || !emailRegex.test(donorEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return false;
    }
    const cleanedPhone = donorPhone.replace(/[\s-]/g, "");
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!donorPhone || !phoneRegex.test(cleanedPhone)) {
      setErrorMessage("Please enter a valid 10-15 digit phone number.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  // Generate Donation Session + Dynamic UPI QR Code
  const handleGeneratePaymentSession = async () => {
    if (!validateDetails()) return;
    setActionLoading(true);
    setErrorMessage("");

    try {
      const token = getIdToken ? await getIdToken() : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const sessionRes = await fetch("/api/donations/session", {
        method: "POST",
        headers,
        body: JSON.stringify({
          amount: Number(getFinalAmount()),
          purposeCode: selectedPurpose,
          branchId: selectedBranch || null,
          donorName,
          donorEmail,
          donorPhone: donorPhone || null,
        }),
      });

      const sessionData = await sessionRes.json();
      if (!sessionRes.ok || !sessionData.success) {
        throw new Error(sessionData.error || "Failed to initialize payment session.");
      }

      const sid = sessionData.session.id;
      setSessionId(sid);
      setReferenceNumber(sessionData.session.referenceNumber);
      setExpiresAt(new Date(sessionData.session.expiresAt));

      // The session API already generates and returns the QR code — use it directly.
      // No need for a second /api/donations/generate-qr call (which was failing 403
      // because the session was already PROCESSING by the time it arrived).
      if (!sessionData.session.qrCode || !sessionData.session.upiUri) {
        throw new Error("Payment session did not return QR data. Please try again.");
      }

      setQrCodeData(sessionData.session.qrCode);
      setUpiUri(sessionData.session.upiUri);
      setUpiId(sessionData.session.upiId || "kcm.kristhraj2004-1@okicici");
      setChurchName(sessionData.session.churchName || "Kingdom of Christ Ministries");

      setStep(2);
      setTimeout(scrollToCard, 100);

      connectSocket(sid);
      startStatusPolling(sid);
    } catch (err: any) {
      console.error("Payment session generation failed:", err);
      setErrorMessage(err.message || "Failed to connect with payment gateway. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // Manual payment verification query fallback
  const handleVerifyPayment = async () => {
    if (verificationLoading) return;
    setVerificationLoading(true);
    setErrorMessage("");
    setPollTimeoutReached(false);

    // Clear any existing poll
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);

    const idempotencyKey = `verify-${sessionId}-${Date.now()}`;

    const doVerify = async (): Promise<{ status: string; donationId?: string }> => {
      const token = getIdToken ? await getIdToken() : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Idempotency-Key": idempotencyKey,
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers,
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();

      if (res.status === 202 || data.status === "PENDING") {
        return { status: "PENDING" };
      }
      if (res.ok && data.success) {
        return { status: "COMPLETED", donationId: data.donationId };
      }
      throw new Error(data.error || "Verification failed.");
    };

    try {
      const result = await doVerify();

      if (result.status === "COMPLETED") {
        setVerificationLoading(false);
        setVerificationStatus("COMPLETED");
        setPaymentSuccess(true);
        setTimeout(() => {
          window.location.href = `/give/receipt/${result.donationId}`;
        }, 2600);
        return;
      }

      // PENDING — begin polling every 4 seconds
      setVerificationStatus("PENDING");
      setVerificationLoading(false);

      // 60-second hard timeout
      pollTimeoutRef.current = setTimeout(() => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setVerificationStatus(null);
        setPollTimeoutReached(true);
      }, 60_000);

      pollIntervalRef.current = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/donations/status/${sessionId}`);
          const pollData = await pollRes.json();

          if (pollData.status === "COMPLETED") {
            clearInterval(pollIntervalRef.current!);
            clearTimeout(pollTimeoutRef.current!);
            setVerificationStatus("COMPLETED");
            setPaymentSuccess(true);
            setTimeout(() => {
              window.location.href = `/give/receipt/${pollData.donationId}`;
            }, 2600);
          } else if (pollData.status === "EXPIRED" || pollData.status === "FAILED") {
            clearInterval(pollIntervalRef.current!);
            clearTimeout(pollTimeoutRef.current!);
            setVerificationStatus("FAILED");
            setErrorMessage("Session expired or payment failed. Please generate a new QR.");
          }
        } catch {
          // Transient network error — keep polling
        }
      }, 4_000);
    } catch (err: any) {
      console.error("Verify payment error:", err);
      setVerificationLoading(false);
      setErrorMessage(err.message || "Verification failed. Please wait a few seconds and try again.");
    }
  };

  /**
   * "Open in UPI App" — Android Chrome Intent URL (all UPI apps chooser).
   * S.browser_fallback_url is required by Chrome on HTTPS for intent:// to work.
   */
  const handleOpenUpiApp = () => {
    if (!upiUri) {
      setToast({ msg: "Payment session not ready. Please generate a QR first.", type: "error" });
      return;
    }

    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = ua.includes("android");
    const isIOS = /ipad|iphone|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isAndroid) {
      const params = upiUri.includes("?") ? upiUri.split("?")[1] : "";
      const fallback = encodeURIComponent("https://play.google.com/store/search?q=UPI+payment&c=apps");
      // Intent URL: no package → OS shows UPI app chooser
      // S.browser_fallback_url → Chrome navigates here if no UPI app handles it
      window.location.href = `intent://pay?${params}#Intent;scheme=upi;S.browser_fallback_url=${fallback};end`;
    } else {
      // On iOS and other platforms, raw upiUri triggers system chooser or default app
      window.location.href = upiUri;
    }
  };

  /**
   * Open a SPECIFIC UPI app. Uses intent URLs on Android and custom schemes on iOS.
   */
  const handleOpenSpecificApp = (pkg: string, scheme: string) => {
    if (!upiUri) {
      setToast({ msg: "Payment session not ready. Please generate a QR first.", type: "error" });
      return;
    }

    const params = upiUri.includes("?") ? upiUri.split("?")[1] : "";
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = ua.includes("android");
    const isIOS = /ipad|iphone|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isAndroid) {
      const playStoreUrl = encodeURIComponent(
        `https://play.google.com/store/apps/details?id=${pkg}`
      );
      // Chrome resolves this intent and opens the specific app directly.
      // If not installed, Chrome follows S.browser_fallback_url → Play Store.
      window.location.href = `intent://pay?${params}#Intent;scheme=upi;package=${pkg};S.browser_fallback_url=${playStoreUrl};end`;
    } else if (isIOS) {
      // iOS app custom scheme (e.g. phonepe://pay? or tez://upi/pay?)
      let targetUrl = scheme;
      if (!targetUrl.includes("?")) {
        targetUrl += targetUrl.endsWith("/") ? "?" : "/?";
      } else if (!targetUrl.endsWith("&") && !targetUrl.endsWith("?")) {
        targetUrl += "&";
      }
      window.location.href = `${targetUrl}${params}`;
    } else {
      // General desktop / other fallback
      window.location.href = `upi://pay?${params}`;
    }
  };



  // Legacy — kept for backward compatibility
  const openPaymentApp = (appUrl: string, storeFallback: string) => {
    window.location.href = appUrl;
    setTimeout(() => {
      if (!document.hidden) window.location.href = storeFallback;
    }, 1800);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    });
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2500);
  };


  const activePurposeObj = purposes.find((p) => p.code === selectedPurpose);
  const getLanguagePurposeName = (p: PurposeItem) => {
    if (language === 'te' && p.nameTe) return p.nameTe;
    if (language === 'hi' && p.nameHi) return p.nameHi;
    return p.nameEn;
  };
  const getLanguagePurposeDesc = (p: PurposeItem) => {
    if (language === 'te' && p.descTe) return p.descTe;
    if (language === 'hi' && p.descHi) return p.descHi;
    return p.descEn;
  };

  const displayAmount = Number(getFinalAmount() || "0");
  const isExpired = timeLeft === "EXPIRED";

  if (!mounted) return null;

  return (
    <>
      {/* ── TOAST ─────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -24, scale: 0.93 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            className={`fixed top-20 right-4 sm:right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold border max-w-sm backdrop-blur-md ${
              toast.type === "error"
                ? "bg-red-900/95 text-white border-red-400/30"
                : "bg-emerald-900/95 text-white border-emerald-400/30"
            }`}
          >
            {toast.type === "error" ? (
              <ShieldAlert className="w-4 h-4 text-red-300 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0 animate-bounce" />
            )}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO SECTION ──────────────────────────────────── */}
      <section className="relative py-16 sm:py-24 md:py-28 overflow-hidden">
        {/* Layered background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0533] via-[#2d1261] to-[#0f172a]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.07]" />
        
        {/* Glowing orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full filter blur-[100px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/15 rounded-full filter blur-[80px] animate-pulse pointer-events-none" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-violet-500/10 rounded-full filter blur-[120px] pointer-events-none" />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-purple-400/40 rounded-full"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          />
        ))}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-xs sm:text-sm mb-6 sm:mb-8 shadow-xl"
            >
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <Heart className="h-4 w-4 text-pink-300" />
              <span className="font-medium tracking-wide">
                {language === 'te' ? 'దాతృత్వము' : language === 'hi' ? 'उदार दान' : 'Generous Giving'}
              </span>
            </motion.div>

            <motion.h1 
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl min-[480px]:text-4xl sm:text-6xl md:text-7xl font-extrabold text-white mb-4 sm:mb-6 tracking-tight font-heading leading-[1.05]"
            >
              {t.pages.give.title}
            </motion.h1>

            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm min-[480px]:text-base sm:text-xl text-white/90 max-w-xl mx-auto leading-relaxed px-2"
            >
              {t.pages.give.subtitle}
            </motion.p>

            {/* Trust badges */}
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8 sm:mt-10 px-2"
            >
              {[
                { icon: <Lock className="w-3.5 h-3.5" />, label: "Bank-Grade Security" },
                { icon: <Zap className="w-3.5 h-3.5" />, label: "Instant UPI" },
                { icon: <Receipt className="w-3.5 h-3.5" />, label: "80G Tax Exempt" },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs font-medium">
                  {badge.icon}
                  {badge.label}
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
          <svg viewBox="0 0 1440 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 w-full" preserveAspectRatio="none">
            <path d="M0 64L1440 64L1440 0C1440 0 1080 64 720 64C360 64 0 0 0 0L0 64Z" className="fill-[hsl(var(--background))]" />
          </svg>
        </div>
      </section>

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <section className="pt-12 pb-24 sm:pb-16 -mt-4 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {loadingLists ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-purple-100 dark:border-purple-900/50" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-purple-600 border-t-transparent animate-spin" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {language === 'te' ? 'కానుక ఎంపికలను లోడ్ చేస్తోంది...' : language === 'hi' ? 'दान विकल्प लोड हो रहे हैं...' : 'Loading giving options...'}
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-8 xl:gap-12 max-w-6xl mx-auto items-start">

              {/* ── LEFT: FORM CARD ───────────────────────── */}
              <div className="lg:col-span-7">
                <div ref={cardRef} className="bg-white dark:bg-gray-900 rounded-3xl shadow-[0_8px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_60px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-gray-800 overflow-hidden">
                  
                  {/* Card header strip */}
                  <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/25">
                          <QrCode className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                            {language === 'te' ? 'తక్షణ UPI కానుక' : language === 'hi' ? 'त्वरित यूपीआई दान' : 'Instant UPI Giving'}
                          </h2>
                          <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                            {language === 'te' ? 'సురక్షితమైన డైనమిక్ QR ద్వారా' : language === 'hi' ? 'सुरक्षित डायनेमिक क्यूआर द्वारा' : 'Secure real-time transfers via Dynamic QR'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-emerald-700 dark:text-emerald-400 text-[10px] font-bold tracking-wide border border-emerald-100 dark:border-emerald-800/40">
                        <Lock className="w-3 h-3" />
                        Secure
                      </div>
                    </div>

                    {/* Step progress bar */}
                    <div className="flex items-center gap-3 mt-5">
                      {[1, 2].map((s) => (
                        <div key={s} className="flex-1 flex items-center gap-3">
                          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all duration-300 ${
                            step >= s 
                              ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                          }`}>
                            {step > s ? <Check className="w-3.5 h-3.5" /> : s}
                          </div>
                          <span className={`text-xs font-medium hidden sm:block ${step >= s ? "text-gray-800 dark:text-gray-200" : "text-gray-400"}`}>
                            {s === 1 
                              ? (language === 'te' ? 'వివరాలు నమోదు చేయండి' : language === 'hi' ? 'विवरण दर्ज करें' : 'Enter Details')
                              : (language === 'te' ? 'స్కాన్ & చెల్లించండి' : language === 'hi' ? 'स्कैन करें और भुगतान करें' : 'Scan & Pay')}
                          </span>
                          {s < 2 && (
                            <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${step >= 2 ? "bg-gradient-to-r from-purple-600 to-indigo-600" : "bg-gray-100 dark:bg-gray-800"}`} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Error message */}
                  <AnimatePresence>
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mx-5 sm:mx-8 mt-4 overflow-hidden"
                      >
                        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-sm rounded-2xl flex items-start gap-3">
                          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <span>{errorMessage}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form Body */}
                  <div className="px-5 sm:px-8 pt-6 pb-8">
                    <div className="relative">
                      <AnimatePresence>
                        {step === 1 && (
                          <motion.div
                            key="step-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, position: "absolute", top: 0, left: 0, right: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-7 w-full"
                          >
                            {/* ── AMOUNT SELECTOR ─────────────── */}
                            <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <IndianRupee className="w-4 h-4 text-purple-600" />
                                {t.pages.give.presetsTitle}
                              </label>
                              <div className="grid grid-cols-2 min-[480px]:grid-cols-3 gap-2 sm:gap-2.5">
                                {["500", "1000", "2500", "5000", "10000"].map((preset) => (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => { setAmount(preset); setCustomAmount(""); }}
                                    className={`relative py-3.5 px-1.5 sm:px-2 rounded-2xl border-2 text-center font-bold text-sm sm:text-base transition-all duration-200 overflow-hidden group ${
                                      preset === "10000" ? "col-span-1" : ""
                                    } ${
                                      amount === preset && !customAmount
                                        ? "border-purple-600 bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/25 scale-[1.02]"
                                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/20"
                                    }`}
                                  >
                                    {amount === preset && !customAmount && (
                                      <motion.div
                                        layoutId="amount-selector"
                                        className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl"
                                        transition={{ duration: 0.2 }}
                                      />
                                    )}
                                    <span className="relative z-10">₹{Number(preset).toLocaleString('en-IN')}</span>
                                  </button>
                                ))}
                                {/* Custom amount */}
                                <div className="relative col-span-1">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-bold text-xs sm:text-sm z-10">₹</span>
                                  <input
                                    type="number"
                                    placeholder={t.pages.give.customPlaceholder}
                                    value={customAmount}
                                    onChange={(e) => { setCustomAmount(e.target.value); setAmount(""); }}
                                    className={`w-full py-3.5 pl-7 pr-2.5 rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all duration-200 bg-gray-50 dark:bg-gray-800/50 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none ${
                                      customAmount
                                        ? "border-purple-600 ring-2 ring-purple-600/20"
                                        : "border-gray-200 dark:border-gray-700 focus:border-purple-400 dark:focus:border-purple-600"
                                    }`}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* ── PURPOSE SELECTOR ────────────── */}
                            <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <Gift className="w-4 h-4 text-purple-600" />
                                {t.pages.give.purposeLabel}
                              </label>
                              <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-2 sm:gap-2.5">
                                {purposes.map((p) => {
                                  const isSelected = selectedPurpose === p.code;
                                  const gradient = purposeColorMap[p.code] || "from-purple-500 to-indigo-600";
                                  const bgStyle = purposeBgMap[p.code] || "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/40";
                                  const icon = purposeIconMap[p.code] || <IndianRupee className="w-5 h-5" />;
                                  return (
                                    <button
                                      key={p.id}
                                      type="button"
                                      onClick={() => setSelectedPurpose(p.code)}
                                      className={`relative p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-start gap-2.5 sm:gap-3 w-full group overflow-hidden ${
                                        isSelected
                                          ? `${bgStyle} shadow-md scale-[1.01]`
                                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/30 hover:border-gray-300 dark:hover:border-gray-600"
                                      }`}
                                    >
                                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white bg-gradient-to-br ${gradient} shadow-md transition-all duration-200 ${isSelected ? "scale-100" : "scale-90 opacity-70 group-hover:scale-95 group-hover:opacity-90"}`}>
                                        {icon}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <span className={`block font-bold text-xs sm:text-sm transition-colors break-words ${isSelected ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                                          {getLanguagePurposeName(p)}
                                        </span>
                                        <span className="block text-gray-400 dark:text-gray-500 text-[10px] sm:text-[11px] mt-0.5 leading-snug line-clamp-2 break-words">
                                          {getLanguagePurposeDesc(p)}
                                        </span>
                                      </div>
                                      {isSelected && (
                                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0 ml-auto mt-0.5" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* ── BRANCH SELECTOR ─────────────── */}
                            <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <Home className="w-4 h-4 text-purple-600" />
                                {language === 'te' ? 'చర్చి బ్రాంచ్' : language === 'hi' ? 'चर्च शाखा' : 'Church Branch'}
                              </label>
                              <div className="relative">
                                <select
                                  value={selectedBranch}
                                  onChange={(e) => setSelectedBranch(e.target.value)}
                                  className="w-full py-3 px-4 pr-10 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-600/25 focus:border-purple-500 focus:outline-none font-semibold appearance-none transition-all text-xs sm:text-sm"
                                >
                                  {branches.map((b) => (
                                    <option key={b.id} value={b.id}>⛪ {b.name}</option>
                                  ))}
                                </select>
                                <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 text-gray-400 pointer-events-none" />
                              </div>
                            </div>

                            {/* ── DONOR INFO ───────────────────── */}
                            <div className="space-y-4 pt-2">
                              <div className="flex items-center gap-2">
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
                                <span className="text-[10px] sm:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                  {t.pages.give.contactTitle}
                                </span>
                                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
                              </div>

                              <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-2 sm:gap-3">
                                <div className="min-[480px]:col-span-2">
                                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                    {t.pages.give.fullNameLabel}
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="text"
                                      placeholder={t.pages.give.fullNamePlaceholder}
                                      value={donorName}
                                      onChange={(e) => setDonorName(e.target.value)}
                                      className="w-full py-2.5 sm:py-3 px-4 pl-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-purple-600/20 focus:border-purple-500 focus:outline-none transition-all text-xs sm:text-sm"
                                    />
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                    {t.pages.give.emailLabel}
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="email"
                                      placeholder={t.pages.give.emailPlaceholder}
                                      value={donorEmail}
                                      onChange={(e) => setDonorEmail(e.target.value)}
                                      className="w-full py-2.5 sm:py-3 px-4 pl-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-purple-600/20 focus:border-purple-500 focus:outline-none transition-all text-xs sm:text-sm"
                                    />
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                    {t.pages.give.phoneLabel}
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="tel"
                                      placeholder={t.pages.give.phonePlaceholder}
                                      value={donorPhone}
                                      onChange={(e) => setDonorPhone(e.target.value)}
                                      className="w-full py-2.5 sm:py-3 px-4 pl-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-purple-600/20 focus:border-purple-500 focus:outline-none transition-all text-xs sm:text-sm"
                                    />
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* ── SUBMIT BUTTON ────────────────── */}
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={handleGeneratePaymentSession}
                              className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 hover:shadow-2xl hover:shadow-purple-600/30 transition-all duration-300 active:scale-[0.99] disabled:opacity-60 relative overflow-hidden group"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-violet-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <span className="relative z-10 flex items-center gap-2.5">
                                {actionLoading ? (
                                  <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {language === 'te' ? 'QR కోడ్‌ని రూపొందిస్తోంది...' : language === 'hi' ? 'क्यूआर कोड जनरेट किया जा रहा है...' : 'Generating Secure QR Code...'}
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-5 h-5" />
                                    {language === 'te' ? 'డైనమిక్ UPI QR కోడ్‌ను రూపొందించండి' : language === 'hi' ? 'डायनेमिक यूपीआई क्यूआर कोड जनरेट करें' : 'Generate Dynamic UPI QR Code'}
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                  </>
                                )}
                              </span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {step === 2 && (
                          /* ── STEP 2: SCAN & PAY ────────────── */
                          <motion.div
                            key="step-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col items-center space-y-5"
                          >
                            {/* ── SUCCESS ANIMATION ─────────────────── */}
                            <AnimatePresence>
                              {paymentSuccess && (
                                <motion.div
                                  key="success-overlay"
                                  initial={{ opacity: 0, scale: 0.7 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 1.1 }}
                                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                                  className="w-full max-w-sm flex flex-col items-center gap-4 py-6"
                                >
                                  <div className="relative">
                                    <motion.div
                                      className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                                    >
                                      <CheckCircle2 className="w-12 h-12 text-white" />
                                    </motion.div>
                                    {/* Burst rings */}
                                    {[1, 2, 3].map((i) => (
                                      <motion.div
                                        key={i}
                                        className="absolute inset-0 rounded-full border-2 border-emerald-400"
                                        initial={{ scale: 1, opacity: 0.6 }}
                                        animate={{ scale: 2.5 + i * 0.5, opacity: 0 }}
                                        transition={{ duration: 1.2, delay: i * 0.15, ease: "easeOut" }}
                                      />
                                    ))}
                                  </div>
                                  <div className="text-center space-y-1">
                                    <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                                      {language === 'te' ? '🎉 దాతృత్వం ధృవీకరించబడింది!' : language === 'hi' ? '🎉 दान सत्यापित हो गया!' : '🎉 Donation Verified!'}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {language === 'te' ? 'రశీదుకు మళ్ళించబడుతోంది...' : language === 'hi' ? 'रसीद पर पुनर्निर्देशित किया जा रहा है...' : 'Redirecting to your receipt...'}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-full text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    {language === 'te' ? 'దయచేసి వేచి ఉండండి...' : language === 'hi' ? 'कृपया प्रतीक्षा करें...' : 'Please wait...'}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* ── MAIN CONTENT (hidden after success) ───────── */}
                            {!paymentSuccess && (
                              <>
                                {/* Countdown Timer */}
                                <div className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${
                                  isExpired
                                    ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40"
                                    : parseInt(timeLeft.split(':')[0]) === 0 && parseInt(timeLeft.split(':')[1]) < 60
                                      ? "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/30 animate-pulse"
                                      : "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/30"
                                }`}>
                                  <Clock className="w-4 h-4" />
                                  <span>{language === 'te' ? 'QR గడువు ముగిసే సమయం:' : language === 'hi' ? 'QR समाप्त होने में:' : 'QR Expires in:'}</span>
                                  <span className="font-mono font-extrabold text-sm tracking-widest">{timeLeft}</span>
                                </div>

                                {/* QR Expired — regenerate prompt */}
                                {isExpired ? (
                                  <div className="w-full max-w-sm flex flex-col items-center gap-4 py-4">
                                    <div className="w-20 h-20 rounded-2xl bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800/40 flex items-center justify-center">
                                      <ShieldAlert className="w-9 h-9 text-red-500" />
                                    </div>
                                    <div className="text-center space-y-1">
                                      <p className="font-bold text-gray-800 dark:text-gray-200">
                                        {language === 'te' ? 'QR కోడ్ గడువు ముగిసింది' : language === 'hi' ? 'QR कोड समाप्त हो गया' : 'QR Code Expired'}
                                      </p>
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {language === 'te' ? 'కొత్త QR కోడ్ రూపొందించడానికి దిగువ క్లిక్ చేయండి.' : language === 'hi' ? 'नया QR कोड जनरेट करने के लिए नीचे क्लिक करें।' : 'Generate a new QR code to proceed with your donation.'}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                                        if (socketRef.current) socketRef.current.disconnect();
                                        setQrCodeData("");
                                        setUpiUri("");
                                        setSessionId("");
                                        setReferenceNumber("");
                                        setExpiresAt(null);
                                        setTimeLeft("");
                                        setErrorMessage("");
                                        setPollTimeoutReached(false);
                                        setVerificationStatus(null);
                                        setStep(1);
                                        setTimeout(scrollToCard, 100);
                                      }}
                                      className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-purple-600/25 transition-all active:scale-[0.99]"
                                    >
                                      <RefreshCw className="w-4 h-4" />
                                      {language === 'te' ? 'కొత్త QR రూపొందించండి' : language === 'hi' ? 'नया QR जनरेट करें' : 'Generate New QR'}
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    {/* QR Container */}
                                    <div className="w-full max-w-sm">
                                      <div className="relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-5 rounded-3xl border-2 border-gray-100 dark:border-gray-700 shadow-[0_4px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] flex flex-col items-center">
                                        {/* Dynamic QR badge */}
                                        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-emerald-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md">
                                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                          {language === 'te' ? 'డైనమిక్ QR' : language === 'hi' ? 'डायनेमिक QR' : 'Dynamic QR'}
                                        </div>

                                        {/* QR Code Image */}
                                        <div className="w-52 h-52 bg-white rounded-2xl overflow-hidden shadow-inner border border-gray-100 flex items-center justify-center mt-2">
                                          {qrCodeData ? (
                                            <img
                                              src={qrCodeData}
                                              alt="Dynamic UPI QR Code"
                                              className="w-full h-full object-contain p-2"
                                            />
                                          ) : (
                                            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                                          )}
                                        </div>

                                        {/* Church Name */}
                                        <p className="mt-3 text-xs font-bold text-gray-600 dark:text-gray-400 text-center">{churchName}</p>

                                        {/* UPI ID Row */}
                                        <div className="mt-3 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-3">
                                          <div className="min-w-0">
                                            <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-widest">
                                              {t.pages.give.upiIdLabel}
                                            </span>
                                            <span className="text-gray-800 dark:text-gray-200 font-bold font-mono text-xs select-all truncate block">
                                              {upiId}
                                            </span>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => copyToClipboard(upiId, "UPI ID")}
                                            className="p-2 bg-gray-50 dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl text-gray-500 hover:text-purple-600 transition-all border border-gray-200 dark:border-gray-700 flex-shrink-0"
                                          >
                                            {copiedLabel === "UPI ID" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Payment App Quick-Launch */}
                                    <div className="w-full max-w-sm space-y-3">
                                      {/* Open in UPI App — Android Intent chooser */}
                                      <button
                                        type="button"
                                        onClick={handleOpenUpiApp}
                                        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white font-bold text-sm hover:shadow-xl hover:shadow-purple-600/30 transition-all active:scale-[0.99] relative overflow-hidden group"
                                      >
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-violet-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Smartphone className="w-5 h-5 relative z-10" />
                                        <span className="relative z-10">
                                          {language === 'te' ? 'UPI యాప్‌లో తెరవండి' : language === 'hi' ? 'UPI ऐप में खोलें' : 'Open in UPI App'}
                                        </span>
                                        <ExternalLink className="w-4 h-4 relative z-10 opacity-70" />
                                      </button>

                                      {/* Per-app buttons */}
                                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">
                                        {language === 'te' ? '— లేదా నేరుగా తెరవండి —' : language === 'hi' ? '— या सीधे खोलें —' : '— Or open directly in —'}
                                      </p>
                                      <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
                                        {[
                                          { name: "GPay",    initial: "G",  pkg: "com.google.android.apps.nbu.paisa.user", scheme: "tez://upi/pay",      logo: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Google_Pay_Acceptance_Mark.svg",  color: "#4285F4", bg: "#e8f0fe" },
                                          { name: "PhonePe", initial: "P",  pkg: "com.phonepe.app",                        scheme: "phonepe://pay",       logo: "https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg",               color: "#5f259f", bg: "#f3eaff" },
                                          { name: "Paytm",   initial: "Pt", pkg: "net.one97.paytm",                        scheme: "paytmmp://upi/pay",  logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg", color: "#00BAF2", bg: "#e0f7fe" },
                                          { name: "BHIM",    initial: "B",  pkg: "in.org.npci.upiapp",                     scheme: "upi://pay",          logo: "https://upload.wikimedia.org/wikipedia/commons/6/65/BHIM_logo.svg",                  color: "#FF6B00", bg: "#fff3e0" },
                                          { name: "FamApp",  initial: "F",  pkg: "com.fampay.in",                          scheme: "fampay://upi/pay",   logo: "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/fampay.svg",                     color: "#b8860b", bg: "#fffde7", invert: true },
                                        ].map((app) => (
                                          <button
                                            key={app.name}
                                            type="button"
                                            title={`Pay with ${app.name}`}
                                            onClick={() => handleOpenSpecificApp(app.pkg, app.scheme)}
                                            className="flex flex-col items-center justify-center gap-0.5 sm:gap-1 py-1.5 sm:py-2.5 px-0.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md active:scale-90 transition-all cursor-pointer"
                                          >
                                            <img
                                              src={app.logo}
                                              className="w-5 h-5 sm:w-7 sm:h-7 object-contain rounded-md"
                                              alt={app.name}
                                              style={app.invert ? { filter: 'brightness(0) saturate(100%) invert(56%) sepia(85%) saturate(350%) hue-rotate(5deg) brightness(98%) contrast(90%)' } : {}}
                                              onError={(e) => {
                                                const img = e.currentTarget;
                                                img.style.display = "none";
                                                const badge = img.nextElementSibling as HTMLElement;
                                                if (badge) badge.style.display = "flex";
                                              }}
                                            />
                                            {/* Fallback letter badge (hidden by default, shown on img error) */}
                                            <span
                                              style={{
                                                display: "none",
                                                width: 20,
                                                height: 20,
                                                borderRadius: 6,
                                                backgroundColor: app.bg,
                                                color: app.color,
                                                fontWeight: 800,
                                                fontSize: app.initial.length > 1 ? 8 : 11,
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                                letterSpacing: "-0.5px",
                                              }}
                                            >
                                              {app.initial}
                                            </span>
                                            <span className="text-[7px] sm:text-[8px] font-bold tracking-tight leading-tight text-center" style={{ color: app.color }}>{app.name}</span>
                                          </button>
                                        ))}
                                      </div>

                                      {/* Copy Payment Link */}
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(upiUri, "LINK")}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 font-semibold text-sm transition-all active:scale-95"
                                      >
                                        {copiedLabel === "LINK" ? (
                                          <><Check className="w-4 h-4 text-emerald-500" /> {language === 'te' ? 'లింక్ కాపీ అయింది!' : language === 'hi' ? 'लिंक कॉपी हो गया!' : 'Payment link copied!'}</>
                                        ) : (
                                          <><Copy className="w-4 h-4" /> {language === 'te' ? 'చెల్లింపు లింక్ కాపీ' : language === 'hi' ? 'भुगतान लिंक कॉपी' : 'Copy Payment Link'}</>
                                        )}
                                      </button>
                                    </div>

                                    {/* Real-time verification status */}
                                    {verificationStatus === 'PENDING' && (
                                      <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="w-full max-w-sm p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-800/40 flex items-start gap-3"
                                      >
                                        <Loader2 className="w-5 h-5 text-amber-600 animate-spin flex-shrink-0 mt-0.5" />
                                        <div>
                                          <p className="font-bold text-sm text-amber-800 dark:text-amber-300">
                                            {language === 'te' ? 'చెల్లింపు నిరీక్షిస్తోంది...' : language === 'hi' ? 'भुगतान प्रतीक्षित है...' : 'Payment pending...'}
                                          </p>
                                          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                                            {language === 'te' ? 'స్వయంచాలకంగా తనిఖీ చేస్తోంది. దయచేసి వేచి ఉండండి.' : language === 'hi' ? 'स्वचालित रूप से जांच रहा है। कृपया प्रतीक्षा करें।' : 'Auto-checking every few seconds. Please wait.'}
                                          </p>
                                        </div>
                                      </motion.div>
                                    )}

                                    {pollTimeoutReached && (
                                      <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="w-full max-w-sm p-4 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-200 dark:border-orange-800/40 flex items-start gap-3"
                                      >
                                        <ShieldAlert className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                          <p className="font-bold text-sm text-orange-800 dark:text-orange-300">
                                            {language === 'te' ? 'ధృవీకరణ సమయం ముగిసింది' : language === 'hi' ? 'सत्यापन टाइमआउट' : 'Verification timeout'}
                                          </p>
                                          <p className="text-xs text-orange-700 dark:text-orange-400 mt-0.5">
                                            {language === 'te' ? 'చెల్లింపు పూర్తయినట్లయితే, మళ్ళీ ప్రయత్నించండి.' : language === 'hi' ? 'यदि भुगतान पूरा हो गया है, तो दोबारा प्रयास करें।' : "If you completed the payment, tap Verify Now again."}
                                          </p>
                                        </div>
                                      </motion.div>
                                    )}

                                    {/* Real-time notice */}
                                    {!verificationStatus && !pollTimeoutReached && (
                                      <div className="w-full max-w-sm p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                                        <div className="flex items-start gap-3">
                                          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                                            <Activity className="w-4 h-4 text-white" />
                                          </div>
                                          <div>
                                            <p className="font-bold text-sm text-gray-800 dark:text-gray-200">
                                              {language === 'te' ? 'నిజ-సమయ ధృవీకరణ సక్రియంగా ఉంది' : language === 'hi' ? 'वास्तविक समय सत्यापन सक्रिय' : 'Real-time verification active'}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                                              {language === 'te' ? 'చెల్లింపు పూర్తయిన తర్వాత స్వయంచాలకంగా ధృవీకరించబడుతుంది.' : language === 'hi' ? 'भुगतान पूरा होने के बाद स्वचालित रूप से सत्यापित किया जाएगा।' : "Once payment is completed, our server auto-verifies in real-time. If it doesn't redirect, tap the button below."}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Action buttons */}
                                    <div className="flex gap-3 w-full max-w-sm mx-auto">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                                          if (socketRef.current) socketRef.current.disconnect();
                                          setVerificationStatus(null);
                                          setPollTimeoutReached(false);
                                          setStep(1);
                                          setTimeout(scrollToCard, 100);
                                        }}
                                        className="py-3.5 px-5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl font-bold transition-all flex items-center gap-1.5 active:scale-98 text-sm flex-shrink-0 min-h-[44px]"
                                      >
                                        <ArrowLeft className="w-4 h-4" />
                                        {t.pages.give.backBtn}
                                      </button>
                                      <button
                                        type="button"
                                        disabled={verificationLoading || isExpired}
                                        onClick={handleVerifyPayment}
                                        className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-emerald-500/25 transition-all active:scale-[0.99] disabled:opacity-60 text-sm min-h-[44px]"
                                      >
                                        {verificationLoading ? (
                                          <><Loader2 className="w-4 h-4 animate-spin" /> {language === 'te' ? 'ధృవీకరిస్తోంది...' : language === 'hi' ? 'सत्यापित हो रहा है...' : 'Verifying...'}</>
                                        ) : (
                                          <><CheckCircle2 className="h-4 w-4" /> {language === 'te' ? 'చెల్లించాను — ధృవీకరించు' : language === 'hi' ? 'भुगतान किया — सत्यापित करें' : "I've Paid — Verify Now"}</>
                                        )}
                                      </button>
                                    </div>
                                  </>
                                )}
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RIGHT: SIDEBAR ────────────────────────── */}
              <div className="lg:col-span-5 space-y-5">

                {/* Giving Summary Card */}
                <div className="relative bg-gradient-to-br from-[#2d1261] via-[#3d1f8a] to-[#1e1065] rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full filter blur-3xl transform translate-x-16 -translate-y-16" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400/10 rounded-full filter blur-2xl transform -translate-x-8 translate-y-8" />
                  
                  <div className="relative px-5 py-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <Receipt className="w-5 h-5 text-purple-200" />
                      <h3 className="font-bold text-base uppercase tracking-widest text-white">
                        {t.pages.give.summaryTitle}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-white/15">
                        <span className="text-white text-sm font-medium">{t.pages.give.summaryType}</span>
                        <span className="font-bold text-xs bg-white/20 px-3 py-1.5 rounded-full uppercase tracking-wider text-white">
                          {activePurposeObj ? getLanguagePurposeName(activePurposeObj) : selectedPurpose}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-white/15">
                        <span className="text-white text-sm font-medium">{t.pages.give.summaryMethod}</span>
                        <span className="font-semibold flex items-center gap-1.5 text-white text-sm">
                          <QrCode className="w-4 h-4 text-purple-200" />
                          {language === 'te' ? 'డైనమిక్ UPI QR' : language === 'hi' ? 'डायनेमिक यूपीआई' : 'Dynamic UPI QR'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-white/15">
                        <span className="text-white text-sm font-medium">{t.pages.give.summaryTax}</span>
                        <span className="font-bold text-emerald-300 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {t.pages.give.summaryTaxValue}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-3">
                        <span className="text-xl font-semibold text-white">{t.pages.give.summaryTotal}</span>
                        <div className="text-right">
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={displayAmount}
                              initial={{ y: -8, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: 8, opacity: 0 }}
                              transition={{ duration: 0.15 }}
                              className="text-3xl font-extrabold flex items-center gap-1 text-white"
                            >
                              <IndianRupee className="w-6 h-6 stroke-[2.5]" />
                              {displayAmount.toLocaleString("en-IN")}
                            </motion.span>
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Giving History */}
                {mounted && user && (
                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] overflow-hidden">
                    <div className="px-5 py-4 sm:px-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                          {t.pages.give.liveHistoryTitle}
                        </h4>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{t.pages.give.liveHistorySubtitle}</p>
                      </div>
                      <button 
                        onClick={() => loadHistory()} 
                        disabled={historyLoading}
                        className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all border border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? "animate-spin" : ""}`} />
                      </button>
                    </div>

                    <div className="px-5 py-5 sm:px-8 sm:pb-6">
                      {historyLoading && history.length === 0 ? (
                        <div className="py-8 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                        </div>
                      ) : history.length === 0 ? (
                        <div className="text-center py-6 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                          <Receipt className="w-7 h-7 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                          <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">{t.pages.give.noRecords}</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                          {history.map((item) => (
                            <div
                              key={item.id}
                              className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 rounded-xl flex items-center justify-between text-xs hover:border-purple-200 dark:hover:border-purple-700/50 transition-all group"
                            >
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-gray-800 dark:text-gray-200 uppercase text-[10px]">
                                    {item.purposeRelation?.nameEn || item.purpose}
                                  </span>
                                  <span className="text-[9px] text-gray-400">
                                    {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                  </span>
                                </div>
                                <span className="block text-[9px] text-gray-400 dark:text-gray-500 font-mono leading-none truncate">
                                  UTR: {item.razorpayPaymentId || "Pending"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="font-black text-gray-900 dark:text-white">
                                  ₹{item.amount.toLocaleString("en-IN")}
                                </span>
                                <a
                                  href={`/give/receipt/${item.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {lastHistorySynced && (
                        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-[9px] text-gray-400 dark:text-gray-500 font-mono flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                            {t.pages.give.syncActive}
                          </span>
                          <span>{t.pages.give.updatedAt}: {lastHistorySynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Scripture Card */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10 rounded-3xl px-5 py-6 sm:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] border border-amber-100 dark:border-amber-800/20">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 dark:text-amber-300 text-sm mb-1">{t.pages.give.malachiTitle}</h4>
                      <p className="text-amber-800/80 dark:text-amber-400/80 text-xs leading-relaxed italic">{t.pages.give.malachiDesc}</p>
                    </div>
                  </div>
                </div>

                {/* Help Card */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl px-5 py-6 sm:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-800">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{t.pages.give.helpTitle}</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-3 leading-relaxed">{t.pages.give.helpDesc}</p>
                  <div className="space-y-2">
                    <a href="mailto:kingofchristministries23@gmail.com" className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-semibold hover:underline break-all">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">kingofchristministries23@gmail.com</span>
                    </a>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-purple-600 dark:text-purple-400 font-semibold">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <a href="tel:+919704090069" className="hover:underline whitespace-nowrap">+91 97040 90069</a>
                      <span className="text-gray-300 dark:text-gray-600 hidden min-[360px]:inline">|</span>
                      <a href="tel:+919640943777" className="hover:underline whitespace-nowrap">+91 96409 43777</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── WHY WE GIVE ───────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-900/30 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-bold uppercase tracking-widest mb-5">
                  <Heart className="w-3.5 h-3.5" />
                  Our Mission
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                  {t.pages.give.whyHeading}
                </h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
                  {t.pages.give.whySubtitle}
                </p>
              </motion.div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {t.pages.give.whyItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="flex items-start gap-4 bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800/40 transition-all duration-300 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-purple-600/20 group-hover:scale-110 transition-transform">
                    <Check className="h-4 w-4 text-white stroke-[2.5]" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base leading-relaxed">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── OTHER WAYS TO GIVE ────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
                  {language === 'te' ? 'కానుకలు ఇవ్వడానికి ఇతర మార్గాలు' : language === 'hi' ? 'दान करने के अन्य तरीके' : 'Other Ways to Give'}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-base">
                  {language === 'te' ? 'మీకు అనుకూలమైన పద్ధతిని ఎంచుకోండి' : language === 'hi' ? 'अपनी सुविधा के अनुसार तरीका चुनें' : 'Choose the method that works best for you'}
                </p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Bank Transfer Card */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-900 rounded-3xl p-7 shadow-xl border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:border-purple-100 dark:hover:border-purple-900/40 transition-all duration-300 flex flex-col"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
                    <Building className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                      {language === 'te' ? 'బ్యాంక్ బదిలీ / NEFT / IMPS' : language === 'hi' ? 'बैंक ट्रांसफर / NEFT / IMPS' : 'Bank Transfer / NEFT / IMPS'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 leading-relaxed">
                      {language === 'te' ? 'పెద్ద దశమభాగాలకు అనుకూలమైనది.' : language === 'hi' ? 'बड़े दान के लिए बिल्कुल सही।' : 'Perfect for larger tithings and bulk offerings.'}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-2xl p-4 sm:p-5 space-y-2.5 sm:space-y-3 text-xs sm:text-sm border border-gray-100 dark:border-gray-700/50 mt-auto">
                  {[
                    { label: language === 'te' ? 'ఖాతాదారుని పేరు' : language === 'hi' ? 'खाता धारक का नाम' : 'Account Name', value: 'Kingdom of Christ Ministries', mono: false },
                    { label: language === 'te' ? 'ఖాతా సంఖ్య' : language === 'hi' ? 'खाता संख्या' : 'Account Number', value: '12041203940129', mono: true },
                    { label: language === 'te' ? 'IFSC కోడ్' : language === 'hi' ? 'IFSC कोड' : 'IFSC Code', value: 'UTIB0001092', mono: true },
                    { label: language === 'te' ? 'బ్యాంక్ బ్రాంచ్' : language === 'hi' ? 'बैंक स्थान' : 'Bank Location', value: 'Axis Bank, Jeedimetla', mono: false },
                  ].map((row) => (
                    <div key={row.label} className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-100 dark:border-gray-700/50 last:border-0 pb-2 sm:pb-2.5 last:pb-0">
                      <span className="text-gray-500 dark:text-gray-400 font-medium text-[11px] sm:text-xs">{row.label}:</span>
                      <span className={`font-bold text-gray-950 dark:text-white sm:text-right text-xs sm:text-sm ${row.mono ? "font-mono text-purple-700 dark:text-purple-400" : ""}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Envelope Giving Card */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white dark:bg-gray-900 rounded-3xl p-7 shadow-xl border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:border-pink-100 dark:hover:border-pink-900/40 transition-all duration-300 flex flex-col"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/25 flex-shrink-0">
                    <Heart className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                      {language === 'te' ? 'వ్యక్తిగతంగా ఎన్వలప్ కానుక' : language === 'hi' ? 'व्यक्तिगत लिफाफा दान' : 'In-Person Envelope Giving'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 leading-relaxed">
                      {language === 'te' ? 'మా చర్చిలలో ఆరాధన సమయంలో కానుకలు ఇవ్వండి.' : language === 'hi' ? 'किसी भी चर्च स्थान पर पूजा के दौरान अर्पित करें।' : 'Place your offering during any worship service at our locations.'}
                    </p>
                  </div>
                </div>

                <div className="mt-auto">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                    {language === 'te' ? 'మా బ్రాంచ్‌లను సందర్శించండి' : language === 'hi' ? 'हमारी शाखाओं का दौरा करें' : 'Visit our branches'}
                  </p>
                  <div className="grid grid-cols-1 min-[480px]:grid-cols-3 gap-2 sm:gap-3">
                    {branches.map((b) => (
                      <div
                        key={b.id}
                        className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 text-purple-700 dark:text-purple-300 p-2.5 sm:p-3.5 rounded-2xl border border-purple-100 dark:border-purple-900/30 shadow-sm flex flex-row min-[480px]:flex-col items-center justify-start min-[480px]:justify-center gap-2.5 sm:gap-2 w-full"
                      >
                        <span className="text-xl sm:text-2xl">⛪</span>
                        <span className="text-xs sm:text-[11px] font-bold truncate max-w-full text-gray-800 dark:text-white">{b.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
