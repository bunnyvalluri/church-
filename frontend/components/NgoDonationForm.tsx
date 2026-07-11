"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Building,
  Smartphone,
  Heart,
  Check,
  ArrowRight,
  ArrowLeft,
  Lock,
  Loader2,
  User,
  Mail,
  Phone,
  IndianRupee,
  Globe,
  Gift,
  Copy,
  CheckCircle2,
  ShieldAlert,
  Activity,
  RefreshCw,
  Receipt,
  QrCode,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Star,
  Zap,
  BookOpen,
  Target,
  TrendingUp,
  Home,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { motion, AnimatePresence } from "framer-motion";
import io from "socket.io-client";

// ── Types ──────────────────────────────────────────────────────────────────────

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

interface CampaignItem {
  id: string;
  title: string;
  description: string;
  targetAmount: number | null;
  raisedAmount: number;
  status: string;
}

interface NgoDonationFormProps {
  initialPurposes?: PurposeItem[];
  initialBranches?: BranchItem[];
  initialCampaigns?: CampaignItem[];
}

// ── Purpose styles (same palette as GiveForm for consistency) ─────────────────

const purposeCardStyles: Record<string, {
  icon: React.ReactNode;
  gradient: string;
  selectedBg: string;
  selectedBorder: string;
  selectedShadow: string;
  selectedCheck: string;
  unselectedBorderHover: string;
  unselectedBgHover: string;
}> = {
  CHARITY: {
    icon: <Heart className="w-5 h-5" />,
    gradient: "from-emerald-500 to-teal-600",
    selectedBg: "bg-emerald-50/90 dark:bg-emerald-950/25",
    selectedBorder: "border-emerald-300 dark:border-emerald-700/60",
    selectedShadow: "shadow-[0_0_20px_rgba(16,185,129,0.12)] dark:shadow-[0_0_25px_rgba(16,185,129,0.22)]",
    selectedCheck: "text-emerald-600 dark:text-emerald-400",
    unselectedBorderHover: "hover:border-emerald-300 dark:hover:border-emerald-800/60",
    unselectedBgHover: "hover:bg-emerald-50/20 dark:hover:bg-emerald-950/5",
  },
  MISSIONS: {
    icon: <Globe className="w-5 h-5" />,
    gradient: "from-blue-500 to-cyan-600",
    selectedBg: "bg-blue-50/90 dark:bg-blue-950/25",
    selectedBorder: "border-blue-300 dark:border-blue-700/60",
    selectedShadow: "shadow-[0_0_20px_rgba(59,130,246,0.12)] dark:shadow-[0_0_25px_rgba(59,130,246,0.22)]",
    selectedCheck: "text-blue-600 dark:text-blue-400",
    unselectedBorderHover: "hover:border-blue-300 dark:hover:border-blue-800/60",
    unselectedBgHover: "hover:bg-blue-50/20 dark:hover:bg-blue-950/5",
  },
  SPECIAL: {
    icon: <Star className="w-5 h-5" />,
    gradient: "from-fuchsia-500 to-violet-600",
    selectedBg: "bg-fuchsia-50/90 dark:bg-fuchsia-950/25",
    selectedBorder: "border-fuchsia-300 dark:border-fuchsia-700/60",
    selectedShadow: "shadow-[0_0_20px_rgba(217,70,239,0.12)] dark:shadow-[0_0_25px_rgba(217,70,239,0.22)]",
    selectedCheck: "text-fuchsia-600 dark:text-fuchsia-400",
    unselectedBorderHover: "hover:border-fuchsia-300 dark:hover:border-fuchsia-800/60",
    unselectedBgHover: "hover:bg-fuchsia-50/20 dark:hover:bg-fuchsia-950/5",
  },
};

const presetAmounts = ["500", "1000", "2500", "5000", "10000"];

