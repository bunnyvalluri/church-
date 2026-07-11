import { prisma } from "@/lib/prisma";
import NgoDonationForm from "@/components/NgoDonationForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Donate to NGO | Kingdom of Christ Ministries",
  description:
    "Support KCM's social service ministry — hospital camps, orphan care, and care for the disabled — via secure Dynamic UPI payment.",
};

// Helper: sort branches in canonical order
function getBranchSortIndex(name: string) {
  const n = name.toLowerCase();
  if (n.includes("shapur")) return 0;
  if (n.includes("subhash")) return 1;
  if (n.includes("bahadur")) return 2;
  return 3;
}

export default async function NgoDonationsPage() {
  // Parallel DB fetch: purposes, branches, and active NGO campaigns
  const [purposesData, branchesData, campaignsData] = await Promise.all([
    prisma.donationPurpose.findMany({
      where: { isActive: true, isArchived: false },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.branch.findMany(),
    prisma.ngoProject.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        title: true,
        description: true,
        targetAmount: true,
        raisedAmount: true,
        status: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Serialize purposes for client hydration
  const purposes = purposesData.map((p) => ({
    id: p.id,
    code: p.code,
    nameEn: p.nameEn,
    nameTe: p.nameTe,
    nameHi: p.nameHi,
    descEn: p.descEn,
    descTe: p.descTe,
    descHi: p.descHi,
  }));

  // Sort and serialize branches
  const branches = branchesData
    .sort((a, b) => getBranchSortIndex(a.name) - getBranchSortIndex(b.name))
    .map((b) => ({ id: b.id, name: b.name }));

  // Serialize campaigns
  const campaigns = campaignsData.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    targetAmount: c.targetAmount,
    raisedAmount: c.raisedAmount,
    status: c.status,
  }));

  return (
    <NgoDonationForm
      initialPurposes={purposes}
      initialBranches={branches}
      initialCampaigns={campaigns}
    />
  );
}
