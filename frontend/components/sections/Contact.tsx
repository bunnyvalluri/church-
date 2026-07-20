"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, Clock, RefreshCw } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useContacts } from "@/hooks/useCmsData";
import type { SiteContact } from "@/types/cms";

// ── Tab colour map by branch index ────────────────────────────────────────────
const TAB_ACTIVE_CLASSES: Record<number, string> = {
  0: "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30 border-0",
  1: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 border-0",
  2: "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 border-0",
};

const ICON_BG_CLASSES = [
  "from-violet-500 via-purple-500 to-indigo-600",
  "from-emerald-500 via-teal-500 to-cyan-600",
  "from-orange-500 via-amber-500 to-yellow-500",
];

// ── Contact Info Skeleton ─────────────────────────────────────────────────────
function ContactInfoSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-6" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
            <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded w-full" />
            <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Info Row Component ────────────────────────────────────────────────────────
function InfoRow({
  icon,
  gradient,
  title,
  children,
}: {
  icon: React.ReactNode;
  gradient: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group flex items-start gap-3 sm:gap-4">
      <div
        className={`relative w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-md sm:shadow-lg transition-transform duration-300 group-hover:scale-110`}
      >
        <div className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-300 blur-md bg-inherit" />
        <div className="scale-90 sm:scale-100">{icon}</div>
      </div>
      <div className="flex-1 min-w-0 pt-0.5 sm:pt-1">
        <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40 mb-1">
          {title}
        </h4>
        <div className="text-slate-800 dark:text-white/90 text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Main Contact Component ────────────────────────────────────────────────────
export default function Contact() {
  const { t, language } = useLanguage();
  const { contacts, loading, error, refetch } = useContacts();

  const [selectedBranchIdx, setSelectedBranchIdx] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const selectedContact: SiteContact | undefined = contacts[selectedBranchIdx];

  useEffect(() => {
    const pending = sessionStorage.getItem("pending-contact-branch") as string | null;
    if (pending && contacts.length) {
      const idx = contacts.findIndex((c) => c.branchKey === pending);
      if (idx >= 0) setSelectedBranchIdx(idx);
      sessionStorage.removeItem("pending-contact-branch");
    }

    const handleBranchChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ branch: string }>;
      if (customEvent.detail?.branch && contacts.length) {
        const idx = contacts.findIndex((c) => c.branchKey === customEvent.detail.branch);
        if (idx >= 0) setSelectedBranchIdx(idx);
      }
    };

    window.addEventListener("change-contact-branch", handleBranchChange);
    return () => window.removeEventListener("change-contact-branch", handleBranchChange);
  }, [contacts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to send message");
      setSubmitStatus("success");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch (err) {
      console.error(err);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resolveAddress = (contact: SiteContact) => {
    if (language === "te" && contact.addressTe) return contact.addressTe;
    if (language === "hi" && contact.addressHi) return contact.addressHi;
    return contact.address;
  };

  const resolveBranchName = (contact: SiteContact) => {
    if (language === "te" && contact.branchNameTe) return contact.branchNameTe;
    if (language === "hi" && contact.branchNameHi) return contact.branchNameHi;
    return contact.branchName;
  };

  const activeGradient = ICON_BG_CLASSES[selectedBranchIdx] ?? ICON_BG_CLASSES[0];

  return (
    <section
      id="contact"
      className="py-14 sm:py-20 lg:py-24 bg-slate-50 dark:bg-transparent relative z-10 transition-colors duration-300 overflow-hidden"
    >
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-400/10 dark:bg-violet-600/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-400/5 dark:bg-purple-600/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-14 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
              Get In Touch
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-slate-900 dark:text-white tracking-tight">
            {t.contact.title}{" "}
            <span className="text-gradient">{t.contact.titleHighlight}</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-500 dark:text-white/60 max-w-xl mx-auto px-2">{t.contact.subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-5 sm:gap-8 lg:gap-10 max-w-6xl mx-auto">
          {/* ── Left Column: Contact Info + Map ── */}
          <div className="space-y-4 sm:space-y-6">
            {/* Contact Info Card */}
            <div className="relative bg-white dark:bg-white/[0.03] rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/[0.06] backdrop-blur-xl">
              {/* Gradient accent bar at top */}
              <div className={`h-1 w-full bg-gradient-to-r ${activeGradient} transition-all duration-500`} />

              <div className="p-4 sm:p-6 lg:p-8">
                <h3 className="text-lg sm:text-xl font-bold mb-5 sm:mb-7 text-slate-900 dark:text-white tracking-tight">
                  {t.contact.infoTitle}
                </h3>

                {/* Loading state */}
                {loading && <ContactInfoSkeleton />}

                {/* Error state */}
                {error && !loading && (
                  <div className="flex flex-col items-center py-8 gap-3 text-center">
                    <p className="text-rose-500 text-sm">{t.contact.subtitle}</p>
                    <button
                      onClick={refetch}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-sm font-medium hover:bg-[hsl(var(--primary)/0.2)] transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" /> Retry
                    </button>
                  </div>
                )}

                {/* Branch tabs */}
                {!loading && !error && contacts.length > 0 && (
                  <>
                    {/* Tab bar */}
                    <div className="flex gap-1.5 p-1 sm:p-1.5 bg-slate-100 dark:bg-white/[0.04] rounded-xl sm:rounded-2xl mb-5 sm:mb-8 overflow-x-auto scrollbar-none">
                      {contacts.map((contact, idx) => (
                        <button
                          key={contact.id}
                          type="button"
                          onClick={() => setSelectedBranchIdx(idx)}
                          className={`flex-1 min-w-0 py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs lg:text-sm transition-all duration-300 whitespace-nowrap truncate ${
                            selectedBranchIdx === idx
                              ? TAB_ACTIVE_CLASSES[idx] ??
                                "bg-white dark:bg-gray-800 text-[hsl(var(--primary))] shadow-sm"
                              : "text-slate-500 dark:text-white/50 hover:text-slate-800 dark:hover:text-white"
                          }`}
                        >
                          {resolveBranchName(contact)}
                        </button>
                      ))}
                    </div>

                    {selectedContact && (
                      <div className="space-y-6">
                        {/* Address */}
                        <InfoRow
                          icon={<MapPin className="h-6 w-6 text-white" />}
                          gradient={`from-violet-500 to-purple-600`}
                          title={t.contact.address}
                        >
                          <a
                            href={selectedContact.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-medium leading-relaxed"
                          >
                            {resolveAddress(selectedContact)
                              .split("\n")
                              .map((line, i) => (
                                <span key={i}>
                                  {line}
                                  {i < resolveAddress(selectedContact).split("\n").length - 1 && <br />}
                                </span>
                              ))}
                          </a>
                        </InfoRow>

                        {/* Phones */}
                        {selectedContact.phones?.length > 0 && (
                          <InfoRow
                            icon={<Phone className="h-6 w-6 text-white" />}
                            gradient="from-emerald-500 to-teal-600"
                            title={t.contact.phone}
                          >
                            <div className="flex flex-col gap-1.5">
                              {selectedContact.phones.map((phone, i) => (
                                <a
                                  key={i}
                                  href={`tel:${phone.number.replace(/\s/g, "")}`}
                                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium"
                                >
                                  {phone.number}
                                  {phone.label && (
                                    <span className="text-xs text-slate-400 dark:text-white/30 ml-2 font-normal">
                                      {phone.label}
                                    </span>
                                  )}
                                </a>
                              ))}
                            </div>
                          </InfoRow>
                        )}

                        {/* Email */}
                        {selectedContact.email && (
                          <InfoRow
                            icon={<Mail className="h-6 w-6 text-white" />}
                            gradient="from-blue-500 to-cyan-500"
                            title={t.contact.email}
                          >
                            <a
                              href={`mailto:${selectedContact.email}`}
                              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors break-all font-medium"
                            >
                              {selectedContact.email}
                            </a>
                          </InfoRow>
                        )}

                        {/* Service Hours */}
                        {selectedContact.serviceHours && (
                          <InfoRow
                            icon={<Clock className="h-6 w-6 text-white" />}
                            gradient="from-pink-500 to-rose-500"
                            title={t.contact.hours}
                          >
                            <span className="font-medium">{selectedContact.serviceHours}</span>
                          </InfoRow>
                        )}

                        {/* Divider */}
                        <div className="h-px bg-slate-100 dark:bg-white/[0.06] my-2" />

                        {/* WhatsApp CTA */}
                        {selectedContact.whatsappUrl && (
                          <a
                            href={selectedContact.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-bold text-sm hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] transition-all duration-300"
                          >
                            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                            </div>
                            <span>Chat on WhatsApp</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-auto opacity-70 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </a>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Map Embed */}
            {!loading && !error && selectedContact && (
              <div className="bg-white dark:bg-white/[0.03] rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/[0.06] h-[18rem] relative group backdrop-blur-xl p-2">
                <div className="absolute inset-2 rounded-2xl overflow-hidden">
                  <a
                    href={selectedContact.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-10 flex items-end p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <span className="text-white text-sm font-semibold flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      {t.contact.openMaps}
                    </span>
                  </a>
                  <iframe
                    src={selectedContact.embedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    className={selectedContact.isStreetView ? "" : "dark:invert-[0.9] dark:hue-rotate-180"}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            )}

            {/* Map skeleton */}
            {loading && (
              <div className="animate-pulse bg-slate-200 dark:bg-slate-800 rounded-3xl h-[18rem]" />
            )}
          </div>

          {/* ── Right Column: Contact Form ── */}
          <div className="relative bg-white dark:bg-white/[0.03] rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/[0.06] backdrop-blur-xl h-fit">
            {/* Gradient accent bar at top */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-purple-600" />

            <div className="p-4 sm:p-6 lg:p-8">
              <h3 className="text-lg sm:text-xl font-bold mb-5 sm:mb-7 text-slate-900 dark:text-white tracking-tight">
                {t.contact.formTitle}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">
                      {t.contact.name}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400/50 dark:focus:border-violet-500/40 transition-all placeholder:text-slate-300 dark:placeholder:text-white/20 text-sm"
                      placeholder={t.contact.namePlaceholder}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">
                      {t.contact.emailLabel}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400/50 dark:focus:border-violet-500/40 transition-all placeholder:text-slate-300 dark:placeholder:text-white/20 text-sm"
                      placeholder={t.contact.emailPlaceholder}
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">
                      {t.contact.phoneLabel}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400/50 dark:focus:border-violet-500/40 transition-all placeholder:text-slate-300 dark:placeholder:text-white/20 text-sm"
                      placeholder={t.contact.phonePlaceholder}
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">
                      {t.contact.subject}
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400/50 dark:focus:border-violet-500/40 transition-all text-sm"
                    >
                      <option value="">{t.contact.subjectPlaceholder}</option>
                      <option value="general">{t.contact.subjectGeneral}</option>
                      <option value="prayer">{t.contact.subjectPrayer}</option>
                      <option value="event">{t.contact.subjectEvent}</option>
                      <option value="membership">{t.contact.subjectMembership}</option>
                      <option value="volunteer">{t.contact.subjectVolunteer}</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">
                    {t.contact.message}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400/50 dark:focus:border-violet-500/40 transition-all resize-none placeholder:text-slate-300 dark:placeholder:text-white/20 text-sm"
                    placeholder={t.contact.messagePlaceholder}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || submitStatus === "success"}
                  className={`w-full py-4 rounded-2xl font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2.5 text-sm ${
                    submitStatus === "success"
                      ? "bg-emerald-500 text-white cursor-default"
                      : submitStatus === "error"
                      ? "bg-rose-500 text-white"
                      : "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-xl hover:shadow-violet-500/25 hover:scale-[1.02] dark:from-white/10 dark:to-white/5 dark:border dark:border-white/10 dark:hover:border-white/20"
                  } ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t.contact.sending}
                    </span>
                  ) : submitStatus === "success" ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {t.contact.sent}
                    </span>
                  ) : submitStatus === "error" ? (
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {t.contact.failed}
                    </span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {t.contact.send}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
