import { prisma } from "@/lib/prisma";
import GiveForm from "@/components/GiveForm";

export const dynamic = "force-dynamic";

export default async function MemberGivePage() {
  // Fetch purposes and branches in parallel directly from DB on the server
  const [purposesData, branchesData] = await Promise.all([
    prisma.donationPurpose.findMany({
      where: { isActive: true, isArchived: false },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.branch.findMany()
  ]);

  // Apply sorting for branches on server to match the API route sorting
  const getIndex = (name: string) => {
    const norm = name.toLowerCase();
    if (norm.includes("shapur")) return 0;
    if (norm.includes("subhash")) return 1;
    if (norm.includes("bahadur")) return 2;
    return 3;
  };
  const sortedBranches = branchesData.sort((a, b) => getIndex(a.name) - getIndex(b.name));

  // Serialize objects for client hydration
  const purposes = purposesData.map(p => ({
    id: p.id,
    code: p.code,
    nameEn: p.nameEn,
    nameTe: p.nameTe,
    nameHi: p.nameHi,
    descEn: p.descEn,
    descTe: p.descTe,
    descHi: p.descHi,
  }));

  const branches = sortedBranches.map(b => ({
    id: b.id,
    name: b.name,
  }));

  return <GiveForm initialPurposes={purposes} initialBranches={branches} />;
}

