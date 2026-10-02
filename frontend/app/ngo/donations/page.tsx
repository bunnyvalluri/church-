"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  QrCode,
  Lock,
  ShieldAlert,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Copy,
  CheckCircle2,
  Share2,
  Download,
  Home,
  RefreshCw,
  User,
  Mail,
  Phone,
  Building,
  Gift,
  Sparkles,
  ShieldCheck,
  Check,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  MessageSquare,
  Globe,
  Smartphone,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
  TrendingUp,
  Users,
  Flame,
  Calendar,
  CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { createDedicatedSocket } from "@/lib/socketClient";
import { DonationAgentProvider, useDonationAgent } from "@/components/donations/DonationAgentProvider";
import { AgentStatusBar } from "@/components/donations/AgentStatusBar";
import { PaymentStateMonitor } from "@/components/donations/PaymentStateMonitor";
import { usePreventContextMenu } from "@/hooks/usePreventContextMenu";

// Brand SVG Icon Components for GPay, PhonePe, Paytm, and BHIM UPI
const GPayIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

const PhonePeIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#5F259F"/>
    <path d="M13.5 7H10.5C9.67 7 9 7.67 9 8.5V15.5C9 16.33 9.67 17 10.5 17H13.5C14.33 17 15 16.33 15 15.5V8.5C15 7.67 14.33 7 13.5 7Z" fill="#5F259F"/>
    <path d="M12 8.5V15.5M9.5 10.5H14.5M9.5 12.5H13.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const PaytmIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#002E6E"/>
    <path d="M5 9.5H7.5V14.5H5V9.5Z" fill="#00BAF2"/>
    <path d="M8.5 9.5H12C12.8 9.5 13.5 10 13.5 11C13.5 12 12.8 12.5 12 12.5H10V14.5H8.5V9.5Z" fill="white"/>
    <path d="M14.5 9.5H16V13C16 14 16.5 14.5 17.5 14.5C18.5 14.5 19 14 19 13V9.5H20.5V13C20.5 15 19 16 17.5 16C16 16 14.5 15 14.5 13V9.5Z" fill="#00BAF2"/>
  </svg>
);

const BhimIcon = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <path d="M5 16.5L12 5.5L19 16.5H5Z" fill="#008837"/>
    <path d="M12 5.5L19 16.5H13.5L9.5 10L12 5.5Z" fill="#EF4123"/>
    <path d="M8.5 12L12 16.5H6L8.5 12Z" fill="#FF9933"/>
  </svg>
);

interface PresetAmount {
  id: string;
  amount: number;
  label: string | null;
  tag?: string;
  displayOrder: number;
  isDefault: boolean;
}

interface CauseItem {
  id: string;
  code: string;
  nameEn: string;
  nameTe?: string;
  nameHi?: string;
  descEn: string;
  icon?: string;
  category?: string;
  targetAmount?: number | null;
  raisedAmount?: number;
}

