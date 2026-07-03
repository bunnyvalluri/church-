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
          <div className="relative bg-gradient-to-br from-white via-white to-violet-50/40 dark:from-[#0d0e1b] dark:to-[#161830] border border-slate-200/60 dark:border-white/[0.06] shadow-xl shadow-slate-100/50 dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] text-slate-800 dark:text-white rounded-[2.5rem] p-10 sm:p-12 md:p-16 overflow-hidden">
            {/* Simple dot pattern */}
            <div className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03]" style={{
              backgroundImage: `radial-gradient(circle, currentColor 1.2px, transparent 1.2px)`,
              backgroundSize: "28px 28px",
            }} />
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-violet-400/10 dark:bg-violet-500/5 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Pastor */}
              <div className="flex flex-col items-center text-center mb-12 pb-12 border-b border-slate-200/80 dark:border-white/10">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-white/10 shadow-xl mb-4 relative hover:scale-105 transition-transform duration-300 bg-slate-900">
                  <img
                    src="/pastor.png"
                    alt="Bishop Kurra Kristhu Raju"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-violet-600/80 dark:text-amber-400/80 font-bold uppercase tracking-[0.2em] text-xs mb-2">Led By</p>
                <h3 className="text-2xl md:text-4xl font-extrabold mb-2 tracking-tight text-slate-900 dark:text-white">{t.about.pastor}</h3>
                <p className="text-xl md:text-3xl font-black tracking-wide bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-amber-300 dark:via-yellow-300 dark:to-amber-200 bg-clip-text text-transparent">{t.about.pastorName}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                {/* Contact */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                  <h3 className="text-xl font-bold mb-6 tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-violet-600 dark:text-violet-400">📍</span>
                    {t.hero.ctaPrimary}
                  </h3>
                  <div className="space-y-1 text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed border-l-2 border-slate-200 dark:border-white/10 pl-4">
                    <p>15-201, Vivekananda Nagar, Srinivas Nagar</p>
                    <p>Jeedimetla, Hyderabad</p>
                    <p>Telangana 500055</p>
                  </div>
                  <div className="flex flex-col gap-3 w-full sm:w-auto">
                    <a
                      href="tel:+919704090069"
                      className="inline-flex items-center gap-3 bg-white hover:bg-slate-50 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] px-6 py-3.5 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] hover:border-violet-300/40 dark:hover:border-purple-500/25 transition-all duration-300 cursor-pointer w-full group/phone hover:shadow-sm"
                    >
                      <Phone className="w-5 h-5 text-violet-600 dark:text-amber-300 group-hover/phone:scale-110 transition-transform" />
                      <p className="text-base md:text-lg font-bold tracking-wide text-slate-800 dark:text-white/90 hover:text-violet-750 dark:hover:text-amber-250 transition-colors">+91 97040 90069 (Senior Pastor)</p>
                    </a>
                    <a
                      href="tel:+919640943777"
                      className="inline-flex items-center gap-3 bg-white hover:bg-slate-50 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] px-6 py-3.5 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] hover:border-violet-300/40 dark:hover:border-purple-500/25 transition-all duration-300 cursor-pointer w-full group/phone hover:shadow-sm"
                    >
                      <Phone className="w-5 h-5 text-violet-600 dark:text-amber-300 group-hover/phone:scale-110 transition-transform" />
                      <p className="text-base md:text-lg font-bold tracking-wide text-slate-800 dark:text-white/90 hover:text-violet-750 dark:hover:text-amber-250 transition-colors">+91 96409 43777</p>
                    </a>
                    <a
                      href="tel:+917396433856"
                      className="inline-flex items-center gap-3 bg-white hover:bg-slate-50 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] px-6 py-3.5 rounded-2xl border border-slate-200/60 dark:border-white/[0.06] hover:border-violet-300/40 dark:hover:border-purple-500/25 transition-all duration-300 cursor-pointer w-full group/phone hover:shadow-sm"
                    >
                      <Phone className="w-5 h-5 text-violet-600 dark:text-amber-300 group-hover/phone:scale-110 transition-transform" />
                      <p className="text-base md:text-lg font-bold tracking-wide text-slate-800 dark:text-white/90 hover:text-violet-750 dark:hover:text-amber-250 transition-colors">+91 73964 33856</p>
                    </a>
                  </div>
                </div>

                {/* Locations */}
                <div>
                  <h3 className="text-xl font-bold mb-6 text-center lg:text-left tracking-tight text-slate-950 dark:text-white">{t.services.title}</h3>
                  <div className="space-y-4">
                    {locations.map((loc) => {
                      const branchStyles = {
                        shapur: {
                          card: "bg-gradient-to-br from-blue-50/90 to-cyan-50/50 hover:from-blue-100 hover:to-cyan-100/70 dark:from-blue-950/40 dark:to-cyan-950/20 border-blue-100 hover:border-blue-300 dark:border-blue-900/40 dark:hover:border-blue-700/50 hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 border-l-4 border-l-blue-600 dark:border-l-blue-400",
                          title: "text-blue-900 dark:text-blue-200 group-hover/loc:text-blue-700 dark:group-hover/loc:text-blue-100",
                          icon: "text-blue-600 dark:text-blue-400",
                          time: "text-blue-800 dark:text-blue-300",
                          badge: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border border-blue-200/50 dark:border-blue-800/30",
                        },
                        subhash: {
                          card: "bg-gradient-to-br from-rose-50/90 to-fuchsia-50/50 hover:from-rose-100 hover:to-fuchsia-100/70 dark:from-rose-950/40 dark:to-fuchsia-950/20 border-rose-100 hover:border-rose-300 dark:border-rose-900/40 dark:hover:border-rose-700/50 hover:shadow-rose-500/5 dark:hover:shadow-rose-500/10 border-l-4 border-l-rose-600 dark:border-l-rose-400",
                          title: "text-rose-900 dark:text-rose-200 group-hover/loc:text-rose-700 dark:group-hover/loc:text-rose-100",
                          icon: "text-rose-600 dark:text-rose-400",
                          time: "text-rose-800 dark:text-rose-300",
                          badge: "bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 border border-rose-200/50 dark:border-rose-800/30",
                        },
                        bahadur: {
                          card: "bg-gradient-to-br from-emerald-50/90 to-teal-50/50 hover:from-emerald-100 hover:to-teal-100/70 dark:from-emerald-950/30 dark:to-teal-950/20 border-emerald-100 hover:border-emerald-300 dark:border-emerald-900/40 dark:hover:border-emerald-700/50 hover:shadow-emerald-500/5 dark:hover:shadow-emerald-500/10 border-l-4 border-l-emerald-600 dark:border-l-emerald-400",
                          title: "text-emerald-900 dark:text-emerald-200 group-hover/loc:text-emerald-700 dark:group-hover/loc:text-emerald-100",
                          icon: "text-emerald-600 dark:text-emerald-400",
                          time: "text-emerald-800 dark:text-emerald-300",
                          badge: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 border border-emerald-200/50 dark:border-emerald-800/30",
                        },
                      };
                      const style = branchStyles[loc.key];
                      return (
                        <div
                          key={loc.key}
                          onClick={() => handleBranchClick(loc.key)}
                          className={`group/loc ${style.card} border rounded-2xl p-4 md:p-5 transition-all duration-300 cursor-pointer hover:shadow-sm`}
                        >
                          <p className="font-bold mb-1 tracking-wide flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <MapPin className={`w-3.5 h-3.5 ${style.icon} group-hover/loc:scale-110 transition-transform`} />
                              <span className={`transition-colors duration-200 ${style.title}`}>{loc.label}</span>
                            </span>
                            <span className={`text-[10px] ${style.badge} px-2 py-0.5 rounded font-normal opacity-0 group-hover/loc:opacity-100 transition-opacity duration-200`}>
                              {language === "te" ? "మ్యాప్ చూడండి" : language === "hi" ? "मानचित्र देखें" : "View Map →"}
                            </span>
                          </p>
                          <p className={`${style.time} text-xs transition-colors duration-200`}>{loc.times}</p>
                        </div>
                      );
                    })}
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
