/**
 * prisma/seed-cms.js
 * Seed database script to populate default CMS records for:
 * - HomepageHero
 * - SiteStatistic
 * - SiteContact
 * - FooterConfig
 * - NavigationItem
 * - AboutConfig
 */
const { PrismaClient } = require("./generated/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Homepage CMS records...");

  // 1. Seed HomepageHero
  await prisma.homepageHero.upsert({
    where: { id: "hero" },
    update: {},
    create: {
      id: "hero",
      headline: "Welcome to",
      subheadline: "Kingdom of Christ",
      subtitle: "A place of Love, Faith, and Miracles",
      badgeText: "We are here for you 24/7",
      ctaPrimaryText: "Join Worship",
      ctaPrimaryHref: "#services",
      ctaSecondaryText: "Watch Sermons",
      ctaSecondaryHref: "#sermons",
      ctaTertiaryText: "Prayer Request",
      ctaTertiaryHref: "/prayer",
      backgroundType: "gradient",
      isActive: true,
    },
  });
  console.log("✅ Seeded HomepageHero");

  // 2. Seed SiteStatistic
  const stats = [
    {
      key: "members",
      label: "Members",
      labelTe: "సభ్యులు",
      labelHi: "सदस्य",
      value: "1000+",
      icon: "Users",
      colorScheme: "violet",
      displayOrder: 0,
    },
    {
      key: "volunteers",
      label: "Volunteers",
      labelTe: "స్వచ్ఛంద సేవకులు",
      labelHi: "स्वयंसेवक",
      value: "150+",
      icon: "HeartHandshake",
      colorScheme: "emerald",
      displayOrder: 1,
    },
    {
      key: "years",
      label: "Years of Ministry",
      labelTe: "సంవత్సరాల పరిచర్య",
      labelHi: "मंत्रालय के वर्ष",
      value: "25+",
      icon: "Award",
      colorScheme: "amber",
      displayOrder: 2,
    },
    {
      key: "programs",
      label: "Community Programs",
      labelTe: "సామాజిక కార్యక్రమాలు",
      labelHi: "सामुदायिक कार्यक्रम",
      value: "100+",
      icon: "BookOpen",
      colorScheme: "rose",
      displayOrder: 3,
    },
  ];

  for (const s of stats) {
    await prisma.siteStatistic.upsert({
      where: { key: s.key },
      update: s,
      create: s,
    });
  }
  console.log(`✅ Seeded ${stats.length} SiteStatistics`);

  // 3. Seed SiteContact
  const contacts = [
    {
      branchKey: "shapur",
      branchName: "Shapur Nagar",
      branchNameTe: "షాపూర్ నగర్",
      branchNameHi: "शापुर नगर",
      address: "Kingdom of Christ Ministries,\n15-201, Vivekananda Nagar, Srinivas Nagar,\nJeedimetla, Hyderabad,\nTelangana 500055",
      addressTe: "కింగ్డమ్ ఆఫ్ క్రైస్ట్ మినిస్ట్రీస్,\n15-201, వివేకానంద నగర్, శ్రీనివాస్ నగర్,\nజీడిమెట్ల, హైదరాబాద్,\nతెలంగాణ 500055",
      addressHi: "किंगडम ऑफ क्राइस्ट मिनिस्ट्रीज,\n15-201, विवेकानंद नगर, श्रीनिवास नगर,\nजीडीमेटला, हैदराबाद,\nतेलंगाना 500055",
      phones: [
        { label: "Senior Pastor", number: "+91 97040 90069" },
        { label: "Office", number: "+91 96409 43777" },
        { label: "Office", number: "+91 73964 33856" },
      ],
      email: "kingofchristministries23@gmail.com",
      mapsUrl: "https://maps.google.com/?q=Kingdom+of+Christ+Ministries,+15-201,+Vivekananda+Nagar,+Srinivas+Nagar,+Jeedimetla,+Hyderabad,+Telangana+500055",
      embedUrl: "https://maps.google.com/maps?q=15-201,+Vivekananda+Nagar,+Srinivas+Nagar,+Jeedimetla,+Hyderabad,+Telangana+500055&hl=en&z=15&output=embed",
      isStreetView: false,
      serviceHours: "Friday & Sunday: 6:00 PM",
      displayOrder: 0,
    },
    {
      branchKey: "subhash",
      branchName: "Subhash Nagar",
      branchNameTe: "సుభాష్ నగర్",
      branchNameHi: "सुभाष नगर",
      address: "Subhash Nagar,\nJeedimetla, Hyderabad,\nTelangana 500055",
      addressTe: "సుభాష్ నగర్,\nజీడిమెట్ల, హైదరాబాద్,\nతెలంగాణ 500055",
      addressHi: "सुभाष नगर,\nजीडीमेटला, हैदराबाद,\nतेलंगाना 500055",
      phones: [
        { label: "Office", number: "+91 96409 43777" },
      ],
      email: null,
      mapsUrl: "https://maps.google.com/?q=Subhash+nagar+jeedimetla+119lp",
      embedUrl: "https://maps.google.com/maps?q=Subhash+Nagar,+Jeedimetla,+Hyderabad,+Telangana+500055&hl=en&z=15&output=embed",
      isStreetView: true,
      serviceHours: "Sunday: 5:45 AM – 8:30 AM",
      displayOrder: 1,
    },
    {
      branchKey: "bahadur",
      branchName: "Bahadurpally",
      branchNameTe: "బహదూర్‌పల్లి",
      branchNameHi: "बहादुरपल्ली",
      address: "Bahadurpally,\nQuthbullapur, Hyderabad,\nTelangana 500043",
      addressTe: "బహదూర్‌పల్లి,\nకుత్బుల్లాపూర్, హైదరాబాద్,\nతెలంగాణ 500043",
      addressHi: "బహదూర్‌పల్లి,\nకుత్బుల్లాపూర్, హైదరాబాద్,\nతెలంగాణ 500043",
      phones: [
        { label: "Office", number: "+91 73964 33856" },
      ],
      email: null,
      mapsUrl: "https://maps.google.com/?q=17.567689,78.443963",
      embedUrl: "https://maps.google.com/maps?q=Bahadurpally,+Quthbullapur,+Hyderabad,+Telangana+500043&hl=en&z=15&output=embed",
      isStreetView: true,
      serviceHours: "Sunday: 11:00 AM – 2:00 PM",
      displayOrder: 2,
    },
  ];

  for (const c of contacts) {
    await prisma.siteContact.upsert({
      where: { branchKey: c.branchKey },
      update: c,
      create: c,
    });
  }
  console.log(`✅ Seeded ${contacts.length} SiteContacts`);

  // 4. Seed FooterConfig
  await prisma.footerConfig.upsert({
    where: { id: "footer" },
    update: {},
    create: {
      id: "footer",
      tagline: '"Time is fulfilled, and the Kingdom of God is at hand; repent and believe in the Gospel." — Mark 1:15',
      taglineTe: 'కాలము సంభవమైయున్నది, దేవునిరాజ్యము సమీపించియున్నది, మారుమనస్సు పొంది సువార్త నమ్ముడి. — మార్కు 1:15',
      address: "Kingdom of Christ Ministries, 15-201, Vivekananda Nagar, Srinivas Nagar, Jeedimetla, Hyderabad – 500055",
      mapsUrl: "https://maps.google.com/?q=Kingdom+of+Christ+Ministries,+15-201,+Vivekananda+Nagar,+Srinivas+Nagar,+Jeedimetla,+Hyderabad,+Telangana+500055",
      phones: [
        { label: "Senior Pastor", number: "+91 97040 90069" },
        { label: "Office", number: "+91 96409 43777" },
        { label: "Office", number: "+91 73964 33856" },
      ],
      email: "kingofchristministries23@gmail.com",
      instagramUrl: "https://instagram.com",
      youtubeUrl: "https://youtube.com/@kcmchurchshapur7107?si=NbnoJjdl5lqt7fkO",
    },
  });
  console.log("✅ Seeded FooterConfig");

  // 5. Seed NavigationItem
  const navItems = [
    // FOOTER_ABOUT
    { label: "Our Story", href: "/about/story", placement: "FOOTER_ABOUT", displayOrder: 0 },
    { label: "Leadership", href: "/about/leadership", placement: "FOOTER_ABOUT", displayOrder: 1 },
    { label: "Our Beliefs", href: "/about/beliefs", placement: "FOOTER_ABOUT", displayOrder: 2 },
    { label: "Ministries", href: "/about/ministries", placement: "FOOTER_ABOUT", displayOrder: 3 },
    { label: "Mission", href: "/about/mission", placement: "FOOTER_ABOUT", displayOrder: 4 },
    // FOOTER_RESOURCES
    { label: "Sermons", href: "/sermons", placement: "FOOTER_RESOURCES", displayOrder: 0 },
    { label: "Events", href: "/events", placement: "FOOTER_RESOURCES", displayOrder: 1 },
    { label: "Prayer", href: "/prayer", placement: "FOOTER_RESOURCES", displayOrder: 2 },
    // FOOTER_INVOLVED
    { label: "Small Groups", href: "/get-involved/small-groups", placement: "FOOTER_INVOLVED", displayOrder: 0 },
    { label: "Volunteer", href: "/get-involved/volunteer", placement: "FOOTER_INVOLVED", displayOrder: 1 },
    { label: "Give", href: "/give", placement: "FOOTER_INVOLVED", displayOrder: 2 },
    { label: "Membership", href: "/membership", placement: "FOOTER_INVOLVED", displayOrder: 3 },
    // FOOTER_CONNECT
    { label: "Contact Us", href: "#contact", placement: "FOOTER_CONNECT", displayOrder: 0 },
    { label: "Visit Us", href: "#about", placement: "FOOTER_CONNECT", displayOrder: 1 },
    { label: "Services", href: "#services", placement: "FOOTER_CONNECT", displayOrder: 2 },
    { label: "Locations", href: "/locations", placement: "FOOTER_CONNECT", displayOrder: 3 },
  ];

  await prisma.navigationItem.deleteMany({});
  await prisma.navigationItem.createMany({ data: navItems });
  console.log(`✅ Seeded ${navItems.length} NavigationItems`);

  // 6. Seed AboutConfig
  await prisma.aboutConfig.upsert({
    where: { id: "about" },
    update: {},
    create: {
      id: "about",
      sectionBadge: "Who We Are",
      heading: "About Our Ministry",
      subtitle: "Kingdom of Christ Ministries is a vibrant, Spirit-filled community in Hyderabad, dedicated to spreading the love of Christ through worship, fellowship, discipleship, and community service.",
      missionTitle: "Our Mission",
      missionText: "To preach the Gospel of the Kingdom of Christ, make disciples of all nations, and serve the community with compassion — reaching the lost, healing the broken, and empowering believers to live for God's glory.",
      values: [
        {
          icon: "Church",
          title: "Worship",
          titleTe: "ఆరాధన",
          description: "We worship God in Spirit and truth, glorifying His name through song, prayer, and dedicated praise.",
          gradient: "from-purple-500 to-violet-600",
        },
        {
          icon: "Heart",
          title: "Community",
          titleTe: "సమాజం",
          description: "Building a loving community where every person is welcomed, valued, and spiritually nourished.",
          gradient: "from-rose-500 to-pink-600",
        },
        {
          icon: "Users",
          title: "Fellowship",
          titleTe: "సహవాసం",
          description: "Growing together through small groups, shared meals, prayer circles, and heartfelt connection.",
          gradient: "from-blue-500 to-cyan-600",
        },
        {
          icon: "BookOpen",
          title: "Teaching",
          titleTe: "బోధ",
          description: "Grounding believers in God's Word through expository preaching, Bible studies, and discipleship programs.",
          gradient: "from-emerald-500 to-teal-600",
        },
      ],
    },
  });
  console.log("✅ Seeded AboutConfig");

  // 7. Seed Senior Pastor if not present
  const existingPastor = await prisma.pastor.findFirst();
  if (!existingPastor) {
    await prisma.pastor.create({
      data: {
        name: "Kurra Kristhu Raju",
        title: "Bishop",
        designation: "Senior Pastor & Founder",
        bio: "Bishop Kurra Kristhu Raju is the founder and Senior Pastor of Kingdom of Christ Ministries. With over 25 years of faithful ministry, he has led thousands to faith in Jesus Christ, built active branch churches in Hyderabad, and established extensive social outreach programs for those in need.",
        image: "/pastor.png",
        phone: "+91 97040 90069",
        email: "kingofchristministries23@gmail.com",
        isActive: true,
        displayOrder: 0,
      },
    });
    console.log("✅ Seeded Senior Pastor");
  }

  console.log("🚀 All Homepage CMS records successfully seeded!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
