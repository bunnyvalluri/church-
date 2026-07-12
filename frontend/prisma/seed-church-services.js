/**
 * seed-church-services.js
 * Seeds the 6 hardcoded worship services from Services.tsx into the church_services PostgreSQL table.
 * Run: node prisma/seed-church-services.js
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const services = [
  {
    slug: "worship-watch-tower",
    title: "Worship (Watch Tower)",
    shortDescription: "Early morning Watch Tower worship service.",
    description:
      "Join our early morning Watch Tower service to seek God through prayer and His Word. This is the first worship service of the day every Sunday.",
    serviceType: "WORSHIP",
    icon: "Users2",
    iconColor: "#ffffff",
    cardColor: "from-blue-500 to-cyan-500",
    badgeColor: "from-blue-500 to-cyan-500",
    serviceDay: "Sunday",
    frequency: "WEEKLY",
    startTime: "05:45",
    endTime: "07:00",
    timezone: "Asia/Kolkata",
    displayOrder: 1,
    status: "PUBLISHED",
    featured: false,
    tags: ["worship", "morning", "watch-tower"],
    language: "en",
  },
  {
    slug: "worship-sunday-service",
    title: "Worship (Sunday Service)",
    shortDescription: "Main Sunday worship and the Word of God.",
    description:
      "Join us for powerful worship and the word of God every Sunday morning. This is our main Sunday service with praise, worship, and a message from the Word.",
    serviceType: "WORSHIP",
    icon: "Music",
    iconColor: "#ffffff",
    cardColor: "from-violet-500 to-purple-600",
    badgeColor: "from-violet-500 to-purple-600",
    serviceDay: "Sunday",
    frequency: "WEEKLY",
    startTime: "08:30",
    endTime: "10:30",
    timezone: "Asia/Kolkata",
    displayOrder: 2,
    status: "PUBLISHED",
    featured: true,
    tags: ["worship", "sunday", "main-service"],
    language: "en",
  },
  {
    slug: "worship-youth-service",
    title: "Worship (Youth Service)",
    shortDescription: "Monthly youth worship with empowering Bible message.",
    description:
      "A dedicated monthly service for youth and young adults, featuring dynamic worship and an empowering Bible message by Bishop Kurra Kristhu Raju.",
    serviceType: "YOUTH",
    icon: "BookHeart",
    iconColor: "#ffffff",
    cardColor: "from-green-500 to-emerald-500",
    badgeColor: "from-green-500 to-emerald-500",
    serviceDay: "Sunday",
    frequency: "MONTHLY",
    occurrence: "Every 4th Sunday",
    startTime: "18:30",
    endTime: "20:30",
    timezone: "Asia/Kolkata",
    displayOrder: 3,
    status: "PUBLISHED",
    featured: false,
    tags: ["youth", "monthly", "young-adults"],
    language: "en",
  },
  {
    slug: "worship-prayer-meeting",
    title: "Worship (Prayer)",
    shortDescription: "Mid-week evening prayer meeting.",
    description:
      "Our mid-week prayer meeting every Wednesday evening. Come together to intercede, worship, and grow in prayer.",
    serviceType: "PRAYER",
    icon: "Mic2",
    iconColor: "#ffffff",
    cardColor: "from-yellow-500 to-orange-500",
    badgeColor: "from-yellow-500 to-orange-500",
    serviceDay: "Wednesday",
    frequency: "WEEKLY",
    startTime: "18:30",
    endTime: "20:00",
    timezone: "Asia/Kolkata",
    displayOrder: 4,
    status: "PUBLISHED",
    featured: false,
    tags: ["prayer", "midweek", "wednesday"],
    language: "en",
  },
  {
    slug: "oil-anointing-prayer-service",
    title: "Oil Anointing Prayer Service",
    shortDescription: "Experience God's healing power every Thursday.",
    description:
      "Experience God's healing power every Thursday through anointing with oil and special intercessory prayer. Come and receive your healing.",
    serviceType: "PRAYER",
    icon: "Heart",
    iconColor: "#ffffff",
    cardColor: "from-pink-500 to-rose-500",
    badgeColor: "from-pink-500 to-rose-500",
    serviceDay: "Thursday",
    frequency: "WEEKLY",
    startTime: "18:30",
    endTime: "20:30",
    timezone: "Asia/Kolkata",
    displayOrder: 5,
    status: "PUBLISHED",
    featured: false,
    tags: ["healing", "anointing", "thursday", "prayer"],
    language: "en",
  },
  {
    slug: "fasting-prayer",
    title: "Fasting Prayer",
    shortDescription: "Spiritual strengthening through fasting prayer.",
    description:
      "Spiritual strengthening through fasting prayer every Thursday morning. Two sessions available. Contact: 91215 23544 for more information.",
    serviceType: "PRAYER",
    icon: "Calendar",
    iconColor: "#ffffff",
    cardColor: "from-purple-600 to-violet-500",
    badgeColor: "from-purple-600 to-violet-500",
    serviceDay: "Thursday",
    frequency: "WEEKLY",
    startTime: "07:00",
    endTime: "10:00",
    timezone: "Asia/Kolkata",
    displayOrder: 6,
    status: "PUBLISHED",
    featured: false,
    tags: ["fasting", "thursday", "morning", "prayer"],
    language: "en",
  },
];

async function main() {
  console.log("🌱 Seeding church services...");

  for (const service of services) {
    try {
      const existing = await prisma.churchService.findUnique({
        where: { slug: service.slug },
      });

      if (existing) {
        await prisma.churchService.update({
          where: { slug: service.slug },
          data: service,
        });
        console.log(`  ✅ Updated: ${service.title}`);
      } else {
        await prisma.churchService.create({ data: service });
        console.log(`  ✅ Created: ${service.title}`);
      }
    } catch (err) {
      console.error(`  ❌ Failed: ${service.title}`, err.message);
    }
  }

  console.log(`\n✅ Done — seeded ${services.length} church services.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
