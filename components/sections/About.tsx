"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { Church, Heart, Users, BookOpen } from "lucide-react";

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
        bahadur: "https://maps.google.com/?q=Bahadurpally,+Hyderabad,+Telangana",
      };
      window.open(maps[branch], "_blank", "noopener,noreferrer");
    }
  };

  const values = [
    {
      icon: Church,
      title: t.about.values.worship,
      description: t.about.values.worshipDesc,
      iconBg: "bg-[hsl(var(--primary)/0.1)]",
      iconColor: "text-[hsl(var(--primary))]",
    },
    {
      icon: Heart,
      title: t.about.values.community,
      description: t.about.values.communityDesc,
      iconBg: "bg-rose-50 dark:bg-rose-500/10",
      iconColor: "text-rose-600 dark:text-rose-400",
    },
    {
      icon: Users,
      title: t.about.values.fellowship,
      description: t.about.values.fellowshipDesc,
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      icon: BookOpen,
      title: t.about.values.teaching,
      description: t.about.values.teachingDesc,
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <section id="about" className="py-16 md:py-24 lg:py-32 bg-slate-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white tracking-tight">
            {t.about.title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-gray-400 px-4 leading-relaxed">
            {t.about.subtitle}
          </p>
        </div>

        {/* Mission Statement */}
        <div className="max-w-4xl mx-auto mb-12 md:mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-xl p-8 sm:p-10 md:p-12 border border-slate-100 dark:border-gray-700/50 transition-all">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 text-slate-900 dark:text-white tracking-tight">
              {t.about.missionTitle}
            </h3>
            <p className="text-base sm:text-lg text-slate-600 dark:text-gray-300 leading-relaxed">
              {t.about.missionText}
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className="group bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:shadow-lg dark:hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 border border-slate-100 dark:border-gray-700/50"
              >
                <div className={`w-14 h-14 rounded-2xl ${value.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-7 w-7 ${value.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white tracking-tight">
                  {value.title}
                </h3>
                <p className="text-slate-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Church Info (Premium Deep Banner) */}
        <div className="mt-16 md:mt-24 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-gradient-end))] rounded-[2.5rem] p-8 sm:p-10 md:p-14 text-white relative overflow-hidden shadow-2xl">
            {/* Atmospheric Glows */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[hsl(var(--primary-gradient-start))]/20 blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-[hsl(var(--primary-gradient-end))]/20 blur-[100px] pointer-events-none"></div>

            <div className="relative z-10">
              {/* Pastor Info */}
              <div className="text-center mb-10 pb-10 border-b border-white/20">
                <h3 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">{t.about.pastor}</h3>
                <p className="text-xl md:text-2xl text-yellow-200 font-semibold tracking-wide">{t.about.pastorName}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                  <h3 className="text-xl md:text-2xl font-bold mb-5 tracking-tight">{t.hero.ctaPrimary}</h3>
                  <div className="space-y-2 text-purple-100 mb-8">
                    <p>15-201, Vivekananda Nagar, Srinivas Nagar</p>
                    <p>Jeedimetla, Hyderabad</p>
                    <p>Telangana 500055</p>
                  </div>
                  <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-3.5 rounded-2xl border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-sm cursor-pointer">
                    <span className="text-xl">📞</span>
                    <p className="text-lg md:text-xl font-semibold tracking-wide text-white">
                      +91 96409 43777
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 lg:mt-0">
                  <h3 className="text-xl md:text-2xl font-bold mb-5 text-center lg:text-left tracking-tight">{t.services.title}</h3>
                  <div className="space-y-4 text-purple-100">
                    <div 
                      onClick={() => handleBranchClick("shapur")}
                      className="bg-white/10 border border-white/10 rounded-2xl p-4 md:p-5 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] cursor-pointer group/loc"
                    >
                      <p className="font-semibold text-yellow-200 mb-1 tracking-wide flex items-center justify-between">
                        <span>📍 {t.services.shapur.title.split(" ")[0]}</span>
                        <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded font-normal text-white opacity-0 group-hover/loc:opacity-100 transition-opacity">
                          {language === "te" ? "మ్యాప్ చూడండి" : language === "hi" ? "मानचित्र देखें" : "View Map"}
                        </span>
                      </p>
                      <p className="text-sm">{t.services.friday} & {t.services.sunday}: 6:00 PM</p>
                    </div>
                    <div 
                      onClick={() => handleBranchClick("subhash")}
                      className="bg-white/10 border border-white/10 rounded-2xl p-4 md:p-5 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] cursor-pointer group/loc"
                    >
                      <p className="font-semibold text-yellow-200 mb-1 tracking-wide flex items-center justify-between">
                        <span>📍 {t.services.subhash.title.split(" ")[0]} {t.services.subhash.title.split(" ")[1]}</span>
                        <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded font-normal text-white opacity-0 group-hover/loc:opacity-100 transition-opacity">
                          {language === "te" ? "మ్యాప్ చూడండి" : language === "hi" ? "मानचित्र देखें" : "View Map"}
                        </span>
                      </p>
                      <p className="text-sm mb-1">{t.services.sunday}: 5:45 AM - 8:30 AM</p>
                      <p className="text-sm mb-1">{t.services.subhash.second}</p>
                      <p className="text-sm">{t.services.subhash.thursday}</p>
                    </div>
                    <div 
                      onClick={() => handleBranchClick("bahadur")}
                      className="bg-white/10 border border-white/10 rounded-2xl p-4 md:p-5 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] cursor-pointer group/loc"
                    >
                      <p className="font-semibold text-yellow-200 mb-1 tracking-wide flex items-center justify-between">
                        <span>📍 {t.services.bahadur.title.split(" ")[0]}</span>
                        <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded font-normal text-white opacity-0 group-hover/loc:opacity-100 transition-opacity">
                          {language === "te" ? "మ్యాప్ చూడండి" : language === "hi" ? "मानचित्र देखें" : "View Map"}
                        </span>
                      </p>
                      <p className="text-sm mb-1">{t.services.sunday}: 11:00 AM - 2:00 PM</p>
                      <p className="text-sm">{t.services.bahadur.tuesday}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
