const { PrismaClient } = require("./prisma/generated/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Starting DB migration: Shapur Nagar -> Subhash Nagar");

  // Find Subhash Nagar branch
  let subhashBranch = await prisma.branch.findFirst({
    where: { name: { contains: "Subhash Nagar", mode: "insensitive" } },
  });

  // Find Shapur Nagar branch
  const shapurBranch = await prisma.branch.findFirst({
    where: { name: { contains: "Shapur", mode: "insensitive" } },
  });

  if (!subhashBranch && shapurBranch) {
    // If no Subhash branch exists, rename Shapur branch
    subhashBranch = await prisma.branch.update({
      where: { id: shapurBranch.id },
      data: {
        name: "Subhash Nagar",
        address: "Subhash Nagar, Jeedimetla, Hyderabad, Telangana",
      },
    });
    console.log("Renamed Shapur branch to Subhash Nagar.");
  } else if (subhashBranch && shapurBranch) {
    // If both exist, reassign all relations from Shapur branch to Subhash branch
    console.log(`Reassigning relations from Shapur branch (${shapurBranch.id}) to Subhash branch (${subhashBranch.id})...`);
    
    await prisma.event.updateMany({
      where: { branchId: shapurBranch.id },
      data: { branchId: subhashBranch.id },
    });

    await prisma.eventReport.updateMany({
      where: { branchId: shapurBranch.id },
      data: { branchId: subhashBranch.id },
    });

    // Delete Shapur branch
    await prisma.branch.delete({
      where: { id: shapurBranch.id },
    });
    console.log("Merged Shapur branch into Subhash Nagar branch.");
  }

  // Update text occurrences in Events
  const events = await prisma.event.findMany({
    where: {
      OR: [
        { location: { contains: "Shapur", mode: "insensitive" } },
        { title: { contains: "Shapur", mode: "insensitive" } },
        { description: { contains: "Shapur", mode: "insensitive" } },
      ],
    },
  });

  for (const event of events) {
    const updatedLocation = (event.location || "").replace(/Shapur Nagar/gi, "Subhash Nagar").replace(/Shapur/gi, "Subhash Nagar");
    const updatedTitle = (event.title || "").replace(/Shapur Nagar/gi, "Subhash Nagar").replace(/Shapur/gi, "Subhash Nagar");
    const updatedDesc = (event.description || "").replace(/Shapur Nagar/gi, "Subhash Nagar").replace(/Shapur/gi, "Subhash Nagar");

    await prisma.event.update({
      where: { id: event.id },
      data: {
        location: updatedLocation,
        title: updatedTitle,
        description: updatedDesc,
      },
    });
  }
  console.log(`Updated ${events.length} Event records.`);

  // Update text occurrences in EventReports
  const reports = await prisma.eventReport.findMany({
    where: {
      OR: [
        { title: { contains: "Shapur", mode: "insensitive" } },
        { description: { contains: "Shapur", mode: "insensitive" } },
      ],
    },
  });

  for (const report of reports) {
    const updatedTitle = (report.title || "").replace(/Shapur Nagar/gi, "Subhash Nagar").replace(/Shapur/gi, "Subhash Nagar");
    const updatedDesc = (report.description || "").replace(/Shapur Nagar/gi, "Subhash Nagar").replace(/Shapur/gi, "Subhash Nagar");

    await prisma.eventReport.update({
      where: { id: report.id },
      data: {
        title: updatedTitle,
        description: updatedDesc,
      },
    });
  }
  console.log(`Updated ${reports.length} EventReport records.`);

  console.log("DB Migration Complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
