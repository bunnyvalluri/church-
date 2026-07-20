"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Printer, ArrowLeft, CheckCircle2, ShieldCheck, Heart,
  LayoutDashboard, Download, Share2, Mail, QrCode,
  Building, MapPin, Phone, Calendar, Clock, CreditCard,
  FileText, ExternalLink, Copy, Check,
} from "lucide-react";
import { motion } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReceiptData {
  id: string;
  receiptNumber: string;
  donationId: string;
  member: string;
  branch: string;
  purpose: string;
  amount: number;
  currency: string;
  issuedAt: string;
  referenceNumber: string;
  verificationCode: string;
  qrCode: string | null;
}

interface DonationDetails {
  id: string;
  amount: number;
  currency: string;
  purpose: string;
  paymentMethod: string;
  razorpayPaymentId: string | null;
  razorpayOrderId: string | null;
  donorName: string | null;
  donorEmail: string | null;
  donorPhone: string | null;
  createdAt: string;
}

// ── Amount to Indian Words ────────────────────────────────────────────────────

function numberToWords(num: number): string {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  if (num === 0) return "Zero Rupees Only";
  const convert = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + convert(n % 10000000) : "");
  };
  return convert(Math.floor(num)) + " Rupees Only";
}

// ── Church Seal SVG ───────────────────────────────────────────────────────────

