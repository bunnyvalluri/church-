"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

const translations: Record<string, Record<string, string>> = {
  en: {
    admin: "Dashboard",
    dashboard: "Dashboard",
    members: "Members",
    member: "Member Registry",
    groups: "Member Groups",
    "prayer-requests": "Prayer Requests",
    "family-management": "Family Management",
    finance: "Finance",
    donations: "Donations",
    pledges: "Pledges",
    transactions: "Transactions",
    accounts: "Accounts",
    attendance: "Attendance",
    records: "Attendance Records",
    events: "Events",
    reports: "Reports & Analytics",
    content: "Content Management",
    sermons: "Sermons Library",
    announcements: "Announcements",
    media: "Media Library",
    pages: "Page CMS",
    ngo: "NGO Operations",
    projects: "Outreach Projects",
    volunteers: "Volunteers Roster",
    settings: "Settings",
    general: "General Settings",
    users: "User Accounts",
    roles: "Roles & Access",
    permissions: "Permissions",
    security: "Security & Audit Logs",
  },
  te: {
    admin: "డాష్‌బోర్డ్",
    dashboard: "డాష్‌బోర్డ్",
    members: "సభ్యుల విభాగం",
    member: "సభ్యుల రికార్డు",
    groups: "సభ్యుల సమూహాలు",
    "prayer-requests": "ప్రార్థన విజ్ఞప్తులు",
    "family-management": "కుటుంబాల నిర్వహణ",
    finance: "ఆర్థిక విభాగం",
    donations: "కానుకలు",
    pledges: "వాగ్దానాలు",
    transactions: "లావాదేవీలు",
    accounts: "ఖాతాలు",
    attendance: "హాజరు",
    records: "హాజరు రికార్డులు",
    events: "కార్యక్రమాలు",
    reports: "విశ్లేషణలు & నివేదికలు",
    content: "కంటెంట్ నిర్వహణ",
    sermons: "ప్రసంగాల నిధి",
    announcements: "ప్రకటనల విభాగం",
    media: "మీడియా గ్యాలరీ",
    pages: "పబ్లిక్ పేజీ ఎడిటర్",
    ngo: "స్వచ్ఛంద సంస్థ అవలోకనం",
    projects: "సువార్త సేవ ప్రాజెక్టులు",
    volunteers: "వాలంటీర్ల రికార్డు",
    settings: "సెట్టింగ్‌లు",
    general: "సాధారణ సెట్టింగ్‌లు",
    users: "వినియోగదారుల ఖాతాలు",
    roles: "పాత్రలు & అనుమతులు",
    permissions: "అనుమతులు",
    security: "భద్రత & ఆడిట్ రికార్డులు",
  },
  hi: {
    admin: "डैशबोर्ड",
    dashboard: "डैशबोर्ड",
    members: "सदस्य",
    member: "सदस्य रिकॉर्ड",
    groups: "सदस्य समूह",
    "prayer-requests": "प्रार्थना अनुरोध",
    "family-management": "परिवार प्रबंधन",
    finance: "वित्त",
    donations: "दान",
    pledges: "प्रतिज्ञाएं",
    transactions: "लेनदेन",
    accounts: "खाते",
    attendance: "उपस्थिति",
    records: "उपस्थिति रिकॉर्ड",
    events: "कार्यक्रम",
    reports: "रिपोर्ट और विश्लेषण",
    content: "सामग्री प्रबंधन",
    sermons: "उपदेश पुस्तकालय",
    announcements: "घोषणाएं",
    media: "मीडिया पुस्तकालय",
    pages: "पृष्ठ संपादक",
    ngo: "गैर सरकारी संगठन",
    projects: "आउटरीच परियोजनाएं",
    volunteers: "स्वयंसेवक रोस्टर",
    settings: "सेटिंग्स",
    general: "सामान्य सेटिंग्स",
    users: "उपयोगकर्ता खाते",
    roles: "भूमिकाएं और पहुंच",
    permissions: "अनुमतियां",
    security: "सुरक्षा और लेखा परीक्षा",
  }
};

export default function AdminBreadcrumb() {
  const pathname = usePathname() || "/admin";
  const { language } = useLanguage();
  const langDict = translations[language] || translations.en;

  const pathSegments = pathname.split("/").filter(Boolean);

  const getLabel = (segment: string) => {
    return langDict[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
  };

  if (pathSegments.length <= 1 || (pathSegments.length === 2 && pathSegments[1] === "dashboard")) {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 dark:text-slate-400">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>{langDict.dashboard}</span>
        </Link>
      </nav>
    );
  }

  const breadcrumbs: { label: string; href: string; isLast: boolean }[] = [];
  let currentPath = "";

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = getLabel(segment);

    if (segment === "admin") {
      breadcrumbs.push({
        label: langDict.dashboard,
        href: "/admin/dashboard",
        isLast: false,
      });
    } else {
      breadcrumbs.push({
        label,
        href: currentPath,
        isLast: index === pathSegments.length - 1,
      });
    }
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 dark:text-slate-400 select-none">
      {breadcrumbs.map((crumb, idx) => {
        return (
          <React.Fragment key={crumb.href + idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 flex-shrink-0" />}
            {crumb.isLast ? (
              <span className="font-bold text-slate-900 dark:text-white tracking-wide">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-semibold flex items-center gap-1"
              >
                {idx === 0 && <Home className="w-3.5 h-3.5 mr-0.5" />}
                <span>{crumb.label}</span>
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
