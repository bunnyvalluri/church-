const { PrismaClient } = require("./prisma/generated/client");
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient();

async function main() {
  console.log("Updating event banner image in DB...");

  // Source path from artifact media
  const sourceImage = "C:\\Users\\vallu\\.gemini\\antigravity-ide\\brain\\4d3798dd-3c31-463a-9811-1acf32934d13\\media__1785827011227.png";
  
  // Destination in public folder
  const destDir = path.join(__dirname, "public", "events");
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const fileName = "family-blessing-subhash-banner.png";
  const destPath = path.join(destDir, fileName);
  const publicUrl = `/events/${fileName}`;

  if (fs.existsSync(sourceImage)) {
    fs.copyFileSync(sourceImage, destPath);
    console.log(`Copied banner image to ${destPath}`);
  } else {
    console.warn(`Source image ${sourceImage} not found, will check alternative...`);
  }

  // Update DB Event record for Family Blessing Gathering
  const events = await prisma.event.findMany({
    where: {
      OR: [
        { title: { contains: "Family Blessing", mode: "insensitive" } },
        { location: { contains: "Subhash", mode: "insensitive" } },
      ],
    },
  });

  console.log(`Found ${events.length} matching events to update.`);

  for (const event of events) {
    const updated = await prisma.event.update({
      where: { id: event.id },
      data: {
        image: publicUrl,
        eventBanner: publicUrl,
        location: "Subhash Nagar",
      },
    });
    console.log(`Updated Event ID ${updated.id} title: "${updated.title}" image -> ${publicUrl}`);
  }

  // Also update EventMedia if attached
  for (const event of events) {
    const existingMedia = await prisma.eventMedia.findFirst({
      where: { eventId: event.id },
    });
    if (existingMedia) {
      await prisma.eventMedia.update({
        where: { id: existingMedia.id },
        data: { imageUrl: publicUrl },
      });
    } else {
      await prisma.eventMedia.create({
        data: {
          eventId: event.id,
          imageUrl: publicUrl,
          caption: event.title,
        },
      });
    }
  }

  console.log("Banner update complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
