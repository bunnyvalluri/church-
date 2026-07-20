"use client";

import { useState, useEffect } from "react";
import { 
  Heart, 
  ShieldCheck, 
  Loader2, 
  ArrowRight, 
  Lock, 
  Sparkles,
  RefreshCw
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useAuth } from "@/components/providers/AuthProvider";

import DynamicGivingHero from "@/components/giving/DynamicGivingHero";
import DynamicPurposeSelector from "@/components/giving/DynamicPurposeSelector";
import DynamicAmountSelector from "@/components/giving/DynamicAmountSelector";
import DynamicBranchSelector from "@/components/giving/DynamicBranchSelector";
import DynamicDonorFormBuilder from "@/components/giving/DynamicDonorFormBuilder";
import DynamicPaymentModal from "@/components/giving/DynamicPaymentModal";
import MemberGivingHistory from "@/components/giving/MemberGivingHistory";

export default function GiveForm() {
  const { language } = useLanguage();
  const { user } = useAuth();

  // Dynamic Metadata state fetched from database
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [heroConfig, setHeroConfig] = useState<any>(null);
  const [purposes, setPurposes] = useState<any[]>([]);
  const [amounts, setAmounts] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [formFields, setFormFields] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  // User Selections
  const [selectedPurposeCode, setSelectedPurposeCode] = useState<string>("");
  const [selectedAmount, setSelectedAmount] = useState<string>("1000");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  
  // Dynamic Donor Form Input Values
  const [formData, setFormData] = useState<Record<string, any>>({
    donorName: user?.name || "",
    donorEmail: user?.email || "",
    donorPhone: (user as any)?.phone || "",
    isAnonymous: false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Payment Session Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<{
    sessionId: string;
    referenceNumber: string;
    amount: number;
    qrCodeDataUrl?: string;
    upiUri?: string;
  } | null>(null);

  // Fetch all configuration dynamically on mount
  useEffect(() => {
    async function loadDynamicConfig() {
      try {
        setLoadingConfig(true);
        const res = await fetch("/api/donations/config");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setHeroConfig(data.heroConfig);
            setPurposes(data.causes || []);
            setAmounts(data.amounts || []);
            setBranches(data.branches || []);
            setFormFields(data.formFields || []);
            setSettings(data.settings);

            // Default Selections
            if (data.causes?.length > 0) setSelectedPurposeCode(data.causes[0].code);
            if (data.branches?.length > 0) setSelectedBranchId(data.branches[0].id);

            const defaultAmount = data.amounts?.find((a: any) => a.isDefault)?.amount || 1000;
            setSelectedAmount(String(defaultAmount));
          }
        }
      } catch (err) {
        console.error("[GIVE_FORM] Failed to load dynamic config:", err);
      } finally {
        setLoadingConfig(false);
      }
    }

    loadDynamicConfig();
  }, []);

  // Sync logged in user details if available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        donorName: prev.donorName || user.name || "",
        donorEmail: prev.donorEmail || user.email || "",
        donorPhone: prev.donorPhone || (user as any)?.phone || "",
      }));
    }
  }, [user]);

  const handleFormFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const getEffectiveAmount = (): number => {
    if (selectedAmount === "custom") {
      return parseFloat(customAmount) || 0;
    }
    return parseFloat(selectedAmount) || 0;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const effectiveAmount = getEffectiveAmount();

    const minAmount = settings?.minDonationAmount || 1;
    const maxAmount = settings?.maxDonationAmount || 500000;

    if (!selectedPurposeCode) {
      errors.purpose = "Please select a giving cause / purpose";
    }

    if (!effectiveAmount || effectiveAmount < minAmount) {
      errors.amount = `Minimum donation amount is ₹${minAmount}`;
    } else if (effectiveAmount > maxAmount) {
      errors.amount = `Maximum donation amount is ₹${maxAmount.toLocaleString('en-IN')}`;
    }

    // Dynamic field rules validation
    formFields.forEach((field) => {
      if (field.isVisible && field.isRequired) {
        const val = formData[field.fieldName];
        if (!val || (typeof val === "string" && !val.trim())) {
          errors[field.fieldName] = `${field.label} is required`;
        }
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const effectiveAmount = getEffectiveAmount();

      // 1. Create backend payment order & session
      const createRes = await fetch("/api/donations/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: effectiveAmount,
          currency: "INR",
          purpose: selectedPurposeCode,
          purposeCode: selectedPurposeCode,
          branchId: selectedBranchId,
          donorName: formData.donorName || undefined,
          donorEmail: formData.donorEmail || undefined,
          donorPhone: formData.donorPhone || undefined,
          panNumber: formData.panNumber || undefined,
          prayerRequest: formData.prayerRequest || undefined,
          notes: formData.notes || undefined,
          isAnonymous: Boolean(formData.isAnonymous),
        }),
      });

      const createData = await createRes.json();
      if (!createRes.ok || !createData.success) {
        throw new Error(createData.error || "Failed to initialize donation session.");
      }

      const { sessionId, referenceNumber } = createData;

      // 2. Generate dynamic single-use UPI QR code
      const qrRes = await fetch("/api/donations/generate-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const qrData = await qrRes.json();
      if (!qrRes.ok || !qrData.success) {
        throw new Error(qrData.error || "Failed to generate dynamic QR code.");
      }

      // 3. Open dynamic payment state machine modal
      setActiveSession({
        sessionId,
        referenceNumber,
        amount: effectiveAmount,
        qrCodeDataUrl: qrData.qrCode,
        upiUri: qrData.upiUri,
      });

      setModalOpen(true);
    } catch (err: any) {
      console.error("[SUBMIT_GIVING] Error:", err);
      setErrorMessage(err.message || "An error occurred while creating your donation.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingConfig) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
        <p className="text-sm font-bold text-gray-600 dark:text-slate-400">
          Loading Dynamic Giving Platform...
        </p>
      </div>
    );
  }

  const effectiveAmount = getEffectiveAmount();

  return (
    <div className="space-y-6 sm:space-y-8 py-2 sm:py-4 max-w-5xl mx-auto px-2 sm:px-6">
      {/* 1. Dynamic Hero Section */}
      <DynamicGivingHero {...heroConfig} />

      {/* 2. Main Giving Form Card */}
      <form
        id="give-form"
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl space-y-6 sm:space-y-8"
      >
        {/* Purpose Selector */}
        <DynamicPurposeSelector
          purposes={purposes}
          selectedCode={selectedPurposeCode}
          onSelect={setSelectedPurposeCode}
          language={language}
        />

        {/* Amount Selector */}
        <DynamicAmountSelector
          amounts={amounts}
          selectedAmount={selectedAmount}
          customAmount={customAmount}
          onSelectAmount={setSelectedAmount}
          onCustomAmountChange={setCustomAmount}
          minAmount={settings?.minDonationAmount || 1}
          maxAmount={settings?.maxDonationAmount || 500000}
        />
        {formErrors.amount && (
          <p className="text-xs text-rose-500 font-bold -mt-2">{formErrors.amount}</p>
        )}

        {/* Branch Selector */}
        <DynamicBranchSelector
          branches={branches}
          selectedBranchId={selectedBranchId}
          onSelectBranch={setSelectedBranchId}
        />

        {/* Dynamic Donor Form Builder */}
        <DynamicDonorFormBuilder
          fields={formFields}
          formData={formData}
          onChange={handleFormFieldChange}
          errors={formErrors}
        />

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Submit CTA Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-extrabold text-base sm:text-lg shadow-xl shadow-violet-600/25 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Secure Payment Session...
            </>
          ) : (
            <>
              <Heart className="w-5 h-5 fill-current text-rose-300" />
              Proceed to Give ₹{effectiveAmount > 0 ? effectiveAmount.toLocaleString('en-IN') : '0'}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Security Footer */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 dark:text-slate-400 font-medium pt-2 border-t border-gray-100 dark:border-slate-800">
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-500" /> 256-bit Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-violet-500" /> Section 80G Tax Deductible
          </span>
        </div>
      </form>

      {/* 3. Member Giving History */}
      <MemberGivingHistory />

      {/* 4. Payment State Machine Modal */}
      {activeSession && (
        <DynamicPaymentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          sessionId={activeSession.sessionId}
          referenceNumber={activeSession.referenceNumber}
          amount={activeSession.amount}
          qrCodeDataUrl={activeSession.qrCodeDataUrl}
          upiUri={activeSession.upiUri}
          upiId={settings?.upiId}
          churchName={settings?.merchantName}
          donorName={formData.donorName}
          donorEmail={formData.donorEmail}
        />
      )}
    </div>
  );
}
