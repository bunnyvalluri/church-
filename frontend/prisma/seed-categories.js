/**
 * frontend/prisma/seed-categories.js
 * Seeding script to initialize dynamic event categories and initial events.
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Service", slug: "service", description: "Regular worship services", color: "#6366f1" },
  { name: "Conference", slug: "conference", description: "Special church conferences", color: "#ec4899" },
  { name: "Youth", slug: "youth", description: "Youth fellowship gatherings", color: "#f97316" },
  { name: "Prayer", slug: "prayer", description: "Prayer meetings and vigils", color: "#3b82f6" },
  { name: "Women's Fellowship", slug: "womens-fellowship", description: "Women's ministry activities", color: "#f43f5e" },
  { name: "Men's Fellowship", slug: "mens-fellowship", description: "Men's ministry activities", color: "#0ea5e9" },
  { name: "Children", slug: "children", description: "Sunday school and kids events", color: "#eab308" },
  { name: "Bible Study", slug: "bible-study", description: "Mid-week Bible study classes", color: "#10b981" },
  { name: "Outreach", slug: "outreach", description: "Community outreach and evangelism", color: "#a855f7" },
  { name: "NGO", slug: "ngo", description: "NGO and charity work activities", color: "#14b8a6" },
  { name: "Camp", slug: "camp", description: "Spiritual retreats and camps", color: "#84cc16" },
  { name: "Special Meeting", slug: "special-meeting", description: "Guest speaker meetings and events", color: "#f97316" }
];

async function main() {
  console.log("🌱 Starting categories seed...");

  // Seed Categories
  for (const cat of CATEGORIES) {
    await prisma.eventCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, color: cat.color },
      create: { name: cat.name, slug: cat.slug, description: cat.description, color: cat.color }
    });
    console.log(`- Upserted category: ${cat.name}`);
  }

  // Find or create a branch
  let branch = await prisma.branch.findFirst();
  if (!branch) {
    branch = await prisma.branch.create({
      data: { name: "Hyderabad General Branch" }
    });
  }

  // Create an initial dynamic event
  const eventName = "KCM Sunday Service & Fellowship";
  const eventSlug = "kcm-sunday-service-fellowship";
  
  await prisma.event.upsert({
    where: { slug: eventSlug },
    update: {},
    create: {
      title: eventName,
      slug: eventSlug,
      shortDescription: "Join us for our weekly worship, teaching, and community fellowship.",
      description: "Welcome to our main Sunday Worship Service! We gather as a family to praise God, study His Word, and fellowship together. This week Pastor Joseph will be sharing a message on faith and patience.",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next Sunday
      time: "09:00 AM",
      location: "KCM Auditorium, Jeedimetla, Hyderabad",
      googleMapsUrl: "https://maps.google.com",
      category: "service",
      organizer: "KCM Media Team",
      speaker: "Pastor Joseph",
      pastor: "Pastor Joseph",
      contactPerson: "Brother John",
      contactPhone: "+91 98765 43210",
      contactEmail: "info@kcm.org",
      registrationRequired: true,
      registrationLimit: 200,
      remainingSeats: 200,
      image: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1000&q=80",
      tags: ["worship", "fellowship", "sunday"],
      featured: true,
      priority: "HIGH",
      status: "PUBLISHED",
      visibility: "PUBLIC",
      isPublished: true,
      branchId: branch.id,
    }
  });
  console.log(`- Upserted initial event: ${eventName}`);

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
