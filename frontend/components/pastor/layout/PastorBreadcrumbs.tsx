"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { getPastorTranslation } from "@/lib/pastorTranslations";

export default function PastorBreadcrumbs() {
  const pathname = usePathname() || "/pastor";
  const { language } = useLanguage();
  const t = getPastorTranslation(language);

  // Don't show breadcrumb on root dashboard
  const segments = pathname.replace(/^\/pastor\/?/, "").split("/").filter(Boolean);
  
  if (segments.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-400 font-medium">
        <Home className="w-3.5 h-3.5 text-indigo-500" />
        <span>{t.pastorPortal}</span>
      </div>
    );
  }

  const formatSegment = (str: string) => {
    const keyMap: Record<string, string> = {
      dashboard: t.navDashboard,
      main: t.groupMain,
      sermons: t.navSermons,
      donations: t.navDonations,
      "member-requests": t.navMemberRequests,
      "prayer-requests": t.navPrayerRequests,
      events: t.navEvents,
      messages: t.navMessages,
      ministry: t.groupMinistry,
      "bible-study-groups": t.navBibleStudy,
      "small-groups": t.navSmallGroups,
      volunteers: t.navVolunteers,
      ngo: t.groupNgo,
      projects: t.navNgoProjects,
      media: t.groupMedia,
      reports: t.groupReports,
      attendance: t.navAttendanceReports,
      members: t.navMemberReports,
      finance: t.navFinanceReports,
      growth: t.navGrowthReports,
      calendar: t.navCalendar,
      gallery: t.navPhotoGallery,
      videos: t.navVideoArchives,
      documents: t.navDocumentLibrary,
      profile: t.navProfile,
      settings: t.groupSettings,
      general: t.navGeneralSettings,
      security: t.navSecurity,
      notifications: t.navNotifications,
      preferences: t.navPreferences,
    };

    if (keyMap[str]) return keyMap[str];

    return str
      .split("-")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  let currentPath = "/pastor";

  return (
    <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-gray-400 overflow-x-auto no-scrollbar">
      <Link 
        href="/pastor/dashboard" 
        className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
      >
        <Home className="w-3.5 h-3.5 text-indigo-500" />
        <span className="hidden sm:inline">{t.pastorPortal}</span>
      </Link>

      {segments.map((seg, idx) => {
        currentPath += `/${seg}`;
        const isLast = idx === segments.length - 1;
        const title = formatSegment(seg);

        return (
          <React.Fragment key={currentPath}>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 shrink-0" />
            {isLast ? (
              <span className="text-slate-900 dark:text-white font-black truncate max-w-[140px] sm:max-w-xs">
                {title}
              </span>
            ) : (
              <Link 
                href={currentPath}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate max-w-[100px] sm:max-w-none"
              >
                {title}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
