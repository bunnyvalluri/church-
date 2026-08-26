"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Smartphone,
  Send,
  ArrowLeft,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  HelpCircle,
  Loader2
} from "lucide-react";
import { useSendTestSms } from "@/hooks/useSms";

const SAMPLE_TEMPLATES = [
  {
    id: "CUSTOM",
    name: "Custom Message",
    content: "KCM Ministries: Greetings in Jesus' name! This is a test notification from Church Portal.",
  },
  {
    id: "EVENT_CREATED",
    name: "Church Event Notice",
    content: "KCM Ministries: New Event Scheduled!\n📅 Sunday Worship Celebration\n🗓 30 Aug 2026 at 9:00 AM\n📍 KCM Central Sanctuary\nDetails: kcmchurch.vercel.app/#events\nReply STOP to opt out.",
  },
  {
    id: "MEMBER_WELCOME",
    name: "Member Registration Welcome",
    content: "Welcome to Kingdom of Christ Ministries! Your membership registration is confirmed. We look forward to fellowship with you. God bless you!",
  },
  {
    id: "DONATION_CONFIRMATION",
    name: "Donation Offering Receipt",
    content: "KCM Ministries: Praise the Lord! Your offering of ₹1000 was received successfully. (Ref: KCM-2026-TEST). Receipt: kcmchurch.vercel.app/give. God bless you!",
  },
  {
    id: "PRAYER_ACKNOWLEDGED",
    name: "Prayer Request Received",
    content: "Kingdom of Christ Ministries: Your prayer request has been received. Our pastoral team is standing in prayer with you. \"With God all things are possible.\" - Mark 10:27",
  },
];

export default function AdminSmsTestPage() {
  const [phoneNumber, setPhoneNumber] = useState<string>("+919876543210");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("CUSTOM");
  const [messageText, setMessageText] = useState<string>(SAMPLE_TEMPLATES[0].content);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [resultSuccess, setResultSuccess] = useState<any | null>(null);

  const sendTestMutation = useSendTestSms();

  // Normalize phone preview
  const normalizedPreview = useMemo(() => {
    let clean = phoneNumber.trim().replace(/[^\d+]/g, "");
    if (/^[6-9]\d{9}$/.test(clean)) return `+91${clean}`;
    if (/^91[6-9]\d{9}$/.test(clean)) return `+${clean}`;
    return clean;
  }, [phoneNumber]);

  const isValidPhone = useMemo(() => {
    return /^\+91[6-9]\d{9}$/.test(normalizedPreview) || /^\+[1-9]\d{7,14}$/.test(normalizedPreview);
  }, [normalizedPreview]);

  // Character and Segment Counting
  const length = messageText.length;
  const isUnicode = /[^\u0000-\u007F]/.test(messageText);
  const maxSingle = isUnicode ? 70 : 160;
  const maxConcat = isUnicode ? 67 : 153;
  const segments = length === 0 ? 0 : length <= maxSingle ? 1 : Math.ceil(length / maxConcat);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = SAMPLE_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) setMessageText(tmpl.content);
  };

  const handleSend = () => {
    if (!isValidPhone || !messageText.trim()) return;
    setResultSuccess(null);
    sendTestMutation.mutate(
      {
        phoneNumber: normalizedPreview,
        message: messageText.trim(),
        template: selectedTemplateId,
      },
      {
        onSuccess: (data) => {
          setResultSuccess(data);
          setShowConfirm(false);
        },
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/notifications/sms"
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to SMS Dashboard
        </Link>
      </div>

      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  SMS Diagnostic & Test Console
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Safely test Android SIM gateway delivery and SMS formatting
                </p>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-4 h-4" />
            Admin Authorized Only
          </div>
        </div>

        {/* Success Alert */}
        {resultSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm">
              <span className="font-extrabold text-emerald-900 dark:text-emerald-200">
                Test SMS successfully queued for dispatch!
              </span>
              <p className="text-emerald-700 dark:text-emerald-300 text-xs">
                Message ID: <span className="font-mono font-bold">{resultSuccess.messageId}</span> via provider: <span className="font-bold capitalize">{resultSuccess.provider}</span>.
              </p>
              <div className="pt-2">
                <Link
                  href="/admin/notifications/sms"
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View in Realtime Dashboard →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {sendTestMutation.isError && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-rose-700 dark:text-rose-300">
              <span className="font-bold block">Dispatch Failed:</span>
              {sendTestMutation.error?.message || "An unexpected error occurred."}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Recipient Mobile Number (India +91)
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+919876543210 or 10-digit number"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex items-center justify-between mt-1 text-[11px]">
                <span className="text-slate-400">
                  Normalized E.164: <strong className="text-slate-700 dark:text-slate-300">{normalizedPreview}</strong>
                </span>
                {isValidPhone ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Valid format
                  </span>
                ) : (
                  <span className="text-rose-500 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Needs 10 digits
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Template Preset
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SAMPLE_TEMPLATES.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    {tmpl.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  SMS Message Body
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  {isUnicode ? "UCS-2 Unicode" : "GSM 7-bit"} Encoding
                </span>
              </div>
              <textarea
                rows={5}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Enter SMS message content..."
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-sans"
              />

              {/* Character & Segment Counter Bar */}
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                <span>
                  Characters: <strong>{length}</strong>
                </span>
                <span>
                  Billable Segments: <strong className="text-indigo-600 dark:text-indigo-400">{segments}</strong> ({isUnicode ? "67 chars/part" : "153 chars/part"})
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Phone Visual Preview */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-100/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Mobile Message Preview</span>
            
            {/* Phone Screen Mockup */}
            <div className="w-full max-w-[280px] bg-slate-900 text-white rounded-[2.5rem] p-4 shadow-2xl border-4 border-slate-700 space-y-3">
              <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto" />
              <div className="text-center text-[10px] text-slate-400 font-semibold">
                KCM Ministries Alert
              </div>
              <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tl-sm text-xs leading-relaxed whitespace-pre-wrap shadow-sm">
                {messageText || "Type a message to see preview..."}
              </div>
              <div className="text-[9px] text-slate-500 text-right">Just now</div>
            </div>

            <div className="text-center text-xs text-slate-500 space-y-1">
              <p>Protected by rate limiting & idempotency keys</p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            disabled={!isValidPhone || !messageText.trim() || sendTestMutation.isPending}
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:opacity-90 disabled:opacity-40 shadow-lg shadow-indigo-500/20 transition"
          >
            {sendTestMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Dispatching...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Test SMS
              </>
            )}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Confirm SMS Dispatch</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to send this test message to <strong className="text-indigo-600">{normalizedPreview}</strong>?
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 max-h-32 overflow-y-auto whitespace-pre-wrap">
              {messageText}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sendTestMutation.isPending}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Confirm & Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
