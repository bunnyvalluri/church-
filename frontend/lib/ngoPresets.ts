export interface MediaItem {
  id: string;
  title: string | null;
  url: string;
  type: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  details: string;
  imageUrl: string | null;
  targetAmount: number | null;
  raisedAmount: number;
  status: string;
  category?: string;
  location?: string;
  beneficiaries?: string;
  createdAt: string;
  media: MediaItem[];
  _count: { volunteers: number };
}

export const NGO_PRESETS: Record<string, Project> = {
  "preset-gandhi": {
    id: "preset-gandhi",
    title: "Gandhi General Hospital Support",
    description: "Distributing nutritious milk food, basic medical supplies, and sanitary items to critical care wards and patient caretakers.",
    details: "Every week, KCM volunteers visit Gandhi General Hospital in Hyderabad. Our primary activities include preparing and distributing fresh food packets, sanitary clothes, warm blankets, and direct financial aid to patients in cardiac, oncology, and general medicine wards. In addition to physical supplies, we offer counseling and emotional support to patient families.",
    imageUrl: "/gandhi_hospital_support_image.png",
    targetAmount: null,
    raisedAmount: 0,
    status: "ACTIVE",
    category: "HOSPITAL",
    location: "Gandhi Hospital, Secunderabad",
    beneficiaries: "1,500+ Patients & Families",
    createdAt: "2026-03-25T00:00:00.000Z",
    media: [
      { id: "g-m-1", title: "Gandhi Hospital Relief Drive & Volunteer Team", type: "IMAGE", url: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0031.jpg" },
      { id: "g-m-2", title: "Nutritious Food Packets Handover in Inpatient Wards", type: "IMAGE", url: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0037.jpg" },
      { id: "g-m-3", title: "Essential Sanitary Kits & Bedding for Caretakers", type: "IMAGE", url: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260325-WA0038.jpg" },
      { id: "g-m-4", title: "KCM Society Hospital Mission Logistics & Aid Bags", type: "IMAGE", url: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260326-WA0029.jpg" },
      { id: "g-m-5", title: "Special Nutritional Sustenance for Critical Patients", type: "IMAGE", url: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260418-WA0035.jpg" },
      { id: "g-m-6", title: "Emergency Care Supplies & Direct Bedside Assistance", type: "IMAGE", url: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260418-WA0046.jpg" },
      { id: "g-m-7", title: "Volunteer Compassionate Fellowship with Patient Families", type: "IMAGE", url: "/KCM_NGO_SERVICES/HOSPITALS/25-03-2026(GANDHI-HOSPITAL)/IMG-20260418-WA0054.jpg" }
    ],
    _count: { volunteers: 38 },
  },
  "preset-bethany": {
    id: "preset-bethany",
    title: "Bethany Samrakshana Ashramam Care",
    description: "Supporting orphan children and elders in Bethany Ashramam with monthly groceries, school supplies, clean blankets, and care assistants.",
    details: "Bethany Samrakshana Ashramam provides refuge to underprivileged orphan children and abandoned elders. KCM NGO services finance their primary operating costs. This includes purchasing monthly dry grocery bags (rice, wheat, pulses), school books and uniforms for the children, medical checkups for the elderly residents, and contributing toward helper salaries.",
    imageUrl: "/bethany_ashramam_care_image.png",
    targetAmount: null,
    raisedAmount: 0,
    status: "ACTIVE",
    category: "ASHRAMAM",
    location: "Bethany Ashramam, Hyderabad",
    beneficiaries: "120+ Elders & Children",
    createdAt: "2026-04-21T00:00:00.000Z",
    media: [
      { id: "b-m-1", title: "Bethany Ashramam Children & Elders Gathering", type: "IMAGE", url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0013.jpg" },
      { id: "b-m-2", title: "Monthly Dry Grocery Provisions Handover", type: "IMAGE", url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0022.jpg" },
      { id: "b-m-3", title: "Bishop Kurra Kristhu Raju Fellowship with Residents", type: "IMAGE", url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0027.jpg" },
      { id: "b-m-4", title: "Fresh Wholesome Meals Distribution for Children", type: "IMAGE", url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0050.jpg" },
      { id: "b-m-5", title: "Compassionate Support for Underprivileged Orphan Youth", type: "IMAGE", url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0131.jpg" },
      { id: "b-m-6", title: "Ashramam Community Prayer, Care & Fellowship Drive", type: "IMAGE", url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260421-WA0145.jpg" },
      { id: "b-m-7", title: "Dignified Support and Care for Senior Resident Elders", type: "IMAGE", url: "/KCM_NGO_SERVICES/BETHANY_SAMRAKSHANA_ASHRAMAM/21-04-2026(AASHRAMAM)/IMG-20260422-WA0001.jpg" }
    ],
    _count: { volunteers: 42 },
  },
  "preset-disabled": {
    id: "preset-disabled",
    title: "Home for the Disabled Ashramam Aid",
    description: "Assisting physical rehabilitation centers with wheelchairs, walkers, monthly provisions, and critical healthcare monitoring programs.",
    details: "We partner with local disabled rehabilitation centers to supply mobility aids. Our support covers the purchase of high-quality wheelchairs, walkers, crutches, and orthotic accessories. We also organize monthly provisions deliveries and fund visiting healthcare nurses to manage therapy, medical needs, and daily rehabilitation audits.",
    imageUrl: "/home_for_disabled_rehab_care.png",
    targetAmount: null,
    raisedAmount: 0,
    status: "ACTIVE",
    category: "REHABILITATION",
    location: "Rehabilitation Center, Jeedimetla",
    beneficiaries: "85+ Specially-Abled Individuals",
    createdAt: "2026-06-17T00:00:00.000Z",
    media: [
      { id: "d-m-1", title: "Rehabilitation Center Support & Mobility Equipment", type: "IMAGE", url: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0010.jpg" },
      { id: "d-m-2", title: "Wheelchair & Walker Distribution for Inmates", type: "IMAGE", url: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0024.jpg" },
      { id: "d-m-3", title: "Daily Physical Care & Assistive Devices Setup", type: "IMAGE", url: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0043.jpg" },
      { id: "d-m-4", title: "Provisions & Groceries Delivered to Care Center", type: "IMAGE", url: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0059.jpg" },
      { id: "d-m-5", title: "Nutritional Sustenance and Meals for Residents", type: "IMAGE", url: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0082.jpg" },
      { id: "d-m-6", title: "KCM Society Volunteer Support Fellowship", type: "IMAGE", url: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED_AASHRAMAM/IMG-20260617-WA0137.jpg" }
    ],
    _count: { volunteers: 35 },
  },
  "preset-charity": {
    id: "preset-charity",
    title: "Missionaries of Charity Bhoiguda Outreach",
    description: "Providing wholesome nutrition, clean blankets, medical care items, and emotional comfort to residents at Missionaries of Charity, Bhoiguda.",
    details: "KCM volunteers organize dedicated compassionate care drives at Missionaries of Charity in Secunderabad Bhoiguda. We supply wholesome meals, fresh milk, fruits, clean bedding, warm blankets, and personal care hygiene kits to destitute residents and patients under specialized care.",
    imageUrl: "/missionaries_of_charity_bhoiguda_outreach.png",
    targetAmount: null,
    raisedAmount: 0,
    status: "ACTIVE",
    category: "CHARITY",
    location: "Missionaries of Charity, Bhoiguda",
    beneficiaries: "150+ Destitute Residents",
    createdAt: "2026-05-25T00:00:00.000Z",
    media: [
      { id: "c-m-1", title: "Missionaries of Charity Bhoiguda Aid Drive", type: "IMAGE", url: "/KCM_NGO_SERVICES/MISSIONARIES OF CHARITY [SECUNDERABAD BHOIGUDA] 25-05-2026/IMG-20260825-WA0012.jpg" },
      { id: "c-m-2", title: "Distributing Fresh Fruits & Wholesome Meals", type: "IMAGE", url: "/KCM_NGO_SERVICES/MISSIONARIES OF CHARITY [SECUNDERABAD BHOIGUDA] 25-05-2026/IMG-20260825-WA0023.jpg" },
      { id: "c-m-3", title: "Personal Care Hygiene Kits & Blankets Handover", type: "IMAGE", url: "/KCM_NGO_SERVICES/MISSIONARIES OF CHARITY [SECUNDERABAD BHOIGUDA] 25-05-2026/IMG-20260825-WA0027.jpg" },
      { id: "c-m-4", title: "Bedding & Clothing Delivery for Inmates", type: "IMAGE", url: "/KCM_NGO_SERVICES/MISSIONARIES OF CHARITY [SECUNDERABAD BHOIGUDA] 25-05-2026/IMG-20260825-WA0040.jpg" },
      { id: "c-m-5", title: "Bishop Christu Raju with Outreach Volunteers", type: "IMAGE", url: "/KCM_NGO_SERVICES/MISSIONARIES OF CHARITY [SECUNDERABAD BHOIGUDA] 25-05-2026/IMG-20260825-WA0054.jpg" },
      { id: "c-m-6", title: "Compassionate Prayer & Direct Comfort Ministry", type: "IMAGE", url: "/KCM_NGO_SERVICES/MISSIONARIES OF CHARITY [SECUNDERABAD BHOIGUDA] 25-05-2026/IMG-20260825-WA0098.jpg" }
    ],
    _count: { volunteers: 29 },
  },
  "preset-disabled-secunderabad": {
    id: "preset-disabled-secunderabad",
    title: "Home for the Disabled (Secunderabad) Care",
    description: "Delivering clothing, monthly groceries, blankets, and essential hygiene provisions to special needs individuals and elderly at Home for the Disabled, Secunderabad.",
    details: "Regular monthly aid drives conducted at Home for the Disabled in Secunderabad. KCM distributes warm blankets, new clothing, sanitary supplies, nutritious food packages, and physical mobility devices, ensuring residents receive dignity, compassionate fellowship, and dependable support.",
    imageUrl: "/home_for_disabled_secunderabad.jpg",
    targetAmount: null,
    raisedAmount: 0,
    status: "ACTIVE",
    category: "REHABILITATION",
    location: "Home for Disabled, Secunderabad",
    beneficiaries: "200+ Disabled & Senior Residents",
    createdAt: "2026-07-23T00:00:00.000Z",
    media: [
      { id: "ds-m-1", title: "Secunderabad Disabled Home Outreach Camp", type: "IMAGE", url: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED (SECUNDERABAD) [23-07-2026]/IMG-20260723-WA0001.jpg" },
      { id: "ds-m-2", title: "Distributing New Blankets & Fresh Clothing", type: "IMAGE", url: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED (SECUNDERABAD) [23-07-2026]/IMG-20260723-WA0013.jpg" },
      { id: "ds-m-3", title: "Special Nutritional Food Handover", type: "IMAGE", url: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED (SECUNDERABAD) [23-07-2026]/IMG-20260723-WA0032.jpg" },
      { id: "ds-m-4", title: "Direct Care and Fellowship with Special Needs Inmates", type: "IMAGE", url: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED (SECUNDERABAD) [23-07-2026]/IMG-20260723-WA0059.jpg" },
      { id: "ds-m-5", title: "Mobility Aid & Walkers Inspection", type: "IMAGE", url: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED (SECUNDERABAD) [23-07-2026]/IMG-20260723-WA0086.jpg" },
      { id: "ds-m-6", title: "KCM Society Volunteer Care Assembly", type: "IMAGE", url: "/KCM_NGO_SERVICES/HOME_FOR_THE_DISABLED (SECUNDERABAD) [23-07-2026]/IMG-20260723-WA0109.jpg" }
    ],
    _count: { volunteers: 44 },
  },
  "preset-sneha-trust": {
    id: "preset-sneha-trust",
    title: "Sneha Charitable Trust - ICU Beds & Care Mission",
    description: "Donating 2 ICU beds, 2.5 KV power inverter backup system, financial support cheque, and essential nutrition for children with multiple disabilities.",
    details: "In partnership with Sneha Charitable Trust in Yalampet (Medchal District), Kingdom of Christ Ministries & NGO Society fulfills its commitment to children suffering from multiple disabilities. Bishop Kurra Kristhu Raju and society leaders personally delivered two advanced ICU beds, a 2.5 KV inverter power backup system to ensure life-saving equipment runs uninterrupted, along with financial cheque assistance and essential provisions. Over 60 children under daily care benefit directly from this mission.",
    imageUrl: "/sneha_charitable_trust_icu_beds.jpg",
    targetAmount: null,
    raisedAmount: 0,
    status: "ACTIVE",
    category: "CHILDREN_CARE",
    location: "Sneha Charitable Trust, Yalampet, Medchal",
    beneficiaries: "60+ Special Needs Children",
    createdAt: "2026-10-25T00:00:00.000Z",
    media: [
      { id: "s-m-1", title: "Daivalayam Facility, 2 ICU Beds & Inverter Unit", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/7.jpeg" },
      { id: "s-m-2", title: "2 ICU Beds Handover & Financial Support Cheque", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/25.jpeg" },
      { id: "s-m-3", title: "Daivalayam Family Letter of Gratitude", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/2.jpeg" },
      { id: "s-m-4", title: "St. Camillus Ashram & Trust Road Signboard", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/1.jpeg" },
      { id: "s-m-5", title: "Telugu Newspaper Coverage Article", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/3.jpeg" },
      { id: "s-m-6", title: "Local Media Press Report Clipping", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/4.jpeg" },
      { id: "s-m-7", title: "Signing Cheque on Inverter Backup Unit", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/24.jpeg" },
      { id: "s-m-8", title: "Bishop Christu Raju TV Broadcast Address", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/11.jpeg" },
      { id: "s-m-9", title: "Bishop Endorsing Financial Aid Cheque", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/28.jpeg" },
      { id: "s-m-10", title: "KCM Society Team, Staff & Special Children", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/30.jpeg" },
      { id: "s-m-11", title: "Care Event Outreach Collage 1", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/5.jpeg" },
      { id: "s-m-12", title: "Care Event Outreach Collage 2", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/6.jpeg" },
      { id: "s-m-13", title: "High-Dependency ICU Bed Specifications", type: "IMAGE", url: "/KCM_NGO_SERVICES/SNEHA CHARITABLE TRUST/47.jpeg" }
    ],
    _count: { volunteers: 52 },
  },
};

/**
 * Normalizes any preset ID or slug alias and returns the canonical project.
 * Handles:
 * - "preset-gandhi", "preset-gandhi-hospital"
 * - "preset-bethany", "preset-bethany-ashramam"
 * - "preset-disabled", "preset-disabled-ashramam"
 * - "preset-charity", "preset-charity-bhoiguda"
 * - "preset-disabled-secunderabad"
 * - "preset-sneha-trust"
 */
export function getNgoPresetById(id: string | null | undefined): Project | null {
  if (!id) return null;
  const cleanId = id.trim().toLowerCase();

  if (cleanId === "preset-gandhi" || cleanId === "preset-gandhi-hospital") {
    return { ...NGO_PRESETS["preset-gandhi"], id: cleanId };
  }
  if (cleanId === "preset-bethany" || cleanId === "preset-bethany-ashramam") {
    return { ...NGO_PRESETS["preset-bethany"], id: cleanId };
  }
  if (cleanId === "preset-disabled" || cleanId === "preset-disabled-ashramam") {
    return { ...NGO_PRESETS["preset-disabled"], id: cleanId };
  }
  if (cleanId === "preset-charity" || cleanId === "preset-charity-bhoiguda") {
    return { ...NGO_PRESETS["preset-charity"], id: cleanId };
  }
  if (cleanId === "preset-disabled-secunderabad") {
    return { ...NGO_PRESETS["preset-disabled-secunderabad"], id: cleanId };
  }
  if (cleanId === "preset-sneha-trust") {
    return { ...NGO_PRESETS["preset-sneha-trust"], id: cleanId };
  }

  return NGO_PRESETS[cleanId] || null;
}