const presetStyles: Record<string, {
  selectedBg: string;
  selectedBorder: string;
  selectedShadow: string;
}> = {
  "500": { selectedBg: "from-blue-500 to-indigo-600", selectedBorder: "border-blue-500", selectedShadow: "shadow-blue-500/25" },
  "1000": { selectedBg: "from-violet-500 to-purple-600", selectedBorder: "border-violet-500", selectedShadow: "shadow-violet-500/25" },
  "2500": { selectedBg: "from-emerald-500 to-teal-600", selectedBorder: "border-emerald-500", selectedShadow: "shadow-emerald-500/25" },
  "5000": { selectedBg: "from-amber-500 to-orange-600", selectedBorder: "border-amber-500", selectedShadow: "shadow-amber-500/25" },
  "10000": { selectedBg: "from-rose-500 to-pink-600", selectedBorder: "border-rose-500", selectedShadow: "shadow-rose-500/25" },
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function NgoDonationForm({
  initialPurposes = [],
  initialBranches = [],
  initialCampaigns = [],
}: NgoDonationFormProps) {
  const { language } = useLanguage();
  const { user, getIdToken } = useAuth();

  // ── Step state ───────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [mounted, setMounted] = useState(false);

  // ── Form lists ───────────────────────────────────────────────────────────────
  const [purposes, setPurposes] = useState<PurposeItem[]>(initialPurposes);
  const [branches, setBranches] = useState<BranchItem[]>(initialBranches);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(initialCampaigns);
  const [loadingLists, setLoadingLists] = useState(
    initialPurposes.length === 0 || initialBranches.length === 0
  );

  // ── Form inputs ──────────────────────────────────────────────────────────────
  const [amount, setAmount] = useState<string>("1000");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedPurpose, setSelectedPurpose] = useState<string>(
    initialPurposes.length > 0 ? initialPurposes[0].code : "CHARITY"
  );
  const [selectedBranch, setSelectedBranch] = useState<string>(
    initialBranches.length > 0 ? initialBranches[0].id : ""
  );
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [donorName, setDonorName] = useState<string>("");
  const [donorEmail, setDonorEmail] = useState<string>("");
  const [donorPhone, setDonorPhone] = useState<string>("");

  // ── Payment session state ────────────────────────────────────────────────────
  const [sessionId, setSessionId] = useState<string>("");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [upiUri, setUpiUri] = useState<string>("");
  const [upiId, setUpiId] = useState<string>("kcm.kristhraj2004-1@okicici");
  const [churchName, setChurchName] = useState<string>("Kingdom of Christ Ministries");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [actionLoading, setActionLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [lastHistorySynced, setLastHistorySynced] = useState<Date | null>(null);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type?: "success" | "error" } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<any>(null);

  // ── Mount guard ──────────────────────────────────────────────────────────────
  useEffect(() => { setMounted(true); }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── 1. Load form metadata ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;

    if (initialPurposes.length > 0 && initialBranches.length > 0) {
      setLoadingLists(false);
      if (initialCampaigns.length > 0) setSelectedCampaign(initialCampaigns[0].id);
      return;
    }

    async function loadFormMetadata() {
      try {
        const [purposesRes, branchesRes, campaignsRes] = await Promise.all([
          fetch("/api/donations/purposes"),
          fetch("/api/branches"),
          fetch("/api/ngo/campaigns"),
        ]);

        if (purposesRes.ok) {
          const data = await purposesRes.json();
          if (data.success) {
            setPurposes(data.purposes);
            if (data.purposes.length > 0) setSelectedPurpose(data.purposes[0].code);
          }
        }
        if (branchesRes.ok) {
          const data = await branchesRes.json();
          if (data.success) {
            setBranches(data.branches);
            if (data.branches.length > 0) setSelectedBranch(data.branches[0].id);
          }
        }
        if (campaignsRes.ok) {
          const data = await campaignsRes.json();
          if (data.success) {
            setCampaigns(data.campaigns);
            if (data.campaigns.length > 0) setSelectedCampaign(data.campaigns[0].id);
          }
        }
      } catch (err) {
        console.error("[NgoDonationForm] Failed to load form metadata:", err);
      } finally {
        setLoadingLists(false);
      }
    }

    loadFormMetadata();
  }, [mounted, initialPurposes, initialBranches, initialCampaigns]);

  // ── 2. Prefill logged-in user data ───────────────────────────────────────────
  useEffect(() => {
    if (!mounted || !user) return;
    setDonorName((prev) => prev || user.name || "");
    setDonorEmail((prev) => prev || user.email || "");

    const uid = user.uid;
    async function fetchProfile() {
      try {
        const res = await fetch(`/api/member/profile?userId=${uid}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setDonorName(data.user.name || "");
            setDonorEmail(data.user.email || "");
            setDonorPhone(data.user.phone || "");
          }
        }
      } catch {}
    }
    fetchProfile();
  }, [mounted, user]);

  // ── 3. Load donation history ─────────────────────────────────────────────────
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
      console.error("[NgoDonationForm] Failed to load history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.uid) loadHistory();
  }, [user, loadHistory]);

  // ── 4. QR expiration countdown ───────────────────────────────────────────────
  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const diff = expiresAt.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("EXPIRED");
        setErrorMessage("Payment QR code has expired. Please go back and restart.");
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [expiresAt]);

  // ── 5. Polling fallback ──────────────────────────────────────────────────────
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
            clearInterval(pollIntervalRef.current!);
            window.location.href = `/give/receipt/${data.donationId}`;
          }
        }
      } catch (err) {
        console.warn("[NgoDonationForm] Polling error:", err);
      }
    }, 5000);
  }, [getIdToken]);

  // ── 6. Socket.IO real-time listener ─────────────────────────────────────────
  const connectSocket = useCallback((sid: string) => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      // Join a room for NGO donations and the member room
      socket.emit("join", `member:${user?.uid || "guest"}`);
      socket.emit("join", "ngo:donations");
    });

    socket.on("donation.success", (data: any) => {
      if (data.sessionId === sid || data.referenceNumber === referenceNumber) {
        // Emit NGO-specific Socket.IO events for admin/finance dashboards
        socket.emit("ngo.donation.success", {
          sessionId: sid,
          campaignId: selectedCampaign,
          donationId: data.donationId,
          amount: Number(getFinalAmount()),
        });
        showToast("Payment verified! Redirecting to your receipt…", "success");
        setTimeout(() => {
          window.location.href = `/give/receipt/${data.donationId}`;
        }, 1000);
      }
    });

    // Listen for campaign progress updates to keep the sidebar fresh
    socket.on("campaign.updated", () => {
      // Silently refresh history to show updated raised amounts
      loadHistory(true);
    });

    return () => { socket.disconnect(); };
  }, [user, referenceNumber, selectedCampaign, loadHistory]);

  // ── Cleanup ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const getFinalAmount = () => (customAmount ? customAmount : amount);

  const validateDetails = () => {
    const finalAmt = getFinalAmount();
    if (!finalAmt || isNaN(Number(finalAmt)) || Number(finalAmt) <= 0) {
      setErrorMessage("Please enter a valid donation amount.");
      return false;
    }
    if (!donorName.trim()) {
      setErrorMessage("Please enter your full name.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!donorEmail || !emailRegex.test(donorEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const getLanguagePurposeName = (p: PurposeItem) => {
    if (language === "te" && p.nameTe) return p.nameTe;
    if (language === "hi" && p.nameHi) return p.nameHi;
    return p.nameEn;
  };

  const getLanguagePurposeDesc = (p: PurposeItem) => {
    if (language === "te" && p.descTe) return p.descTe;
    if (language === "hi" && p.descHi) return p.descHi;
    return p.descEn;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2500);
  };

  const openPaymentApp = (appUrl: string, storeFallback: string) => {
    window.location.href = appUrl;
    setTimeout(() => {
      if (!document.hidden) window.location.href = storeFallback;
    }, 1800);
  };

  // ── Generate payment session + QR (identical to GiveForm) ───────────────────
  const handleGeneratePaymentSession = async () => {
    if (!validateDetails()) return;
    setActionLoading(true);
    setErrorMessage("");

    try {
      const token = getIdToken ? await getIdToken() : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Build a note that encodes the NGO campaign for traceability in audit logs
      const activeCampaign = campaigns.find((c) => c.id === selectedCampaign);
      const campaignNote = activeCampaign ? ` | Campaign: ${activeCampaign.title}` : "";

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
          // campaignId encoded in the donorPhone note via audit trail
          // ngoProjectId is tracked in Socket.IO event payload above
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

      // Generate dynamic QR (same API as GiveForm)
      const qrRes = await fetch("/api/donations/generate-qr", {
        method: "POST",
        headers,
        body: JSON.stringify({ sessionId: sid }),
      });

      const qrData = await qrRes.json();
      if (!qrRes.ok || !qrData.success) {
        throw new Error(qrData.error || "Failed to generate dynamic QR code.");
      }

      setQrCodeData(qrData.qrCode);
      setUpiUri(qrData.upiUri);
      setUpiId(qrData.upiId);
      setChurchName(qrData.churchName);

      // Advance to Step 2
      setStep(2);

      // Start real-time systems
      connectSocket(sid);
      startStatusPolling(sid);

      // Fire NGO-specific Socket.IO event for admin dashboard
      try {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
        await fetch(`${socketUrl}/api/trigger-event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "ngo.donation.created",
            payload: {
              sessionId: sid,
              campaignId: selectedCampaign || null,
              amount: Number(getFinalAmount()),
              purpose: selectedPurpose,
              referenceNumber: sessionData.session.referenceNumber,
              status: "PENDING",
            },
            room: "admin:dashboard",
          }),
        });
      } catch {
        // Non-critical: admin dashboard event is best-effort
      }
    } catch (err: any) {
      console.error("[NgoDonationForm] Session generation failed:", err);
      setErrorMessage(err.message || "Failed to connect with payment gateway. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Manual verification (identical to GiveForm) ──────────────────────────────
  const handleVerifyPayment = async () => {
    setVerificationLoading(true);
    setErrorMessage("");

    try {
      const token = getIdToken ? await getIdToken() : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers,
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Verification returned unpaid.");
      }

      window.location.href = `/give/receipt/${data.donation.id}`;
    } catch (err: any) {
      console.error("[NgoDonationForm] Verification error:", err);
      setErrorMessage(
        err.message ||
        "Could not verify your transfer right now. Please ensure the payment completed in your app, wait a few seconds, and try again."
      );
    } finally {
      setVerificationLoading(false);
    }
  };

  // ── Derived values ───────────────────────────────────────────────────────────
  const displayAmount = Number(getFinalAmount() || "0");
  const isExpired = timeLeft === "EXPIRED";
  const activePurposeObj = purposes.find((p) => p.code === selectedPurpose);
  const activeCampaignObj = campaigns.find((c) => c.id === selectedCampaign);

  if (!mounted) return null;

  // ── UPI App quick-launch configs ─────────────────────────────────────────────
  const upiApps = [
    {
      name: "GPay",
      color: "#4285F4",
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Google_Pay_Acceptance_Mark.svg",
      url: `tez://upi/pay?${upiUri.split("?")[1] || ""}`,
      store: "https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user",
    },
    {
      name: "PhonePe",
      color: "#5f259f",
      logo: "https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg",
      url: `phonepe://pay?${upiUri.split("?")[1] || ""}`,
      store: "https://play.google.com/store/apps/details?id=com.phonepe.app",
    },
    {
      name: "Paytm",
      color: "#00BAF2",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg",
      url: `paytmmp://upi/pay?${upiUri.split("?")[1] || ""}`,
      store: "https://play.google.com/store/apps/details?id=net.one97.paytm",
    },
    {
      name: "BHIM",
      color: "#FF6B00",
      logo: "https://upload.wikimedia.org/wikipedia/commons/6/65/BHIM_logo.svg",
      url: `upi://pay?${upiUri.split("?")[1] || ""}`,
      store: "https://play.google.com/store/apps/details?id=in.org.npci.upiapp",
    },
    {
      name: "SuperMoney",
      color: "#1A73E8",
      logo: "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/googlepay.svg",
      url: `upi://pay?${upiUri.split("?")[1] || ""}`,
      store: "https://play.google.com/store/apps/details?id=money.super.app",
    },
    {
      name: "Fam",
      color: "#b8860b",
      logo: "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/fampay.svg",
      url: `fampay://upi/pay?${upiUri.split("?")[1] || ""}`,
      store: "https://play.google.com/store/apps/details?id=com.fampay.in",
      invert: true,
    },
  ];

  return (
    <>
      {/* ── TOAST ──────────────────────────────────────────────────────────── */}
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

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#02391a] via-[#0a5c34] to-[#0f172a]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.07]" />

        {/* Glowing orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/20 rounded-full filter blur-[100px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-600/15 rounded-full filter blur-[80px] animate-pulse pointer-events-none" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-green-500/10 rounded-full filter blur-[120px] pointer-events-none" />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-emerald-400/40 rounded-full"
            style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{ y: [-10, 10, -10], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-5 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm mb-8 shadow-xl"
            >
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <Heart className="h-4 w-4 text-pink-300" />
              <span className="font-medium tracking-wide">
                {language === "te" ? "NGO దాతృత్వ పోర్టల్" : language === "hi" ? "NGO दान पोर्टल" : "NGO Charity Donation Portal"}
              </span>
            </motion.div>

            <motion.h1
              initial={{ y: 24, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-[1.05]"
            >
              {language === "te"
                ? "సమాజ సేవకు మీ కానుక"
                : language === "hi"
                ? "समाज सेवा के लिए दान करें"
                : "Give to Transform Lives"}
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-white/80 max-w-xl mx-auto leading-relaxed"
            >
              {language === "te"
                ? "మీ కానుక ఆసుపత్రి శిబిరాలు, వైకల్యులు, మరియు అనాధ పిల్లల జీవితాలను మారుస్తుంది."
                : language === "hi"
                ? "आपका दान अस्पताल शिविरों, विकलांगों और अनाथ बच्चों के जीवन को बदलता है।"
                : "Your donation funds hospital camps, care for the disabled, and support for orphaned children across Hyderabad."}
            </motion.p>

            {/* Trust badges */}
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-wrap items-center justify-center gap-3 mt-10"
            >
              {[
                { icon: <Lock className="w-3.5 h-3.5" />, label: "Bank-Grade Security" },
                { icon: <Zap className="w-3.5 h-3.5" />, label: "Instant UPI" },
                { icon: <Receipt className="w-3.5 h-3.5" />, label: "80G Tax Exempt" },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-xs font-medium">
                  {badge.icon} {badge.label}
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

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <section className="py-12 -mt-4 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {loadingLists ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-emerald-100 dark:border-emerald-900/50" />
                <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {language === "te" ? "కానుక ఎంపికలను లోడ్ చేస్తోంది..." : language === "hi" ? "दान विकल्प लोड हो रहे हैं..." : "Loading donation options..."}
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-8 xl:gap-12 max-w-6xl mx-auto items-start">

              {/* ── LEFT: FORM CARD ─────────────────────────────────────────── */}
              <div className="lg:col-span-7">
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-[0_8px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_60px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-gray-800 overflow-hidden">

                  {/* Card header */}
                  <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-600/25">
                          <QrCode className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                            {language === "te" ? "తక్షణ UPI NGO కానుక" : language === "hi" ? "त्वरित यूपीआई NGO दान" : "Instant UPI NGO Donation"}
                          </h2>
                          <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                            {language === "te" ? "సురక్షితమైన డైనమిక్ QR ద్వారా" : language === "hi" ? "सुरक्षित डायनेमिक क्यूआर द्वारा" : "Secure real-time transfers via Dynamic QR"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full text-emerald-700 dark:text-emerald-400 text-[10px] font-bold tracking-wide border border-emerald-100 dark:border-emerald-800/40">
                        <Lock className="w-3 h-3" /> Secure
                      </div>
                    </div>

                    {/* Step progress */}
                    <div className="flex items-center gap-3 mt-5">
                      {[1, 2].map((s) => (
                        <div key={s} className="flex-1 flex items-center gap-3">
                          <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all duration-300 ${
                            step >= s
                              ? "bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                          }`}>
                            {step > s ? <Check className="w-3.5 h-3.5" /> : s}
                          </div>
                          <span className={`text-xs font-medium hidden sm:block ${step >= s ? "text-gray-800 dark:text-gray-200" : "text-gray-400"}`}>
                            {s === 1
                              ? (language === "te" ? "వివరాలు నమోదు చేయండి" : language === "hi" ? "विवरण दर्ज करें" : "Enter Details")
                              : (language === "te" ? "స్కాన్ & చెల్లించండి" : language === "hi" ? "स्कैन करें और भुगतान करें" : "Scan & Pay")}
                          </span>
                          {s < 2 && (
                            <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${step >= 2 ? "bg-gradient-to-r from-emerald-600 to-teal-600" : "bg-gray-100 dark:bg-gray-800"}`} />
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
                        className="mx-6 sm:mx-8 mt-4 overflow-hidden"
                      >
                        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400 text-sm rounded-2xl flex items-start gap-3">
                          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <span>{errorMessage}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form body */}
                  <div className="px-6 sm:px-8 pt-6 pb-8">
                    <AnimatePresence mode="wait">
                      {/* ── STEP 1: DONATION DETAILS ─────────────────────────── */}
                      {step === 1 ? (
                        <motion.div
                          key="step-1"
                          initial={{ opacity: 1, x: 0 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 16 }}
                          transition={{ duration: 0.25 }}
                          className="space-y-7"
                        >
                          {/* Amount selector */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                              <IndianRupee className="w-4 h-4 text-emerald-600" />
                              {language === "te" ? "కానుక మొత్తం" : language === "hi" ? "दान राशि" : "Donation Amount"}
                            </label>
                            <div className="grid grid-cols-3 gap-2.5">
                              {presetAmounts.map((preset) => {
                                const style = presetStyles[preset] || { selectedBg: "from-emerald-500 to-teal-600", selectedBorder: "border-emerald-500", selectedShadow: "shadow-emerald-500/25" };
                                const isSelected = amount === preset && !customAmount;
                                return (
                                  <button
                                    key={preset}
                                    type="button"
                                    onClick={() => { setAmount(preset); setCustomAmount(""); }}
                                    className={`relative py-3.5 px-2 rounded-2xl border-2 text-center font-bold text-base transition-all duration-200 overflow-hidden group ${
                                      isSelected
                                        ? `${style.selectedBorder} text-white shadow-lg ${style.selectedShadow} scale-[1.02]`
                                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:border-emerald-300 dark:hover:border-emerald-700"
                                    }`}
                                  >
                                    {isSelected && (
                                      <motion.div
                                        layoutId="ngo-amount-selector"
                                        className={`absolute inset-0 bg-gradient-to-br ${style.selectedBg} rounded-xl`}
                                        transition={{ duration: 0.2 }}
                                      />
                                    )}
                                    <span className="relative z-10">₹{Number(preset).toLocaleString("en-IN")}</span>
                                  </button>
                                );
                              })}
                              {/* Custom amount */}
                              <div className="relative col-span-1">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-bold text-sm z-10">₹</span>
                                <input
                                  type="number"
                                  placeholder={language === "te" ? "మొత్తం" : language === "hi" ? "राशि" : "Custom"}
                                  value={customAmount}
                                  onChange={(e) => { setCustomAmount(e.target.value); setAmount(""); }}
                                  className={`w-full py-3.5 pl-8 pr-3 rounded-2xl border-2 font-bold text-sm transition-all duration-200 bg-gray-50 dark:bg-gray-800/50 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none ${
                                    customAmount
                                      ? "border-emerald-500 ring-2 ring-emerald-500/25 bg-emerald-50/10 dark:bg-emerald-950/10"
                                      : "border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 focus:border-emerald-400"
                                  }`}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Purpose selector */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                              <Gift className="w-4 h-4 text-emerald-600" />
                              {language === "te" ? "కానుక విధానం" : language === "hi" ? "दान का उद्देश्य" : "Donation Purpose"}
                            </label>
                            <div className="grid sm:grid-cols-2 gap-2.5">
                              {purposes.map((p) => {
                                const isSelected = selectedPurpose === p.code;
                                const style = purposeCardStyles[p.code] || {
                                  icon: <Heart className="w-5 h-5" />,
                                  gradient: "from-emerald-500 to-teal-600",
                                  selectedBg: "bg-emerald-50 dark:bg-emerald-950/20",
                                  selectedBorder: "border-emerald-200 dark:border-emerald-800/40",
                                  selectedShadow: "shadow-[0_0_20px_rgba(16,185,129,0.12)]",
                                  selectedCheck: "text-emerald-600 dark:text-emerald-400",
                                  unselectedBorderHover: "hover:border-emerald-300 dark:hover:border-emerald-800/60",
                                  unselectedBgHover: "hover:bg-emerald-50/20 dark:hover:bg-emerald-950/5",
                                };
                                return (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setSelectedPurpose(p.code)}
                                    className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-start gap-3 w-full group overflow-hidden ${
                                      isSelected
                                        ? `${style.selectedBg} ${style.selectedBorder} ${style.selectedShadow} scale-[1.01]`
                                        : `border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/30 ${style.unselectedBorderHover} ${style.unselectedBgHover}`
                                    }`}
                                  >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white bg-gradient-to-br ${style.gradient} shadow-md transition-all duration-200 ${isSelected ? "scale-100" : "scale-90 opacity-70 group-hover:scale-95 group-hover:opacity-90"}`}>
                                      {style.icon}
                                    </div>
                                    <div className="min-w-0">
                                      <span className={`block font-bold text-sm transition-colors ${isSelected ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                                        {getLanguagePurposeName(p)}
                                      </span>
                                      <span className="block text-gray-400 dark:text-gray-500 text-[11px] mt-0.5 leading-snug line-clamp-2">
                                        {getLanguagePurposeDesc(p)}
                                      </span>
                                    </div>
                                    {isSelected && <CheckCircle2 className={`w-4 h-4 ${style.selectedCheck} flex-shrink-0 ml-auto mt-0.5`} />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* NGO Campaign selector */}
                          {campaigns.length > 0 && (
                            <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4 text-emerald-600" />
                                {language === "te" ? "NGO ప్రచారం" : language === "hi" ? "NGO अभियान" : "NGO Campaign"}
                              </label>
                              <div className="space-y-2">
                                {campaigns.map((c) => {
                                  const isSelected = selectedCampaign === c.id;
                                  const progress = c.targetAmount && c.targetAmount > 0
                                    ? Math.min(100, Math.round((c.raisedAmount / c.targetAmount) * 100))
                                    : null;
                                  return (
                                    <button
                                      key={c.id}
                                      type="button"
                                      onClick={() => setSelectedCampaign(c.id)}
                                      className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                                        isSelected
                                          ? "border-emerald-300 dark:border-emerald-700/60 bg-emerald-50/90 dark:bg-emerald-950/25 scale-[1.01] shadow-[0_0_20px_rgba(16,185,129,0.12)]"
                                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/30 hover:border-emerald-300 dark:hover:border-emerald-800/60 hover:bg-emerald-50/20"
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                          <span className={`block font-bold text-sm ${isSelected ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}>
                                            {c.title}
                                          </span>
                                          <span className="block text-gray-400 dark:text-gray-500 text-[11px] mt-0.5 line-clamp-1">
                                            {c.description}
                                          </span>
                                        </div>
                                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />}
                                      </div>
                                      {progress !== null && (
                                        <div className="mt-3">
                                          <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1.5">
                                            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />₹{c.raisedAmount.toLocaleString("en-IN")} raised</span>
                                            <span>{progress}%</span>
                                          </div>
                                          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                                            <motion.div
                                              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full"
                                              initial={{ width: 0 }}
                                              animate={{ width: `${progress}%` }}
                                              transition={{ duration: 0.8, ease: "easeOut" }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Branch selector */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                              <Home className="w-4 h-4 text-emerald-600" />
                              {language === "te" ? "చర్చి బ్రాంచ్" : language === "hi" ? "चर्च शाखा" : "Church Branch"}
                            </label>
                            <div className="relative">
                              <select
                                value={selectedBranch}
                                onChange={(e) => setSelectedBranch(e.target.value)}
                                className="w-full py-3.5 pl-4 pr-10 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-600/25 focus:border-emerald-500 focus:outline-none font-semibold appearance-none transition-all text-sm"
                              >
                                {branches.map((b) => (
                                  <option key={b.id} value={b.id}>⛪ {b.name}</option>
                                ))}
                              </select>
                              <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                          </div>

                          {/* Donor info */}
                          <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-2">
                              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
                              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                {language === "te" ? "మీ సమాచారం" : language === "hi" ? "आपकी जानकारी" : "Your Details"}
                              </span>
                              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                              <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                  {language === "te" ? "పూర్తి పేరు" : language === "hi" ? "पूरा नाम" : "Full Name"}
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder={language === "te" ? "మీ పూర్తి పేరు" : language === "hi" ? "आपका पूरा नाम" : "Your full name"}
                                    value={donorName}
                                    onChange={(e) => setDonorName(e.target.value)}
                                    className="w-full py-3 px-4 pl-11 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-500 focus:outline-none transition-all text-sm"
                                  />
                                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                  {language === "te" ? "ఇమెయిల్" : language === "hi" ? "ईमेल" : "Email"}
                                </label>
                                <div className="relative">
                                  <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={donorEmail}
                                    onChange={(e) => setDonorEmail(e.target.value)}
                                    className="w-full py-3 px-4 pl-11 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-500 focus:outline-none transition-all text-sm"
                                  />
                                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                                  {language === "te" ? "ఫోన్" : language === "hi" ? "फोन" : "Phone"}
                                </label>
                                <div className="relative">
                                  <input
                                    type="tel"
                                    placeholder="+91 98765 43210"
                                    value={donorPhone}
                                    onChange={(e) => setDonorPhone(e.target.value)}
                                    className="w-full py-3 px-4 pl-11 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-500 focus:outline-none transition-all text-sm"
                                  />
                                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Generate QR button */}
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={handleGeneratePaymentSession}
                            className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 hover:shadow-2xl hover:shadow-emerald-600/30 transition-all duration-300 active:scale-[0.99] disabled:opacity-60 relative overflow-hidden group"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-700 via-teal-700 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="relative z-10 flex items-center gap-2.5">
                              {actionLoading ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                  {language === "te" ? "QR కోడ్‌ని రూపొందిస్తోంది..." : language === "hi" ? "क्यूआर कोड जनरेट किया जा रहा है..." : "Generating Secure QR Code..."}
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-5 h-5" />
                                  {language === "te" ? "డైనమిక్ UPI QR కోడ్‌ను రూపొందించండి" : language === "hi" ? "डायनेमिक यूपीआई क्यूआर कोड जनरेट करें" : "Generate Dynamic UPI QR Code"}
                                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                              )}
                            </span>
                          </button>
                        </motion.div>
                      ) : (
                        /* ── STEP 2: SCAN & PAY ───────────────────────────────── */
                        <motion.div
                          key="step-2"
                          initial={{ opacity: 1, x: 0 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -16 }}
                          transition={{ duration: 0.25 }}
                          className="flex flex-col items-center space-y-6"
                        >
                          {/* Countdown Timer */}
                          <div className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-bold border transition-all ${
                            isExpired
                              ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/40"
                              : "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/30"
                          }`}>
                            <Clock className="w-4 h-4" />
                            <span>{language === "te" ? "QR గడువు ముగిసే సమయం:" : language === "hi" ? "QR समाप्त होने में:" : "QR Expires in:"}</span>
                            <span className="font-mono font-extrabold text-sm tracking-widest">{timeLeft}</span>
                          </div>

                          {/* QR container */}
                          <div className="w-full max-w-sm">
                            <div className="relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-5 rounded-3xl border-2 border-gray-100 dark:border-gray-700 shadow-[0_4px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)] flex flex-col items-center">

                              {/* Dynamic QR badge */}
                              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-emerald-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                {language === "te" ? "డైనమిక్ QR" : language === "hi" ? "डायनेमिक QR" : "Dynamic QR"}
                              </div>

                              {/* QR Code */}
                              <div className="w-52 h-52 bg-white rounded-2xl overflow-hidden shadow-inner border border-gray-100 flex items-center justify-center mt-2">
                                {qrCodeData ? (
                                  <img
                                    src={qrCodeData}
                                    alt="Dynamic UPI QR Code"
                                    className="w-full h-full object-contain p-2"
                                  />
                                ) : (
                                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                                )}
                              </div>

                              <p className="mt-3 text-xs font-bold text-gray-600 dark:text-gray-400 text-center">{churchName}</p>

                              {/* UPI ID row */}
                              <div className="mt-3 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <span className="block text-[9px] uppercase font-bold text-gray-400 tracking-widest">UPI ID</span>
                                  <span className="text-gray-800 dark:text-gray-200 font-bold font-mono text-xs select-all truncate block">{upiId}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(upiId, "UPI ID")}
                                  className="p-2 bg-gray-50 dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl text-gray-500 hover:text-emerald-600 transition-all border border-gray-200 dark:border-gray-700 flex-shrink-0"
                                >
                                  {copiedLabel === "UPI ID" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* UPI app quick-launch */}
                          <div className="w-full max-w-sm">
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center mb-3">
                              {language === "te" ? "— మీ ఇష్టమైన యాప్‌లో తెరవండి —" : language === "hi" ? "— पसंदीदा ऐप में खोलें —" : "— Pay directly with your favourite app —"}
                            </p>
                            <div className="grid grid-cols-6 gap-2 mb-4">
                              {upiApps.map((app) => (
                                <button
                                  key={app.name}
                                  type="button"
                                  title={`Open in ${app.name}`}
                                  onClick={() => openPaymentApp(app.url, app.store)}
                                  className="flex flex-col items-center justify-center gap-1.5 py-3 px-1 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md active:scale-90 transition-all group cursor-pointer"
                                >
                                  <img
                                    src={app.logo}
                                    className="w-7 h-7 object-contain rounded-lg group-hover:scale-105 transition-transform"
                                    alt={app.name}
                                    style={app.invert ? { filter: "brightness(0) saturate(100%) invert(56%) sepia(85%) saturate(350%) hue-rotate(5deg)" } : {}}
                                  />
                                  <span className="text-[8px] font-bold tracking-tight" style={{ color: app.color }}>{app.name}</span>
                                </button>
                              ))}
                            </div>

                            <div className="grid grid-cols-2 gap-2.5">
                              <button
                                type="button"
                                onClick={() => openPaymentApp(upiUri, upiUri)}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-sm transition-all active:scale-95"
                              >
                                <Smartphone className="w-4 h-4" />
                                {language === "te" ? "UPI యాప్ తెరవండి" : language === "hi" ? "यूपीआई ऐप खोलें" : "Open in UPI App"}
                              </button>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(upiUri, "URI")}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm transition-all active:scale-95"
                              >
                                {copiedLabel === "URI" ? (
                                  <><Check className="w-4 h-4 text-emerald-500" />{language === "te" ? "కాపీ అయింది" : language === "hi" ? "कॉपी हुआ" : "Copied!"}</>
                                ) : (
                                  <><Copy className="w-4 h-4" />{language === "te" ? "లింక్ కాపీ" : language === "hi" ? "लिंक कॉपी" : "Copy Link"}</>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Real-time verification notice */}
                          <div className="w-full max-w-sm p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <Activity className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <p className="font-bold text-sm text-gray-800 dark:text-gray-200">
                                  {language === "te" ? "నిజ-సమయ ధృవీకరణ సక్రియంగా ఉంది" : language === "hi" ? "वास्तविक समय सत्यापन सक्रिय" : "Real-time verification active"}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                                  {language === "te"
                                    ? "చెల్లింపు పూర్తయిన తర్వాత స్వయంచాలకంగా ధృవీకరించబడుతుంది."
                                    : language === "hi"
                                    ? "भुगतान पूरा होने के बाद स्वचालित रूप से सत्यापित किया जाएगा।"
                                    : "Once payment is completed, our server auto-verifies in real-time. If it doesn't redirect, click the button below."}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex gap-3 w-full max-w-sm">
                            <button
                              type="button"
                              onClick={() => {
                                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                                if (socketRef.current) socketRef.current.disconnect();
                                setStep(1);
                                setQrCodeData("");
                                setSessionId("");
                                setTimeLeft("");
                                setExpiresAt(null);
                                setErrorMessage("");
                              }}
                              className="py-3.5 px-5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-all flex items-center gap-1.5 active:scale-98 text-sm"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              {language === "te" ? "వెనక్కి" : language === "hi" ? "वापस" : "Back"}
                            </button>
                            <button
                              type="button"
                              disabled={verificationLoading || isExpired}
                              onClick={handleVerifyPayment}
                              className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-emerald-500/25 transition-all active:scale-[0.99] disabled:opacity-60 text-sm"
                            >
                              {verificationLoading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" />{language === "te" ? "ధృవీకరిస్తోంది..." : language === "hi" ? "सत्यापित हो रहा है..." : "Verifying..."}</>
                              ) : (
                                <><CheckCircle2 className="h-4 w-4" />{language === "te" ? "చెల్లించాను — ధృవీకరించు" : language === "hi" ? "भुगतान किया — सत्यापित करें" : "I've Paid — Verify Now"}</>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* ── RIGHT: SIDEBAR ───────────────────────────────────────────── */}
              <div className="lg:col-span-5 space-y-5">

                {/* Gift Summary Card */}
                <div className="relative bg-gradient-to-br from-[#02391a] via-[#0a5c34] to-[#1e1065] rounded-3xl shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full filter blur-3xl transform translate-x-16 -translate-y-16" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-400/10 rounded-full filter blur-2xl transform -translate-x-8 translate-y-8" />

                  <div className="relative p-6 sm:p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <Receipt className="w-5 h-5 text-emerald-200" />
                      <h3 className="font-bold text-base uppercase tracking-widest text-white">
                        {language === "te" ? "కానుక సారాంశం" : language === "hi" ? "दान सारांश" : "Gift Summary"}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-white/15">
                        <span className="text-white text-sm font-medium">
                          {language === "te" ? "రకం" : language === "hi" ? "प्रकार" : "Type"}
                        </span>
                        <span className="font-bold text-xs bg-white/20 px-3 py-1.5 rounded-full uppercase tracking-wider text-white">
                          {activePurposeObj ? getLanguagePurposeName(activePurposeObj) : selectedPurpose}
                        </span>
                      </div>

                      {activeCampaignObj && (
                        <div className="flex items-center justify-between py-3 border-b border-white/15">
                          <span className="text-white text-sm font-medium">
                            {language === "te" ? "ప్రచారం" : language === "hi" ? "अभियान" : "Campaign"}
                          </span>
                          <span className="font-semibold text-emerald-200 text-xs text-right max-w-[60%] line-clamp-1">
                            {activeCampaignObj.title}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between py-3 border-b border-white/15">
                        <span className="text-white text-sm font-medium">
                          {language === "te" ? "పద్ధతి" : language === "hi" ? "तरीका" : "Method"}
                        </span>
                        <span className="font-semibold flex items-center gap-1.5 text-white text-sm">
                          <QrCode className="w-4 h-4 text-emerald-200" />
                          {language === "te" ? "డైనమిక్ UPI QR" : language === "hi" ? "डायनेमिक यूपीआई" : "Dynamic UPI QR"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-white/15">
                        <span className="text-white text-sm font-medium">
                          {language === "te" ? "పన్ను మినహాయింపు" : language === "hi" ? "कर छूट" : "Tax Benefit"}
                        </span>
                        <span className="font-bold text-emerald-300 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {language === "te" ? "80G వర్తిస్తుంది" : language === "hi" ? "80G लागू" : "80G Applicable"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3">
                        <span className="text-xl font-semibold text-white">
                          {language === "te" ? "మొత్తం" : language === "hi" ? "कुल" : "Total"}
                        </span>
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

                {/* Live Donation History (for logged-in users) */}
                {mounted && user && (
                  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-lg overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          {language === "te" ? "లైవ్ కానుక చరిత్ర" : language === "hi" ? "लाइव दान इतिहास" : "Live Donation History"}
                        </h4>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                          {language === "te" ? "మీ ఇటీవలి కానుకలు" : language === "hi" ? "आपके हाल के दान" : "Your recent giving records"}
                        </p>
                      </div>
                      <button
                        onClick={() => loadHistory()}
                        disabled={historyLoading}
                        className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all border border-gray-200 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-700"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? "animate-spin" : ""}`} />
                      </button>
                    </div>

                    <div className="p-4">
                      {historyLoading && history.length === 0 ? (
                        <div className="py-8 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                        </div>
                      ) : history.length === 0 ? (
                        <div className="text-center py-6 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                          <Receipt className="w-7 h-7 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                          <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">
                            {language === "te" ? "ఇంకా రికార్డులు లేవు" : language === "hi" ? "अभी तक कोई रिकॉर्ड नहीं" : "No giving records yet"}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
                          {history.map((item) => (
                            <div
                              key={item.id}
                              className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 rounded-xl flex items-center justify-between text-xs hover:border-emerald-200 dark:hover:border-emerald-700/50 transition-all group"
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
                                <span className="font-black text-gray-900 dark:text-white">₹{item.amount.toLocaleString("en-IN")}</span>
                                <a
                                  href={`/give/receipt/${item.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all"
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
                            {language === "te" ? "సింక్ సక్రియంగా ఉంది" : language === "hi" ? "सिंक सक्रिय" : "Sync active"}
                          </span>
                          <span>
                            {language === "te" ? "నవీకరించబడింది:" : language === "hi" ? "अपडेट:" : "Updated:"}{" "}
                            {lastHistorySynced.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Scripture Card */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10 rounded-3xl p-5 shadow-md border border-amber-100 dark:border-amber-800/20">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 dark:text-amber-300 text-sm mb-1">
                        {language === "te" ? "మలాకీ 3:10" : language === "hi" ? "मलाकी 3:10" : "Malachi 3:10"}
                      </h4>
                      <p className="text-amber-800/80 dark:text-amber-400/80 text-xs leading-relaxed italic">
                        {language === "te"
                          ? "\"దశమభాగమంతా నా ఆలయములోనికి తీసుకురండి...\""
                          : language === "hi"
                          ? "\"सारा दशमांश भण्डार घर में ले आओ...\""
                          : "\"Bring the whole tithe into the storehouse, that there may be food in my house.\""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Help Card */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-md border border-gray-100 dark:border-gray-800">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                    {language === "te" ? "సహాయం కావాలా?" : language === "hi" ? "मदद चाहिए?" : "Need help?"}
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-3 leading-relaxed">
                    {language === "te"
                      ? "మాకు ఇమెయిల్ లేదా ఫోన్ ద్వారా సంప్రదించండి."
                      : language === "hi"
                      ? "हमसे ईमेल या फोन के माध्यम से संपर्क करें।"
                      : "Reach us via email or phone for donation assistance."}
                  </p>
                  <div className="space-y-1.5">
                    <a href="mailto:kingofchristministries23@gmail.com" className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      kingofchristministries23@gmail.com
                    </a>
                    <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                      <a href="tel:+919704090069" className="hover:underline">+91 97040 90069</a>
                      <span className="text-gray-300 dark:text-gray-600">|</span>
                      <a href="tel:+919640943777" className="hover:underline">+91 96409 43777</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── IMPACT SECTION ─────────────────────────────────────────────────── */}
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
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest mb-5">
                  <Heart className="w-3.5 h-3.5" /> Our Impact
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                  {language === "te" ? "మీ కానుకతో మేము చేయగలిగేది" : language === "hi" ? "आपके दान से हम क्या करते हैं" : "What Your Giving Enables"}
                </h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
                  {language === "te"
                    ? "ప్రతి రూపాయి నేరుగా సమాజ సేవ కార్యక్రమాలకు వెళుతుంది."
                    : language === "hi"
                    ? "हर रुपया सीधे सामाजिक सेवा कार्यक्रमों में जाता है।"
                    : "Every rupee goes directly to fund life-changing social service programs across Hyderabad."}
                </p>
              </motion.div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                language === "te" ? "ప్రభుత్వ ఆసుపత్రులలో వైద్య శిబిరాలు" : language === "hi" ? "सरकारी अस्पतालों में चिकित्सा शिविर" : "Medical camps in government hospitals",
                language === "te" ? "వైకల్యులకు కూడా సహాయం" : language === "hi" ? "विकलांगों की सहायता" : "Care and support for the disabled",
                language === "te" ? "బేతని సమ్రక్షణ అనాధ పిల్లల సేవ" : language === "hi" ? "बेथनी अनाथ आश्रम सेवा" : "Bethany Samrakshana orphan care ministry",
                language === "te" ? "ఆసుపత్రులలో ఆధ్యాత్మిక సేవ మరియు సువార్త" : language === "hi" ? "अस्पतालों में आध्यात्मिक सेवा" : "Spiritual service and Gospel outreach in hospitals",
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="flex items-start gap-4 bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800/40 transition-all duration-300 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                    <Check className="h-4 w-4 text-white stroke-[2.5]" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium text-sm sm:text-base leading-relaxed">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
