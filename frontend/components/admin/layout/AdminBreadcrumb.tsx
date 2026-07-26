"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const labelMap: Record<string, string> = {
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
};

export default function AdminBreadcrumb() {
  const pathname = usePathname() || "/admin";

  const pathSegments = pathname.split("/").filter(Boolean);

  if (pathSegments.length <= 1 || (pathSegments.length === 2 && pathSegments[1] === "dashboard")) {
    return (
      <nav aria-label="Breadcrumb" className="flex items-center text-xs text-gray-500 dark:text-gray-400">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
      </nav>
    );
  }

  const breadcrumbs: { label: string; href: string; isLast: boolean }[] = [];
  let currentPath = "";

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

    if (segment === "admin") {
      breadcrumbs.push({
        label: "Dashboard",
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
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5 text-xs text-gray-500 dark:text-gray-400 select-none">
      {breadcrumbs.map((crumb, idx) => {
        return (
          <React.Fragment key={crumb.href + idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-600 flex-shrink-0" />}
            {crumb.isLast ? (
              <span className="font-semibold text-gray-900 dark:text-white tracking-wide">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium flex items-center gap-1"
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
