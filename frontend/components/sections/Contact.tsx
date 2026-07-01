"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function Contact() {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [selectedBranch, setSelectedBranch] = useState<"shapur" | "subhash" | "bahadur">("shapur");

  const branches = {
    shapur: {
      name: language === "te" ? "షాపూర్" : language === "hi" ? "शापुर" : "Shapur",
      address: language === "te" 
        ? "కింగ్డమ్ ఆఫ్ క్రైస్ట్ మినిస్ట్రీస్,\n15-201, వివేకానంద నగర్, శ్రీనివాస్ నగర్,\nజీడిమెట్ల, హైదరాబాద్,\nతెలంగాణ 500055"
        : language === "hi"
        ? "किंगडम ऑफ क्राइस्ट मिनिस्ट्रीज,\n15-201, विवेकानंद नगर, श्रीनिवास नगर,\nजीडीमेटला, हैदराबाद,\nतेलंगाना 500055"
        : "Kingdom of Christ Ministries,\n15-201, Vivekananda Nagar, Srinivas Nagar,\nJeedimetla, Hyderabad,\nTelangana 500055",
      mapsUrl: "https://maps.google.com/?q=Kingdom+of+Christ+Ministries,+15-201,+Vivekananda+Nagar,+Srinivas+Nagar,+Jeedimetla,+Hyderabad,+Telangana+500055",
      embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3805.5369!2d78.43506!3d17.52098!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb91e2f02d5555%3A0x2a6c6c6b6a6a6a6a!2sVivekananda+Nagar%2C+Jeedimetla%2C+Hyderabad%2C+Telangana+500055!5e0!3m2!1sen!2sin!4v1716000000000",
      isStreetView: false
    },
    subhash: {
      name: language === "te" ? "సుభాష్ నగర్" : language === "hi" ? "सुभाष नगर" : "Subhash Nagar",
      address: language === "te"
        ? "సుభాష్ నగర్,\nజీడిమెట్ల, హైదరాబాద్,\nతెలంగాణ 500055"
        : language === "hi"
        ? "सुभाष नगर,\nजीडीमेटला, हैदराबाद,\nतेलंगाना 500055"
        : "Subhash Nagar,\nJeedimetla, Hyderabad,\nTelangana 500055",
      mapsUrl: "https://maps.google.com/?q=Subhash+nagar+jeedimetla+119lp",
      embedUrl: "https://www.google.com/maps/embed?pb=!4v1780922610976!6m8!1m7!1sPfdOpDBV-AUaCAX-pavx_g!2m2!1d17.51769104998973!2d78.46098218561453!3f42.5558951222148!4f33.27373317227213!5f0.4000000000000002",
      isStreetView: true
    },
    bahadur: {
      name: language === "te" ? "బహదూర్‌పల్లి" : language === "hi" ? "बहादुरपल्ली" : "Bahadurpally",
      address: language === "te"
        ? "బహదూర్‌పల్లి,\nకుత్బుల్లాపూర్, హైదరాబాద్,\nతెలంగాణ 500043"
        : language === "hi"
        ? "बहादुरपल्ली,\nकुतुबुल्लापुर, हैदराबाद,\nतेलंगाना 500043"
        : "Bahadurpally,\nQuthbullapur, Hyderabad,\nTelangana 500043",
      mapsUrl: "https://maps.google.com/?q=17.567689,78.443963",
      embedUrl: "https://www.google.com/maps/embed?pb=!4v1780922487353!6m8!1m7!1sB6MuJsAZw1kA_ZCw4b2pGw!2m2!1d17.56771525177928!2d78.44416184725885!3f298.8926008480041!4f-1.3244437518344796!5f0.7820865974627469",
      isStreetView: true
    }
  };

  useEffect(() => {
    // Check sessionStorage for pending branch selection from other pages
    const pending = sessionStorage.getItem("pending-contact-branch") as "shapur" | "subhash" | "bahadur" | null;
    if (pending) {
      setSelectedBranch(pending);
      sessionStorage.removeItem("pending-contact-branch");
    }

    const handleBranchChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ branch: "shapur" | "subhash" | "bahadur" }>;
      if (customEvent.detail && customEvent.detail.branch) {
        setSelectedBranch(customEvent.detail.branch);
      }
    };
    window.addEventListener("change-contact-branch", handleBranchChange);
    return () => {
      window.removeEventListener("change-contact-branch", handleBranchChange);
    };
  }, []);

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

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch (error) {
      console.error(error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-24 bg-slate-50 dark:bg-transparent relative z-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white tracking-tight">
            {t.contact.title}{" "}
            <span className="text-gradient">{t.contact.titleHighlight}</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-white/70">
            {t.contact.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-white/[0.02] rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-white/[0.05] dark:backdrop-blur-3xl">
              <h3 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white tracking-tight">
                {t.contact.infoTitle}
              </h3>

              {/* Location Selector Tabs */}
              <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-white/[0.03] rounded-2xl mb-8">
                {(Object.keys(branches) as Array<keyof typeof branches>).map((key) => {
                  const activeColorMap: Record<string, string> = {
                    shapur:  "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30 border-0",
                    subhash: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 border-0",
                    bahadur: "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 border-0",
                  };
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedBranch(key)}
                      className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 ${
                        selectedBranch === key
                          ? activeColorMap[key] ?? "bg-white dark:bg-gray-800 text-[hsl(var(--primary))] shadow-sm"
                          : "text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {branches[key].name}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-gradient-end))] flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                      {t.contact.address}
                    </h4>
                    <a
                      href={branches[selectedBranch].mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 dark:text-white/70 hover:text-[hsl(var(--primary))] dark:hover:text-[hsl(var(--primary))] transition-colors leading-relaxed group flex items-start gap-1 text-sm sm:text-base font-semibold"
                    >
                      <span>
                        {branches[selectedBranch].address.split('\n').map((line, idx) => (
                          <span key={idx}>
                            {line}
                            {idx < branches[selectedBranch].address.split('\n').length - 1 && <br />}
                          </span>
                        ))}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-[hsl(var(--primary))]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                      {t.contact.phone}
                    </h4>
                    <div className="flex flex-col gap-1">
                      <a href="tel:+919704090069" className="text-slate-600 dark:text-white/70 text-sm sm:text-base hover:text-[hsl(var(--primary))] transition-colors block">
                        +91 97040 90069 (Senior Pastor)
                      </a>
                      <a href="tel:+919640943777" className="text-slate-600 dark:text-white/70 text-sm sm:text-base hover:text-[hsl(var(--primary))] transition-colors block">
                        +91 96409 43777
                      </a>
                      <a href="tel:+917396433856" className="text-slate-600 dark:text-white/70 text-sm sm:text-base hover:text-[hsl(var(--primary))] transition-colors block">
                        +91 73964 33856
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                      {t.contact.email}
                    </h4>
                    <p className="text-slate-605 dark:text-white/70 break-all text-sm sm:text-base font-medium">
                      kingofchristministries23@gmail.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">
                      {t.contact.hours}
                    </h4>
                    <p className="text-slate-605 dark:text-white/70 text-sm sm:text-base">
                      {t.contact.hoursValue}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white dark:bg-white/[0.02] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-white/[0.05] h-[20rem] relative group dark:backdrop-blur-3xl p-2">
              <div className="absolute inset-2 rounded-2xl overflow-hidden">
                <a
                  href={branches[selectedBranch].mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 z-10 flex items-end p-4 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="text-white text-sm font-semibold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                    {t.contact.openMaps}
                  </span>
                </a>
                <iframe
                  src={branches[selectedBranch].embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  className={branches[selectedBranch].isStreetView ? "" : "dark:invert-[0.9] dark:hue-rotate-180"}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>

          {/* Contact Form */}
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
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-slate-400 dark:placeholder:text-white/20"
                    placeholder={t.contact.namePlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                    {t.contact.emailLabel}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-slate-400 dark:placeholder:text-white/20"
                    placeholder={t.contact.emailPlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-white/80 mb-2">
                    {t.contact.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
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
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
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
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
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
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {t.contact.sent}
                  </span>
                ) : submitStatus === "error" ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
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