interface BranchItem {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

interface FormFieldRule {
  id: string;
  fieldName: string;
  label: string;
  placeholder?: string;
  isRequired: boolean;
  isVisible: boolean;
  displayOrder: number;
  fieldType: string;
}

interface PaymentSettings {
  minDonationAmount: number;
  maxDonationAmount: number;
  upiId: string;
  merchantName: string;
  qrExpiryMinutes: number;
}

// Instant Default Metadata for 0ms Page Load Speed
const DEFAULT_PRESETS: PresetAmount[] = [
  { id: "1", amount: 500, label: "₹500", tag: "Warm Meals", displayOrder: 1, isDefault: false },
  { id: "2", amount: 1000, label: "₹1,000", tag: "Most Popular", displayOrder: 2, isDefault: true },
  { id: "3", amount: 2000, label: "₹2,000", tag: "Patient Kit", displayOrder: 3, isDefault: false },
  { id: "4", amount: 5000, label: "₹5,000", tag: "Elderly Care", displayOrder: 4, isDefault: false },
  { id: "5", amount: 10000, label: "₹10,000", tag: "Community Aid", displayOrder: 5, isDefault: false },
  { id: "6", amount: 25000, label: "₹25,000", tag: "Major Sponsor", displayOrder: 6, isDefault: false },
];

const DEFAULT_CAUSES: CauseItem[] = [
  {
    id: "c1",
    code: "CHARITY",
    nameEn: "Hospital Outreach & Patient Kits",
    descEn: "Support fresh meals, hygiene kits, and emergency medicine for hospital patients.",
    icon: "Heart",
    category: "OUTREACH",
    targetAmount: 500000,
    raisedAmount: 245000,
  },
  {
    id: "c2",
    code: "ASHRAMAM",
    nameEn: "Ashramam & Handicap Support",
    descEn: "Funding essential shelter care, wheelchair gear, and assistance for handicap homes.",
    icon: "Gift",
    category: "BENEVOLENCE",
    targetAmount: 300000,
    raisedAmount: 182000,
  },
  {
    id: "c3",
    code: "FOOD",
    nameEn: "Fresh Food Packets Drive",
    descEn: "Daily fresh nutritious meals distributed to underprivileged hospital families.",
    icon: "Sparkles",
    category: "FOOD_AID",
    targetAmount: 250000,
    raisedAmount: 210000,
  },
];

const DEFAULT_BRANCHES: BranchItem[] = [
  { id: "b1", name: "Shapur Nagar (Main Central)" },
  { id: "b2", name: "Subhash Nagar Branch" },
  { id: "b3", name: "Bahadurpally Branch" },
];

const DEFAULT_FORM_FIELDS: FormFieldRule[] = [
  { id: "f1", fieldName: "donorName", label: "Full Name", placeholder: "e.g. John Doe", isRequired: true, isVisible: true, displayOrder: 1, fieldType: "text" },
  { id: "f2", fieldName: "donorPhone", label: "Mobile Number", placeholder: "10-digit mobile number", isRequired: true, isVisible: true, displayOrder: 2, fieldType: "tel" },
  { id: "f3", fieldName: "donorEmail", label: "Email Address", placeholder: "donor@example.com", isRequired: false, isVisible: true, displayOrder: 3, fieldType: "email" },
  { id: "f11", fieldName: "isAnonymous", label: "Make my donation anonymous", placeholder: "", isRequired: false, isVisible: true, displayOrder: 11, fieldType: "checkbox" },
];

// Pure hydration-safe Indian numbering format
function formatNumber(num: number | string, withDecimals: boolean = false): string {
  const parsed = typeof num === "number" ? num : parseFloat(num || "0");
  if (isNaN(parsed)) return "0";
  const parts = parsed.toFixed(withDecimals ? 2 : 0).split(".");
  let lastThree = parts[0].slice(-3);
  const otherNumbers = parts[0].slice(0, -3);
  if (otherNumbers !== "") {
    lastThree = "," + lastThree;
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return withDecimals ? `${formatted}.${parts[1]}` : formatted;
}

// Multilingual Cause Name Translations
const CAUSE_TRANSLATIONS: Record<string, { te: string; hi: string }> = {
  "CHARITY": { te: "ఆసుపత్రి సేవా కార్యక్రమాలు & రోగుల కిట్లు", hi: "अस्पताल सेवा एवं मरीज किट सहायता" },
  "Hospital Outreach & Patient Kits": { te: "ఆసుపత్రి సేవా కార్యక్రమాలు & రోగుల కిట్లు", hi: "अस्पताल सेवा एवं मरीज किट सहायता" },
  "ASHRAMAM": { te: "ఆశ్రమం & వికలాంగుల సహాయం", hi: "आश्रम एवं दिव्यांग सहायता" },
  "Ashramam & Handicap Support": { te: "ఆశ్రమం & వికలాంగుల సహాయం", hi: "आश्रम एवं दिव्यांग सहायता" },
  "FOOD": { te: "తాజా భోజన పంపిణీ డ్రైవ్", hi: "ताजा भोजन वितरण अभियान" },
  "Fresh Food Packets Drive": { te: "తాజా భోజన పంపిణీ డ్రైవ్", hi: "ताजा भोजन वितरण अभियान" },
  "Tithe": { te: "దశమభాగం (Tithe)", hi: "दशमांश (Tithe)" },
  "Offering": { te: "కానుక (Offering)", hi: "भेंट (Offering)" },
  "Building Fund": { te: "భవన నిర్మాణ నిధి (Building Fund)", hi: "भवन निर्माण कोष" },
  "Missions": { te: "సువార్త సేవ నిధి (Missions)", hi: "मिशनरी फंड" },
};

function getCauseDisplayName(cause: CauseItem, lang: string): string {
  if (lang === "te") return cause.nameTe || CAUSE_TRANSLATIONS[cause.code]?.te || CAUSE_TRANSLATIONS[cause.nameEn]?.te || cause.nameEn;
  if (lang === "hi") return cause.nameHi || CAUSE_TRANSLATIONS[cause.code]?.hi || CAUSE_TRANSLATIONS[cause.nameEn]?.hi || cause.nameEn;
  return cause.nameEn;
}

const BRANCH_TRANSLATIONS: Record<string, { te: string; hi: string }> = {
  "Shapur Nagar (Main Central)": { te: "షాపూర్ నగర్ (ప్రధాన శాఖ)", hi: "शापूर नगर (मुख्य शाखा)" },
  "Shapur Nagar (Main)": { te: "షాపూర్ నగర్ (ప్రధాన శాఖ)", hi: "शापूर नगर (मुख्य शाखा)" },
  "Subhash Nagar Branch": { te: "సుభాష్ నగర్ శాఖ", hi: "सुभाष नगर शाखा" },
  "Bahadurpally Branch": { te: "బహదూర్‌పల్లి శాఖ", hi: "बहादुरपल्ली शाखा" },
};

function getBranchDisplayName(branch: BranchItem, lang: string): string {
  if (lang === "te") return BRANCH_TRANSLATIONS[branch.name]?.te || branch.name;
  if (lang === "hi") return BRANCH_TRANSLATIONS[branch.name]?.hi || branch.name;
  return branch.name;
}

const FORM_FIELD_TRANSLATIONS: Record<string, { te: string; hi: string }> = {
  donorName: { te: "పూర్తి పేరు", hi: "पूरा नाम" },
  donorPhone: { te: "మొబైల్ నంబర్", hi: "मोबाइल नंबर" },
  donorEmail: { te: "ఈమెయిల్ చిరునామా", hi: "ईमेल पता" },
  address: { te: "చిరునామా", hi: "पता" },
  city: { te: "నగరం", hi: "शहर" },
  state: { te: "రాష్ట్రం", hi: "राज्य" },
  prayerRequest: { te: "ప్రార్థన విన్నపం", hi: "प्रार्थना निवेदन" },
  message: { te: "సందేశం", hi: "संदेश" },
  isAnonymous: { te: "నా విరాళాన్ని గోప్యంగా ఉంచండి (Anonymous)", hi: "मेरा दान गोपनीय रखें (Anonymous)" },
};

function getImpactDisplayCopy(amount: number, lang: string): string {
  if (amount < 500) {
    if (lang === "te") return "ప్రభుత్వ ఆసుపత్రి రోగులకు తాజా పండ్ల రసాలు మరియు పోషకాహారాన్ని అందిస్తుంది.";
    if (lang === "hi") return "सरकारी अस्पताल के मरीजों को ताजा फल एवं पोषण सहायता प्रदान करता है।";
    return "Provides fresh nutritious fruit packs and daily hydration to hospital caretakers.";
  }
  if (amount < 1000) {
    if (lang === "te") return "5 మంది ఆసుపత్రి రోగులకు మరియు సహాయకులకు వేడి, పోషకమైన తాజా భోజనాన్ని సమకూరుస్తుంది.";
    if (lang === "hi") return "5 मरीजों और उनके तीमारदारों को पौष्टिक ताजा गर्म भोजन उपलब्ध कराता है।";
    return "Sponsors 5 complete warm, freshly cooked meals for hospital patients & attendants.";
  }
  if (amount < 2500) {
    if (lang === "te") return "1 పూర్తి మెడికల్ రికవరీ కిట్ మరియు అత్యవసర మందులను నిరుపేద రోగికి అందిస్తుంది.";
    if (lang === "hi") return "1 संपूर्ण मेडिकल रिकवरी किट और आवश्यक दवाएं जरूरतमंद मरीज को प्रदान करता है।";
    return "Provides 1 complete emergency medical recovery kit and sterile supplies to a patient.";
  }
  if (amount < 5000) {
    if (lang === "te") return "20 మందికి పైగా రోగులకు భోజనం మరియు ఆశ్రమ వృద్ధులకు మందులను సమకూరుస్తుంది.";
    if (lang === "hi") return "20 से अधिक मरीजों को भोजन और वृद्ध आश्रम में आवश्यक दवाएं उपलब्ध कराता है।";
    return "Funds 20+ fresh meals and essential geriatric medicines at community care shelters.";
  }
  if (amount < 15000) {
    if (lang === "te") return "ఆశ్రమంలో ఒక వృద్ధునికి పూర్తి నెలవారీ పోషణ మరియు ప్రత్యేక ఫిజియోథెరపీ సహాయాన్ని స్పాన్సర్ చేస్తుంది.";
    if (lang === "hi") return "आश्रम में एक बुजुर्ग का पूरे महीने का पोषण एवं आवश्यक फिजियोथेरेपी देखभाल प्रायोजित करता है।";
    return "Sponsors a full month of specialized nutrition, shelter, and medical care for an elderly resident.";
  }
  if (lang === "te") return "పూర్తి కమ్యూనిటీ మెడికల్ క్యాంప్ మరియు వికలాంగులకు వీల్‌చైర్ సహాయాన్ని సమకూరుస్తుంది.";
  if (lang === "hi") return "एक संपूर्ण सामुदायिक चिकित्सा शिविर और दिव्यांगजनों हेतु व्हीलचेयर सहायता प्रदान करता है।";
  return "Funds a dedicated hospital outreach drive, emergency surgery medicines, and mobility wheelchair aids.";
}

function NgoDonationsContent() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Dynamic state
  const [presetAmounts, setPresetAmounts] = useState<PresetAmount[]>(DEFAULT_PRESETS);
  const [causes, setCauses] = useState<CauseItem[]>(DEFAULT_CAUSES);
  const [branches, setBranches] = useState<BranchItem[]>(DEFAULT_BRANCHES);
  const [formFields, setFormFields] = useState<FormFieldRule[]>(DEFAULT_FORM_FIELDS);
  const [settings, setSettings] = useState<PaymentSettings>({
    minDonationAmount: 10,
    maxDonationAmount: 500000,
    upiId: "kcm.kristhraj2004-1@okicici",
    merchantName: "Kingdom of Christ Ministries",
    qrExpiryMinutes: 10,
  });

  // User input state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [frequency, setFrequency] = useState<"ONE_TIME" | "MONTHLY">("ONE_TIME");
  const [amount, setAmount] = useState<string>("1000");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedCause, setSelectedCause] = useState<string>("CHARITY");
  const [selectedBranch, setSelectedBranch] = useState<string>("b1");
  const [paymentStatus, setPaymentStatus] = useState<"PENDING" | "PROCESSING" | "SUCCESS" | "FAILED" | "EXPIRED">("PENDING");

