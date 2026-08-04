const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("./prisma/generated/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Applying exact Family Blessing Gathering graphic banner...");

  const artifactDir = "C:\\Users\\vallu\\.gemini\\antigravity-ide\\brain\\4d3798dd-3c31-463a-9811-1acf32934d13";
  const exactGraphicPath = path.join(artifactDir, "media__1785834505578.jpg");

  if (!fs.existsSync(exactGraphicPath)) {
    console.error("Exact graphic image media__1785834505578.jpg not found!");
    process.exit(1);
  }

  const destDir = path.join(__dirname, "public", "events");
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const destPng = path.join(destDir, "family-blessing-subhash-banner.png");
  const destJpg = path.join(destDir, "family-blessing-subhash-banner.jpg");

  // Copy exact graphic poster to both PNG & JPG paths in public/events
  fs.copyFileSync(exactGraphicPath, destPng);
  fs.copyFileSync(exactGraphicPath, destJpg);
  console.log(`Successfully copied graphic poster (${fs.statSync(exactGraphicPath).size} bytes) to ${destPng} & ${destJpg}`);

  const publicUrl = "/events/family-blessing-subhash-banner.png";

  // Update Database Event records
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
    console.log(`Updated Event ID ${event.id} banner to exact Family Blessing Gathering poster!`);

    // Update attached EventMedia
    const existingMedia = await prisma.eventMedia.findMany({
      where: { eventId: event.id },
    });
    for (const m of existingMedia) {
      await prisma.eventMedia.update({
        where: { id: m.id },
        data: { imageUrl: publicUrl },
      });
    }
  }

  // Update EventReport media
  const reports = await prisma.eventReport.findMany({
    where: {
      OR: [
        { title: { contains: "Family Blessing", mode: "insensitive" } },
      ],
    },
    include: { media: true },
  });

  for (const r of reports) {
    for (const m of r.media) {
      await prisma.mediaReport.update({
        where: { id: m.id },
        data: { url: publicUrl },
      });
    }
  }

  console.log("All DB records updated to exact Family Blessing poster!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
