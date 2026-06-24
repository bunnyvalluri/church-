"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { Church, Heart, Users, BookOpen, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
  const { t, language } = useLanguage();

  const handleBranchClick = (branch: "shapur" | "subhash" | "bahadur") => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
      const event = new CustomEvent("change-contact-branch", { detail: { branch } });
      window.dispatchEvent(event);
    } else {
      const maps = {
        shapur: "https://maps.google.com/?q=Kingdom+of+Christ+Ministries,+15-201,+Vivekananda+Nagar,+Srinivas+Nagar,+Jeedimetla,+Hyderabad,+Telangana+500055",
        subhash: "https://maps.google.com/?q=Subhash+nagar+jeedimetla+119lp",
        bahadur: "https://maps.google.com/?q=17.567689,78.443963",
      };
      window.open(maps[branch], "_blank", "noopener,noreferrer");
    }
  };

  const values = [
    {
      icon: Church,
      title: t.about.values.worship,
      description: t.about.values.worshipDesc,
      gradient: "from-purple-500 to-violet-600",
    },
    {
      icon: Heart,
      title: t.about.values.community,
      description: t.about.values.communityDesc,
      gradient: "from-rose-500 to-pink-600",
    },
    {
      icon: Users,
      title: t.about.values.fellowship,
      description: t.about.values.fellowshipDesc,
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      icon: BookOpen,
      title: t.about.values.teaching,
      description: t.about.values.teachingDesc,
      gradient: "from-emerald-500 to-teal-600",
    },
  ];

  const locations = [
    {
      key: "shapur" as const,
      label: t.services?.shapur?.title?.split(" ")[0] ?? "Jeedimetla",
      times: `${t.services?.friday} & ${t.services?.sunday}: 6:00 PM`,
    },
    {
      key: "subhash" as const,
      label: `${t.services?.subhash?.title?.split(" ")[0] ?? "Subhash"} ${t.services?.subhash?.title?.split(" ")[1] ?? "Nagar"}`,
      times: `${t.services?.sunday}: 5:45 AM – 8:30 AM`,
    },
    {
      key: "bahadur" as const,
      label: t.services?.bahadur?.title?.split(" ")[0] ?? "Bahadurpally",
      times: `${t.services?.sunday}: 11:00 AM – 2:00 PM`,
    },
  ];

  return (
    <section id="about" className="py-28 md:py-36 relative overflow-hidden transition-colors duration-300 bg-slate-50 dark:bg-transparent">

      <div className="container mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-[hsl(var(--primary))] mb-4 px-4 py-1.5 rounded-full bg-[hsl(var(--primary)/0.08)] border border-[hsl(var(--primary)/0.15)]">
            Who We Are
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-5 text-slate-900 dark:text-white tracking-tight">
            {t.about.title.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-gradient-end))] bg-clip-text text-transparent">
              {t.about.title.split(" ").slice(-1)[0]}
            </span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-white/60 px-4 leading-relaxed">
            {t.about.subtitle}
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-4xl mx-auto mb-20"
        >
          <div className="relative bg-white dark:bg-white/[0.02] rounded-[2rem] p-10 md:p-14 border border-slate-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
            <div className="absolute left-0 top-8 bottom-8 w-1 bg-gradient-to-b from-transparent via-[hsl(var(--primary))] to-transparent rounded-full" />
            <div className="relative z-10 pl-4">
              <h3 className="text-xl sm:text-2xl font-bold mb-5 text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <span className="text-2xl">✝️</span>
                {t.about.missionTitle}
              </h3>
              <p className="text-base sm:text-lg text-slate-600 dark:text-white/70 leading-relaxed">
                {t.about.missionText}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Core Values — CSS hover, no whileHover */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="group relative bg-white dark:bg-white/[0.02] rounded-3xl p-8 border border-slate-100 dark:border-white/[0.06] shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
              >
                <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${value.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-3xl`} />
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-6 shadow-md services-icon`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white tracking-tight">{value.title}</h3>
                  <p className="text-slate-600 dark:text-white/60 leading-relaxed text-sm">{value.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Church Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-24 max-w-5xl mx-auto"
        >
          <div className="relative bg-gradient-to-br from-[hsl(var(--primary))] via-[hsl(var(--primary-gradient-start))] to-[hsl(var(--primary-gradient-end))] rounded-[2.5rem] p-10 sm:p-12 md:p-16 text-white overflow-hidden shadow-2xl shadow-[hsl(var(--primary)/0.35)]">
            {/* Simple dot pattern — no blur layers */}
            <div className="absolute inset-0 opacity-[0.05]" style={{
              backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
              backgroundSize: "28px 28px",
            }} />
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />

            <div className="relative z-10">
              {/* Pastor */}
              <div className="flex flex-col items-center text-center mb-12 pb-12 border-b border-white/20">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/25 shadow-xl mb-4 relative hover:scale-105 transition-transform duration-300 bg-slate-900">
                  <img
                    src="/pastor.png"
                    alt="Bishop Kurra Kristhu Raju"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-white/60 text-sm font-semibold uppercase tracking-widest mb-2">Led By</p>
                <h3 className="text-2xl md:text-4xl font-black mb-2 tracking-tight">{t.about.pastor}</h3>
                <p className="text-xl md:text-2xl text-yellow-200 font-bold tracking-wide">{t.about.pastorName}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                {/* Contact */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                  <h3 className="text-xl md:text-2xl font-bold mb-6 tracking-tight">{t.hero.ctaPrimary}</h3>
                  <div className="space-y-1 text-purple-100 mb-8 text-sm leading-relaxed">
                    <p>15-201, Vivekananda Nagar, Srinivas Nagar</p>
                    <p>Jeedimetla, Hyderabad</p>
                    <p>Telangana 500055</p>
                  </div>
                  <a
                    href="tel:+919704090069"
                    className="inline-flex items-center gap-3 bg-white/15 hover:bg-white/25 px-6 py-4 rounded-2xl border border-white/25 transition-colors duration-300 cursor-pointer"
                  >
                    <Phone className="w-5 h-5 text-yellow-200" />
                    <p className="text-lg md:text-xl font-bold tracking-wide text-white">+91 97040 90069</p>
                  </a>
                </div>

                {/* Locations */}
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-6 text-center lg:text-left tracking-tight">{t.services.title}</h3>
                  <div className="space-y-4">
                    {locations.map((loc) => (
                      <div
                        key={loc.key}
                        onClick={() => handleBranchClick(loc.key)}
                        className="group/loc bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/30 rounded-2xl p-4 md:p-5 transition-colors duration-300 cursor-pointer"
                      >
                        <p className="font-bold text-yellow-200 mb-1 tracking-wide flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5" />
                            {loc.label}
                          </span>
                          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-normal text-white/80 opacity-0 group-hover/loc:opacity-100 transition-opacity duration-200">
                            {language === "te" ? "మ్యాప్ చూడండి" : language === "hi" ? "मानचित्र देखें" : "View Map →"}
                          </span>
                        </p>
                        <p className="text-purple-100 text-xs">{loc.times}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
