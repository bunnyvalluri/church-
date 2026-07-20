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

// ── Contact Info Skeleton ─────────────────────────────────────────────────────
function ContactInfoSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl mb-6" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
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

  // Listen for cross-section navigation (from About section branch clicks)
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

  // Resolve address in current language
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

  return (
    <section
      id="contact"
      className="py-24 bg-slate-50 dark:bg-transparent relative z-10 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white tracking-tight">
            {t.contact.title}{" "}
            <span className="text-gradient">{t.contact.titleHighlight}</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-white/70">{t.contact.subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info Column */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-white/[0.02] rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-white/[0.05] dark:backdrop-blur-3xl">
              <h3 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white tracking-tight">
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
                  <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-white/[0.03] rounded-2xl mb-8 overflow-x-auto">
                    {contacts.map((contact, idx) => (
                      <button
                        key={contact.id}
                        type="button"
                        onClick={() => setSelectedBranchIdx(idx)}
                        className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${
                          selectedBranchIdx === idx
                            ? TAB_ACTIVE_CLASSES[idx] ?? "bg-white dark:bg-gray-800 text-[hsl(var(--primary))] shadow-sm"
                            : "text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {resolveBranchName(contact)}
                      </button>
                    ))}
                  </div>

                  {selectedContact && (
                    <div className="space-y-6">
                      {/* Address */}
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-gradient-end))] flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                            {t.contact.address}
                          </h4>
                          <a
                            href={selectedContact.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-600 dark:text-white/70 hover:text-[hsl(var(--primary))] dark:hover:text-[hsl(var(--primary))] transition-colors leading-relaxed group flex items-start gap-1 text-sm sm:text-base font-semibold"
                          >
                            <span>
                              {resolveAddress(selectedContact)
                                .split("\n")
                                .map((line, idx) => (
                                  <span key={idx}>
                                    {line}
                                    {idx < resolveAddress(selectedContact).split("\n").length - 1 && <br />}
                                  </span>
                                ))}
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-[hsl(var(--primary))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </a>
                        </div>
                      </div>

                      {/* Phones */}
                      {selectedContact.phones?.length > 0 && (
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                            <Phone className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                              {t.contact.phone}
                            </h4>
                            <div className="flex flex-col gap-1">
                              {selectedContact.phones.map((phone, i) => (
                                <a
                                  key={i}
                                  href={`tel:${phone.number.replace(/\s/g, "")}`}
                                  className="text-slate-600 dark:text-white/70 text-sm sm:text-base hover:text-[hsl(var(--primary))] transition-colors block"
                                >
                                  {phone.number}
                                  {phone.label && (
                                    <span className="text-xs text-slate-400 ml-1">({phone.label})</span>
                                  )}
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Email */}
                      {selectedContact.email && (
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                            <Mail className="h-6 w-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                              {t.contact.email}
                            </h4>
                            <a
                              href={`mailto:${selectedContact.email}`}
                              className="text-slate-600 dark:text-white/70 break-all text-sm sm:text-base font-medium hover:text-[hsl(var(--primary))] transition-colors"
                            >
                              {selectedContact.email}
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Service Hours */}
                      {selectedContact.serviceHours && (
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                            <Clock className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                              {t.contact.hours}
                            </h4>
                            <p className="text-slate-600 dark:text-white/70 text-sm sm:text-base">
                              {selectedContact.serviceHours}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* WhatsApp */}
                      {selectedContact.whatsappUrl && (
                        <a
                          href={selectedContact.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#25D366] text-white font-bold text-sm hover:bg-[#128C7E] transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          WhatsApp
                        </a>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Map Embed */}
            {!loading && !error && selectedContact && (
              <div className="bg-white dark:bg-white/[0.02] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-white/[0.05] h-[20rem] relative group dark:backdrop-blur-3xl p-2">
                <div className="absolute inset-2 rounded-2xl overflow-hidden">
                  <a
                    href={selectedContact.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 z-10 flex items-end p-4 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="text-white text-sm font-semibold flex items-center gap-2">
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
              <div className="animate-pulse bg-slate-200 dark:bg-slate-800 rounded-3xl h-[20rem]" />
            )}
          </div>

          {/* Contact Form (unchanged) */}
          <div className="bg-white dark:bg-white/[0.02] rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-white/[0.05] dark:backdrop-blur-3xl h-fit">
            <h3 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white tracking-tight">
              {t.contact.formTitle}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                    {t.contact.name}
                  </label>
                  <input
                    type="text" name="name" value={formData.name}
                    onChange={handleChange} required
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-slate-400 dark:placeholder:text-white/20"
                    placeholder={t.contact.namePlaceholder}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                    {t.contact.emailLabel}
                  </label>
                  <input
                    type="email" name="email" value={formData.email}
                    onChange={handleChange} required
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-slate-400 dark:placeholder:text-white/20"
                    placeholder={t.contact.emailPlaceholder}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                    {t.contact.phoneLabel}
                  </label>
                  <input
                    type="tel" name="phone" value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-slate-400 dark:placeholder:text-white/20"
                    placeholder={t.contact.phonePlaceholder}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                    {t.contact.subject}
                  </label>
                  <select
                    name="subject" value={formData.subject}
                    onChange={handleChange} required
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
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

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                  {t.contact.message}
                </label>
                <textarea
                  name="message" value={formData.message}
                  onChange={handleChange} required rows={5}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-white/20"
                  placeholder={t.contact.messagePlaceholder}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || submitStatus === "success"}
                className={`w-full py-4 text-white rounded-xl font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
                  submitStatus === "success"
                    ? "bg-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border dark:border-emerald-500/30 cursor-default"
                    : submitStatus === "error"
                    ? "bg-rose-500 dark:bg-rose-500/20 dark:text-rose-400 dark:border dark:border-rose-500/30"
                    : "bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-gradient-end))] dark:from-white/10 dark:to-white/5 dark:backdrop-blur-xl dark:border dark:border-white/10 dark:hover:bg-white/20 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02]"
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
                    <Send className="h-5 w-5" />
                    {t.contact.send}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
