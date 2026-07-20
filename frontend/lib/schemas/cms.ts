/**
 * lib/schemas/cms.ts
 * Zod validation schemas for all CMS API endpoints.
 */
import { z } from "zod";

// ── Hero ─────────────────────────────────────────────────────────────────────

export const HeroUpdateSchema = z.object({
  headline: z.string().min(1, "Headline is required").max(200),
  subheadline: z.string().min(1, "Subheadline is required").max(200),
  subtitle: z.string().min(1, "Subtitle is required").max(500),
  badgeText: z.string().min(1).max(100),
  ctaPrimaryText: z.string().min(1).max(60),
  ctaPrimaryHref: z.string().min(1).max(200),
  ctaSecondaryText: z.string().min(1).max(60),
  ctaSecondaryHref: z.string().min(1).max(200),
  ctaTertiaryText: z.string().min(1).max(60),
  ctaTertiaryHref: z.string().min(1).max(200),
  backgroundImageUrl: z.string().url().nullable().optional(),
  backgroundImageId: z.string().nullable().optional(),
  backgroundVideoUrl: z.string().url().nullable().optional(),
  backgroundType: z.enum(["gradient", "image", "video"]).default("gradient"),
  isActive: z.boolean().default(true),
});

export type HeroUpdateInput = z.infer<typeof HeroUpdateSchema>;

// ── Statistics ────────────────────────────────────────────────────────────────

export const StatColorSchemeEnum = z.enum([
  "violet", "emerald", "amber", "rose", "blue", "teal", "orange", "purple",
]);

export const SiteStatisticCreateSchema = z.object({
  key: z.string().min(1).max(50).regex(/^[a-z_]+$/, "Key must be lowercase letters and underscores only"),
  label: z.string().min(1).max(100),
  labelTe: z.string().max(100).nullable().optional(),
  labelHi: z.string().max(100).nullable().optional(),
  value: z.string().min(1).max(20),
  icon: z.string().min(1).max(50).default("Users"),
  colorScheme: StatColorSchemeEnum.default("violet"),
  autoCompute: z.boolean().default(false),
  computeFrom: z.string().nullable().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const SiteStatisticUpdateSchema = SiteStatisticCreateSchema.partial();
export const SiteStatisticBatchUpdateSchema = z.object({
  statistics: z.array(z.object({
    id: z.string(),
    value: z.string().min(1).max(20).optional(),
    label: z.string().min(1).max(100).optional(),
    labelTe: z.string().max(100).nullable().optional(),
    labelHi: z.string().max(100).nullable().optional(),
    displayOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
    colorScheme: StatColorSchemeEnum.optional(),
    icon: z.string().max(50).optional(),
  })).min(1),
});

export type SiteStatisticCreateInput = z.infer<typeof SiteStatisticCreateSchema>;
export type SiteStatisticBatchUpdateInput = z.infer<typeof SiteStatisticBatchUpdateSchema>;

// ── Contact ───────────────────────────────────────────────────────────────────

const ContactPhoneSchema = z.object({
  label: z.string().min(1).max(100),
  number: z.string().min(5).max(25),
});

export const SiteContactUpdateSchema = z.object({
  branchKey: z.string().min(1).max(50),
  branchName: z.string().min(1).max(100),
  branchNameTe: z.string().max(100).nullable().optional(),
  branchNameHi: z.string().max(100).nullable().optional(),
  address: z.string().min(1).max(500),
  addressTe: z.string().max(500).nullable().optional(),
  addressHi: z.string().max(500).nullable().optional(),
  phones: z.array(ContactPhoneSchema).min(1, "At least one phone number is required"),
  email: z.string().email().nullable().optional(),
  mapsUrl: z.string().url("Must be a valid Google Maps URL"),
  embedUrl: z.string().url("Must be a valid Google Maps embed URL"),
  isStreetView: z.boolean().default(false),
  serviceHours: z.string().max(200).nullable().optional(),
  whatsappUrl: z.string().url().nullable().optional(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export type SiteContactUpdateInput = z.infer<typeof SiteContactUpdateSchema>;

// ── Footer ────────────────────────────────────────────────────────────────────

export const FooterConfigUpdateSchema = z.object({
  tagline: z.string().min(1).max(500),
  taglineTe: z.string().max(500).nullable().optional(),
  address: z.string().min(1).max(500),
  mapsUrl: z.string().url("Must be a valid URL"),
  phones: z.array(ContactPhoneSchema),
  email: z.string().email("Must be a valid email address"),
  instagramUrl: z.string().url().nullable().optional(),
  youtubeUrl: z.string().url().nullable().optional(),
  facebookUrl: z.string().url().nullable().optional(),
  twitterUrl: z.string().url().nullable().optional(),
  copyright: z.string().max(200).nullable().optional(),
});

export type FooterConfigUpdateInput = z.infer<typeof FooterConfigUpdateSchema>;

// ── Navigation Items ──────────────────────────────────────────────────────────

export const NavPlacementEnum = z.enum([
  "FOOTER_ABOUT",
  "FOOTER_RESOURCES",
  "FOOTER_INVOLVED",
  "FOOTER_CONNECT",
  "NAV_MAIN",
]);

export const NavigationItemCreateSchema = z.object({
  label: z.string().min(1).max(100),
  labelTe: z.string().max(100).nullable().optional(),
  labelHi: z.string().max(100).nullable().optional(),
  href: z.string().min(1).max(500),
  placement: NavPlacementEnum,
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  openInNew: z.boolean().default(false),
  icon: z.string().max(50).nullable().optional(),
});

export const NavigationItemUpdateSchema = NavigationItemCreateSchema.partial().extend({
  id: z.string(),
});

export const NavigationItemBatchReorderSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    displayOrder: z.number().int(),
  })).min(1),
});

export type NavigationItemCreateInput = z.infer<typeof NavigationItemCreateSchema>;
export type NavigationItemUpdateInput = z.infer<typeof NavigationItemUpdateSchema>;
export type NavigationItemBatchReorderInput = z.infer<typeof NavigationItemBatchReorderSchema>;

// ── About ─────────────────────────────────────────────────────────────────────

const AboutValueSchema = z.object({
  icon: z.string().min(1).max(50),
  title: z.string().min(1).max(100),
  titleTe: z.string().max(100).optional(),
  titleHi: z.string().max(100).optional(),
  description: z.string().min(1).max(500),
  descriptionTe: z.string().max(500).optional(),
  descriptionHi: z.string().max(500).optional(),
  gradient: z.string().min(1).max(100),
});

export const AboutConfigUpdateSchema = z.object({
  sectionBadge: z.string().min(1).max(100),
  heading: z.string().min(1).max(200),
  headingTe: z.string().max(200).nullable().optional(),
  headingHi: z.string().max(200).nullable().optional(),
  subtitle: z.string().min(1).max(500),
  subtitleTe: z.string().max(500).nullable().optional(),
  subtitleHi: z.string().max(500).nullable().optional(),
  missionTitle: z.string().min(1).max(200),
  missionText: z.string().min(1).max(2000),
  values: z.array(AboutValueSchema).min(1).max(8),
});

export type AboutConfigUpdateInput = z.infer<typeof AboutConfigUpdateSchema>;

// ── Revalidation ─────────────────────────────────────────────────────────────

export const RevalidateSchema = z.object({
  tags: z.array(z.string().min(1)).min(1),
  secret: z.string().optional(),
});

export type RevalidateInput = z.infer<typeof RevalidateSchema>;
