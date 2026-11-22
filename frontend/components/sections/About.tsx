"use client";

import { memo } from "react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { Church, Heart, Users, BookOpen, MapPin, Phone, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useAboutContent, useContacts, usePastors } from "@/hooks/useCmsData";
import type { SiteContact } from "@/types/cms";

// ── Icon registry ─────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  Church, Heart, Users, BookOpen,
};
function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] || Heart;
}

// ── Core Values Theming (Harmonious brand palette) ───────────────────────────
const VALUE_THEMES = [
  { gradient: "from-violet-600 to-indigo-600", glow: "shadow-violet-500/20" },
  { gradient: "from-purple-600 via-fuchsia-600 to-pink-600", glow: "shadow-pink-500/20" },
  { gradient: "from-indigo-600 to-blue-600", glow: "shadow-indigo-500/20" },
  { gradient: "from-teal-600 to-emerald-600", glow: "shadow-teal-500/20" },
];
function ValueCardSkeleton() {
  return (
    <div className="animate-pulse bg-white dark:bg-white/[0.02] rounded-3xl p-8 border border-slate-100 dark:border-white/[0.06] shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 mb-6" />
      <div className="h-5 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-3" />
      <div className="h-3 w-full bg-slate-100 dark:bg-slate-900 rounded mb-2" />
      <div className="h-3 w-4/5 bg-slate-100 dark:bg-slate-900 rounded" />
    </div>
  );
}

function PastorSkeleton() {
  return (
    <div className="animate-pulse flex flex-col items-center text-center mb-12 pb-12 border-b border-slate-200/80 dark:border-white/10">
      <div className="w-28 h-28 rounded-full bg-slate-200 dark:bg-slate-800 mb-4" />
      <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
      <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
      <div className="h-5 w-36 bg-slate-300 dark:bg-slate-700 rounded" />
    </div>
  );
}

