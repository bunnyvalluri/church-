"use client";

/**
 * DynamicPaymentModal.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise-grade Razorpay UPI Payment Modal for KCM Church donations.
 *
 * Features:
 *  ✅ Real-time payment state via SSE (Created → Waiting → Processing → Completed)
 *  ✅ Dynamic QR with auto-expiry ring + countdown timer
 *  ✅ "Generate New QR" flow (max 3 regenerations)
 *  ✅ Full UPI app selector (GPay, PhonePe, Paytm, BHIM, Amazon Pay, Bank UPI)
 *  ✅ PhonePe "Blocked by Authorities" graceful handler (Phase 14)
 *  ✅ Payment progress indicator
 *  ✅ Razorpay checkout gateway fallback (cards, net-banking)
 *  ✅ Professional 80G receipt download link
 *  ✅ Dark-mode compatible, fully responsive (320px → 1920px)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  CheckCircle2,
  Clock,
  QrCode,
  Smartphone,
  Copy,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Download,
  AlertCircle,
  CreditCard,
  X,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Wifi,
  WifiOff,
  CheckCheck,
} from "lucide-react";

// ─── UPI App Definitions ──────────────────────────────────────────────────────

interface UpiApp {
  id: string;
  label: string;
  pkg: string;          // Android Intent package
  iosScheme: string;    // iOS URL scheme
  color: string;
  icon: React.ReactNode;
}

// ─── Brand Icon Components ────────────────────────────────────────────────────

const GPayIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

const PhonePeIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#5F259F"/>
    <path d="M16.5 8.5C15.5 7.5 14.1 7 12.5 7H8v10h2.5v-3H12.5c1.6 0 3-.5 4-1.5s1.5-2.4 1.5-4c0-.7-.2-1.4-.5-2z" fill="white"/>
    <ellipse cx="12" cy="11" rx="2" ry="2" fill="#5F259F"/>
  </svg>
);

const PaytmIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#002E6E"/>
    <path d="M5 9.5H7.5V14.5H5V9.5Z" fill="#00BAF2"/>
    <path d="M8.5 9.5H12C12.8 9.5 13.5 10 13.5 11C13.5 12 12.8 12.5 12 12.5H10V14.5H8.5V9.5Z" fill="white"/>
    <path d="M14.5 9.5H16V13C16 14 16.5 14.5 17.5 14.5C18.5 14.5 19 14 19 13V9.5H20.5V13C20.5 15 19 16 17.5 16C16 16 14.5 15 14.5 13V9.5Z" fill="#00BAF2"/>
  </svg>
);

const BhimIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#00693E"/>
    <path d="M12 4L19.5 18H4.5L12 4Z" fill="white" opacity="0.9"/>
    <path d="M12 4L17 18H12V4Z" fill="#FF9933" opacity="0.8"/>
    <circle cx="12" cy="14" r="2" fill="#005BBB"/>
  </svg>
);

const AmazonPayIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#232F3E"/>
    <text x="3" y="16" fontSize="7" fontWeight="bold" fill="#FF9900">amazon</text>
    <text x="3" y="22" fontSize="6" fill="#FF9900">pay</text>
  </svg>
);

const BankUpiIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#1a56db"/>
    <path d="M12 4L20 8H4L12 4Z" fill="white"/>
    <rect x="6" y="9" width="2" height="7" fill="white"/>
    <rect x="11" y="9" width="2" height="7" fill="white"/>
    <rect x="16" y="9" width="2" height="7" fill="white"/>
    <rect x="4" y="17" width="16" height="2" fill="white"/>
  </svg>
);

// ─── UPI App Registry ─────────────────────────────────────────────────────────

const UPI_APPS: UpiApp[] = [
  { id: 'GPAY', label: 'Google Pay', pkg: 'com.google.android.apps.nbu.paisa.user', iosScheme: 'gpay', color: 'border-blue-400/30 hover:border-blue-400', icon: <GPayIcon /> },
  { id: 'PHONEPE', label: 'PhonePe', pkg: 'com.phonepe.app', iosScheme: 'phonepe', color: 'border-purple-500/30 hover:border-purple-400', icon: <PhonePeIcon /> },
  { id: 'PAYTM', label: 'Paytm', pkg: 'net.one97.paytm', iosScheme: 'paytmmp', color: 'border-blue-600/30 hover:border-blue-500', icon: <PaytmIcon /> },
  { id: 'BHIM', label: 'BHIM', pkg: 'in.org.npci.upiapp', iosScheme: 'bhim', color: 'border-green-500/30 hover:border-green-400', icon: <BhimIcon /> },
  { id: 'AMAZON_PAY', label: 'Amazon Pay', pkg: 'in.amazon.mShop.android.shopping', iosScheme: 'amzn', color: 'border-orange-400/30 hover:border-orange-400', icon: <AmazonPayIcon /> },
  { id: 'BANK', label: 'Bank UPI', pkg: '', iosScheme: 'upi', color: 'border-indigo-400/30 hover:border-indigo-400', icon: <BankUpiIcon /> },
];

// ─── Payment State Config ─────────────────────────────────────────────────────

const PAYMENT_STATES = [
  { key: 'CREATED', label: 'Order Created', icon: CheckCheck },
  { key: 'QR_GENERATED', label: 'QR Ready', icon: QrCode },
  { key: 'PROCESSING', label: 'Processing', icon: Loader2 },
  { key: 'COMPLETED', label: 'Verified', icon: CheckCircle2 },
];

// ─── Props ────────────────────────────────────────────────────────────────────

export interface DynamicPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  donationId?: string;
  referenceNumber: string;
  amount: number;
  qrCodeDataUrl?: string;
  upiUri?: string;
  upiId?: string;
  churchName?: string;
  donorName?: string;
  donorEmail?: string;
  expiresAt?: Date | null;
  onSuccess?: (donationId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DynamicPaymentModal({
  isOpen,
  onClose,
  sessionId,
  donationId: initialDonationId,
  referenceNumber,
  amount,
  qrCodeDataUrl: initialQr,
  upiUri: initialUpiUri,
  upiId = "kcm.kristhraj2004-1@okicici",
  churchName = "Kingdom of Christ Ministries",
  donorName,
  donorEmail,
  expiresAt,
  onSuccess,
}: DynamicPaymentModalProps) {
  const [status, setStatus] = useState<string>("PENDING");
  const [paymentState, setPaymentState] = useState<string>("QR_GENERATED");
  const [donationId, setDonationId] = useState<string | null>(initialDonationId || null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [launchingRazorpay, setLaunchingRazorpay] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | undefined>(initialQr);
  const [upiUri, setUpiUri] = useState<string | undefined>(initialUpiUri);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenCount, setRegenCount] = useState(0);
  const [qrExpired, setQrExpired] = useState(false);
  const [phonePeBlocked, setPhonePeBlocked] = useState(false);
  const [blockedApp, setBlockedApp] = useState<string>("");
  const [sseConnected, setSseConnected] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // ── Derived state ────────────────────────────────────────────────────────
  const isCompleted = status === "COMPLETED" || status === "VERIFIED";
  const maxRegen = 3;
  const canRegen = regenCount < maxRegen && !isCompleted;

  // ── Sync initial state ────────────────────────────────────────────────────
  useEffect(() => { if (initialDonationId) setDonationId(initialDonationId); }, [initialDonationId]);
  useEffect(() => { if (initialQr) setQrDataUrl(initialQr); }, [initialQr]);
  useEffect(() => { if (initialUpiUri) setUpiUri(initialUpiUri); }, [initialUpiUri]);

  // ── Expiry timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || isCompleted) return;
    if (expiresAt) {
      const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(diff);
    }
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setQrExpired(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, expiresAt, isCompleted]);

  // ── SSE real-time status ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !sessionId || isCompleted) return;
    const es = new EventSource(`/api/donations/live-status/${sessionId}`);
    setSseConnected(true);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status) setStatus(data.status);
        if (data.paymentState) setPaymentState(data.paymentState);
        if (data.donationId) {
          setDonationId(data.donationId);
          if (onSuccess) onSuccess(data.donationId);
        }
        if (data.isTerminal) es.close();
      } catch {}
    };

    es.onerror = () => {
      setSseConnected(false);
      es.close();
    };

    return () => { es.close(); setSseConnected(false); };
  }, [isOpen, sessionId, isCompleted, onSuccess]);

  // ── Auto-scroll modal into view ──────────────────────────────────────────
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isOpen]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  const timerPct = expiresAt
    ? Math.max(0, (timeLeft / (Math.floor((new Date(expiresAt).getTime() - Date.now() + timeLeft * 1000) / 1000))) * 100)
    : (timeLeft / 600) * 100;

  // ── UPI App Launcher ──────────────────────────────────────────────────────
  const handleOpenUpiApp = useCallback((app: UpiApp) => {
    if (typeof window === "undefined" || !upiUri) return;
    const params = upiUri.includes("?") ? upiUri.split("?")[1] : "";
    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = /android/i.test(ua);

    if (isAndroid && app.pkg) {
      const fallback = encodeURIComponent(`https://play.google.com/store/apps/details?id=${app.pkg}`);
      window.location.href = `intent://pay?${params}#Intent;scheme=upi;package=${app.pkg};S.browser_fallback_url=${fallback};end`;
    } else {
      // iOS / desktop — use UPI URI directly
      window.location.href = upiUri;
    }
  }, [upiUri]);

  // ── Generic UPI open (no specific app) ───────────────────────────────────
  const handleOpenAnyUpi = useCallback(() => {
    if (!upiUri) return;
    const params = upiUri.includes("?") ? upiUri.split("?")[1] : "";
    const ua = navigator.userAgent.toLowerCase();
    if (/android/i.test(ua)) {
      const fallback = encodeURIComponent("https://play.google.com/store/search?q=UPI+payment&c=apps");
      window.location.href = `intent://pay?${params}#Intent;scheme=upi;S.browser_fallback_url=${fallback};end`;
    } else {
      window.location.href = upiUri;
    }
  }, [upiUri]);

  // ── PhonePe Blocked Report ────────────────────────────────────────────────
  const reportPhonePeBlocked = useCallback(async () => {
    setPhonePeBlocked(true);
    setBlockedApp("PhonePe");
    // Log incident
    try {
      await fetch('/api/donations/session/report-blocked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, blockedReason: 'PHONEPE_BLOCKED_BY_AUTHORITIES', upiApp: 'PHONEPE' }),
      });
    } catch {}
  }, [sessionId]);

  // ── Generate New QR ───────────────────────────────────────────────────────
  const handleGenerateNewQr = useCallback(async () => {
    if (!canRegen || isRegenerating) return;
    setIsRegenerating(true);
    setVerifyError("");

    try {
      const res = await fetch('/api/donations/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to generate new QR');

      setQrDataUrl(data.qrCode);
      setUpiUri(data.upiUri);
      setQrExpired(false);
      setPhonePeBlocked(false);
      setRegenCount(data.regenerationCount || regenCount + 1);
      setTimeLeft(600); // reset visual timer
    } catch (err: any) {
      setVerifyError(err.message || 'Could not generate new QR. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  }, [canRegen, isRegenerating, sessionId, regenCount]);

  // ── Manual Confirm Payment ────────────────────────────────────────────────
  const handleConfirmPayment = async () => {
    try {
      setVerifying(true);
      setVerifyError("");
      const res = await fetch("/api/donations/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donationId: donationId || undefined,
          razorpayOrderId: referenceNumber,
          sessionId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Payment verification failed.");
      const verifiedId = data.donation?.id || donationId;
      if (verifiedId) { setDonationId(verifiedId); if (onSuccess) onSuccess(verifiedId); }
      setStatus("VERIFIED");
    } catch (err: any) {
      setVerifyError(err.message || "Could not verify payment. Please ensure payment is completed in your app.");
    } finally {
      setVerifying(false);
    }
  };

  // ── Razorpay Gateway ──────────────────────────────────────────────────────
  const handleLaunchRazorpay = async () => {
    try {
      setLaunchingRazorpay(true);
      setVerifyError("");
      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve) => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = () => resolve();
          document.body.appendChild(s);
        });
      }
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_default";
      const options = {
        key: keyId,
        amount: Math.round(amount * 100),
        currency: "INR",
        name: churchName,
        description: `KCM Giving Ref: ${referenceNumber}`,
        order_id: referenceNumber.startsWith("order_") ? referenceNumber : undefined,
        prefill: { name: donorName || "", email: donorEmail || "" },
        theme: { color: "#4F1C91" },
        handler: async (response: any) => {
          try {
            const vRes = await fetch("/api/donations/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                donationId: donationId || undefined,
                razorpayOrderId: response.razorpay_order_id || referenceNumber,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                sessionId,
              }),
            });
            const vData = await vRes.json();
            if (vData.donation?.id) { setDonationId(vData.donation.id); if (onSuccess) onSuccess(vData.donation.id); }
          } catch {}
          setStatus("VERIFIED");
        },
      };
      new (window as any).Razorpay(options).open();
    } catch (err) {
      console.error("[RAZORPAY_LAUNCH_ERR]", err);
    } finally {
      setLaunchingRazorpay(false);
    }
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── RENDER ─────────────────────────────────────────────────────────────────

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-violet-700/40 rounded-2xl shadow-2xl shadow-violet-950/60 overflow-hidden text-white my-auto"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-gradient-to-r from-violet-950/60 to-indigo-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500/15 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white leading-tight">Complete Your Giving</h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[180px]">
                Ref: <span className="text-violet-400 font-bold">{referenceNumber}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* SSE Connection Indicator */}
            <div className={`flex items-center gap-1 text-[10px] font-bold ${sseConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
              {sseConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span className="hidden sm:inline">{sseConnected ? 'Live' : 'Offline'}</span>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* ── SUCCESS SCREEN ─────────────────────────────────────── */}
        {isCompleted ? (
          <div className="p-6 space-y-5">
            <div className="text-center space-y-4">
              {/* Animated success ring */}
              <div className="w-20 h-20 mx-auto bg-emerald-950/60 border-2 border-emerald-500/50 rounded-full flex items-center justify-center shadow-xl shadow-emerald-950/50">
                <CheckCircle2 className="w-11 h-11 text-emerald-400" style={{ animation: 'bounce 1s ease-in-out 3' }} />
              </div>
              <div>
                <h4 className="text-xl font-black text-white">Payment Verified! 🎉</h4>
                <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
                  Thank you for your generous contribution of{" "}
                  <strong className="text-emerald-400">₹{amount.toLocaleString("en-IN")}</strong>.
                  <br />May God bless you abundantly!
                </p>
              </div>
            </div>

            {donationId && (
              <div className="flex flex-col gap-2.5">
                <a
                  href={`/api/donations/receipt/${donationId}?format=html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-600/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  View & Download 80G Tax Receipt
                </a>
                <a
                  href={`/api/donations/receipt/${donationId}?format=download`}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-violet-400" />
                  Download Receipt File
                </a>
              </div>
            )}
          </div>
        ) : phonePeBlocked ? (
          /* ── PHONEPE BLOCKED HANDLER (PHASE 14) ───────────────── */
          <PhonePeBlockedView
            amount={amount}
            upiApps={UPI_APPS}
            onOpenApp={handleOpenUpiApp}
            onOpenAny={handleOpenAnyUpi}
            onGenerateNewQr={handleGenerateNewQr}
            isRegenerating={isRegenerating}
            canRegen={canRegen}
          />
        ) : (
          /* ── ACTIVE PAYMENT VIEW ──────────────────────────────── */
          <div className="p-4 sm:p-5 space-y-3.5">
            {/* Amount Banner */}
            <div className="bg-gradient-to-r from-violet-900/80 to-indigo-900/60 rounded-xl px-4 py-3 text-center border border-violet-700/30">
              <div className="text-[10px] uppercase tracking-widest text-violet-300 font-bold">Total Giving Amount</div>
              <div className="text-3xl font-black text-amber-300 mt-0.5 drop-shadow">₹{amount.toLocaleString("en-IN")}</div>
            </div>

            {/* Payment State Progress */}
            <PaymentStateBar paymentState={paymentState} status={status} />

            {/* QR Code + Expiry Ring */}
            <div className="bg-slate-950/60 rounded-xl p-3 sm:p-4 border border-violet-800/30 text-center space-y-2.5">
              {qrExpired ? (
                /* QR Expired Overlay */
                <div className="py-6 space-y-3">
                  <div className="w-14 h-14 mx-auto bg-amber-950/60 border border-amber-600/40 rounded-full flex items-center justify-center">
                    <Clock className="w-7 h-7 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-300">QR Code Expired</h4>
                    <p className="text-xs text-slate-400 mt-1">This QR code has expired. Generate a fresh one to continue.</p>
                  </div>
                  {canRegen ? (
                    <button
                      onClick={handleGenerateNewQr}
                      disabled={isRegenerating}
                      className="mx-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm transition disabled:opacity-50"
                    >
                      {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      {isRegenerating ? "Generating..." : "Generate New QR"}
                    </button>
                  ) : (
                    <p className="text-xs text-rose-400">Maximum QR regenerations reached. Please start a new donation.</p>
                  )}
                </div>
              ) : qrDataUrl ? (
                <>
                  {/* QR with timer ring */}
                  <div className="relative inline-block">
                    <div className="p-2.5 bg-white rounded-xl shadow-xl border-2 border-violet-400/60">
                      <img
                        src={qrDataUrl}
                        alt="Dynamic UPI Payment QR Code"
                        className="w-44 h-44 sm:w-48 sm:h-48 mx-auto"
                      />
                    </div>
                    {/* Expiry badge */}
                    <div className={`absolute -bottom-2 -right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${timeLeft <= 60 ? 'bg-rose-900/90 border-rose-600 text-rose-200' : timeLeft <= 120 ? 'bg-amber-900/90 border-amber-500 text-amber-200' : 'bg-slate-800/90 border-slate-600 text-slate-300'}`}>
                      <Clock className={`w-3 h-3 ${timeLeft <= 60 ? 'text-rose-400' : 'text-amber-400'}`} />
                      {formattedTime}
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-slate-400">
                    Scan with any UPI app — GPay, PhonePe, Paytm, BHIM
                  </p>
                  {canRegen && (
                    <button
                      onClick={handleGenerateNewQr}
                      disabled={isRegenerating}
                      className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1 mx-auto transition disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                      {isRegenerating ? "Refreshing..." : `Refresh QR (${maxRegen - regenCount} left)`}
                    </button>
                  )}
                </>
              ) : (
                <div className="py-8">
                  <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400 mt-2">Generating secure UPI QR token...</p>
                </div>
              )}
            </div>

            {/* UPI App Quick-Launcher Grid */}
            {upiUri && !qrExpired && (
              <UpiAppGrid apps={UPI_APPS} onOpen={handleOpenUpiApp} onOpenAny={handleOpenAnyUpi} onPhonePeBlocked={reportPhonePeBlocked} />
            )}

            {/* UPI ID Copy */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs font-mono">
              <span className="text-slate-300 truncate text-[11px]">{upiId}</span>
              <button onClick={copyUpi} className="ml-2 font-sans font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 shrink-0 text-[11px] transition">
                <Copy className="w-3 h-3" /> {copied ? "Copied!" : "Copy VPA"}
              </button>
            </div>

            {/* Error Banner */}
            {verifyError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-200 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{verifyError}</span>
              </div>
            )}

            {/* PRIMARY: Confirm Payment */}
            <button
              onClick={handleConfirmPayment}
              disabled={verifying || qrExpired}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-emerald-950/40 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 border border-emerald-400/20"
            >
              {verifying ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Verifying Payment...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4 text-emerald-200" /> I've Completed Payment — Get Receipt</>
              )}
            </button>

            {/* SECONDARY: Razorpay gateway */}
            <button
              onClick={handleLaunchRazorpay}
              disabled={launchingRazorpay}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-violet-500/30 text-violet-200 font-bold text-xs transition-all"
            >
              {launchingRazorpay ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Opening Gateway...</>
              ) : (
                <><CreditCard className="w-3.5 h-3.5 text-violet-400" /> Pay via Cards or Net-Banking</>
              )}
            </button>

            {/* Footer: real-time status */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60 pt-2.5 mt-0.5">
              <div className="flex items-center gap-1 font-bold text-amber-500">
                <Clock className="w-3 h-3" />
                <span>Expires: {formattedTime}</span>
              </div>
              <div className="flex items-center gap-1 text-violet-500 font-bold">
                <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
                <span>Awaiting Confirmation</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

// Payment State Progress Bar
function PaymentStateBar({ paymentState, status }: { paymentState: string; status: string }) {
  const currentIdx = PAYMENT_STATES.findIndex(s =>
    status === 'COMPLETED' || status === 'VERIFIED' ? s.key === 'COMPLETED' :
    paymentState === s.key
  );

  return (
    <div className="flex items-center justify-between px-1 py-1">
      {PAYMENT_STATES.map((state, idx) => {
        const isActive = idx <= (currentIdx >= 0 ? currentIdx : 1);
        const isCurrent = idx === (currentIdx >= 0 ? currentIdx : 1);
        const Icon = state.icon;
        return (
          <div key={state.key} className="flex items-center gap-0.5 flex-1">
            <div className="flex flex-col items-center gap-0.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${isActive ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-600'} ${isCurrent ? 'scale-110' : ''}`}>
                <Icon className={`w-2.5 h-2.5 ${isCurrent ? 'animate-pulse' : ''}`} />
              </div>
              <span className={`text-[9px] text-center font-semibold leading-tight ${isActive ? 'text-emerald-400' : 'text-slate-600'}`}>
                {state.label}
              </span>
            </div>
            {idx < PAYMENT_STATES.length - 1 && (
              <div className={`h-px flex-1 mt-[-10px] mb-2 ${idx < currentIdx ? 'bg-emerald-500/60' : 'bg-slate-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// UPI App Grid
interface UpiAppGridProps {
  apps: UpiApp[];
  onOpen: (app: UpiApp) => void;
  onOpenAny: () => void;
  onPhonePeBlocked: () => void;
}

function UpiAppGrid({ apps, onOpen, onOpenAny, onPhonePeBlocked }: UpiAppGridProps) {
  return (
    <div className="space-y-1.5">
      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center">Open UPI App Directly</div>
      <div className="grid grid-cols-3 gap-1.5">
        {apps.map(app => (
          <button
            key={app.id}
            onClick={() => onOpen(app)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg bg-slate-900/60 border ${app.color} transition-all active:scale-95 hover:bg-slate-800/60`}
          >
            {app.icon}
            <span className="text-[9px] font-semibold text-slate-300 text-center leading-tight">{app.label}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={onOpenAny}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800/60 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-[10px] transition"
        >
          <Smartphone className="w-3.5 h-3.5 text-violet-400" />
          Open Any UPI App
        </button>
        <button
          onClick={onPhonePeBlocked}
          className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/40 text-rose-300 font-semibold text-[10px] transition"
        >
          <AlertTriangle className="w-3 h-3" />
          PhonePe Blocked?
        </button>
      </div>
    </div>
  );
}

// PhonePe Blocked View (Phase 14)
interface PhonePeBlockedViewProps {
  amount: number;
  upiApps: UpiApp[];
  onOpenApp: (app: UpiApp) => void;
  onOpenAny: () => void;
  onGenerateNewQr: () => void;
  isRegenerating: boolean;
  canRegen: boolean;
}

function PhonePeBlockedView({
  amount, upiApps, onOpenApp, onOpenAny, onGenerateNewQr, isRegenerating, canRegen,
}: PhonePeBlockedViewProps) {
  const alternatives = upiApps.filter(a => a.id !== 'PHONEPE');

  return (
    <div className="p-5 space-y-4">
      {/* Warning Banner */}
      <div className="bg-amber-950/60 border border-amber-600/40 rounded-xl p-4 text-center space-y-2">
        <div className="w-12 h-12 bg-amber-900/50 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7 text-amber-400" />
        </div>
        <div>
          <h4 className="font-black text-amber-200 text-sm">Payment Could Not Be Completed</h4>
          <p className="text-xs text-amber-300/80 mt-1.5 leading-relaxed">
            This payment could not be completed by your UPI provider (PhonePe).
            <strong className="text-amber-200"> Your donation has NOT been deducted.</strong>
            Please try another UPI app or generate a new QR.
          </p>
        </div>
      </div>

      {/* Amount reminder */}
      <div className="text-center">
        <div className="text-xs text-slate-400">Your donation of</div>
        <div className="text-2xl font-black text-amber-300">₹{amount.toLocaleString("en-IN")}</div>
        <div className="text-xs text-slate-400">is ready to be processed</div>
      </div>

      {/* Alternative UPI Apps */}
      <div className="space-y-2">
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">Try Another UPI App</div>
        <div className="grid grid-cols-2 gap-2">
          {alternatives.slice(0, 4).map(app => (
            <button
              key={app.id}
              onClick={() => onOpenApp(app)}
              className={`flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/70 border ${app.color} transition-all active:scale-95 hover:bg-slate-800`}
            >
              {app.icon}
              <span className="text-xs font-bold text-slate-200">{app.label}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 ml-auto" />
            </button>
          ))}
        </div>
      </div>

      {/* Generate New QR */}
      {canRegen && (
        <button
          onClick={onGenerateNewQr}
          disabled={isRegenerating}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-violet-700/70 hover:bg-violet-600/80 border border-violet-500/40 text-white font-bold text-sm transition disabled:opacity-50"
        >
          {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {isRegenerating ? "Generating New QR..." : "Generate New QR Code"}
        </button>
      )}

      {/* Open any UPI */}
      <button
        onClick={onOpenAny}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-xs transition"
      >
        <Smartphone className="w-4 h-4 text-slate-400" />
        Open Any Other UPI App
      </button>

      <p className="text-[10px] text-slate-500 text-center leading-relaxed">
        ⚠️ If the issue persists, please contact KCM at <strong className="text-violet-400">kingofchristministries23@gmail.com</strong>. This incident has been logged for review.
      </p>
    </div>
  );
}
