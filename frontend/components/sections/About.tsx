"use client";

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

// ── Branch colour scheme ──────────────────────────────────────────────────────
const BRANCH_STYLES: Record<
  number,
  { card: string; title: string; icon: string; time: string; badge: string }
> = {
  0: {
    card: "bg-blue-500/5 hover:bg-blue-500/10 dark:bg-blue-500/[0.02] dark:hover:bg-blue-500/5 border-blue-500/15 hover:border-blue-500/35 dark:border-blue-500/10 dark:hover:border-blue-500/25 hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 border-l-4 border-l-blue-500/80 dark:border-l-blue-400/80 backdrop-blur-md",
    title: "text-blue-900 dark:text-blue-200 group-hover/loc:text-blue-700 dark:group-hover/loc:text-blue-100",
    icon: "text-blue-600 dark:text-blue-400",
    time: "text-blue-800 dark:text-blue-300",
    badge: "bg-blue-500/10 dark:bg-blue-500/20 text-blue-900 dark:text-blue-200 border border-blue-500/20 dark:border-blue-500/30",
  },
  1: {
    card: "bg-rose-500/5 hover:bg-rose-500/10 dark:bg-rose-500/[0.02] dark:hover:bg-rose-500/5 border-rose-500/15 hover:border-rose-500/35 dark:border-rose-500/10 dark:hover:border-rose-500/25 hover:shadow-rose-500/5 dark:hover:shadow-rose-500/10 border-l-4 border-l-rose-500/80 dark:border-l-rose-400/80 backdrop-blur-md",
    title: "text-rose-900 dark:text-rose-200 group-hover/loc:text-rose-700 dark:group-hover/loc:text-rose-100",
    icon: "text-rose-600 dark:text-rose-400",
    time: "text-rose-800 dark:text-rose-300",
    badge: "bg-rose-500/10 dark:bg-rose-500/20 text-rose-900 dark:text-rose-200 border border-rose-500/20 dark:border-rose-500/30",
  },
  2: {
    card: "bg-emerald-500/5 hover:bg-emerald-500/10 dark:bg-emerald-500/[0.02] dark:hover:bg-emerald-500/5 border-emerald-500/15 hover:border-emerald-500/35 dark:border-emerald-500/10 dark:hover:border-emerald-500/25 hover:shadow-emerald-500/5 dark:hover:shadow-emerald-500/10 border-l-4 border-l-emerald-500/80 dark:border-l-emerald-400/80 backdrop-blur-md",
    title: "text-emerald-900 dark:text-emerald-200 group-hover/loc:text-emerald-700 dark:group-hover/loc:text-emerald-100",
    icon: "text-emerald-600 dark:text-emerald-400",
    time: "text-emerald-800 dark:text-emerald-300",
    badge: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 border border-emerald-500/20 dark:border-emerald-500/30",
  },
};

// ── Skeleton Components ───────────────────────────────────────────────────────
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
function BranchCard({ contact, idx, language }: { contact: SiteContact; idx: number; language: string }) {
  const style = BRANCH_STYLES[idx % 3] ?? BRANCH_STYLES[0];

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

  return (
    <div
      onClick={handleClick}
      className={`group/loc ${style.card} border rounded-2xl p-4 md:p-5 transition-all duration-300 cursor-pointer hover:shadow-sm`}
    >
      <p className="font-bold mb-1 tracking-wide flex items-center justify-between text-sm">
        <span className="flex items-center gap-2">
          <MapPin className={`w-3.5 h-3.5 ${style.icon} group-hover/loc:scale-110 transition-transform`} />
          <span className={`transition-colors duration-200 ${style.title}`}>{name}</span>
        </span>
        <span
          className={`text-[10px] ${style.badge} px-2 py-0.5 rounded font-normal opacity-0 group-hover/loc:opacity-100 transition-opacity duration-200`}
        >
          {language === "te" ? "మ్యాప్ చూడండి" : language === "hi" ? "मानचित्र देखें" : "View Map →"}
        </span>
      </p>
      {contact.serviceHours && (
        <p className={`${style.time} text-xs transition-colors duration-200`}>{contact.serviceHours}</p>
      )}
    </div>
  );
}

