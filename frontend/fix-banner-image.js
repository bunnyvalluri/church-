const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("./prisma/generated/client");
const prisma = new PrismaClient();

async function main() {
  const artifactDir = "C:\\Users\\vallu\\.gemini\\antigravity-ide\\brain\\4d3798dd-3c31-463a-9811-1acf32934d13";
  const sourceBanner = path.join(artifactDir, "media__1785823806639.png");
  const destDir = path.join(__dirname, "public", "events");

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const destPath = path.join(destDir, "family-blessing-subhash-banner.png");
  const publicUrl = "/events/family-blessing-subhash-banner.png";

  if (fs.existsSync(sourceBanner)) {
    fs.copyFileSync(sourceBanner, destPath);
    console.log(`Successfully replaced banner with high-res graphic from ${sourceBanner}`);
  } else {
    console.error("Source high-res banner not found!");
    process.exit(1);
  }

  // Update DB Event records
  const events = await prisma.event.findMany({
    where: {
      OR: [
        { title: { contains: "Family Blessing", mode: "insensitive" } },
        { location: { contains: "Subhash", mode: "insensitive" } },
      ],
    },
  });

  for (const event of events) {
    await prisma.event.update({
      where: { id: event.id },
      data: {
        image: publicUrl,
        eventBanner: publicUrl,
        location: "Subhash Nagar",
      },
    });
    console.log(`Updated Event ID ${event.id} banner to high-res graphic!`);
  }

  console.log("Banner replacement complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
