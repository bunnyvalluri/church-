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
  BookOpen,
  Home,
  ShieldCheck,
  CreditCard
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

const DEFAULT_PURPOSES: PurposeItem[] = [
  { id: "1", code: "TITHE", nameEn: "Tithe", nameTe: "దశమ భాగము (Tithe)", nameHi: "दशमांश (Tithe)", descEn: "10% of monthly income to support the ministry.", descTe: null, descHi: null },
  { id: "2", code: "OFFERING", nameEn: "Online Offering", nameTe: "ఆరాధన కానుక (Offering)", nameHi: "पूजा की भेंट (Offering)", descEn: "General offerings to support church operations and worship.", descTe: null, descHi: null },
  { id: "3", code: "BUILDING", nameEn: "Building Fund", nameTe: "భవన నిర్మాణ నిధి (Building Fund)", nameHi: "భవన్ నిర్మాణ నిధి (Building Fund)", descEn: "For church construction, expansion, and facilities maintenance.", descTe: null, descHi: null },
  { id: "4", code: "MISSIONS", nameEn: "Missions", nameTe: "సువార్త సేవ నిధి (Missions)", nameHi: "मिशनरी सेवा (Missions)", descEn: "Supporting local evangelism and global outreach missions.", descTe: null, descHi: null },
  { id: "5", code: "CHARITY", nameEn: "Benevolence", nameTe: "ధర్మకార్యములు (Charity)", nameHi: "परोपकार (Charity)", descEn: "Assisting widows, orphans, and families in financial distress.", descTe: null, descHi: null },
  { id: "6", code: "SPECIAL", nameEn: "Special Offering", nameTe: "ప్రత్యేక కానుక (Special)", nameHi: "विशेष भेंट (Special)", descEn: "Vows, thanksgiving offerings, or special pledge gifts.", descTe: null, descHi: null },
];

const DEFAULT_BRANCHES: BranchItem[] = [
  { id: "b1", name: "Shapur Nagar" },
  { id: "b2", name: "Subhash Nagar" },
  { id: "b3", name: "Bahadurpally" }
];

// Purpose icon map
const purposeIconMap: Record<string, React.ReactNode> = {
  TITHE: <IndianRupee className="w-4 h-4" />,
  OFFERING: <Gift className="w-4 h-4" />,
  BUILDING_FUND: <Building className="w-4 h-4" />,
  BUILDING: <Building className="w-4 h-4" />,
  MISSIONS: <Globe className="w-4 h-4" />,
  BENEVOLENCE: <Heart className="w-4 h-4" />,
  CHARITY: <Heart className="w-4 h-4" />,
  SPECIAL: <Star className="w-4 h-4" />,
};

const purposeColorMap: Record<string, string> = {
  TITHE: "from-indigo-600 to-purple-600",
  OFFERING: "from-rose-500 to-pink-600",
  BUILDING_FUND: "from-amber-500 to-orange-600",
  BUILDING: "from-amber-500 to-orange-600",
  MISSIONS: "from-blue-600 to-indigo-600",
  BENEVOLENCE: "from-emerald-500 to-teal-600",
  CHARITY: "from-emerald-500 to-teal-600",
  SPECIAL: "from-fuchsia-500 to-purple-600",
};

// Payment App Definitions with 100% inline SVG vectors
const UPI_APPS = [
  { 
    name: "GPay", 
    pkg: "com.google.android.apps.nbu.paisa.user", 
    scheme: "tez://upi/pay",
    color: "#4285F4",
    bgClass: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-400",
    svg: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
      </svg>
    )
  },
  { 
    name: "PhonePe", 
    pkg: "com.phonepe.app", 
    scheme: "phonepe://pay",
    color: "#5F259F",
    bgClass: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-400",
    svg: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#5F259F"/>
        <path d="M15.5 8.5H12V7h3.5a.5.5 0 000-1H9.5a.5.5 0 000 1H11v8.5a.5.5 0 001 0V13h2.5a3 3 0 000-6zm0 3.5H12V9.5h3.5a1.5 1.5 0 010 3z" fill="#FFF"/>
      </svg>
    )
  },
  { 
    name: "Paytm", 
    pkg: "net.one97.paytm", 
    scheme: "paytmmp://upi/pay",
    color: "#00BAF2",
    bgClass: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-400",
    svg: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#002E6E"/>
        <path d="M4.5 14.5L7 7h3l-2.5 7.5H4.5zm5.5 0L12.5 7h3L13 14.5h-3z" fill="#00BAF2"/>
        <path d="M15 14.5l1.5-4.5h2l-1.5 4.5H15zm2.5-6h2L20 7h-2l-.5 1.5z" fill="#00BAF2"/>
      </svg>
    )
  },
  { 
    name: "BHIM", 
    pkg: "in.org.npci.upiapp", 
    scheme: "upi://pay",
    color: "#FF6B00",
    bgClass: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-400",
    svg: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#008345"/>
        <path d="M6 7h6a3.5 3.5 0 010 7H6V7zm3 2.5v2h3a1 1 0 000-2H9z" fill="#FFF"/>
        <path d="M6 14h7a3.5 3.5 0 010 7H6v-7zm3 2.5v2h4a1 1 0 000-2H9z" fill="#F7931A"/>
      </svg>
    )
  },
  { 
    name: "FamApp", 
    pkg: "com.fampay.in", 
    scheme: "fampay://upi/pay",
    color: "#B8860B",
    bgClass: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-yellow-400 dark:hover:border-yellow-400",
    svg: (
      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="6" fill="#FFD700"/>
        <path d="M7 8h10v2H7V8zm0 4h7v2H7v-2zm0 4h10v2H7v-2z" fill="#000"/>
      </svg>
    )
  }
];

