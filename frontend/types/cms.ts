/**
 * types/cms.ts
 * TypeScript interfaces for all CMS (Content Management System) models.
 * These types mirror the Prisma schema and are used across frontend components and API routes.
 */

// ── Hero Section ──────────────────────────────────────────────────────────────

export interface HeroContent {
  id: string;
  headline: string;
  subheadline: string;
  subtitle: string;
  badgeText: string;
  ctaPrimaryText: string;
  ctaPrimaryHref: string;
  ctaSecondaryText: string;
  ctaSecondaryHref: string;
  ctaTertiaryText: string;
  ctaTertiaryHref: string;
  backgroundImageUrl: string | null;
  backgroundImageId: string | null;
  backgroundVideoUrl: string | null;
  backgroundType: "gradient" | "image" | "video";
  isActive: boolean;
  updatedById: string | null;
  updatedAt: string;
}

export type HeroContentUpdate = Omit<HeroContent, "id" | "updatedAt">;

// ── Statistics ────────────────────────────────────────────────────────────────

export type StatColorScheme = "violet" | "emerald" | "amber" | "rose" | "blue" | "teal" | "orange" | "purple";

export interface SiteStatistic {
  id: string;
  key: string;
  label: string;
  labelTe: string | null;
  labelHi: string | null;
  value: string;
  icon: string;
  colorScheme: StatColorScheme;
  autoCompute: boolean;
  computeFrom: string | null;
  displayOrder: number;
  isActive: boolean;
  updatedById: string | null;
  updatedAt: string;
}

export type SiteStatisticCreate = Omit<SiteStatistic, "id" | "updatedAt">;
export type SiteStatisticUpdate = Partial<SiteStatisticCreate>;

// ── Contact / Branches ────────────────────────────────────────────────────────

export interface ContactPhone {
  label: string; // e.g. "Senior Pastor"
  number: string; // e.g. "+91 97040 90069"
}

export interface SiteContact {
  id: string;
  branchKey: string;
  branchName: string;
  branchNameTe: string | null;
  branchNameHi: string | null;
  address: string;
  addressTe: string | null;
  addressHi: string | null;
  phones: ContactPhone[];
  email: string | null;
  mapsUrl: string;
  embedUrl: string;
  isStreetView: boolean;
  serviceHours: string | null;
  whatsappUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  updatedAt: string;
}

export type SiteContactUpdate = Omit<SiteContact, "id" | "updatedAt">;

// ── Footer ────────────────────────────────────────────────────────────────────

export interface FooterConfig {
  id: string;
  tagline: string;
  taglineTe: string | null;
  address: string;
  mapsUrl: string;
  phones: ContactPhone[];
  email: string;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  copyright: string | null;
  updatedById: string | null;
  updatedAt: string;
}

export type FooterConfigUpdate = Omit<FooterConfig, "id" | "updatedAt">;

// ── Navigation Items ──────────────────────────────────────────────────────────

export type NavPlacement =
  | "FOOTER_ABOUT"
  | "FOOTER_RESOURCES"
  | "FOOTER_INVOLVED"
  | "FOOTER_CONNECT"
  | "NAV_MAIN";

export interface NavigationItem {
  id: string;
  label: string;
  labelTe: string | null;
  labelHi: string | null;
  href: string;
  placement: NavPlacement;
  displayOrder: number;
  isActive: boolean;
  openInNew: boolean;
  icon: string | null;
  updatedAt: string;
}

export type NavigationItemCreate = Omit<NavigationItem, "id" | "updatedAt">;
export type NavigationItemUpdate = Partial<NavigationItemCreate>;

export interface FooterNavGroups {
  about: NavigationItem[];
  resources: NavigationItem[];
  involved: NavigationItem[];
  connect: NavigationItem[];
}

// ── About Section ─────────────────────────────────────────────────────────────

export interface AboutValue {
  icon: string;           // Lucide icon name
  title: string;
  titleTe?: string;
  titleHi?: string;
  description: string;
  descriptionTe?: string;
  descriptionHi?: string;
  gradient: string;       // e.g. "from-purple-500 to-violet-600"
}

export interface AboutConfig {
  id: string;
  sectionBadge: string;
  heading: string;
  headingTe: string | null;
  headingHi: string | null;
  subtitle: string;
  subtitleTe: string | null;
  subtitleHi: string | null;
  missionTitle: string;
  missionText: string;
  values: AboutValue[];
  updatedById: string | null;
  updatedAt: string;
}

export type AboutConfigUpdate = Omit<AboutConfig, "id" | "updatedAt">;

// ── Pastor ────────────────────────────────────────────────────────────────────

export interface PastorSocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  whatsapp?: string;
}

export interface Pastor {
  id: string;
  name: string;
  title: string;
  designation: string | null;
  bio: string;
  image: string | null;
  imagePublicId: string | null;
  email: string | null;
  phone: string | null;
  socialLinks: PastorSocialLinks | null;
  branchId: string | null;
  isActive: boolean;
  isDeleted: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ── Combined homepage data ────────────────────────────────────────────────────

export interface HomepageCmsData {
  hero: HeroContent | null;
  statistics: SiteStatistic[];
  contacts: SiteContact[];
  footer: FooterConfig | null;
  navigation: FooterNavGroups;
  about: AboutConfig | null;
  pastors: Pastor[];
}

// ── API Response wrappers ─────────────────────────────────────────────────────

export interface CmsApiResponse<T> {
  data: T;
  cached?: boolean;
  updatedAt?: string;
}

export interface CmsApiError {
  error: string;
  details?: unknown;
}
