"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Printer, ArrowLeft, CheckCircle2, ShieldCheck, Heart, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

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

// Convert numbers to Indian Rupees Words
function numberToWords(num: number): string {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (num === 0) return "Zero";

  const convert = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + convert(n % 10000000) : "");
  };

  return convert(Math.floor(num)) + " Rupees Only";
}

export default function ReceiptPage({ params }: { params: { donationId: string } }) {
  const { donationId } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState<DonationDetails | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReceipt() {
      try {
        const res = await fetch(`/api/donations/receipt/${donationId}`);
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Receipt not found");
        }
        
        setDonation(data.donation);
      } catch (err: any) {
        console.error("Error fetching receipt:", err);
        setError(err.message || "Failed to load receipt details.");
      } finally {
        setLoading(false);
      }
    }

    if (donationId) {
      fetchReceipt();
    }
  }, [donationId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Fetching receipt details...</p>
        </div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 rotate-180" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Receipt Unavailable</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || "The requested receipt could not be found."}</p>
          <div className="space-y-3">
            <Link
              href="/give"
              className="block w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              Back to Giving Portal
            </Link>
            <Link
              href="/"
              className="block w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(donation.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 print:bg-white print:py-0">
      
      {/* Top Banner (On Screen Only) */}
      <div className="max-w-3xl mx-auto mb-8 print:hidden flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-950 dark:text-white">Payment Successful!</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your donation has been verified and registered.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handlePrint}
            className="flex-1 md:flex-initial px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <Printer className="w-4.5 h-4.5" />
            Print Receipt
          </button>
          
          <Link
            href="/dashboard"
            className="flex-1 md:flex-initial px-5 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
            Dashboard
          </Link>
        </div>
      </div>

      {/* Main Printable Receipt (Forces standard physical letterhead styling) */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto bg-white text-gray-900 shadow-xl rounded-3xl overflow-hidden border border-gray-200 print:shadow-none print:border-none print:rounded-none print:max-w-full"
      >
        <div className="p-4 sm:p-8 md:p-12 space-y-8 print:p-0">
          
          {/* Header Letterhead */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-2 border-purple-100 pb-8 gap-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-purple-900 uppercase">
                Kingdom of Christ Ministries
              </h1>
              <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-wider">
                Registration No: 125/2012 • 80G Tax Exempted Society
              </p>
              <div className="text-sm text-gray-600 mt-3 space-y-0.5 leading-relaxed">
                <p>15-201, Vivekananda Nagar, Jeedimetla, Hyderabad, TS, 500055</p>
                <p>Phone: +91 97040 90069 | +91 96409 43777 | +91 73964 33856 | Email: kingofchristministries23@gmail.com</p>
              </div>
            </div>
            
            <div className="text-left md:text-right border-l-4 border-purple-600 pl-4 md:border-l-0 md:border-r-4 md:pr-4 md:pl-0">
              <span className="text-xs font-bold text-purple-700 uppercase tracking-widest block">Official Receipt</span>
              <span className="text-3xl font-black text-gray-900 font-mono tracking-tight block mt-1">
                {donation.id.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Payment Status Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-purple-50/50 p-5 rounded-2xl border border-purple-100/50">
            <div>
              <span className="text-xs text-purple-700 font-bold uppercase tracking-wider block">Date & Time</span>
              <span className="text-sm font-semibold text-gray-800 block mt-1">{formattedDate}</span>
            </div>
            <div>
              <span className="text-xs text-purple-700 font-bold uppercase tracking-wider block">Payment Mode</span>
              <span className="text-sm font-semibold text-gray-800 block mt-1">{donation.paymentMethod}</span>
            </div>
            <div className="col-span-2">
              <span className="text-xs text-purple-700 font-bold uppercase tracking-wider block">Razorpay Payment ID</span>
              <span className="text-sm font-mono font-bold text-indigo-700 block mt-1">
                {donation.razorpayPaymentId || "N/A (Test Mode)"}
              </span>
            </div>
          </div>

          {/* Donor & Purpose Invoice details */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b border-gray-200 pb-2 text-gray-800 uppercase tracking-wide">
              Donation Particulars
            </h3>

            <div className="grid md:grid-cols-2 gap-8 text-sm">
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 block">Received From:</span>
                  <span className="text-lg font-bold text-gray-900 block mt-0.5">{donation.donorName || "Anonymous Member"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Email Address:</span>
                  <span className="text-gray-800 font-medium block">{donation.donorEmail || "N/A"}</span>
                </div>
                {donation.donorPhone && (
                  <div>
                    <span className="text-gray-500 block">Phone Number:</span>
                    <span className="text-gray-800 font-medium block">{donation.donorPhone}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 md:border-l md:border-gray-100 md:pl-8">
                <div>
                  <span className="text-gray-500 block">Purpose of Gift:</span>
                  <span className="text-lg font-bold text-purple-900 block mt-0.5">
                    {donation.purpose.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Exemption Category:</span>
                  <span className="text-green-700 font-bold block">Section 80G Eligible</span>
                </div>
              </div>
            </div>
          </div>

          {/* Large Amount Display Box */}
          <div className="border-2 border-purple-100 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center bg-purple-50/20 gap-4">
            <div className="text-center md:text-left">
              <span className="text-xs text-purple-700 font-bold uppercase tracking-wider block">Amount Received in Words</span>
              <span className="text-lg font-bold text-gray-900 block mt-1 italic">
                {numberToWords(donation.amount)}
              </span>
            </div>
            <div className="bg-purple-900 text-white px-8 py-4 rounded-2xl flex items-center gap-1 font-mono text-3xl font-extrabold shadow-md">
              <span>₹</span>
              <span>{donation.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Legal / Exemption Statement */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 text-xs text-gray-600 leading-relaxed space-y-2">
            <p className="font-bold uppercase tracking-wide text-gray-700">Tax Exemption Declaration:</p>
            <p>
              Donations made to Kingdom of Christ Ministries are exempt from Income Tax under Section 80G of the Income Tax Act, 1961 (Notification/Approval details pending official updates).
            </p>
            <p>
              This is a computer-generated official receipt. No physical signature is required. All funds are utilized solely for the spiritual, humanitarian, and charitable activities of the church.
            </p>
          </div>

          {/* Footer Signature letterhead */}
          <div className="flex justify-between items-end border-t border-gray-100 pt-8 mt-12">
            <div className="text-xs text-gray-400">
              <p>Thank you for your cheerful giving!</p>
              <p className="mt-1 font-semibold text-purple-600">"God loves a cheerful giver." — 2 Corinthians 9:7</p>
            </div>
            
            <div className="text-center w-48">
              <div className="h-12 flex items-center justify-center font-serif text-purple-700 italic border-b border-gray-300 pb-1">
                Bishop K. Kristhu Raju
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mt-1">
                Senior Pastor & President
              </span>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Back button at screen bottom (On Screen Only) */}
      <div className="max-w-3xl mx-auto mt-8 text-center print:hidden">
        <Link
          href="/give"
          className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:underline transition-all"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          Back to Online Giving Portal
        </Link>
      </div>
    </div>
  );
}
