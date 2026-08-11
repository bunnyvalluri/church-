import { LucideIcon } from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  emoji?: string;
}

export interface NavStyles {
  activeText: string;
  activeBg: string;
  activeBorder: string;
  hoverText: string;
  hoverBg: string;
  mobileActiveBorder: string;
  activeIndicator: string;
  // Apple Liquid Glass Extended Tokens
  glowColor: string;
  liquidBlobGradient: string;
  liquidBorderGlow: string;
  iconBg: string;
  activeIconText: string;
}

export interface NavContextValue {
  isScrolled: boolean;
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  activeSection: string;
  pathname: string;
  isHomePage: boolean;
}