  // Donor Details state
  const [donorDetails, setDonorDetails] = useState<Record<string, any>>({
    donorName: "",
    donorPhone: "",
    donorEmail: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    prayerRequest: "",
    message: "",
    isAnonymous: false,
  });

  // Backend Payment Session Response State
  const [sessionId, setSessionId] = useState<string>("");
  const [donationId, setDonationId] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [qrCodeBase64, setQrCodeBase64] = useState<string>("");
  const [upiUri, setUpiUri] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeftStr, setTimeLeftStr] = useState<string>("10:00");

  // Success Receipt State
  const [receiptData, setReceiptData] = useState<{
    receiptNumber: string;
    transactionId: string;
    amount: number;
    issuedAt: string;
    donorName: string;
    purpose: string;
    branch: string;
  } | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type?: "success" | "error" } | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<any>(null);

  // Read URL query parameter for donation amount pre-selection
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlAmount = urlParams.get("amount");
      if (urlAmount && !isNaN(Number(urlAmount))) {
        setAmount(urlAmount);
      }
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ngoT = t?.ngo || {};
  const dp = ngoT?.donationsPage || {};

  const faqItems = [
    {
      question: dp.faq1Q || "Where does my donation go?",
      answer: dp.faq1A || "100% of your contributions directly fund food distribution drives, hospital patient kits, wheelchairs, medicines, and Ashramam shelter assistance across Hyderabad with zero platform fees."
    },
    {
      question: dp.faq2Q || "How do I pay using UPI on mobile or desktop?",
      answer: dp.faq2A || "On desktop, simply scan the dynamic QR code using Google Pay, PhonePe, Paytm, or BHIM. On mobile, tap any of the UPI app buttons to open your preferred payment app directly."
    },
    {
      question: dp.faq3Q || "Will I receive an instant digital receipt?",
      answer: dp.faq3A || "Yes! As soon as your payment is verified, you can download an official PDF digital receipt, share it on WhatsApp, or have it sent directly to your email address."
    },
    {
      question: dp.faq4Q || "Can I donate anonymously?",
      answer: dp.faq4A || "Yes! In Step 2, simply toggle 'Make my donation anonymous' and your name will remain strictly confidential while still receiving your verified receipt."
    }
  ];

  // Fetch dynamic configuration
  useEffect(() => {
    if (!mounted) return;

    async function loadDynamicConfig() {
      try {
        const res = await fetch("/api/donations/config");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (data.amounts?.length > 0) setPresetAmounts(data.amounts);
            if (data.causes?.length > 0) setCauses(data.causes);
            if (data.branches?.length > 0) setBranches(data.branches);
            if (data.formFields?.length > 0) setFormFields(data.formFields);
            if (data.settings) setSettings(data.settings);

            const defaultAmt = data.amounts?.find((a: PresetAmount) => a.isDefault)?.amount;
            if (defaultAmt) setAmount(defaultAmt.toString());
            else if (data.amounts?.length > 0) setAmount(data.amounts[0].amount.toString());

            if (data.causes?.length > 0) setSelectedCause(data.causes[0].code);
            if (data.branches?.length > 0) setSelectedBranch(data.branches[0].id);
          }
        }
      } catch (err) {
        console.error("[DONATIONS] Dynamic config load failed:", err);
      }
    }

    loadDynamicConfig();
  }, [mounted]);

  // Prefill logged in user info
  useEffect(() => {
    if (user) {
      setDonorDetails((prev) => ({
        ...prev,
        donorName: prev.donorName || user.name || "",
        donorEmail: prev.donorEmail || user.email || "",
      }));
    }
  }, [user]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getFinalAmount = () => (customAmount ? customAmount : amount);

  // Quick Amount Adjuster
  const handleQuickAdd = (addVal: number) => {
    const current = Number(getFinalAmount() || 0);
    const nextVal = current + addVal;
    setCustomAmount(nextVal.toString());
    setAmount("");
  };

  const validateStep1 = () => {
    const finalAmt = Number(getFinalAmount());
    if (isNaN(finalAmt) || finalAmt <= 0) {
      setErrorMessage("Please select or enter a valid donation amount.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  const validateStep2 = () => {
    for (const field of formFields) {
      if (field.isVisible && field.isRequired) {
        const val = donorDetails[field.fieldName];
        if (field.fieldName === "isAnonymous") continue;
        if (!val || (typeof val === "string" && !val.trim())) {
          setErrorMessage(`Please enter your ${field.label}.`);
          return false;
        }
      }
    }

    if (donorDetails.donorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorDetails.donorEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return false;
    }

    if (donorDetails.donorPhone) {
      const cleaned = donorDetails.donorPhone.replace(/[\s-]/g, "");
      if (!/^\+?[0-9]{10,15}$/.test(cleaned)) {
        setErrorMessage("Please enter a valid 10-digit mobile number.");
        return false;
      }
    }

    setErrorMessage("");
    return true;
  };

  const handleProceedToStep2 = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleCreatePaymentOrder = async () => {
    if (loading) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setErrorMessage("You're currently offline. Internet connection is required to complete payment verification.");
      return;
    }
    if (!validateStep2()) return;
    setLoading(true);
    setErrorMessage("");

    try {
      const finalAmt = getFinalAmount();
      const res = await fetch("/api/donations/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(finalAmt),
          purpose: selectedCause,
          branchId: selectedBranch,
          frequency,
          userId: user?.uid || null,
          ...donorDetails,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create donation payment order.");
      }

      setSessionId(data.sessionId);
      setDonationId(data.donationId);
      setOrderId(data.orderId);
      setReferenceNumber(data.referenceNumber);
      setQrCodeBase64(data.qrCode);
      setUpiUri(data.upiUri);
      setExpiresAt(new Date(data.expiresAt));

      setPaymentStatus("PROCESSING");
      setStep(3);

      startPollingStatus(data.sessionId, data.donationId);
      connectSocket(data.sessionId, data.referenceNumber);
    } catch (err: any) {
      console.error("[DONATION_PAGE] Order creation failed:", err);
      setErrorMessage(err.message || "Could not generate UPI QR Code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Countdown Timer
  useEffect(() => {
    if (!expiresAt || step !== 3 || paymentStatus === "SUCCESS") return;

    const updateTimer = () => {
      const diff = expiresAt.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeftStr("00:00");
        setPaymentStatus("EXPIRED");
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }
      const mins = Math.floor((diff / 1000 / 60) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setTimeLeftStr(`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`);
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [expiresAt, step, paymentStatus]);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePaymentConfirmed = useCallback(async (targetDonationId: string, confirmedPaymentId?: string, confirmedReceiptNumber?: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const res = await fetch(`/api/donations/agent?donationId=${targetDonationId}`);
      let serverData = null;
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          serverData = json.data;
        }
      }

      const branchObj = branches.find((b) => b.id === selectedBranch);
      const causeObj = causes.find((c) => c.code === selectedCause);

      setReceiptData({
        receiptNumber: confirmedReceiptNumber || serverData?.receiptNumber || `REC-${Date.now().toString().slice(-8)}`,
        transactionId: confirmedPaymentId || serverData?.razorpayPaymentId || "pay_verified",
        amount: Number(serverData?.amount || getFinalAmount()),
        issuedAt: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
        donorName: donorDetails.isAnonymous ? "Anonymous Donor" : donorDetails.donorName || "Beloved Donor",
        purpose: causeObj ? getCauseDisplayName(causeObj, language) : selectedCause,
        branch: branchObj ? getBranchDisplayName(branchObj, language) : "Shapur Nagar (Main)",
      });

      setPaymentStatus("SUCCESS");
      setStep(4);
      showToast("🎉 Payment verified successfully!", "success");
    } catch (err) {
      console.error("[DONATION_PAGE] Receipt resolution failed:", err);
      setPaymentStatus("SUCCESS");
      setStep(4);
    }
  }, [branches, causes, selectedBranch, selectedCause, donorDetails, getFinalAmount, language]);

  // Real-Time Polling
  const startPollingStatus = useCallback((sid: string, donId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/donations/status/${sid}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.status === "COMPLETED") {
            clearInterval(pollRef.current!);
            handlePaymentConfirmed(donId || data.donationId);
          } else if (data.status === "EXPIRED") {
            clearInterval(pollRef.current!);
            setPaymentStatus("EXPIRED");
          } else if (data.status === "FAILED") {
            clearInterval(pollRef.current!);
            setPaymentStatus("FAILED");
          }
        }
      } catch (err) {
        console.warn("[DONATION_PAGE] Polling check notice:", err);
      }
    }, 3000);
  }, [handlePaymentConfirmed]);

  // Socket.IO Listener
  const connectSocket = useCallback((sid: string, refNum: string) => {
    createDedicatedSocket().then((socket) => {
      if (!socket) return;
      socketRef.current = socket;

      socket.on("connect", () => {
        socket.emit("join", `member:${user?.uid || "guest"}`);
        socket.emit("join", "ngo:donations");
      });

      socket.on("donation.success", (data: any) => {
        if (data.sessionId === sid || data.referenceNumber === refNum) {
          handlePaymentConfirmed(data.donationId || donationId);
        }
      });
    }).catch(() => {});
  }, [user, donationId, handlePaymentConfirmed]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const handleOpenRazorpayCheckout = async () => {
    if (!orderId) {
      showToast("Payment order not initialized. Please try again.", "error");
      return;
    }

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || !(window as any).Razorpay) {
      showToast("Could not load Razorpay Checkout. Please scan the UPI QR code.", "error");
      return;
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
    const finalAmt = Number(getFinalAmount());
    const causeObj = causes.find((c) => c.code === selectedCause);

    const options = {
      key: keyId,
      amount: Math.round(finalAmt * 100),
      currency: "INR",
      name: settings.merchantName || "Kingdom of Christ Ministries",
      description: causeObj?.nameEn || "KCM Ministry Donation",
      order_id: orderId.startsWith("order_") ? orderId : undefined,
      prefill: {
        name: donorDetails.isAnonymous ? "Anonymous Donor" : donorDetails.donorName || "",
        email: donorDetails.donorEmail || "",
        contact: donorDetails.donorPhone || "",
      },
      theme: {
        color: "#6B21A8",
      },
      handler: async function (response: any) {
        setPaymentStatus("PROCESSING");
        try {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId,
              donationId,
              razorpayOrderId: response.razorpay_order_id || orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            handlePaymentConfirmed(verifyData.donationId || donationId, response.razorpay_payment_id, verifyData.receiptNumber);
          } else {
            setErrorMessage(verifyData.error || "Payment signature verification failed.");
            showToast("Payment verification failed.", "error");
          }
        } catch (verifyErr) {
          console.error("[RAZORPAY] Verification call failed:", verifyErr);
          showToast("Network error verifying payment. Checking backend...", "error");
        }
      },
      modal: {
        ondismiss: function () {
          console.info("[RAZORPAY] Checkout modal dismissed");
        },
      },
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (failResponse: any) {
        console.warn("[RAZORPAY] Payment failed:", failResponse.error);
        setErrorMessage(failResponse.error?.description || "Payment was not completed.");
        showToast("Payment failed. Please try again.", "error");
      });
      rzp.open();
    } catch (e: any) {
      console.error("[RAZORPAY] Open modal error:", e);
      showToast("Could not open Razorpay checkout modal.", "error");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2500);
  };

  const handleOpenUpiApp = (pkg?: string, scheme?: string) => {
    if (typeof window === "undefined") return;

    let params = "";
    if (upiUri && upiUri.includes("?")) {
      params = upiUri.split("?")[1];
    } else {
      const finalAmt = Number(getFinalAmount() || "1");
      const merchantName = settings?.merchantName || "Kingdom of Christ Ministries";
      const upiId = settings?.upiId || "kcm.kristhraj2004-1@okicici";
      const encodedName = encodeURIComponent(merchantName);
      const txNote = encodeURIComponent(`KCM NGO Donation Ref ${referenceNumber || orderId || "NGO"}`);
      const ref = referenceNumber || orderId || `KCM-NGO-${Date.now()}`;
      params = `pa=${upiId}&pn=${encodedName}&am=${finalAmt.toFixed(2)}&cu=INR&tn=${txNote}&tr=${ref}`;
    }

    const ua = navigator.userAgent.toLowerCase();
    const isAndroid = /android/i.test(ua);
    const isIOS = /ipad|iphone|ipod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (isAndroid) {
      if (pkg) {
        const playStoreUrl = encodeURIComponent(`https://play.google.com/store/apps/details?id=${pkg}`);
        window.location.href = `intent://pay?${params}#Intent;scheme=upi;package=${pkg};S.browser_fallback_url=${playStoreUrl};end`;
      } else {
        const fallback = encodeURIComponent("https://play.google.com/store/search?q=UPI+payment&c=apps");
        window.location.href = `intent://pay?${params}#Intent;scheme=upi;S.browser_fallback_url=${fallback};end`;
      }
    } else if (isIOS) {
      if (scheme) {
        let targetUrl = scheme;
        if (!targetUrl.includes("?")) targetUrl += targetUrl.endsWith("/") ? "?" : "/?";
        else if (!targetUrl.endsWith("&") && !targetUrl.endsWith("?")) targetUrl += "&";
        window.location.href = `${targetUrl}${params}`;
      } else {
        window.location.href = `upi://pay?${params}`;
      }
    } else {
      window.location.href = `upi://pay?${params}`;
      showToast("Opening UPI app... If on desktop, scan the QR code above.", "success");
    }
  };

  const handleShareReceipt = async () => {
    const receiptUrl = `${window.location.origin}/give/receipt/${donationId}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Kingdom of Christ Ministries — Donation Receipt",
          text: `My donation receipt for ₹${getFinalAmount()} to KCM NGO`,
          url: receiptUrl,
        });
      } catch {}
    } else {
      copyToClipboard(receiptUrl, "receipt_link");
      showToast("Receipt link copied to clipboard!", "success");
    }
  };

  const resetDonationWizard = () => {
    setStep(1);
    setPaymentStatus("PENDING");
    setErrorMessage("");
    setSessionId("");
    setDonationId("");
    setQrCodeBase64("");
  };

  const currentNumAmount = Number(getFinalAmount() || "0");
  const currentImpactText = getImpactDisplayCopy(currentNumAmount, language);

  return (
    <div className="relative py-8 sm:py-14 min-h-[85vh] space-y-8 sm:space-y-12 overflow-hidden">
      {/* Subtle Ambient Glow Blobs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-500/10 dark:bg-purple-600/10 blur-[130px] rounded-full -z-10" />
      <div className="pointer-events-none absolute top-1/3 -right-40 w-[600px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/10 blur-[140px] rounded-full -z-10" />

      {/* ── TOAST NOTIFICATION ───────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`fixed top-20 right-4 sm:right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold border max-w-sm backdrop-blur-xl ${
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

      {/* Top Banner: AI Agent Status & Payment Monitors */}
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <AgentStatusBar />
        {step === 3 && <PaymentStateMonitor />}

        {/* ── TOP IMPACT METRICS BAR ────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-sm text-slate-800 dark:text-slate-200">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">{dp.regdNo || "Regd No: 206/2024"}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{dp.govtRegd || "Govt Registered NGO"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">{dp.assistedCount || "5,000+ Assisted"}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{dp.assistedDesc || "Patients & Families"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 flex-shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">{dp.volunteersCount || "100+ Volunteers"}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{dp.volunteersDesc || "Active Ground Team"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">{dp.taxExempt || "100% Direct Impact"}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{dp.taxExemptDesc || "Zero Platform Fees"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ── LEFT COLUMN: Hero & Cause Explorer ─────────────────────────── */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-black uppercase tracking-wider shadow-sm">
              <Heart className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 fill-purple-500/20 animate-pulse" />
              <span>{dp.tag || "Verified NGO Social Service"}</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12] bg-gradient-to-r from-purple-800 via-indigo-700 to-purple-900 dark:from-white dark:via-purple-100 dark:to-purple-200 bg-clip-text text-transparent">
                {dp.title || "Empowering Lives Through Compassion"}
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
                {dp.desc || "Your direct support provides fresh nutritious meals, life-saving medicines, medical recovery kits, and shelter support to underprivileged hospital patients and elderly care homes."}
              </p>
            </div>

            {/* Interactive Giving Frequency Switcher */}
            <div role="radiogroup" aria-label={dp.tag || "Giving Frequency"} className="p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-1 shadow-inner">
              <button
                type="button"
                role="radio"
                aria-checked={frequency === "ONE_TIME"}
                onClick={() => setFrequency("ONE_TIME")}
                className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation select-none ${
                  frequency === "ONE_TIME"
                    ? "bg-white dark:bg-purple-600 text-purple-900 dark:text-white shadow-md border border-purple-200 dark:border-purple-500/50"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Zap className={`w-4 h-4 ${frequency === "ONE_TIME" ? "text-purple-600 dark:text-white" : "text-purple-500"}`} />
                <span>{dp.oneTime || "One-Time Donation"}</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={frequency === "MONTHLY"}
                onClick={() => setFrequency("MONTHLY")}
                className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 flex items-center justify-center gap-2 relative touch-manipulation select-none ${
                  frequency === "MONTHLY"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25 border border-purple-400"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Calendar className="w-4 h-4 text-white" />
                <span>{dp.monthly || "Monthly Partner"}</span>
                <span className="hidden sm:inline-block bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                  {dp.impact2x || "2x Impact"}
                </span>
              </button>
            </div>

            {/* Live Cause Explorer Selector */}
            <div className="space-y-3 pt-1">
              <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
                {dp.selectCause || "Select Cause to Support"}
              </label>

              <div className="space-y-2.5" role="radiogroup" aria-label={dp.selectCause || "Select Cause to Support"}>
                {causes.map((c) => {
                  const isSelected = selectedCause === c.code;
                  const target = c.targetAmount || 1;
                  const raised = c.raisedAmount || 0;
                  const pct = Math.min(100, Math.round((raised / target) * 100));
                  const causeName = getCauseDisplayName(c, language);

                  return (
                    <button
                      key={c.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`${causeName}, ${pct}% funded`}
                      onClick={() => setSelectedCause(c.code)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer touch-manipulation select-none active:scale-[0.99] ${
                        isSelected
                          ? "bg-purple-50/90 dark:bg-purple-950/60 border-purple-500 dark:border-purple-400 shadow-md shadow-purple-500/10 ring-2 ring-purple-500/20"
                          : "bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/40 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs sm:text-sm font-black ${isSelected ? "text-purple-950 dark:text-white" : "text-slate-900 dark:text-white"}`}>
                            {causeName}
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />}
                        </div>
                        <span className={`text-[11px] font-mono font-bold ${isSelected ? "text-purple-800 dark:text-purple-200" : "text-slate-500 dark:text-slate-400"}`}>
                          ₹{formatNumber(raised)} / ₹{formatNumber(target)} ({pct}%)
                        </span>
                      </div>

                      <div className="w-full bg-slate-200/80 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Impact Calculator Display */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50/60 to-purple-50/30 dark:from-purple-950/60 dark:via-indigo-950/40 dark:to-slate-900 border border-purple-200 dark:border-purple-500/30 text-xs sm:text-sm space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-black">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-300 flex-shrink-0 animate-spin" style={{ animationDuration: '8s' }} />
                <span>{dp.impactOf || "Real-world Impact of"} ₹{formatNumber(currentNumAmount)}:</span>
              </div>
              <p className="text-slate-800 dark:text-slate-100 font-semibold leading-relaxed">
                {currentImpactText}
              </p>
            </div>

            {/* Beneficiaries & Security Card */}
            <div className="p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md text-xs sm:text-sm space-y-3 text-slate-700 dark:text-slate-300 shadow-sm">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p>
                  <strong className="text-slate-900 dark:text-white font-bold">{dp.primaryBeneficiaries || "Primary Beneficiaries:"}</strong> {dp.primaryBeneficiariesDesc || "Caretakers & patients at Gandhi Hospital, NIMS, Osmania, and local physical handicap ashramams."}
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <p>
                  <strong className="text-slate-900 dark:text-white font-bold">{dp.secureGuaranteed || "Direct & Transparent:"}</strong> {dp.secureGuaranteedDesc || "100% of funds go straight to food, patient kits, and wheelchair supplies with instant digital receipts."}
                </p>
              </div>
            </div>

            {/* Supported Payment App Logos */}
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
                {dp.acceptedMethods || "Instant UPI & Secure Checkout"}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { name: "Google Pay", icon: GPayIcon },
                  { name: "PhonePe", icon: PhonePeIcon },
                  { name: "Paytm", icon: PaytmIcon },
                  { name: "BHIM", icon: BhimIcon },
                ].map((app) => (
                  <span
                    key={app.name}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm flex items-center gap-2"
                  >
                    <app.icon />
                    <span>{app.name}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Interactive Donation Wizard Form ─────────────────────── */}
          <div className="lg:col-span-7 lg:sticky lg:top-24 self-start bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-white/10 rounded-3xl p-6 sm:p-8 lg:p-9 shadow-2xl shadow-purple-500/5 relative overflow-hidden">
            
            {/* ── WIZARD STEP INDICATOR ────────────────────────────────────── */}
            <div className="mb-6 pb-4 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center justify-between relative">
                {[
                  { num: 1, label: dp.stepAmount || "Amount" },
                  { num: 2, label: dp.stepDetails || "Details" },
                  { num: 3, label: dp.stepUpi || "Pay UPI" },
                  { num: 4, label: dp.stepReceipt || "Receipt" },
                ].map((s) => {
                  const isCurrent = step === s.num;
                  const isDone = step > s.num;

                  return (
                    <div key={s.num} className="flex flex-col items-center gap-1 z-10">
                      <div
                        className={`w-8 h-8 rounded-full text-xs font-black flex items-center justify-center transition-all ${
                          isDone
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                            : isCurrent
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30 ring-4 ring-purple-100 dark:ring-purple-950"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                      </div>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider ${
                          isCurrent
                            ? "text-purple-700 dark:text-purple-300"
                            : isDone
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}

                {/* Stepper background line */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 dark:bg-slate-800 z-0" />
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-left text-sm text-red-600 dark:text-red-300"
              >
                <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* ── STEP 1: SELECT DONATION AMOUNT ────────────────────────────── */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6 text-left"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      {dp.step1Title || "Step 1: Choose Donation Amount"}
                    </label>
                    <span className="text-[11px] font-extrabold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800/60">
                      {frequency === "MONTHLY" ? (dp.monthlyRecurring || "Monthly Partnership") : (dp.oneTimeGiving || "One-Time Giving")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {presetAmounts.map((preset) => {
                      const isSelected = amount === preset.amount.toString() && !customAmount;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setAmount(preset.amount.toString());
                            setCustomAmount("");
                          }}
                          className={`relative py-3.5 px-3 rounded-2xl border font-black text-sm sm:text-base transition-all duration-200 flex flex-col items-center justify-center gap-0.5 touch-manipulation select-none ${
                            isSelected
                              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-lg shadow-purple-500/25 scale-[1.02]"
                              : "bg-slate-50/80 hover:bg-purple-50/60 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white hover:border-purple-300 dark:hover:border-purple-500/50"
                          }`}
                        >
                          {preset.tag && (
                            <span className={`text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded-full ${
                              isSelected ? "bg-white/20 text-white" : "text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50"
                            }`}>
                              {preset.tag}
                            </span>
                          )}
                          <span className="text-base sm:text-lg font-black">₹{formatNumber(preset.amount)}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Amount Input Box */}
                  <div className="mt-3.5 space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {dp.customPlaceholder || "Or enter custom amount in INR (₹):"}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 dark:text-slate-500">
                        ₹
                      </span>
                      <input
                        type="number"
                        placeholder="Enter any amount"
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setAmount("");
                        }}
                        className={`w-full py-3 pl-8 pr-4 rounded-2xl border text-sm font-bold placeholder:text-slate-400 focus:outline-none transition-all ${
                          customAmount
                            ? "bg-purple-50/90 dark:bg-purple-950/90 text-slate-900 dark:text-white border-purple-600 dark:border-purple-400 shadow-md ring-2 ring-purple-600/20"
                            : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Quick Add Pills */}
                  <div className="pt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-black text-slate-500 dark:text-slate-400">{dp.quickAdd || "Quick add:"}</span>
                    {[500, 1000, 5000].map((addVal) => (
                      <button
                        key={addVal}
                        type="button"
                        onClick={() => handleQuickAdd(addVal)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-slate-800 dark:text-slate-100 text-xs font-black border border-slate-200 dark:border-white/10 transition-colors touch-manipulation select-none"
                      >
                        +₹{formatNumber(addVal)}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToStep2}
                  className="w-full py-4 min-h-[48px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 active:scale-[0.99] transition-all touch-manipulation select-none"
                >
                  <span>{dp.continueDetails || "Continue to Donor Details"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* ── STEP 2: DONOR DETAILS ──────────────────────────────────────── */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4 text-left"
              >
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    {dp.step2Title || "Step 2: Donor Information"}
                  </label>
                  <span className="text-xs font-extrabold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/80 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800/60">
                    {dp.amountPrefix || "Amount:"} ₹{formatNumber(getFinalAmount())}
                  </span>
                </div>

                {/* Dynamic Form Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {formFields.map((field) => {
                    if (!field.isVisible) return null;
                    const val = donorDetails[field.fieldName] || "";
                    const fieldLabel =
                      (language === "te" && FORM_FIELD_TRANSLATIONS[field.fieldName]?.te) ||
                      (language === "hi" && FORM_FIELD_TRANSLATIONS[field.fieldName]?.hi) ||
                      field.label;

                    if (field.fieldType === "checkbox") {
                      return (
                        <div key={field.id} className="sm:col-span-2 flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10">
                          <span className="text-xs font-extrabold text-slate-800 dark:text-white">
                            {fieldLabel}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={!!donorDetails[field.fieldName]}
                            aria-label={fieldLabel}
                            onClick={() =>
                              setDonorDetails((prev) => ({
                                ...prev,
                                [field.fieldName]: !prev[field.fieldName],
                              }))
                            }
                            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors touch-manipulation select-none ${
                              donorDetails[field.fieldName] ? "bg-purple-600 justify-end" : "bg-slate-300 dark:bg-slate-800 justify-start"
                            }`}
                          >
                            <motion.div layout className="w-4 h-4 rounded-full bg-white shadow-md" />
                          </button>
                        </div>
                      );
                    }

                    const isFullWidth = field.fieldName === "donorName" || field.fieldName === "address";

                    return (
                      <div key={field.id} className={isFullWidth ? "sm:col-span-2" : "sm:col-span-1"}>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                          {fieldLabel} {field.isRequired ? "*" : "(Optional)"}
                        </label>
                        <input
                          type={field.fieldType || "text"}
                          disabled={field.fieldName === "donorName" && donorDetails.isAnonymous}
                          value={field.fieldName === "donorName" && donorDetails.isAnonymous ? "Anonymous Donor" : val}
                          onChange={(e) =>
                            setDonorDetails((prev) => ({
                              ...prev,
                              [field.fieldName]: e.target.value,
                            }))
                          }
                          placeholder={field.placeholder || ""}
                          className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:border-purple-500 disabled:opacity-60 touch-manipulation"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Purpose & Branch Selectors */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                      {dp.donationCause || "Donation Cause"}
                    </label>
                    <select
                      value={selectedCause}
                      onChange={(e) => setSelectedCause(e.target.value)}
                      className="w-full py-3 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-purple-500 touch-manipulation"
                    >
                      {causes.map((c) => (
                        <option key={c.id} value={c.code}>
                          {getCauseDisplayName(c, language)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                      {dp.branch || "Branch"}
                    </label>
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      className="w-full py-3 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-purple-500 touch-manipulation"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {getBranchDisplayName(b, language)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Navigation Action Buttons */}
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3.5 min-h-[44px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 touch-manipulation select-none"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{dp.back || "Back"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCreatePaymentOrder}
                    disabled={loading}
                    className="flex-[2] py-3.5 min-h-[44px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 disabled:opacity-50 touch-manipulation select-none"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{dp.generatingQr || "Generating Dynamic QR…"}</span>
                      </>
                    ) : (
                      <>
                        <span>{dp.generateQr || "Generate UPI QR & Checkout"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: DYNAMIC UPI QR & REAL-TIME STATUS ───────────────────── */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 flex flex-col items-center text-center"
              >
                {/* Status Bar */}
                <div className="w-full flex items-center justify-between bg-purple-500/10 border border-purple-500/30 px-4 py-2.5 rounded-2xl text-xs font-bold text-purple-800 dark:text-purple-200">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600 dark:text-purple-400" />
                    <span>{dp.waitingPayment || "Awaiting Payment Confirmation…"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-700 dark:text-slate-200 font-mono font-bold">
                    <Clock className="w-3.5 h-3.5 text-purple-500" />
                    <span>{dp.expiresIn || "Expires in:"} {timeLeftStr}</span>
                  </div>
                </div>

                {/* Dynamic QR Code Container */}
                <div className={`p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-3xl flex flex-col items-center w-full max-w-sm relative transition-all ${
                  paymentStatus === "EXPIRED" ? "opacity-40 grayscale pointer-events-none" : ""
                }`}>
                  <div className="relative w-56 aspect-square bg-white rounded-2xl p-3 border border-slate-200 dark:border-white/20 shadow-inner flex items-center justify-center">
                    {qrCodeBase64 ? (
                      <img
                        src={qrCodeBase64}
                        alt="Dynamic UPI QR Code"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    )}
                  </div>

                  <p className="mt-3 text-sm font-black text-slate-900 dark:text-white">
                    {dp.scanToPay || "Scan with any UPI App to Pay"} ₹{formatNumber(getFinalAmount())}
                  </p>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-bold mt-0.5">
                    {dp.orderRef || "Order Ref:"} {referenceNumber || orderId}
                  </p>

                  {/* Merchant UPI ID Copy Box */}
                  <div className="mt-4 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-slate-800 dark:text-white font-black font-mono truncate mr-2">
                      {dp.upiId || "UPI ID:"} {settings.upiId}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(settings.upiId, "upi")}
                      className="text-purple-700 dark:text-purple-300 font-extrabold hover:text-purple-500 flex items-center gap-1 min-h-[36px] px-2 touch-manipulation select-none flex-shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedLabel === "upi" ? (dp.copied || "Copied!") : (dp.copy || "Copy")}</span>
                    </button>
                  </div>
                </div>

                {/* Mobile Deep Link Apps */}
                <div className="w-full max-w-sm space-y-2.5">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {dp.tapToPayMobile || "Tap to pay directly on mobile"}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: "Google Pay", icon: GPayIcon, pkg: "com.google.android.apps.nbu.paisa.user", scheme: "tez://upi/pay?" },
                      { name: "PhonePe", icon: PhonePeIcon, pkg: "com.phonepe.app", scheme: "phonepe://pay?" },
                      { name: "Paytm", icon: PaytmIcon, pkg: "net.one97.paytm", scheme: "paytmmp://upi/pay?" },
                      { name: "BHIM", icon: BhimIcon, pkg: "in.org.npci.upiapp", scheme: "upi://pay?" },
                    ].map((app) => (
                      <button
                        key={app.name}
                        type="button"
                        onClick={() => handleOpenUpiApp(app.pkg, app.scheme)}
                        className="py-2.5 px-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-black text-slate-800 dark:text-white hover:border-purple-500 hover:shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm min-h-[44px] touch-manipulation select-none"
                      >
                        <app.icon />
                        <span>{app.name}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400 opacity-60 flex-shrink-0" />
                      </button>
                    ))}
                  </div>

                  {/* Razorpay Standard Checkout (Cards, NetBanking, UPI Modal, Wallets) */}
                  <button
                    type="button"
                    onClick={handleOpenRazorpayCheckout}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-700 to-violet-700 hover:from-purple-800 hover:to-indigo-800 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[46px] touch-manipulation select-none"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{dp.payViaCheckout || "Pay with Cards, NetBanking, or Wallet"}</span>
                  </button>

                  {/* Universal Open in UPI App Chooser Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenUpiApp()}
                    className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-950/60 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800/60 font-extrabold text-xs shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px] touch-manipulation select-none"
                  >
                    <Smartphone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>{dp.openInAnyUpi || "Open in any UPI App"}</span>
                  </button>
                </div>

                {/* Back / Edit Details */}
                <div className="pt-3 w-full max-w-sm flex items-center justify-between border-t border-slate-100 dark:border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold flex items-center gap-1 min-h-[36px] touch-manipulation select-none"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{dp.editDetails || "Edit Details"}</span>
                  </button>

                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>256-Bit SSL Encrypted</span>
                  </span>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: SUCCESS VIEW ───────────────────────────────────────── */}
            {step === 4 && paymentStatus === "SUCCESS" && receiptData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-5"
              >
                <div className="flex flex-col items-center text-center pt-2 pb-1">
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
                    className="relative w-20 h-20 mb-4"
                  >
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: "2s" }} />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 shadow-2xl shadow-emerald-500/40 flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
                    </div>
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight"
                  >
                    {dp.paymentSuccess || "Payment Successful! 🎉"}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 max-w-xs font-medium"
                  >
                    {dp.paymentSuccessDesc || "Thank you for your generous support. Your donation has been recorded and actively put to work on the field."}
                  </motion.p>
                </div>

                {/* Amount Hero Card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-purple-600 via-indigo-600 to-violet-600 rounded-2xl p-5 text-center shadow-xl shadow-purple-500/25"
                >
                  <p className="text-purple-200 text-xs font-extrabold uppercase tracking-widest mb-1">{dp.amountDonated || "Amount Donated"}</p>
                  <p className="text-white text-4xl font-black tracking-tight">
                    ₹{formatNumber(receiptData.amount, true)}
                  </p>
                  <p className="text-purple-200 text-xs mt-1.5 font-bold">{receiptData.purpose}</p>
                </motion.div>

                {/* Receipt Breakdown Table */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm"
                >
                  <div className="bg-purple-600/10 dark:bg-purple-900/40 px-5 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                      <span className="text-xs font-extrabold uppercase tracking-widest text-purple-800 dark:text-purple-200">{dp.officialReceipt || "Official Receipt"}</span>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-white/10 text-xs">
                    {[
                      { label: dp.receiptNumber || "Receipt Number", value: receiptData.receiptNumber, mono: true, highlight: true },
                      { label: dp.donationId || "Donation ID", value: donationId, mono: true },
                      { label: dp.transactionId || "Transaction Ref / UTR", value: receiptData.transactionId, mono: true },
                      { label: dp.dateTime || "Date & Time", value: receiptData.issuedAt },
                      { label: dp.donorName || "Donor Name", value: receiptData.donorName },
                      { label: dp.donationCause || "Donation Cause", value: receiptData.purpose },
                      { label: dp.branch || "Branch", value: receiptData.branch },
                      { label: dp.paymentMethod || "Payment Method", value: "UPI (Instant Dynamic QR)" },
                    ].map((row) => (
                      <div key={row.label} className="flex justify-between items-center px-5 py-2.5 gap-3">
                        <span className="text-slate-500 dark:text-slate-400 flex-shrink-0 font-semibold">{row.label}</span>
                        <span className={`font-bold text-right break-all ${
                          row.highlight
                            ? "text-purple-700 dark:text-purple-300 font-mono font-extrabold"
                            : row.mono
                            ? "font-mono text-slate-800 dark:text-white"
                            : "text-slate-900 dark:text-white"
                        }`}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  className="space-y-2.5"
                >
                  <a
                    href={`/api/receipts/${donationId}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 min-h-[48px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] touch-manipulation select-none"
                  >
                    <Download className="w-4 h-4" />
                    {dp.downloadPdf || "Download Receipt (PDF)"}
                  </a>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleShareReceipt}
                      className="py-3 min-h-[44px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all touch-manipulation select-none"
                    >
                      <Share2 className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                      {dp.shareReceipt || "Share Receipt"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        fetch(`/api/receipts/${donationId}?email=true`)
                          .then(() => showToast("📧 Receipt emailed successfully!", "success"))
                          .catch(() => showToast("Could not send email. Try again.", "error"));
                      }}
                      className="py-3 min-h-[44px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all touch-manipulation select-none"
                    >
                      <Mail className="w-4 h-4 text-blue-500" />
                      {dp.emailReceipt || "Email Receipt"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={resetDonationWizard}
                      className="py-3 min-h-[44px] bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800/60 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all touch-manipulation select-none"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>{dp.donateAgain || "Donate Again"}</span>
                    </button>

                    <Link
                      href="/member/give"
                      className="py-3 min-h-[44px] bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-700/50 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all touch-manipulation select-none"
                    >
                      <FileText className="w-4 h-4" />
                      <span>{dp.donationHistory || "History"}</span>
                    </Link>

                    <Link
                      href="/ngo"
                      className="py-3 min-h-[44px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all col-span-2 sm:col-span-1 touch-manipulation select-none"
                    >
                      <Home className="w-4 h-4" />
                      <span>{dp.returnHome || "NGO Home"}</span>
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            )}

          </div>
        </div>
      </div>

      {/* ── BOTTOM SECTION: FAQ ACCORDION ─────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {dp.faqTitle || "Frequently Asked Questions"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
            {dp.faqSubtitle || "Learn more about our transparent fund allocation, payment methods, and instant digital receipts."}
          </p>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 min-h-[48px] text-left font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors touch-manipulation select-none"
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    {item.question}
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-white/10 pt-3 font-medium"
                    >
                      {item.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function NgoDonationsPage() {
  usePreventContextMenu();

  return (
    <div onContextMenu={(e) => e.preventDefault()} className="w-full">
      <DonationAgentProvider>
        <NgoDonationsContent />
      </DonationAgentProvider>
    </div>
  );
}
