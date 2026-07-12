/**
 * seed-services.js
 * Seeds the church_services table with core KCM services.
 * Run: node prisma/seed-services.js
 */
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const services = [
  {
    slug: "sunday-worship-service",
    title: "Sunday Worship Service",
    shortDescription: "Come and experience the presence of God in our vibrant Sunday service.",
    description: "Join us every Sunday for a powerful time of praise, worship, and the Word of God. Our services are conducted in Telugu, Hindi, and English.",
    serviceType: "WORSHIP",
    icon: "Heart",
    iconColor: "#ffffff",
    cardColor: "from-violet-500 to-purple-600",
    badgeColor: "from-violet-500 to-purple-600",
    serviceDay: "Sunday",
    frequency: "WEEKLY",
    occurrence: "Every Sunday",
    startTime: "09:00",
    endTime: "11:30",
    location: "KCM Main Auditorium",
    featured: true,
    displayOrder: 1,
    status: "PUBLISHED",
    tags: ["worship", "sunday", "prayer", "fellowship"],
    language: "en",
  },
  {
    slug: "prayer-meeting",
    title: "Prayer Meeting",
    shortDescription: "Midweek prayer gatherings to seek God's face together.",
    description: "Every Wednesday evening, we gather for intercessory prayer, worship, and spiritual renewal. This is the heartbeat of our church.",
    serviceType: "PRAYER",
    icon: "Flame",
    iconColor: "#ffffff",
    cardColor: "from-orange-500 to-red-500",
    badgeColor: "from-orange-500 to-red-500",
    serviceDay: "Wednesday",
    frequency: "WEEKLY",
    occurrence: "Every Wednesday",
    startTime: "18:00",
    endTime: "19:30",
    location: "KCM Prayer Hall",
    featured: false,
    displayOrder: 2,
    status: "PUBLISHED",
    tags: ["prayer", "intercession", "midweek"],
    language: "en",
  },
  {
    slug: "bible-study",
    title: "Bible Study",
    shortDescription: "Deep dive into God's Word every Friday evening.",
    description: "Our Friday Bible Study sessions are designed to help believers grow in the knowledge of Scripture through verse-by-verse teaching and group discussion.",
    serviceType: "BIBLE_STUDY",
    icon: "BookHeart",
    iconColor: "#ffffff",
    cardColor: "from-blue-500 to-cyan-500",
    badgeColor: "from-blue-500 to-cyan-500",
    serviceDay: "Friday",
    frequency: "WEEKLY",
    occurrence: "Every Friday",
    startTime: "18:30",
    endTime: "20:00",
    location: "KCM Education Wing",
    featured: false,
    displayOrder: 3,
    status: "PUBLISHED",
    tags: ["bible", "study", "teaching"],
    language: "en",
  },
  {
    slug: "youth-ministry",
    title: "Youth Ministry",
    shortDescription: "Empowering the next generation to live boldly for Christ.",
    description: "KCM Youth is a dynamic ministry for ages 13-25. We meet every Saturday for worship, the Word, games, and community. Come as you are!",
    serviceType: "YOUTH",
    icon: "Sparkles",
    iconColor: "#ffffff",
    cardColor: "from-pink-500 to-rose-500",
    badgeColor: "from-pink-500 to-rose-500",
    serviceDay: "Saturday",
    frequency: "WEEKLY",
    occurrence: "Every Saturday",
    startTime: "16:00",
    endTime: "18:00",
    location: "KCM Youth Centre",
    featured: true,
    displayOrder: 4,
    status: "PUBLISHED",
    tags: ["youth", "teens", "young adults"],
    language: "en",
  },
  {
    slug: "womens-fellowship",
    title: "Women's Fellowship",
    shortDescription: "Building sisterhood and spiritual strength together.",
    description: "The KCM Women's Fellowship gathers on the 1st Sunday of every month for worship, testimony, and ministry to one another. Every woman is welcome.",
    serviceType: "FELLOWSHIP",
    icon: "Users2",
    iconColor: "#ffffff",
    cardColor: "from-purple-600 to-violet-500",
    badgeColor: "from-purple-600 to-violet-500",
    serviceDay: "Sunday",
    frequency: "MONTHLY",
    occurrence: "1st Sunday of the month",
    startTime: "14:00",
    endTime: "16:00",
    location: "KCM Fellowship Hall",
    featured: false,
    displayOrder: 5,
    status: "PUBLISHED",
    tags: ["women", "fellowship", "sisterhood"],
    language: "en",
  },
  {
    slug: "mens-fellowship",
    title: "Men's Fellowship",
    shortDescription: "Iron sharpens iron — men growing together in faith.",
    description: "KCM Men's Fellowship meets on the 3rd Sunday of every month. We cover topics on leadership, family, character, and purpose from a Biblical perspective.",
    serviceType: "FELLOWSHIP",
    icon: "Shield",
    iconColor: "#ffffff",
    cardColor: "from-green-500 to-emerald-500",
    badgeColor: "from-green-500 to-emerald-500",
    serviceDay: "Sunday",
    frequency: "MONTHLY",
    occurrence: "3rd Sunday of the month",
    startTime: "14:00",
    endTime: "16:00",
    location: "KCM Fellowship Hall",
    featured: false,
    displayOrder: 6,
    status: "PUBLISHED",
    tags: ["men", "leadership", "fellowship"],
    language: "en",
  },
];

async function main() {
  console.log("Seeding church services...");
  for (const service of services) {
    const existing = await prisma.churchService.findUnique({ where: { slug: service.slug } });
    if (existing) {
      console.log("  Skipped (already exists): " + service.title);
      continue;
    }
    await prisma.churchService.create({ data: service });
    console.log("  Created: " + service.title);
  }
  console.log("\nDone seeding church services!");
}

main()
  .catch((e) => { console.error("Error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
