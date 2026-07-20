"use client";

import { useState, useEffect, useRef } from "react";
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
  X
} from "lucide-react";

interface DynamicPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
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

export default function DynamicPaymentModal({
  isOpen,
  onClose,
  sessionId,
  referenceNumber,
  amount,
  qrCodeDataUrl,
  upiUri,
  upiId = "kcm.kristhraj2004-1@okicici",
  churchName = "Kingdom of Christ Ministries",
  donorName,
  donorEmail,
  expiresAt,
  onSuccess,
}: DynamicPaymentModalProps) {
  const [status, setStatus] = useState<string>("PENDING");
  const [donationId, setDonationId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 mins default
  const [launchingRazorpay, setLaunchingRazorpay] = useState(false);

  // Setup Server-Sent Events (SSE) Listener for Real-Time Payment State Updates
  useEffect(() => {
    if (!isOpen || !sessionId) return;

    const eventSource = new EventSource(`/api/donations/live-status/${sessionId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status) {
          setStatus(data.status);
          if (data.donationId) {
            setDonationId(data.donationId);
            if (onSuccess) onSuccess(data.donationId);
          }
        }
      } catch (err) {
        console.error("[SSE_PARSE_ERR]", err);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [isOpen, sessionId, onSuccess]);

  // Countdown timer effect
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLaunchRazorpay = async () => {
    try {
      setLaunchingRazorpay(true);
      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          document.body.appendChild(script);
        });
      }

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_default";

      const options = {
        key: keyId,
        amount: Math.round(amount * 100),
        currency: "INR",
        name: churchName,
        description: `Giving Ref: ${referenceNumber}`,
        order_id: referenceNumber.startsWith("order_") ? referenceNumber : undefined,
        prefill: {
          name: donorName || "",
          email: donorEmail || "",
        },
        theme: {
          color: "#4F1C91",
        },
        handler: function (response: any) {
          setStatus("VERIFIED");
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("[RAZORPAY_LAUNCH_ERR]", err);
    } finally {
      setLaunchingRazorpay(false);
    }
  };

  const modalRef = useRef<HTMLDivElement>(null);

  // Auto scroll into view on modal opening
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isOpen]);

  const isCompleted = status === "COMPLETED" || status === "VERIFIED";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div ref={modalRef} className="relative w-full max-w-lg bg-slate-900 border border-violet-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-white my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Complete Your Giving
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Order Ref: <span className="font-mono text-violet-400 font-bold">{referenceNumber}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* COMPLETED SUCCESS SCREEN */}
        {isCompleted ? (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 bg-emerald-950/80 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <div>
              <h4 className="text-2xl font-black text-white">
                Payment Verified & Complete!
              </h4>
              <p className="text-sm text-slate-300 mt-1">
                Thank you for your generous contribution of <strong className="text-emerald-400">₹{amount.toLocaleString('en-IN')}</strong>. May God bless you abundantly!
              </p>
            </div>

            {donationId && (
              <div className="pt-2">
                <a
                  href={`/api/donations/receipt/${donationId}?format=html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-lg shadow-violet-600/30 transition-all transform hover:scale-[1.02]"
                >
                  <Download className="w-4 h-4" /> Download Official 80G PDF Receipt
                </a>
              </div>
            )}
          </div>
        ) : (
          /* ACTIVE PAYMENT SCANNER SCREEN */
          <div className="space-y-5">
            {/* Amount Banner */}
            <div className="bg-gradient-to-r from-violet-900 to-indigo-900 text-white rounded-2xl p-4 text-center shadow border border-violet-700/40">
              <div className="text-xs uppercase tracking-wider text-violet-200 font-bold">Total Giving Amount</div>
              <div className="text-3xl font-black text-amber-300 mt-1 drop-shadow">₹{amount.toLocaleString('en-IN')}</div>
            </div>

            {/* Dynamic QR Scanner Display */}
            {qrCodeDataUrl ? (
              <div className="bg-slate-950 p-5 rounded-2xl border border-violet-800/40 text-center space-y-3 shadow-inner">
                <div className="inline-block p-3.5 bg-white rounded-2xl shadow-xl border-2 border-violet-400">
                  <img src={qrCodeDataUrl} alt="Dynamic Payment QR Code" className="w-52 h-52 mx-auto" />
                </div>
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-200">
                  <QrCode className="w-4 h-4 text-violet-400" />
                  Scan with GPay, PhonePe, Paytm, or BHIM UPI
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                <p className="text-xs text-slate-400 mt-2 font-medium">Generating dynamic UPI payment QR token...</p>
              </div>
            )}

            {/* Action Buttons: UPI App & Razorpay Gateway */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {upiUri && (
                <a
                  href={upiUri}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                >
                  <Smartphone className="w-4 h-4" /> Open UPI App Directly
                </a>
              )}

              <button
                type="button"
                onClick={handleLaunchRazorpay}
                disabled={launchingRazorpay}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                {launchingRazorpay ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                Pay via Razorpay SDK
              </button>
            </div>

            {/* UPI ID Copy Box */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <span className="text-slate-300 truncate">{upiId}</span>
              <button
                onClick={copyUpi}
                className="ml-2 font-sans font-bold text-violet-400 hover:underline flex items-center gap-1 shrink-0"
              >
                <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy VPA"}
              </button>
            </div>

            {/* Real-time Status Footer */}
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-3.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Expires: {formattedTime}</span>
              </div>
              <div className="flex items-center gap-1.5 text-violet-400 font-bold">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Awaiting Payment...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