export default function GiveForm({ initialPurposes = [], initialBranches = [] }: GiveFormProps) {
  const { language, t } = useLanguage();
  const { user, getIdToken } = useAuth();
  const pathname = usePathname() || "";
  const isPortalRoute = pathname.startsWith("/member");

  // Steps: 1 = Enter Details, 2 = Scan & Pay
  const [step, setStep] = useState(1);
  
  // Dynamic Lists loaded from DB
  const [purposes, setPurposes] = useState<PurposeItem[]>(
    initialPurposes.length > 0 ? initialPurposes : DEFAULT_PURPOSES
  );
  const [branches, setBranches] = useState<BranchItem[]>(
    initialBranches.length > 0 ? initialBranches : DEFAULT_BRANCHES
  );
  const [loadingLists, setLoadingLists] = useState(initialPurposes.length === 0 || initialBranches.length === 0);

  // Form Inputs
  const [amount, setAmount] = useState<string>("1000");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedPurpose, setSelectedPurpose] = useState<string>(
    initialPurposes.length > 0 ? initialPurposes[0].code : "TITHE"
  );
  const [selectedBranch, setSelectedBranch] = useState<string>(
    (initialBranches.length > 0 ? initialBranches[0].id : DEFAULT_BRANCHES[0].id)
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
  
  // Mobile Tab Navigation ('form' | 'summary' | 'ways')
  const [mobileTab, setMobileTab] = useState<'form' | 'summary' | 'ways'>('form');
  
  const [mounted, setMounted] = useState(false);
  const hasFetchedMetadataRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<any>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const scrollToCard = () => {
    if (cardRef.current) {
      const offset = 80;
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

  useEffect(() => { setMounted(true); }, []);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. Fetch Purposes and Branches on Mount (once)
  useEffect(() => {
    if (!mounted || hasFetchedMetadataRef.current) return;

    if (initialPurposes.length > 0 && initialBranches.length > 0) {
      setLoadingLists(false);
      return;
    }

    hasFetchedMetadataRef.current = true;

    async function loadFormMetadata() {
      try {
        const [purposesRes, branchesRes] = await Promise.all([
          fetch("/api/donations/purposes"),
          fetch("/api/branches")
        ]);

        if (purposesRes.ok) {
          const purposesData = await purposesRes.json();
          if (purposesData.success && Array.isArray(purposesData.purposes) && purposesData.purposes.length > 0) {
            setPurposes(purposesData.purposes);
            const foundPurpose = purposesData.purposes.find((p: any) => p.code === selectedPurpose || p.id === selectedPurpose);
            if (!foundPurpose) {
              setSelectedPurpose(purposesData.purposes[0].code || "TITHE");
            }
          } else {
            setPurposes(DEFAULT_PURPOSES);
          }
        } else {
          setPurposes(DEFAULT_PURPOSES);
        }

        if (branchesRes.ok) {
          const branchesData = await branchesRes.json();
          if (branchesData.success && Array.isArray(branchesData.branches) && branchesData.branches.length > 0) {
            setBranches(branchesData.branches);
            const foundBranch = branchesData.branches.find((b: any) => b.id === selectedBranch);
            if (!foundBranch) {
              setSelectedBranch(branchesData.branches[0].id);
            }
          } else {
            setBranches(DEFAULT_BRANCHES);
          }
        } else {
          setBranches(DEFAULT_BRANCHES);
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

  // Countdown timer for QR expiration
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

  // Status Polling Fallback
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

  // Connect Socket.IO for real-time success listener
  const connectSocket = useCallback((sid: string) => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "";
    const isProduction = process.env.NODE_ENV === "production";
    const isLocalhost = socketUrl.includes("localhost") || socketUrl.includes("127.0.0.1");
    if (!socketUrl || (isProduction && (isLocalhost || !socketUrl))) {
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

    return () => {
      socket.disconnect();
    };
  }, [user, referenceNumber]);

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

  const handleGeneratePaymentSession = async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setErrorMessage("You're currently offline. Internet connection is required to complete payment verification.");
      return;
    }
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
      const rawMsg = err?.message || "";
      const isFetchErr = rawMsg.toLowerCase().includes("failed to fetch") || rawMsg.toLowerCase().includes("networkerror");
      const userMsg = isFetchErr
        ? "Unable to connect to the payment server. Please check your network connection and try again."
        : rawMsg || "Failed to connect with payment gateway. Please try again.";
      setErrorMessage(userMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (verificationLoading) return;
    setVerificationLoading(true);
    setErrorMessage("");
    setPollTimeoutReached(false);

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

      setVerificationStatus("PENDING");
      setVerificationLoading(false);

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
          // Keep polling
        }
      }, 4_000);
    } catch (err: any) {
      console.error("Verify payment error:", err);
      setVerificationLoading(false);
      setErrorMessage(err.message || "Verification failed. Please wait a few seconds and try again.");
    }
  };

  const handleOpenUpiApp = () => {
    if (!upiUri) {
      setToast({ msg: "Payment session not ready. Please generate a QR first.", type: "error" });
      return;
    }

    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = ua.includes("android");

    if (isAndroid) {
      const params = upiUri.includes("?") ? upiUri.split("?")[1] : "";
      const fallback = encodeURIComponent("https://play.google.com/store/search?q=UPI+payment&c=apps");
      window.location.href = `intent://pay?${params}#Intent;scheme=upi;S.browser_fallback_url=${fallback};end`;
    } else {
      window.location.href = upiUri;
    }
  };

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
      const playStoreUrl = encodeURIComponent(`https://play.google.com/store/apps/details?id=${pkg}`);
      window.location.href = `intent://pay?${params}#Intent;scheme=upi;package=${pkg};S.browser_fallback_url=${playStoreUrl};end`;
    } else if (isIOS) {
      let targetUrl = scheme;
      if (!targetUrl.includes("?")) {
        targetUrl += targetUrl.endsWith("/") ? "?" : "/?";
      } else if (!targetUrl.endsWith("&") && !targetUrl.endsWith("?")) {
        targetUrl += "&";
      }
      window.location.href = `${targetUrl}${params}`;
    } else {
      window.location.href = `upi://pay?${params}`;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).catch(() => {
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
      {/* ── TOAST NOTIFICATION ─────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -24, scale: 0.93 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            className={`fixed top-20 right-3 sm:right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold border max-w-xs sm:max-w-sm backdrop-blur-md ${
              toast.type === "error"
                ? "bg-red-900/95 text-white border-red-400/40"
                : "bg-emerald-900/95 text-white border-emerald-400/40"
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
      {isPortalRoute ? (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-5 pb-2">
          <div className="relative overflow-hidden px-4 py-3.5 sm:px-8 sm:py-6 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-white border border-indigo-500/20 dark:border-indigo-500/30 shadow-lg shadow-indigo-600/10">
            <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white border border-white/30 text-[10px] font-black uppercase tracking-wider shadow-sm">
                  <Heart className="w-3.5 h-3.5 text-pink-300 fill-pink-300" />
                  {language === 'te' ? 'దాతృత్వము' : language === 'hi' ? 'उदार दान' : 'Generous Giving'}
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {t.pages.give.title}
                </h1>
                <p className="text-xs sm:text-sm text-indigo-100 dark:text-slate-100 font-medium italic opacity-95">
                  {t.pages.give.subtitle}
                </p>
              </div>
              <div className="hidden min-[640px]:flex items-center gap-3 bg-white/20 dark:bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/30 dark:border-white/20">
                <ShieldCheck className="w-5 h-5 text-emerald-300 dark:text-emerald-300" />
                <div className="text-left">
                  <p className="text-xs font-black text-white leading-none">Instant & Verified</p>
                  <p className="text-[10px] text-indigo-100 dark:text-slate-200 mt-0.5 font-semibold">Real-time UPI Transfer</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── MOBILE SEGMENTED TAB CONTROLLER ───────────────────── */}
          <div className="flex lg:hidden items-center justify-between gap-1 p-1 mt-3 bg-slate-200/80 dark:bg-slate-800/90 rounded-2xl border border-slate-300/70 dark:border-slate-700/70 shadow-inner">
            <button
              type="button"
              onClick={() => setMobileTab('form')}
              className={`flex-1 py-2 px-2 rounded-xl font-black text-[11px] sm:text-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition-all ${
                mobileTab === 'form'
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <QrCode className="w-3.5 h-3.5 shrink-0" />
              <span>Give</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('summary')}
              className={`flex-1 py-2 px-2 rounded-xl font-black text-[11px] sm:text-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition-all ${
                mobileTab === 'summary'
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Receipt className="w-3.5 h-3.5 shrink-0" />
              <span>Summary</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('ways')}
              className={`flex-1 py-2 px-2 rounded-xl font-black text-[11px] sm:text-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition-all ${
                mobileTab === 'ways'
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Building className="w-3.5 h-3.5 shrink-0" />
              <span>Bank Info</span>
            </button>
          </div>
        </div>
      ) : (
        <section className="relative py-8 sm:py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.08]" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-full text-white text-xs mb-3 shadow-xl font-bold"
              >
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <Heart className="h-4 w-4 text-pink-400 fill-pink-400" />
                <span className="font-medium tracking-wide">
                  {language === 'te' ? 'దాతృత్వము' : language === 'hi' ? 'उदार दान' : 'Generous Giving'}
                </span>
              </motion.div>

              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl sm:text-5xl font-black text-white mb-2 tracking-tight leading-tight"
              >
                {t.pages.give.title}
              </motion.h1>

              <motion.p 
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-xs sm:text-base text-slate-100 font-medium max-w-xl mx-auto leading-relaxed"
              >
                {t.pages.give.subtitle}
              </motion.p>
            </div>
          </div>
        </section>
      )}

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <section className="pt-2 sm:pt-6 pb-20 sm:pb-24 relative z-20">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          
          {loadingLists ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-5">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-indigo-100 dark:border-indigo-900/50" />
                <div className="absolute inset-0 w-14 h-14 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
              </div>
              <p className="text-slate-600 dark:text-slate-200 font-bold text-xs sm:text-sm">
                {language === 'te' ? 'కానుక ఎంపికలను లోడ్ చేస్తోంది...' : language === 'hi' ? 'दान विकल्प लोड हो रहे हैं...' : 'Loading giving options...'}
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-5 lg:gap-8 xl:gap-12 max-w-6xl mx-auto items-start">

              {/* ── LEFT: FORM CARD ───────────────────────── */}
              <div className={`lg:col-span-7 ${mobileTab === 'form' ? 'block' : 'hidden lg:block'}`}>
                <div ref={cardRef} className="bg-white dark:bg-slate-900 rounded-3xl shadow-md sm:shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                  
                  {/* Card Header Strip */}
                  <div className="px-3.5 sm:px-8 pt-4 sm:pt-6 pb-3.5 sm:pb-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-600/20 text-white shrink-0">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                            {language === 'te' ? 'తక్షణ UPI కానుక' : language === 'hi' ? 'త్వరిత్ యూపీఐ దాన్' : 'Instant UPI Giving'}
                          </h2>
                          <p className="text-slate-500 dark:text-slate-300 text-[11px] sm:text-xs font-medium">
                            {language === 'te' ? 'సురక్షితమైన డైనమిక్ QR ద్వారా' : language === 'hi' ? 'सुरक्षित डायनेमिक क्यूआर द्वारा' : 'Secure real-time transfers via Dynamic QR'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px] sm:text-[11px] font-extrabold border border-emerald-200 dark:border-emerald-800/60 self-start sm:self-auto">
                        <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        256-bit Encrypted
                      </div>
                    </div>

                    {/* Modern Step Progress Indicator */}
                    <div className="mt-4 sm:mt-5 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
                      {[
                        { num: 1, label: language === 'te' ? '1. వివరాలు నమోదు చేయండి' : language === 'hi' ? '1. विवरण दर्ज करें' : '1. Enter Details' },
                        { num: 2, label: language === 'te' ? '2. స్కాన్ & చెల్లించండి' : language === 'hi' ? '2. स्कैन और भुगतान' : '2. Scan & Pay' },
                      ].map((s) => (
                        <div key={s.num} className="flex-1 flex items-center gap-2 min-w-0">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                            step >= s.num
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                          }`}>
                            {step > s.num ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                          </div>
                          <span className={`text-xs truncate transition-colors ${
                            step >= s.num ? "text-slate-900 dark:text-white font-black" : "text-slate-600 dark:text-slate-300 font-bold"
                          }`}>
                            {s.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Error Banner */}
                  <AnimatePresence>
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mx-3.5 sm:mx-8 mt-3.5 overflow-hidden"
                      >
                        <div className="p-3 sm:p-3.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 text-red-800 dark:text-red-200 text-xs sm:text-sm rounded-2xl flex items-start gap-2.5 shadow-sm">
                          <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
                          <span className="font-bold">{errorMessage}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form Body */}
                  <div className="px-3.5 sm:px-8 py-4 sm:py-6">
                    <AnimatePresence mode="wait">
                      {step === 1 && (
                        <motion.div
                          key="step-1"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-5 sm:space-y-6"
                        >
                          {/* ── AMOUNT SELECTOR ─────────────── */}
                          <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                              <IndianRupee className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              {t.pages.give.presetsTitle}
                            </label>
                            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                              {["500", "1000", "2500", "5000", "10000"].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => { setAmount(preset); setCustomAmount(""); setErrorMessage(""); }}
                                  className={`py-2.5 sm:py-3 px-1.5 rounded-2xl border-2 text-center font-black text-xs sm:text-sm transition-all duration-200 active:scale-95 ${
                                    amount === preset && !customAmount
                                      ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02]"
                                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white hover:border-indigo-400 dark:hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-slate-700"
                                  }`}
                                >
                                  ₹{Number(preset).toLocaleString('en-IN')}
                                </button>
                              ))}

                              {/* Custom amount input */}
                              <div className="relative col-span-3 sm:col-span-1">
                                <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-black text-sm z-10 ${customAmount ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}>₹</span>
                                <input
                                  type="number"
                                  placeholder={t.pages.give.customPlaceholder}
                                  value={customAmount}
                                  onChange={(e) => { setCustomAmount(e.target.value); setAmount(""); setErrorMessage(""); }}
                                  className={`w-full py-2.5 sm:py-3 pl-7 pr-2 rounded-2xl border-2 font-black text-xs sm:text-sm transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none ${
                                    customAmount
                                      ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/70 ring-2 ring-indigo-500/20"
                                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500"
                                  }`}
                                />
                              </div>
                            </div>
                          </div>

                          {/* ── PURPOSE SELECTOR ────────────── */}
                          <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                              <Gift className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              {t.pages.give.purposeLabel}
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                              {purposes.map((p) => {
                                const codeKey = p.code || p.id;
                                const isSelected = selectedPurpose === p.code || selectedPurpose === p.id || selectedPurpose === codeKey;
                                const gradient = purposeColorMap[codeKey] || purposeColorMap[p.code] || "from-indigo-600 to-purple-600";
                                const icon = purposeIconMap[codeKey] || purposeIconMap[p.code] || <IndianRupee className="w-4 h-4" />;
                                const desc = getLanguagePurposeDesc(p);

                                return (
                                  <button
                                    key={p.id || p.code}
                                    type="button"
                                    onClick={() => { setSelectedPurpose(codeKey); setErrorMessage(""); }}
                                    className={`relative p-3 sm:p-3.5 rounded-2xl border-2 text-left transition-all duration-200 flex items-start gap-2.5 sm:gap-3 w-full cursor-pointer active:scale-[0.98] ${
                                      isSelected
                                        ? "bg-indigo-50/80 dark:bg-indigo-950/80 border-indigo-600 dark:border-indigo-400 text-slate-900 dark:text-white shadow-md ring-2 ring-indigo-500/20"
                                        : "border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-white hover:border-indigo-300 dark:hover:border-slate-600 hover:bg-slate-50/80 dark:hover:bg-slate-800"
                                    }`}
                                  >
                                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white bg-gradient-to-br ${gradient} shadow-sm mt-0.5`}>
                                      {icon}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <span className="block font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                                        {getLanguagePurposeName(p)}
                                      </span>
                                      {desc && (
                                        <span className="block text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-200 font-medium leading-tight mt-1 line-clamp-2">
                                          {desc}
                                        </span>
                                      )}
                                    </div>
                                    {isSelected && (
                                      <div className="w-5 h-5 bg-indigo-600 dark:bg-indigo-500 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                                        <Check className="w-3 h-3 stroke-[3]" />
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* ── BRANCH SELECTOR ─────────────── */}
                          <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                              <Home className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                              {language === 'te' ? 'చర్చి బ్రాంచ్' : language === 'hi' ? 'చర్చ శాఖ' : 'Church Branch'}
                            </label>
                            <div className="relative">
                              <select
                                value={selectedBranch}
                                onChange={(e) => { setSelectedBranch(e.target.value); setErrorMessage(""); }}
                                className="w-full py-2.5 sm:py-3 px-3.5 pr-10 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-500 focus:outline-none appearance-none transition-all text-xs sm:text-sm"
                              >
                                {branches.map((b) => (
                                  <option key={b.id} value={b.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                                    ⛪ {b.name}
                                  </option>
                                ))}
                              </select>
                              <ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                          </div>

                          {/* ── DONOR CONTACT INFO ───────────── */}
                          <div className="space-y-3 pt-1">
                            <div className="flex items-center gap-2">
                              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                              <span className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest">
                                {t.pages.give.contactTitle}
                              </span>
                              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="sm:col-span-2">
                                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-200 mb-1">
                                  {t.pages.give.fullNameLabel}
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder={t.pages.give.fullNamePlaceholder}
                                    value={donorName}
                                    onChange={(e) => { setDonorName(e.target.value); setErrorMessage(""); }}
                                    className="w-full py-2.5 px-3.5 pl-10 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold placeholder-slate-400 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-500 focus:outline-none transition-all text-xs sm:text-sm"
                                  />
                                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-600 dark:text-indigo-400 w-4 h-4" />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-200 mb-1">
                                  {t.pages.give.emailLabel}
                                </label>
                                <div className="relative">
                                  <input
                                    type="email"
                                    placeholder={t.pages.give.emailPlaceholder}
                                    value={donorEmail}
                                    onChange={(e) => { setDonorEmail(e.target.value); setErrorMessage(""); }}
                                    className="w-full py-2.5 px-3.5 pl-10 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold placeholder-slate-400 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-500 focus:outline-none transition-all text-xs sm:text-sm"
                                  />
                                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-600 dark:text-indigo-400 w-4 h-4" />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[11px] font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-200 mb-1">
                                  {t.pages.give.phoneLabel}
                                </label>
                                <div className="relative">
                                  <input
                                    type="tel"
                                    placeholder={t.pages.give.phonePlaceholder}
                                    value={donorPhone}
                                    onChange={(e) => setDonorPhone(e.target.value)}
                                    className="w-full py-2.5 px-3.5 pl-10 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold placeholder-slate-400 dark:placeholder-slate-400 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-500 focus:outline-none transition-all text-xs sm:text-sm"
                                  />
                                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-600 dark:text-indigo-400 w-4 h-4" />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ── SUBMIT BUTTON ────────────────── */}
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={handleGeneratePaymentSession}
                            className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white rounded-2xl font-extrabold text-xs sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/35 active:scale-[0.99] transition-all duration-300 disabled:opacity-60 relative overflow-hidden group"
                          >
                            {actionLoading ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {language === 'te' ? 'QR కోడ్‌ని రూపొందిస్తోంది...' : language === 'hi' ? 'क्यूఆర్ कोड जनरेट किया जा रहा है...' : 'Generating Dynamic QR...'}
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                                {language === 'te' ? 'QR కోడ్ పొంది చెల్లించండి' : language === 'hi' ? 'क्यूఆర్ कोड प्राप्त करें' : 'Generate Dynamic QR & Pay'}
                                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                              </>
                            )}
                          </button>
                        </motion.div>
                      )}

                      {step === 2 && (
                        /* ── STEP 2: SCAN & PAY ────────────── */
                        <motion.div
                          key="step-2"
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-4 sm:space-y-5"
                        >
                          {/* ── SUCCESS ANIMATION OVERLAY ─────────────────── */}
                          <AnimatePresence>
                            {paymentSuccess && (
                              <motion.div
                                key="success-overlay"
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                                className="w-full max-w-sm mx-auto flex flex-col items-center gap-4 py-8"
                              >
                                <div className="relative">
                                  <motion.div
                                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                                  >
                                    <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                                  </motion.div>
                                </div>
                                <div className="text-center space-y-1">
                                  <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                                    {language === 'te' ? '🎉 దాతృత్వం ధృవీకరించబడింది!' : language === 'hi' ? '🎉 दान सत्यापित हो गया!' : '🎉 Donation Verified!'}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">
                                    {language === 'te' ? 'రశీదుకు మళ్ళించబడుతోంది...' : language === 'hi' ? 'रसीद पर पुनर्निर्देशित किया जा रहा है...' : 'Generating official receipt...'}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {!paymentSuccess && (
                            <>
                              {/* ── EXPIRED STATE ───────────────────── */}
                              {isExpired ? (
                                <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-4 py-6 text-center">
                                  <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 flex items-center justify-center text-red-500">
                                    <ShieldAlert className="w-8 h-8" />
                                  </div>
                                  <div>
                                    <p className="font-extrabold text-base text-slate-900 dark:text-white">
                                      {language === 'te' ? 'QR కోడ్ గడువు ముగిసింది' : language === 'hi' ? 'QR कोड समाप्त हो गया' : 'QR Code Expired'}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-300 mt-1 font-medium">
                                      {language === 'te' ? 'కొత్త QR కోడ్ రూపొందించడానికి దిగువ క్లిక్ చేయండి.' : language === 'hi' ? 'नया QR कोड जनरेट करने के लिए नीचे क्लिक करें।' : 'Generates fresh 15-minute secure dynamic QR.'}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                                      if (socketRef.current) socketRef.current.disconnect();
                                      setStep(1);
                                    }}
                                    className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-95 text-xs sm:text-sm"
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                    {language === 'te' ? 'కొత్త QR రూపొందించండి' : language === 'hi' ? 'नया QR जनरेट करें' : 'Generate New QR'}
                                  </button>
                                </div>
                              ) : (
                                <>
                                  {/* ── ELEGANT INTEGRATED QR CARD ─────────── */}
                                  <div className="w-full max-w-xs sm:max-w-sm mx-auto bg-slate-950 p-4 sm:p-5 rounded-3xl text-white shadow-2xl border border-slate-800 relative overflow-hidden">
                                    
                                    {/* Ambient top glow */}
                                    <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

                                    {/* Timer & Status Header inside Card */}
                                    <div className="flex items-center justify-between px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 mb-3.5">
                                      <div className="flex items-center gap-1.5">
                                        <span className="relative flex h-2.5 w-2.5">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                                        </span>
                                        <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">Live Dynamic QR</span>
                                      </div>

                                      <div className="flex items-center gap-1 text-[11px] sm:text-xs font-mono font-black text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/30">
                                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                        <span>{timeLeft}</span>
                                      </div>
                                    </div>

                                    {/* Framed QR Code */}
                                    <div className="relative bg-white rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col items-center justify-center mx-auto max-w-[210px] sm:max-w-[230px]">
                                      {/* Corner Crosshair Accents */}
                                      <div className="absolute top-2 left-2 w-3.5 h-3.5 sm:w-4 sm:h-4 border-t-2 border-l-2 border-indigo-600 rounded-tl-sm" />
                                      <div className="absolute top-2 right-2 w-3.5 h-3.5 sm:w-4 sm:h-4 border-t-2 border-r-2 border-indigo-600 rounded-tr-sm" />
                                      <div className="absolute bottom-2 left-2 w-3.5 h-3.5 sm:w-4 sm:h-4 border-b-2 border-l-2 border-indigo-600 rounded-bl-sm" />
                                      <div className="absolute bottom-2 right-2 w-3.5 h-3.5 sm:w-4 sm:h-4 border-b-2 border-r-2 border-indigo-600 rounded-br-sm" />

                                      {qrCodeData ? (
                                        <img
                                          src={qrCodeData}
                                          alt="Dynamic UPI QR Code"
                                          className="w-40 h-40 sm:w-48 sm:h-48 object-contain"
                                        />
                                      ) : (
                                        <div className="w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
                                          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                        </div>
                                      )}
                                    </div>

                                    {/* Church Name & Amount summary */}
                                    <div className="mt-3 text-center">
                                      <p className="text-[11px] sm:text-xs font-bold text-slate-300">{churchName}</p>
                                      <p className="text-base sm:text-lg font-black text-white mt-0.5 tracking-tight">
                                        ₹{displayAmount.toLocaleString("en-IN")}
                                      </p>
                                    </div>

                                    {/* UPI Address Box - Responsive */}
                                    <div className="mt-3 bg-white/10 backdrop-blur-md border border-white/15 p-2.5 sm:px-3.5 sm:py-2 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                                      <div className="min-w-0 flex-1">
                                        <span className="block text-[9px] uppercase font-bold text-indigo-300 tracking-wider">
                                          Official VPA / UPI ID
                                        </span>
                                        <span className="text-white font-mono font-bold text-xs truncate block select-all">
                                          {upiId}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => copyToClipboard(upiId, "UPI ID")}
                                        className="w-full sm:w-auto px-2.5 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-white text-xs font-bold transition-all flex items-center justify-center gap-1 border border-white/20 flex-shrink-0 active:scale-95"
                                      >
                                        {copiedLabel === "UPI ID" ? (
                                          <><Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" /> Copied</>
                                        ) : (
                                          <><Copy className="w-3.5 h-3.5" /> Copy VPA</>
                                        )}
                                      </button>
                                    </div>
                                  </div>

                                  {/* ── UNIFIED PAYMENT ACTION BLOCK ──────────── */}
                                  <div className="w-full max-w-xs sm:max-w-sm mx-auto space-y-3">
                                    
                                    {/* Primary Mobile App Launcher */}
                                    <button
                                      type="button"
                                      onClick={handleOpenUpiApp}
                                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-600/30 hover:shadow-2xl hover:shadow-indigo-600/40 active:scale-[0.99] transition-all"
                                    >
                                      <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                                      <span>
                                        {language === 'te' ? 'UPI యాప్‌లో తెరవండి' : language === 'hi' ? 'UPI ऐप में खोलें' : 'Open in UPI App'}
                                      </span>
                                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                                    </button>

                                    {/* Direct App Launch Grid */}
                                    <div>
                                      <p className="text-[10px] font-extrabold text-slate-500 dark:text-slate-300 uppercase tracking-widest text-center mb-2">
                                        {language === 'te' ? '— లేదా నేరుగా యాప్ ద్వారా —' : language === 'hi' ? '— या सीधे ऐप द्वारा —' : '— Or launch directly with —'}
                                      </p>
                                      
                                      <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
                                        {UPI_APPS.map((app) => (
                                          <button
                                            key={app.name}
                                            type="button"
                                            onClick={() => handleOpenSpecificApp(app.pkg, app.scheme)}
                                            className={`flex flex-col items-center justify-center gap-1 p-1.5 sm:p-2 rounded-2xl border transition-all active:scale-90 hover:shadow-md cursor-pointer ${app.bgClass}`}
                                            title={`Pay with ${app.name}`}
                                          >
                                            {app.svg}
                                            <span className="text-[9px] sm:text-[10px] font-black tracking-tight leading-none truncate max-w-full text-slate-800 dark:text-slate-100">
                                              {app.name}
                                            </span>
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Copy Payment Link */}
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(upiUri, "LINK")}
                                      className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
                                    >
                                      {copiedLabel === "LINK" ? (
                                        <><Check className="w-4 h-4 text-emerald-500 stroke-[3]" /> {language === 'te' ? 'లింక్ కాపీ అయింది!' : language === 'hi' ? 'लिंक कॉपी हो गया!' : 'Payment link copied!'}</>
                                      ) : (
                                        <><Copy className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> {language === 'te' ? 'చెల్లింపు లింక్ కాపీ' : language === 'hi' ? 'भुगतान लिंक कॉपी' : 'Copy Payment Link'}</>
                                      )}
                                    </button>

                                    {/* Auto-Verification Pulse Bar */}
                                    <div className="p-2.5 sm:p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-200 dark:border-emerald-700/60 flex items-center gap-2.5 sm:gap-3">
                                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                                        <Activity className="w-4 h-4 animate-pulse" />
                                      </div>
                                      <div className="text-left flex-1 min-w-0">
                                        <p className="font-extrabold text-[11px] sm:text-xs text-emerald-900 dark:text-emerald-100">Real-Time Verification Active</p>
                                        <p className="text-[10px] sm:text-[11px] text-emerald-700 dark:text-emerald-200 leading-tight font-medium">Listening for payment confirmation from bank...</p>
                                      </div>
                                    </div>

                                    {/* Verification & Navigation Buttons - Full-width stack on Mobile */}
                                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                                      <button
                                        type="button"
                                        disabled={verificationLoading || isExpired}
                                        onClick={handleVerifyPayment}
                                        className="w-full sm:flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-xl active:scale-[0.99] disabled:opacity-60"
                                      >
                                        {verificationLoading ? (
                                          <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                                        ) : (
                                          <><CheckCircle2 className="h-4 w-4 stroke-[2.5]" /> {language === 'te' ? 'చెల్లించాను — ధృవీకరించు' : language === 'hi' ? 'भुगतान किया — सत्यापित करें' : "I've Paid — Verify Now"}</>
                                        )}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                                          if (socketRef.current) socketRef.current.disconnect();
                                          setStep(1);
                                        }}
                                        className="w-full sm:w-auto px-4 py-2.5 sm:py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1 active:scale-95"
                                      >
                                        <ArrowLeft className="w-4 h-4" />
                                        {t.pages.give.backBtn}
                                      </button>
                                    </div>
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

              {/* ── RIGHT: SIDEBAR ────────────────────────── */}
              <div className={`lg:col-span-5 space-y-4 ${mobileTab === 'summary' ? 'block' : 'hidden lg:block'}`}>

                {/* Giving Summary Card */}
                <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-md sm:shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
                  <div className="relative p-4 sm:p-6 space-y-4 sm:space-y-5">
                    {/* Header */}
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white">
                        {t.pages.give.summaryTitle}
                      </h3>
                    </div>

                    {/* Details Rows */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-300 font-extrabold">{t.pages.give.summaryType}</span>
                        <span className="font-black text-xs bg-indigo-600 text-white dark:bg-indigo-600 dark:text-white border border-indigo-500 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                          {activePurposeObj ? getLanguagePurposeName(activePurposeObj) : selectedPurpose}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-300 font-extrabold">{t.pages.give.summaryMethod}</span>
                        <span className="font-extrabold text-xs bg-purple-600 text-white dark:bg-purple-600 dark:text-white flex items-center gap-1.5 border border-purple-500 px-2.5 py-1 rounded-xl shadow-sm">
                          <QrCode className="w-3.5 h-3.5 text-white" />
                          Dynamic UPI QR
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-300 font-extrabold">{t.pages.give.summaryTax}</span>
                        <span className="font-black text-xs text-white bg-emerald-600 dark:bg-emerald-600 border border-emerald-500 px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm">
                          <CheckCircle className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                          {t.pages.give.summaryTaxValue}
                        </span>
                      </div>
                    </div>

                    {/* Total Amount Row */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">{t.pages.give.summaryTotal}</span>
                      <span className="text-xl sm:text-2xl font-black flex items-center gap-0.5 text-indigo-600 dark:text-indigo-300">
                        <IndianRupee className="w-5 h-5 stroke-[2.5]" />
                        {displayAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Giving History */}
                {mounted && user && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-md sm:shadow-xl overflow-hidden">
                    <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                          {t.pages.give.liveHistoryTitle}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{t.pages.give.liveHistorySubtitle}</p>
                      </div>
                      <button 
                        onClick={() => loadHistory()} 
                        disabled={historyLoading}
                        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-slate-200 dark:border-slate-700"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${historyLoading ? "animate-spin" : ""}`} />
                      </button>
                    </div>

                    <div className="px-4 sm:px-5 py-3.5 sm:py-4">
                      {historyLoading && history.length === 0 ? (
                        <div className="py-6 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                        </div>
                      ) : history.length === 0 ? (
                        <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                          <Receipt className="w-6 h-6 text-slate-300 dark:text-slate-700 mx-auto mb-1.5" />
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{t.pages.give.noRecords}</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
                          {history.map((item) => (
                            <div
                              key={item.id}
                              className="p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-between text-xs hover:border-indigo-300 transition-all"
                            >
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px]">
                                    {item.purposeRelation?.nameEn || item.purpose}
                                  </span>
                                  <span className="text-[9px] text-slate-500 dark:text-slate-400">
                                    {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                  </span>
                                </div>
                                <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-mono truncate">
                                  UTR: {item.razorpayPaymentId || "Pending"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="font-black text-slate-900 dark:text-white">
                                  ₹{item.amount.toLocaleString("en-IN")}
                                </span>
                                <a
                                  href={`/give/receipt/${item.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-all"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Scripture Card (Malachi 3:10) */}
                <div className="bg-amber-50 dark:bg-amber-950/60 rounded-3xl p-4 sm:p-5 border border-amber-200 dark:border-amber-700/60 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0 shadow-md text-white">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-amber-950 dark:text-amber-200 text-xs mb-1">{t.pages.give.malachiTitle}</h4>
                      <p className="text-amber-900 dark:text-amber-100 text-xs leading-relaxed italic font-semibold">{t.pages.give.malachiDesc}</p>
                    </div>
                  </div>
                </div>

                {/* Need Assistance Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-md">
                  <h4 className="font-black text-slate-900 dark:text-white text-xs mb-1">{t.pages.give.helpTitle}</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs mb-3 font-medium">{t.pages.give.helpDesc}</p>
                  <div className="space-y-2">
                    <a 
                      href="mailto:kingofchristministries23@gmail.com" 
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-300 transition-all group"
                    >
                      <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      <span className="truncate underline underline-offset-2">kingofchristministries23@gmail.com</span>
                    </a>
                    <div className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white">
                      <Phone className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                      <a href="tel:+919704090069" className="hover:text-indigo-600 dark:hover:text-indigo-300 hover:underline">+91 97040 90069</a>
                      <span className="text-slate-400 dark:text-slate-500">|</span>
                      <a href="tel:+919640943777" className="hover:text-indigo-600 dark:hover:text-indigo-300 hover:underline">+91 96409 43777</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── OTHER WAYS TO GIVE ────────────────────────────── */}
      <section className={`py-10 sm:py-16 border-t border-slate-200/80 dark:border-slate-800 ${mobileTab === 'ways' ? 'block' : 'hidden lg:block'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1.5 sm:mb-2">
                {language === 'te' ? 'కానుకలు ఇవ్వడానికి ఇతర మార్గాలు' : language === 'hi' ? 'दान करने के अन्य तरीके' : 'Other Ways to Give'}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium">
                {language === 'te' ? 'మీకు అనుకూలమైన పద్ధతిని ఎంచుకోండి' : language === 'hi' ? 'अपनी सुविधा के अनुसार तरीका चुनें' : 'Choose the method that works best for you'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              {/* Bank Transfer Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-start gap-3.5 sm:gap-4 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-md shadow-indigo-600/20 text-white flex-shrink-0">
                    <Building className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {language === 'te' ? 'బ్యాంక్ బదిలీ / NEFT / IMPS' : language === 'hi' ? 'बैंक ट्रांसफर / NEFT / IMPS' : 'Bank Transfer / NEFT / IMPS'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                      {language === 'te' ? 'పెద్ద దశమభాగాలకు అనుకూలమైనది.' : language === 'hi' ? 'बड़े दान के लिए बिल्कुल सही।' : 'Perfect for larger tithings and bulk offerings.'}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/70 rounded-2xl p-3.5 sm:p-4 space-y-2 text-xs border border-slate-100 dark:border-slate-700">
                  {[
                    { label: 'Account Name', value: 'Kingdom of Christ Ministries' },
                    { label: 'Account Number', value: '12041203940129', mono: true },
                    { label: 'IFSC Code', value: 'UTIB0001092', mono: true },
                    { label: 'Bank Branch', value: 'Axis Bank, Jeedimetla' },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center border-b border-slate-200/60 dark:border-slate-700/50 last:border-0 pb-1.5 last:pb-0">
                      <span className="text-slate-600 dark:text-slate-300 font-bold text-[11px] sm:text-xs">{row.label}:</span>
                      <span className={`font-extrabold text-[11px] sm:text-xs text-slate-900 dark:text-white ${row.mono ? "font-mono text-indigo-600 dark:text-indigo-300" : ""}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Envelope Giving Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-start gap-3.5 sm:gap-4 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-md shadow-rose-500/20 text-white flex-shrink-0">
                    <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {language === 'te' ? 'వ్యక్తిగతంగా ఎన్వలప్ కానుక' : language === 'hi' ? 'व्यक्तिगत लिफाफा दान' : 'In-Person Envelope Giving'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                      {language === 'te' ? 'మా చర్చిలలో ఆరాధన సమయంలో కానుకలు ఇవ్వండి.' : language === 'hi' ? 'किसी भी चर्च स्थान पर पूजा के दौरान अर्पित करें।' : 'Place your offering during any worship service at our locations.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  {branches.map((b) => (
                    <div
                      key={b.id}
                      className="bg-slate-50 dark:bg-slate-800/80 p-2.5 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-sm"
                    >
                      <span className="text-lg sm:text-xl block mb-1">⛪</span>
                      <span className="text-[10px] sm:text-xs font-black block truncate text-slate-900 dark:text-white tracking-wide">{b.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
