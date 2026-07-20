import { LucideIcon } from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

export interface NavStyles {
  activeText: string;
  activeBg: string;
  activeBorder: string;
  hoverText: string;
  hoverBg: string;
  mobileActiveBorder: string;
  activeIndicator: string;
}

export interface NavContextValue {
  isScrolled: boolean;
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  activeSection: string;
  pathname: string;
  isHomePage: boolean;
}
