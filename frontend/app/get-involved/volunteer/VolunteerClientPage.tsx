"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Music,
  Users,
  Baby,
  Heart,
  Camera,
  Coffee,
  Wrench,
  Sparkles,
  CheckCircle2,
  Send,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  HeartHandshake,
  Check,
  User,
  Mail,
  Phone,
  Layers,
  FileText
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import BackToHome from "@/components/ui/BackToHome";
import Navbar from "@/components/layout/Navbar";

export default function VolunteerClientPage() {
  const { language, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Form states
  const [selectedArea, setSelectedArea] = useState<string>("Select an area");
  const [formData, setFormData] = useState({ fname: "", lname: "", email: "", phone: "", about: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const opportunities = [
    {
      id: "worship",
      title: !mounted
        ? "Worship Team"
        : language === "te"
        ? "ఆరాధన బృందం"
        : language === "hi"
        ? "आराधना टीम"
        : "Worship Team",
      areas: !mounted ? ["Singers", "Musicians", "Sound technicians", "Media team"] : t.pages.volunteer.worshipAreas,
      icon: Music,
      colorBg: "bg-purple-600 text-white shadow-md",
    },
    {
      id: "children",
      title: !mounted
        ? "Children's Ministry"
        : language === "te"
        ? "పిల్లల పరిచర్య"
        : language === "hi"
        ? "बाल मंत्रालय"
        : "Children's Ministry",
      areas: !mounted ? ["Sunday School teachers", "Nursery helpers", "VBS volunteers", "Kids camp staff"] : t.pages.volunteer.childrenAreas,
      icon: Baby,
      colorBg: "bg-pink-600 text-white shadow-md",
    },
    {
      id: "hospitality",
      title: !mounted ? "Hospitality" : t.pages.volunteer.hospitalityTitle,
      areas: !mounted ? ["Greeters", "Ushers", "Coffee team", "Setup crew"] : t.pages.volunteer.hospitalityAreas,
      icon: Coffee,
      colorBg: "bg-amber-600 text-white shadow-md",
    },
    {
      id: "tech",
      title: !mounted ? "Technical Team" : t.pages.volunteer.techTitle,
      areas: !mounted ? ["Audio/Visual", "Live streaming", "Social media", "Photography"] : t.pages.volunteer.techAreas,
      icon: Camera,
      colorBg: "bg-indigo-600 text-white shadow-md",
    },
    {
      id: "outreach",
      title: !mounted
        ? "Outreach"
        : language === "te"
        ? "అవుట్‌రీచ్ పరిచర్య"
        : language === "hi"
        ? "आउटरीच मंत्रालय"
        : "Outreach",
      areas: !mounted ? ["Community events", "Food distribution", "Medical camps", "Evangelism teams"] : t.pages.volunteer.outreachAreas,
      icon: Heart,
      colorBg: "bg-emerald-600 text-white shadow-md",
    },
    {
      id: "facilities",
      title: !mounted ? "Facilities" : t.pages.volunteer.facilitiesTitle,
      areas: !mounted ? ["Maintenance", "Cleaning", "Setup/Teardown", "Security"] : t.pages.volunteer.facilitiesAreas,
      icon: Wrench,
      colorBg: "bg-blue-600 text-white shadow-md",
    },
  ];

  const steps = [
    {
      step: "1",
      title: !mounted ? "Sign Up" : t.pages.volunteer.step1,
      desc: !mounted ? "Fill out the form below" : t.pages.volunteer.step1Desc,
    },
    {
      step: "2",
      title: !mounted ? "Meet" : t.pages.volunteer.step2,
      desc: !mounted ? "Meet with a team leader" : t.pages.volunteer.step2Desc,
    },
    {
      step: "3",
      title: !mounted ? "Train" : t.pages.volunteer.step3,
      desc: !mounted ? "Get equipped to serve" : t.pages.volunteer.step3Desc,
    },
    {
      step: "4",
      title: !mounted ? "Serve" : t.pages.volunteer.step4,
      desc: !mounted ? "Start making a difference" : t.pages.volunteer.step4Desc,
    },
  ];

  const handleSelectOpportunity = (title: string) => {
    setSelectedArea(title);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ fname: "", lname: "", email: "", phone: "", about: "" });
      setSelectedArea("Select an area");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-purple-500 selection:text-white">
      {/* 🧭 Global Navigation Bar */}
      <Navbar />

      {/* 🌌 Hero Section - Deep Slate with Subtle Purple Ambient Glow */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-slate-950 text-white overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 flex justify-center">
              <BackToHome label={t?.nav?.home || "Home"} />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-semibold text-xs sm:text-sm mb-6 shadow-md">
              <HeartHandshake className="h-4 w-4 text-pink-400" />
              <span>
                {!mounted
                  ? "Make a Difference"
                  : language === "te"
                  ? "మార్పు తీసుకురండి"
                  : language === "hi"
                  ? "బదలావ లాఏం"
                  : "Make a Difference"}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 font-serif text-white">
              {!mounted ? "Volunteer" : t.pages.volunteer.title}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
              {!mounted ? "Serve God by serving others in a vibrant community" : t.pages.volunteer.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* 💡 Why Volunteer Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 font-serif">
              {!mounted ? "Why Volunteer?" : t.pages.volunteer.whyTitle}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed font-light">
              {!mounted
                ? "Volunteering is a great way to meet new people, grow in your faith, and make a difference."
                : t.pages.volunteer.whyDesc}
            </p>
          </div>

          {/* Opportunities Grid */}
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 font-serif">
                {!mounted ? "Volunteer Opportunities" : t.pages.volunteer.oppsTitle}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Click any team to select it and apply directly.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {opportunities.map((opp) => {
                const IconComponent = opp.icon;
                const isSelected = selectedArea === opp.title;
                return (
                  <div
                    key={opp.id}
                    onClick={() => handleSelectOpportunity(opp.title)}
                    className={`cursor-pointer rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between ${
                      isSelected
                        ? "bg-purple-500/10 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/50 shadow-xl"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-500/50 shadow-sm hover:shadow-xl"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${opp.colorBg}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        {isSelected && (
                          <span className="px-2.5 py-1 rounded-full bg-purple-600 text-white text-xs font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Selected
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 font-serif">
                        {opp.title}
                      </h3>

                      <ul className="space-y-2 mb-6">
                        {opp.areas.map((area: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                        isSelected
                          ? "bg-purple-600 text-white shadow-md"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600"
                      }`}
                    >
                      <span>Apply for {opp.title}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 🛠️ How to Volunteer */}
      <section className="py-16 md:py-24 bg-slate-100/70 dark:bg-slate-900/50 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-12 text-center font-serif">
              {!mounted ? "How to Volunteer" : t.pages.volunteer.howTitle}
            </h2>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {steps.map((item, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow text-center"
                >
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-md shadow-purple-600/20">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 font-serif">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 📝 Volunteer Form */}
      <section ref={formRef} className="py-16 md:py-24 bg-slate-50/80 dark:bg-slate-950 relative z-10">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-purple-500/5">
            <div className="text-center max-w-xl mx-auto mb-10">
              <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white border border-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-600/30">
                <HeartHandshake className="w-7 h-7 text-white" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3 font-serif tracking-tight">
                {!mounted ? "Volunteer Application" : t.pages.volunteer.formTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                Fill in your details below and our ministry leaders will reach out to get you plugged in.
              </p>
            </div>

            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-serif">Application Submitted!</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{formData.fname || "friend"}</strong>! We have received your application to serve in <strong>{selectedArea}</strong>.
                </p>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {!mounted ? "First Name" : t.pages.volunteer.fname} *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={formData.fname}
                        onChange={(e) => setFormData({ ...formData, fname: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-sm transition-all shadow-sm"
                        placeholder={!mounted ? "First Name" : t.pages.volunteer.fname}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {!mounted ? "Last Name" : t.pages.volunteer.lname} *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={formData.lname}
                        onChange={(e) => setFormData({ ...formData, lname: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-sm transition-all shadow-sm"
                        placeholder={!mounted ? "Last Name" : t.pages.volunteer.lname}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {!mounted ? "Email Address" : t.pages.volunteer.email} *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-sm transition-all shadow-sm"
                        placeholder="example@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      {!mounted ? "Phone Number" : t.pages.volunteer.phone} *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-sm transition-all shadow-sm"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {!mounted ? "Area of Interest" : t.pages.volunteer.area} *
                  </label>
                  <div className="relative">
                    <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      value={selectedArea}
                      onChange={(e) => setSelectedArea(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-sm transition-all shadow-sm cursor-pointer"
                    >
                      <option value="Select an area">{!mounted ? "Select an area" : t.pages.volunteer.areaPlaceholder}</option>
                      <option value="Worship Team">{!mounted ? "Worship Team" : (language === "te" ? "ఆరాధన బృందం" : language === "hi" ? "ఆరాధనా టీమ్" : "Worship Team")}</option>
                      <option value="Children's Ministry">{!mounted ? "Children's Ministry" : (language === "te" ? "పిల్లల పరిచర్య" : language === "hi" ? "బాల మంత్రాలయా" : "Children's Ministry")}</option>
                      <option value="Hospitality">{!mounted ? "Hospitality" : t.pages.volunteer.hospitalityTitle}</option>
                      <option value="Technical Team">{!mounted ? "Technical Team" : t.pages.volunteer.techTitle}</option>
                      <option value="Outreach">{!mounted ? "Outreach" : (language === "te" ? "అవుట్‌రీచ్ పరిచర్య" : language === "hi" ? "ఆవుటరీచ్ మంత్రాలయా" : "Outreach")}</option>
                      <option value="Facilities">{!mounted ? "Facilities" : t.pages.volunteer.facilitiesTitle}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {!mounted ? "Tell us about yourself" : t.pages.volunteer.about}
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                    <textarea
                      rows={4}
                      value={formData.about}
                      onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none text-sm transition-all shadow-sm resize-none"
                      placeholder={!mounted ? "Share your experience, skills, and why you want to volunteer..." : t.pages.volunteer.aboutPlaceholder}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base rounded-xl transition-all duration-200 shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{!mounted ? "Submit Application" : t.pages.volunteer.submit}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 🚀 CTA Questions */}
      <section className="py-20 bg-slate-950 text-white border-t border-slate-800 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 font-serif">
              {!mounted ? "Questions?" : t.pages.volunteer.questions}
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mb-8 font-light max-w-xl mx-auto">
              {!mounted ? "We're here to help you find the perfect place to serve" : t.pages.volunteer.questionsDesc}
            </p>
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:scale-105"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{!mounted ? "Contact Us" : t.links.contact}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 🦶 Global Footer */}
      <Footer />
    </div>
  );
}