function ChurchSeal({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="45" cy="45" r="43" stroke="#4F1C91" strokeWidth="2.5" strokeDasharray="4 3" />
      <circle cx="45" cy="45" r="36" stroke="#4F1C91" strokeWidth="1.5" />
      <text x="45" y="33" textAnchor="middle" fontFamily="Arial" fontSize="6.5" fontWeight="700" fill="#4F1C91" letterSpacing="1.5">KINGDOM OF CHRIST</text>
      <text x="45" y="46" textAnchor="middle" fontFamily="Arial" fontSize="16" fontWeight="900" fill="#4F1C91">✝</text>
      <text x="45" y="57" textAnchor="middle" fontFamily="Arial" fontSize="6" fontWeight="700" fill="#4F1C91" letterSpacing="1">MINISTRIES</text>
      <text x="45" y="66" textAnchor="middle" fontFamily="Arial" fontSize="5.5" fill="#7c3aed">HYDERABAD • 2004</text>
    </svg>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ReceiptPage() {
  const params = useParams();
  const donationId = params?.donationId as string;

  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [donation, setDonation] = useState<DonationDetails | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Fetch receipt from API
  useEffect(() => {
    if (!donationId) return;

    async function fetchReceipt() {
      try {
        // Try receipts API first (most complete data)
        const res = await fetch(`/api/receipts/${donationId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.receipt) {
            setReceipt(data.receipt);
          }
        }

        // Also fetch donation details for full info
        const donationRes = await fetch(`/api/donations/receipt/${donationId}`);
        if (donationRes.ok) {
          const donationData = await donationRes.json();
          if (donationData.success && donationData.donation) {
            setDonation(donationData.donation);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load receipt.");
      } finally {
        setLoading(false);
      }
    }

    fetchReceipt();
  }, [donationId]);

  const handleCopy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2500);
  }, []);

  const handleEmailReceipt = useCallback(async () => {
    setEmailSending(true);
    try {
      await fetch(`/api/receipts/${donationId}?email=true`);
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 4000);
    } catch {
      // silent fail
    } finally {
      setEmailSending(false);
    }
  }, [donationId]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: "KCM Donation Receipt", url });
    } else {
      handleCopy(url, "link");
    }
  }, [handleCopy]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full border-4 border-purple-600 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-semibold">Loading Receipt…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || (!receipt && !donation)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-50 dark:from-slate-950 dark:to-slate-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 text-center border border-red-100 dark:border-red-900/30">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 rotate-180" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Receipt Unavailable</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{error || "The requested receipt could not be found."}</p>
          <Link href="/ngo/donations" className="block w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors mb-3">
            Make a Donation
          </Link>
          <Link href="/" className="block w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // ── Compute display values ────────────────────────────────────────────────
  const amount = receipt?.amount ?? donation?.amount ?? 0;
  const donorName = receipt?.member || donation?.donorName || "Anonymous Giver";
  const donorEmail = donation?.donorEmail || "N/A";
  const donorPhone = donation?.donorPhone || "N/A";
  const purpose = receipt?.purpose || donation?.purpose?.replace(/_/g, " ") || "General Donation";
  const branch = receipt?.branch || "General";
  const receiptNumber = receipt?.receiptNumber || `DON-${donationId?.slice(-8).toUpperCase()}`;
  const verificationCode = receipt?.verificationCode || "";
  const utr = receipt?.referenceNumber || donation?.razorpayPaymentId || "N/A";
  const razorpayId = donation?.razorpayPaymentId || utr;
  const issuedAt = receipt?.issuedAt || donation?.createdAt || new Date().toISOString();
  const qrCode = receipt?.qrCode;
  const currency = receipt?.currency || "INR";

  const formattedAmount = amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2, style: "currency", currency,
  });
  const formattedDate = new Date(issuedAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
  const formattedTime = new Date(issuedAt).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

  const isAnonymous = donorName === "Anonymous Giver" || donorName === "Anonymous";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 px-4 print:bg-white print:py-0">

      {/* ── Screen-Only Top Action Bar ─────────────────────────────────── */}
      <div className="max-w-3xl mx-auto mb-6 print:hidden">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-white/10 p-4"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Status */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-md shadow-emerald-500/30 flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">Payment Verified ✅</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Official donation receipt • Kingdom of Christ Ministries</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => window.print()}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/20 transition-all"
              >
                <Printer className="w-4 h-4" />
                Print / PDF
              </button>

              <a
                href={`/api/receipts/${donationId}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
              >
                <Download className="w-4 h-4" />
                Download
              </a>

              <button
                onClick={handleShare}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>

              <button
                onClick={handleEmailReceipt}
                disabled={emailSending || emailSent}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/40 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-60"
              >
                {emailSent ? <><Check className="w-4 h-4" /> Sent!</> : emailSending ? "Sending…" : <><Mail className="w-4 h-4" /> Email</>}
              </button>

              <Link
                href="/dashboard"
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── A4 Premium Receipt ─────────────────────────────────────────── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto bg-white text-gray-900 shadow-2xl rounded-3xl overflow-hidden border border-purple-100 print:shadow-none print:border-none print:rounded-none print:max-w-full"
        id="receipt-printable"
      >
        <div className="print:p-0">

          {/* ── HEADER BAND ──────────────────────────────────────────────── */}
          <div className="bg-gradient-to-r from-[#3b0764] via-[#4F1C91] to-[#4338ca] px-8 sm:px-12 py-8 relative overflow-hidden">
            {/* Decorative background circles */}
            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/5" />
            <div className="absolute -bottom-12 -left-8 w-48 h-48 rounded-full bg-white/5" />

            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              {/* Church identity */}
              <div>
                <div className="text-3xl mb-2 text-white/80">✝</div>
                <h1 className="text-white text-xl sm:text-2xl font-extrabold tracking-tight leading-tight mb-1">
                  Kingdom of Christ Ministries
                </h1>
                <p className="text-purple-200 text-[11px] uppercase tracking-widest font-semibold mb-2">
                  Reg. No: 125/2012 | 80G Tax Exempted Society
                </p>
                <div className="text-purple-200/80 text-[11px] space-y-0.5 leading-relaxed">
                  <p>📍 15-201, Vivekananda Nagar, Jeedimetla, Hyderabad - 500055</p>
                  <p>📞 +91 97040 90069 | +91 73964 33856</p>
                </div>
              </div>

              {/* Receipt badge */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20 text-right sm:text-right min-w-[180px]">
                <p className="text-[10px] font-bold text-purple-200 uppercase tracking-widest mb-1">Official Receipt</p>
                <p className="text-white text-xl font-black font-mono tracking-tight leading-tight">{receiptNumber}</p>
                <p className="text-purple-200 text-[11px] mt-1.5">{formattedDate}</p>
                <p className="text-purple-200 text-[11px]">{formattedTime}</p>
              </div>
            </div>
          </div>

          {/* ── SUCCESS STATUS BAND ───────────────────────────────────────── */}
          <div className="bg-emerald-50 border-y-2 border-emerald-100 px-8 sm:px-12 py-3 flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </div>
            <span className="text-emerald-800 font-bold text-sm">Payment Verified Successfully</span>
            <span className="ml-auto text-emerald-600 font-mono text-xs hidden sm:block">UTR: {utr}</span>
          </div>

          {/* ── BODY ──────────────────────────────────────────────────────── */}
          <div className="px-8 sm:px-12 py-8 space-y-7">

            {/* Info grid: Donor + Donation */}
            <div className="grid sm:grid-cols-2 gap-5">
              {/* Donor info */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-5">
                <h3 className="text-[10px] font-bold text-purple-700 uppercase tracking-widest mb-4 pb-2 border-b border-purple-100">
                  Donor Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Full Name</p>
                    <p className="font-bold text-purple-900 text-base leading-tight">{isAnonymous ? "🔒 Anonymous Donor" : donorName}</p>
                  </div>
                  {!isAnonymous && (
                    <>
                      <div>
                        <p className="text-[10px] text-gray-400 font-medium">Email Address</p>
                        <p className="font-semibold text-gray-800">{donorEmail}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-medium">Mobile Number</p>
                        <p className="font-semibold text-gray-800">{donorPhone}</p>
                      </div>
                    </>
                  )}
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Donor Status</p>
                    <p className="font-semibold text-gray-800">{isAnonymous ? "Anonymous" : "Named Donor"}</p>
                  </div>
                </div>
              </div>

              {/* Donation info */}
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-5">
                <h3 className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest mb-4 pb-2 border-b border-indigo-100">
                  Donation Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Donation Cause</p>
                    <p className="font-bold text-indigo-900 text-base leading-tight">{purpose}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Branch</p>
                    <p className="font-semibold text-gray-800">🏛 {branch}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Payment Method</p>
                    <p className="font-semibold text-gray-800">📱 UPI (Instant QR)</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Tax Exemption</p>
                    <p className="font-bold text-emerald-700">✅ Section 80G Eligible</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Amount hero box */}
            <div className="bg-gradient-to-r from-[#3b0764] via-[#4F1C91] to-[#4338ca] rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-center sm:text-left">
                <p className="text-[10px] font-bold text-purple-300 uppercase tracking-widest mb-1">Amount in Words</p>
                <p className="text-purple-100 font-bold italic text-sm sm:text-base leading-snug max-w-sm">
                  {numberToWords(amount)}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-8 py-4 border border-white/20 text-center flex-shrink-0">
                <p className="text-purple-300 text-[10px] uppercase tracking-widest mb-1">Total Amount</p>
                <p className="text-white text-3xl sm:text-4xl font-black font-mono tracking-tight">{formattedAmount}</p>
              </div>
            </div>

            {/* Full Transaction Details Table */}
            <div>
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                Transaction & Receipt Details
              </h3>
              <div className="rounded-2xl border border-gray-100 overflow-hidden">
                {[
                  { label: "Donation ID", value: donationId || receipt?.donationId, mono: true },
                  { label: "Receipt Number", value: receiptNumber, mono: true, highlight: true },
                  { label: "Razorpay / UPI Payment ID", value: razorpayId, mono: true },
                  { label: "Transaction Ref (UTR)", value: utr, mono: true },
                  { label: "Verification Code", value: verificationCode, mono: true },
                  { label: "Date of Transaction", value: formattedDate },
                  { label: "Time of Transaction", value: formattedTime },
                  { label: "Payment Method", value: "UPI (Instant QR)" },
                  { label: "Amount Received", value: formattedAmount, bold: true },
                ].map((row, i) => (
                  <div
                    key={row.label}
                    className={`flex justify-between items-center px-5 py-3 text-sm gap-4 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/70"} ${i !== 8 ? "border-b border-gray-100" : ""}`}
                  >
                    <span className="text-gray-500 text-xs font-medium flex-shrink-0">{row.label}</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`font-semibold text-right break-all ${
                        row.highlight ? "text-purple-700 font-bold" :
                        row.bold ? "text-purple-900 font-extrabold text-base" :
                        row.mono ? "font-mono text-indigo-700" : "text-gray-800"
                      }`}>
                        {row.value || "N/A"}
                      </span>
                      {row.mono && row.value && (
                        <button
                          onClick={() => handleCopy(String(row.value), row.label)}
                          className="text-gray-400 hover:text-purple-600 transition-colors flex-shrink-0 print:hidden"
                          title="Copy"
                        >
                          {copied === row.label ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QR Code + Church Seal + Authorized Signature */}
            <div className="flex flex-col sm:flex-row justify-between items-end gap-8 pt-2">
              {/* QR Code */}
              <div className="flex flex-col items-center gap-2">
                {qrCode ? (
                  <img
                    src={qrCode}
                    alt="Verification QR Code"
                    className="w-24 h-24 rounded-xl border-2 border-purple-100 p-1 shadow-sm"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-xl border-2 border-purple-100 bg-purple-50 flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-purple-300" />
                  </div>
                )}
                <p className="text-[10px] text-gray-400 text-center leading-tight">Scan to verify<br />this receipt</p>
              </div>

              {/* Church Seal */}
              <div className="flex flex-col items-center gap-1">
                <ChurchSeal size={88} />
                <p className="text-[10px] text-gray-400 font-medium">Official Church Seal</p>
              </div>

              {/* Signature */}
              <div className="text-center min-w-[160px]">
                <div className="h-12 flex items-end justify-center border-b-2 border-gray-300 pb-1.5 mb-2">
                  <span className="font-serif italic text-lg text-purple-800 select-none">Bishop K. Kristhu Raju</span>
                </div>
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Authorized Signatory</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Senior Pastor & President</p>
              </div>
            </div>

            {/* Tax Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>📋 Tax Exemption Declaration:</strong> Donations to Kingdom of Christ Ministries are eligible for income tax deduction under Section 80G of the Income Tax Act, 1961. Please retain this receipt for your tax records. This is a computer-generated official receipt — no physical signature required. All funds are utilized solely for spiritual, humanitarian, and charitable activities.
              </p>
            </div>

          </div>

          {/* ── FOOTER BAND ───────────────────────────────────────────────── */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-t-2 border-purple-100 px-8 sm:px-12 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-center sm:text-left">
              <p className="font-bold text-purple-800 text-sm mb-0.5">
                Thank you for supporting Kingdom of Christ Ministries.
              </p>
              <p className="text-xs text-gray-500 italic">"God loves a cheerful giver." — 2 Corinthians 9:7</p>
            </div>
            <div className="text-center sm:text-right text-xs text-gray-400 space-y-0.5">
              <p>✉ kingofchristministries23@gmail.com</p>
              <p>Generated: {new Date().toLocaleString("en-IN")}</p>
            </div>
          </div>

        </div>
      </motion.div>

      {/* ── Bottom Navigation (Screen Only) ─────────────────────────────── */}
      <div className="max-w-3xl mx-auto mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        <Link
          href="/ngo/donations"
          className="inline-flex items-center gap-2 text-purple-700 dark:text-purple-400 font-bold hover:underline text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Make Another Donation
        </Link>
        <Link
          href="/member/donations"
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 font-semibold hover:underline text-sm"
        >
          <FileText className="w-4 h-4" />
          View All Donations
        </Link>
      </div>

    </div>
  );
}