// ── Branch Location Card ──────────────────────────────────────────────────────
const BranchCard = memo(function BranchCard({ contact, idx, language }: { contact: SiteContact; idx: number; language: string }) {
  const name =
    language === "te" && contact.branchNameTe
      ? contact.branchNameTe
      : language === "hi" && contact.branchNameHi
      ? contact.branchNameHi
      : contact.branchName;

  const handleClick = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
      window.dispatchEvent(
        new CustomEvent("change-contact-branch", { detail: { branch: contact.branchKey } })
      );
    } else {
      window.open(contact.mapsUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      tabIndex={0}
      role="button"
      aria-label={`Select branch ${name}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="group/loc bg-white/90 hover:bg-white dark:bg-white/[0.03] dark:hover:bg-white/[0.06] border border-slate-200/90 dark:border-white/10 hover:border-violet-400/50 dark:hover:border-violet-400/40 rounded-2xl p-3.5 sm:p-4 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none flex items-center justify-between"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 group-hover/loc:scale-105 transition-transform">
          <MapPin className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight truncate font-outfit">
            {name}
          </p>
          {contact.serviceHours && (
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight font-sans">
              {contact.serviceHours}
            </p>
          )}
        </div>
      </div>
      <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-200/60 dark:border-violet-500/20 group-hover/loc:bg-violet-600 group-hover/loc:text-white transition-all shrink-0 ml-2">
        {language === "te" ? "మ్యాప్" : language === "hi" ? "मानचित्र" : "View Map →"}
      </span>
    </div>
  );
});


// ── Main About Component ──────────────────────────────────────────────────────
export default function About({ initialAboutData, initialContactsData, initialPastorsData }: { initialAboutData?: any, initialContactsData?: any, initialPastorsData?: any }) {
  const { t, language } = useLanguage();

  // CMS data hooks
  const { data: about, loading: aboutLoading } = useAboutContent(initialAboutData);
  const { contacts, loading: contactsLoading } = useContacts(initialContactsData);
  const { pastors, loading: pastorsLoading } = usePastors(initialPastorsData);

  const safeContacts = Array.isArray(contacts) ? contacts : [];
  const safePastors = Array.isArray(pastors) ? pastors : [];
  const primaryContact = safeContacts[0];
  const primaryPastor = safePastors.find((p) => p.isActive) ?? safePastors[0];

  const handlePrimaryAddressClick = () => {
    if (!primaryContact) return;
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
      window.dispatchEvent(
        new CustomEvent("change-contact-branch", { detail: { branch: primaryContact.branchKey } })
      );
    } else {
      window.open(primaryContact.mapsUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handlePrimaryAddressKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handlePrimaryAddressClick();
    }
  };

  // Resolve localized text
  const heading =
    language === "te" && about?.headingTe
      ? about.headingTe
      : language === "hi" && about?.headingHi
      ? about.headingHi
      : language !== "en"
      ? t.about.title
      : about?.heading ?? t.about.title;

  const subtitle =
    language === "te" && about?.subtitleTe
      ? about.subtitleTe
      : language === "hi" && about?.subtitleHi
      ? about.subtitleHi
      : language !== "en"
      ? t.about.subtitle
      : about?.subtitle ?? t.about.subtitle;

  // Values from CMS or fallback to translation
  const values = language !== "en"
    ? [
        { icon: Church, title: t.about.values.worship, description: t.about.values.worshipDesc, gradient: "from-purple-500 to-violet-600" },
        { icon: Heart, title: t.about.values.community, description: t.about.values.communityDesc, gradient: "from-rose-500 to-pink-600" },
        { icon: Users, title: t.about.values.fellowship, description: t.about.values.fellowshipDesc, gradient: "from-blue-500 to-cyan-600" },
        { icon: BookOpen, title: t.about.values.teaching, description: t.about.values.teachingDesc, gradient: "from-emerald-500 to-teal-600" },
      ]
    : about?.values?.length
    ? about.values.map((v) => ({
        icon: getIcon(v.icon),
        title: v.title,
        description: v.description,
        gradient: v.gradient,
      }))
    : [
        { icon: Church, title: t.about.values.worship, description: t.about.values.worshipDesc, gradient: "from-purple-500 to-violet-600" },
        { icon: Heart, title: t.about.values.community, description: t.about.values.communityDesc, gradient: "from-rose-500 to-pink-600" },
        { icon: Users, title: t.about.values.fellowship, description: t.about.values.fellowshipDesc, gradient: "from-blue-500 to-cyan-600" },
        { icon: BookOpen, title: t.about.values.teaching, description: t.about.values.teachingDesc, gradient: "from-emerald-500 to-teal-600" },
      ];

  const sectionBadge =
    language === "te"
      ? "మా గురించి"
      : language === "hi"
      ? "हमारे बारे में"
      : about?.sectionBadge ?? "Who We Are";

  // Resolve localized text for Mission & Pastor
  const missionTitle =
    language === "te"
      ? "మా లక్ష్యం"
      : language === "hi"
      ? "हमारा लक्ष्य"
      : about?.missionTitle ?? t.about.missionTitle;

  const missionText =
    language === "te"
      ? "క్రీస్తు యొక్క రాజ సువార్తను ప్రకటించడం, సమస్త జనులను శిష్యులుగా చేయడం, మరియు ప్రేమ కనికరములతో సమాజానికి సేవ చేస్తూ నశించిన వారిని రక్షించడం మా లక్ష్యం."
      : language === "hi"
      ? "मसीह के राज्य के सुसमाचार का प्रचार करना, सभी जातियों को चेला बनाना, और प्रेम व करुणा से समाज की सेवा करते हुए खोए हुओं को बचाना हमारा लक्ष्य है।"
      : about?.missionText ?? t.about.missionText;

  const ledByLabel =
    language === "te"
      ? "నడిపించువారు"
      : language === "hi"
      ? "नेतृत्वकर्ता"
      : "Led By";

  const pastorTitle =
    language === "te"
      ? primaryPastor?.titleTe || "బిషప్"
      : language === "hi"
      ? primaryPastor?.titleHi || "बिशप"
      : primaryPastor?.title || "Bishop";

  const pastorName =
    language === "te"
      ? primaryPastor?.nameTe || "కుర్రా క్రీస్తు రాజు"
      : language === "hi"
      ? primaryPastor?.nameHi || "कुर्रा क्रिस्तु राजू"
      : primaryPastor?.name || "Kurra Kristhu Raju";

  const pastorDesignation =
    language === "te"
      ? primaryPastor?.designationTe || "సీనియర్ పాస్టర్ & వ్యవస్థాపకులు"
      : language === "hi"
      ? primaryPastor?.designationHi || "वरिष्ठ पादरी एवं संस्थापक"
      : primaryPastor?.designation || "Senior Pastor & Founder";

  return (
    <section
      id="about"
      className="py-16 md:py-24 lg:py-28 relative overflow-hidden transition-colors duration-300 bg-slate-50 dark:bg-transparent"
    >
      <div className="container mx-auto px-4 sm:px-6 relative z-10">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="max-w-3xl mx-auto text-center mb-10 sm:mb-14"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-violet-600 dark:text-violet-400 mb-3 px-4 py-1.5 rounded-full bg-violet-500/10 dark:bg-violet-500/15 border border-violet-500/20 dark:border-violet-500/30 font-outfit">
            {aboutLoading ? "..." : sectionBadge}
          </span>
          {aboutLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-3/4 mx-auto" />
              <div className="h-5 bg-slate-100 dark:bg-slate-900 rounded w-full" />
              <div className="h-5 bg-slate-100 dark:bg-slate-900 rounded w-4/5 mx-auto" />
            </div>
          ) : (
            <>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 sm:mb-4 text-slate-900 dark:text-white tracking-tight font-outfit">
                {heading.split(" ").slice(0, -1).join(" ")}{" "}
                <span 
                  className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 dark:from-violet-400 dark:via-purple-300 dark:to-indigo-300 bg-clip-text text-transparent"
                  style={{
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {heading.split(" ").slice(-1)[0]}
                </span>
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 px-4 leading-relaxed font-sans">
                {subtitle}
              </p>
            </>
          )}
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="max-w-4xl mx-auto mb-10 sm:mb-14"
        >
          <div className="relative bg-white dark:bg-white/[0.03] rounded-3xl p-6 sm:p-9 md:p-11 border border-slate-200/90 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg sm:text-xl md:text-2xl font-black mb-3 sm:mb-4 text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 sm:gap-3 font-outfit">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shadow-violet-600/25 shrink-0">
                  <Church className="w-4 h-4 text-white" />
                </div>
                <span>{aboutLoading ? "..." : missionTitle}</span>
              </h3>
              {aboutLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
                </div>
              ) : (
                <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  {missionText}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Core Values: Elegant Responsive Card Architecture */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6">
          {aboutLoading
            ? Array.from({ length: 4 }).map((_, i) => <ValueCardSkeleton key={i} />)
            : values.map((value, index) => {
                const Icon = value.icon;
                const theme = VALUE_THEMES[index % VALUE_THEMES.length];
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.4, delay: index * 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
                    className="group relative bg-white/95 dark:bg-white/[0.03] rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-200/90 dark:border-white/10 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden active:scale-[0.99] flex flex-row sm:flex-col items-start gap-3.5 sm:gap-4 justify-start"
                  >
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-xs ${theme.glow} text-white shrink-0 group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base md:text-lg font-black mb-1 text-slate-900 dark:text-white tracking-tight font-outfit">
                        {value.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm font-sans">
                        {value.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
        </div>

        {/* Church Info Banner — Pastor + Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-16 sm:mt-20 max-w-5xl mx-auto relative group"
        >
          <div className="relative bg-white/80 dark:bg-[#090a15]/80 backdrop-blur-md border border-slate-200/80 dark:border-white/[0.08] shadow-lg text-slate-800 dark:text-white rounded-[2rem] p-6 sm:p-10 md:p-14 overflow-hidden">
            <div className="relative z-10">
              {/* Pastor Section */}
              {pastorsLoading ? (
                <PastorSkeleton />
              ) : primaryPastor ? (
                <div className="flex flex-col items-center text-center mb-10 pb-10 border-b border-slate-200/80 dark:border-white/10">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4 relative hover:scale-105 transition-transform duration-300 bg-white ring-1 ring-slate-900/10 dark:ring-white/20">
                    <Image
                      src={primaryPastor.image ?? "/pastor.png"}
                      alt={primaryPastor.name}
                      fill
                      sizes="(max-width: 640px) 112px, 128px"
                      className="object-cover"
                      priority
                      unoptimized
                    />
                  </div>
                  <p className="text-indigo-600 dark:text-amber-400 font-bold uppercase tracking-[0.2em] text-xs mb-1.5 font-outfit">
                    {ledByLabel}
                  </p>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-1.5 tracking-tight text-slate-900 dark:text-white font-outfit">
                    {pastorTitle}
                  </h3>
                  <p className="text-lg sm:text-2xl md:text-3xl font-black tracking-wide text-amber-600 dark:text-amber-300 font-outfit">
                    {pastorName}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-white/50 mt-1 font-sans">
                    {pastorDesignation}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center mb-10 pb-10 border-b border-slate-200/80 dark:border-white/10">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl mb-4 relative hover:scale-105 transition-transform duration-300 bg-white ring-1 ring-slate-900/10 dark:ring-white/20">
                    <Image
                      src="/pastor.png"
                      alt="Bishop Kurra Kristhu Raju"
                      fill
                      sizes="(max-width: 640px) 112px, 128px"
                      className="object-cover"
                      priority
                      unoptimized
                    />
                  </div>
                  <p className="text-indigo-600 dark:text-amber-400 font-bold uppercase tracking-[0.2em] text-xs mb-1.5 font-outfit">
                    {ledByLabel}
                  </p>
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-1.5 tracking-tight text-slate-900 dark:text-white font-outfit">
                    {t.about.pastor}
                  </h3>
                  <p className="text-lg sm:text-2xl md:text-3xl font-black tracking-wide text-amber-600 dark:text-amber-300 font-outfit">
                    {t.about.pastorName}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
                {/* Contact Details */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                  <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 tracking-tight text-slate-900 dark:text-white flex items-center gap-2 font-outfit">
                    <div className="w-7 h-7 rounded-lg bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span>{t.hero.ctaPrimary}</span>
                  </h3>
                  {contactsLoading ? (
                    <div className="animate-pulse space-y-2 w-full mb-6">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                    </div>
                  ) : primaryContact ? (
                    <>
                      <div
                        onClick={handlePrimaryAddressClick}
                        onKeyDown={handlePrimaryAddressKeyDown}
                        role="button"
                        tabIndex={0}
                        aria-label={`View ${primaryContact.branchName} contact details`}
                        className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 mb-4 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 cursor-pointer hover:border-violet-400/50 dark:hover:border-violet-400/40 hover:bg-slate-100/80 dark:hover:bg-white/[0.06] transition-all select-none outline-none focus-visible:ring-2 focus-visible:ring-violet-500 w-full text-center lg:text-left"
                      >
                        {(
                          language === "te" && primaryContact.addressTe
                            ? primaryContact.addressTe
                            : language === "hi" && primaryContact.addressHi
                            ? primaryContact.addressHi
                            : primaryContact.address
                        )
                          .split("\n")
                          .map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                      </div>
                      <div className="flex flex-col gap-2.5 w-full">
                        {primaryContact.phones.map((phone, i) => (
                          <a
                            key={i}
                            href={`tel:${phone.number.replace(/\s/g, "")}`}
                            className="inline-flex items-center justify-between bg-white hover:bg-slate-50 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl border border-slate-200/90 dark:border-white/10 hover:border-violet-400 dark:hover:border-violet-400/50 transition-all duration-200 cursor-pointer w-full group/phone shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 group-hover/phone:scale-110 transition-transform">
                                <Phone className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-xs sm:text-sm md:text-base font-bold tracking-tight text-slate-900 dark:text-white truncate font-sans">
                                {phone.number}
                              </span>
                            </div>
                            {phone.label && (
                              <span className="text-[10px] sm:text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-200/60 dark:border-violet-500/20 whitespace-nowrap">
                                {phone.label}
                              </span>
                            )}
                          </a>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>

                {/* Branch Locations */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center lg:text-left tracking-tight text-slate-950 dark:text-white font-outfit flex items-center justify-center lg:justify-start gap-2">
                    <div className="w-7 h-7 rounded-lg bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                      <Church className="w-3.5 h-3.5" />
                    </div>
                    <span>{t.services.title}</span>
                  </h3>
                  {contactsLoading ? (
                    <div className="space-y-2.5">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse h-14 bg-slate-100 dark:bg-slate-900 rounded-2xl" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {safeContacts.map((contact, idx) => (
                        <BranchCard key={contact.id} contact={contact} idx={idx} language={language} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

