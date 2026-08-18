const { PrismaClient } = require("./prisma/generated/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Creating new event & report for Subhash Nagar...");

  // 1. Ensure Subhash Nagar branch exists
  let branch = await prisma.branch.findFirst({
    where: { name: { contains: "Subhash Nagar", mode: "insensitive" } },
  });

  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        name: "Subhash Nagar",
        address: "Subhash Nagar, Jeedimetla, Hyderabad, Telangana",
      },
    });
    console.log("Created Subhash Nagar branch:", branch.id);
  } else {
    console.log("Found Subhash Nagar branch:", branch.id);
  }

  // 2. Find pastor / admin user to attach as creator
  const creator = await prisma.user.findFirst({
    where: {
      OR: [
        { email: "pastor.kristhuraju@kcm-church.com" },
        { email: "kingofchristministries23@gmail.com" },
        { role: "PASTOR" },
        { role: "ADMIN" },
      ],
    },
  });

  const createdById = creator ? creator.id : "system_admin";
  const bannerUrl = "/events/family-blessing-subhash-banner.png";

  const eventTitle = "Family Blessing Gathering";
  const reportDate = new Date("2026-08-15T00:00:00.000Z");
  const reportNotes = "The Family Blessing Gathering was conducted successfully at the Subhash Nagar Branch on July 15, 2026. The session opened with prayer and worship, followed by a message focused on strengthening family relationships and spiritual growth. Multiple families attended the event, participated in group prayers, and shared testimonies. The gathering concluded with a closing prayer and fellowship";
  const volunteers = ["Bishop Kurra Kristhu Raju"];

  // 3. Create or find EventReport
  let report = await prisma.eventReport.findFirst({
    where: { title: eventTitle, branchId: branch.id },
    include: { branch: true, media: true },
  });

  if (!report) {
    report = await prisma.eventReport.create({
      data: {
        branchId: branch.id,
        title: eventTitle,
        description: reportNotes,
        reportDate: reportDate,
        attendanceCount: 0,
        offeringAmount: 0,
        status: "APPROVED",
        createdById: createdById,
        volunteerNames: volunteers,
        media: {
          create: [
            {
              type: "IMAGE",
              url: bannerUrl,
              uploadedById: createdById,
            },
          ],
        },
      },
      include: {
        branch: true,
        media: true,
      },
    });
    console.log(`Created EventReport: ${report.id}`);
  } else {
    report = await prisma.eventReport.update({
      where: { id: report.id },
      data: {
        description: reportNotes,
        reportDate: reportDate,
        volunteerNames: volunteers,
      },
      include: { branch: true, media: true },
    });
    console.log(`Updated existing EventReport: ${report.id}`);
  }

  // 4. Create or update public Landing Page Event
  let publicEvent = await prisma.event.findFirst({
    where: {
      OR: [
        { slug: `report-${report.id}` },
        { title: eventTitle, branchId: branch.id }
      ]
    }
  });

  if (!publicEvent) {
    publicEvent = await prisma.event.create({
      data: {
        title: eventTitle,
        slug: `report-${report.id}`,
        description: reportNotes,
        date: reportDate,
        time: "10:00 AM",
        location: "Subhash Nagar",
        category: "SPECIAL",
        status: "PUBLISHED",
        isPublished: true,
        branchId: branch.id,
        createdById: createdById,
        image: bannerUrl,
        eventBanner: bannerUrl,
        eventImages: {
          create: [
            {
              url: bannerUrl,
              caption: eventTitle,
            },
          ],
        },
      },
    });
    console.log(`Created Public Event on Landing Page: ${publicEvent.id}`);
  } else {
    publicEvent = await prisma.event.update({
      where: { id: publicEvent.id },
      data: {
        title: eventTitle,
        description: reportNotes,
        date: reportDate,
        time: "10:00 AM",
        location: "Subhash Nagar",
        category: "SPECIAL",
        status: "PUBLISHED",
        isPublished: true,
        image: bannerUrl,
        eventBanner: bannerUrl,
      },
    });
    console.log(`Updated Public Event on Landing Page: ${publicEvent.id}`);
  }

  console.log("Successfully created/updated event and report!");
}

main()
  .catch((e) => {
    console.error("Error creating event:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