// ── Main About Component ──────────────────────────────────────────────────────
export default function About({ initialAboutData, initialContactsData, initialPastorsData }: { initialAboutData?: any, initialContactsData?: any, initialPastorsData?: any }) {
  const { t, language } = useLanguage();

  // CMS data hooks
  const { data: about, loading: aboutLoading } = useAboutContent(initialAboutData);
  const { contacts, loading: contactsLoading } = useContacts(initialContactsData);
  const { pastors, loading: pastorsLoading } = usePastors(initialPastorsData);

  const primaryContact = contacts[0];
  const primaryPastor = pastors.find((p) => p.isActive) ?? pastors[0];

  // Resolve localized text
  const heading =
    language === "te" && about?.headingTe
      ? about.headingTe
      : language === "hi" && about?.headingHi
      ? about.headingHi
      : about?.heading ?? t.about.title;

  const subtitle =
    language === "te" && about?.subtitleTe
      ? about.subtitleTe
      : language === "hi" && about?.subtitleHi
      ? about.subtitleHi
      : about?.subtitle ?? t.about.subtitle;

  // Values from CMS or fallback to translation
  const values = about?.values?.length
    ? about.values.map((v) => ({
        icon: getIcon(v.icon),
        title:
          language === "te" && v.titleTe
            ? v.titleTe
            : language === "hi" && v.titleHi
            ? v.titleHi
            : v.title,
        description:
          language === "te" && v.descriptionTe
            ? v.descriptionTe
            : language === "hi" && v.descriptionHi
            ? v.descriptionHi
            : v.description,
        gradient: v.gradient,
      }))
    : [
        { icon: Church, title: t.about.values.worship, description: t.about.values.worshipDesc, gradient: "from-purple-500 to-violet-600" },
        { icon: Heart, title: t.about.values.community, description: t.about.values.communityDesc, gradient: "from-rose-500 to-pink-600" },
        { icon: Users, title: t.about.values.fellowship, description: t.about.values.fellowshipDesc, gradient: "from-blue-500 to-cyan-600" },
        { icon: BookOpen, title: t.about.values.teaching, description: t.about.values.teachingDesc, gradient: "from-emerald-500 to-teal-600" },
      ];

  return (
    <section
      id="about"
      className="py-20 md:py-28 lg:py-36 relative overflow-hidden transition-colors duration-300 bg-slate-50 dark:bg-transparent"
    >
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
            {aboutLoading ? "..." : about?.sectionBadge ?? "Who We Are"}
          </span>
          {aboutLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-3/4 mx-auto" />
              <div className="h-5 bg-slate-100 dark:bg-slate-900 rounded w-full" />
              <div className="h-5 bg-slate-100 dark:bg-slate-900 rounded w-4/5 mx-auto" />
            </div>
          ) : (
            <>
              <h2 className="text-4xl md:text-5xl font-black mb-5 text-slate-900 dark:text-white tracking-tight">
                {heading.split(" ").slice(0, -1).join(" ")}{" "}
                <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-gradient-end))] bg-clip-text text-transparent">
                  {heading.split(" ").slice(-1)[0]}
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-600 dark:text-white/60 px-4 leading-relaxed">
                {subtitle}
              </p>
            </>
          )}
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
                {aboutLoading ? "..." : about?.missionTitle ?? t.about.missionTitle}
              </h3>
              {aboutLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
                </div>
              ) : (
                <p className="text-base sm:text-lg text-slate-600 dark:text-white/70 leading-relaxed">
                  {about?.missionText ?? t.about.missionText}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {aboutLoading
            ? Array.from({ length: 4 }).map((_, i) => <ValueCardSkeleton key={i} />)
            : values.map((value, index) => {
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
                    <div
                      className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${value.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-3xl`}
                    />
                    <div className="relative z-10">
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-6 shadow-md services-icon`}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white tracking-tight">
                        {value.title}
                      </h3>
                      <p className="text-slate-600 dark:text-white/60 leading-relaxed text-sm">
                        {value.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
        </div>

        {/* Church Info Banner — Pastor + Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-24 max-w-5xl mx-auto relative group"
        >
          <div className="absolute -top-12 -right-12 w-96 h-96 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/10 dark:from-violet-500/10 dark:to-purple-500/5 blur-3xl pointer-events-none -z-10 group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute -bottom-12 -left-12 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-500/15 to-blue-500/10 dark:from-cyan-500/5 dark:to-blue-500/5 blur-3xl pointer-events-none -z-10 group-hover:scale-105 transition-transform duration-700" />

          <div className="relative bg-white/40 dark:bg-[#090a15]/40 backdrop-blur-xl border border-white/60 dark:border-white/[0.08] shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-slate-800 dark:text-white rounded-[2.5rem] p-10 sm:p-12 md:p-16 overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03]"
              style={{
                backgroundImage: `radial-gradient(circle, currentColor 1.2px, transparent 1.2px)`,
                backgroundSize: "28px 28px",
              }}
            />
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-violet-400/10 dark:bg-violet-500/5 blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Pastor Section */}
              {pastorsLoading ? (
                <PastorSkeleton />
              ) : primaryPastor ? (
                <div className="flex flex-col items-center text-center mb-12 pb-12 border-b border-slate-200/80 dark:border-white/10">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-white/10 shadow-xl mb-4 relative hover:scale-105 transition-transform duration-300 bg-slate-900">
                    <Image
                      src={primaryPastor.image ?? "/pastor.png"}
                      alt={primaryPastor.name}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                  <p className="text-violet-600/80 dark:text-amber-400/80 font-bold uppercase tracking-[0.2em] text-xs mb-2">
                    Led By
                  </p>
                  <h3 className="text-2xl md:text-4xl font-extrabold mb-2 tracking-tight text-slate-900 dark:text-white">
                    {primaryPastor.title}
                  </h3>
                  <p className="text-xl md:text-3xl font-black tracking-wide text-violet-600 dark:text-amber-300">
                    {primaryPastor.name}
                  </p>
                  {primaryPastor.designation && (
                    <p className="text-sm text-slate-500 dark:text-white/50 mt-1">{primaryPastor.designation}</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center text-center mb-12 pb-12 border-b border-slate-200/80 dark:border-white/10">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-white/10 shadow-xl mb-4 relative hover:scale-105 transition-transform duration-300 bg-slate-900">
                    <Image src="/pastor.png" alt="Bishop Kurra Kristhu Raju" fill sizes="112px" className="object-cover" />
                  </div>
                  <p className="text-violet-600/80 dark:text-amber-400/80 font-bold uppercase tracking-[0.2em] text-xs mb-2">Led By</p>
                  <h3 className="text-2xl md:text-4xl font-extrabold mb-2 tracking-tight text-slate-900 dark:text-white">{t.about.pastor}</h3>
                  <p className="text-xl md:text-3xl font-black tracking-wide text-violet-600 dark:text-amber-300">{t.about.pastorName}</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                {/* Contact Details */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                  <h3 className="text-xl font-bold mb-6 tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-violet-600 dark:text-violet-400">📍</span>
                    {t.hero.ctaPrimary}
                  </h3>
                  {contactsLoading ? (
                    <div className="animate-pulse space-y-2 w-full mb-8">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                    </div>
                  ) : primaryContact ? (
                    <>
                      <div className="space-y-1 text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed border-l-2 border-slate-200 dark:border-white/10 pl-4">
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
                      <div className="flex flex-col gap-3 w-full sm:w-auto">
                        {primaryContact.phones.map((phone, i) => (
                          <a
                            key={i}
                            href={`tel:${phone.number.replace(/\s/g, "")}`}
                            className="inline-flex items-center gap-3 bg-white/40 hover:bg-white/60 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] px-6 py-3.5 rounded-2xl border border-white/60 dark:border-white/[0.06] hover:border-violet-300/45 dark:hover:border-purple-500/25 transition-all duration-300 cursor-pointer w-full group/phone hover:shadow-sm"
                          >
                            <Phone className="w-5 h-5 text-violet-600 dark:text-amber-300 group-hover/phone:scale-110 transition-transform" />
                            <p className="text-base md:text-lg font-bold tracking-wide text-slate-800 dark:text-white/90">
                              {phone.number}
                              {phone.label && (
                                <span className="text-xs text-slate-400 dark:text-white/40 ml-2">({phone.label})</span>
                              )}
                            </p>
                          </a>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>

                {/* Branch Locations */}
                <div>
                  <h3 className="text-xl font-bold mb-6 text-center lg:text-left tracking-tight text-slate-950 dark:text-white">
                    {t.services.title}
                  </h3>
                  {contactsLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {contacts.map((contact, idx) => (
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
