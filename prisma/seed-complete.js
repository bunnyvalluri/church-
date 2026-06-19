/**
 * seed-complete.js — Kingdom of Christ Ministries
 * Complete database seeder — covers ALL 18 Prisma models
 * Run: node prisma/seed-complete.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const log = (msg) => console.log(`\x1b[36m[KCM-SEED]\x1b[0m ${msg}`);
const ok  = (msg) => console.log(`\x1b[32m  ✓\x1b[0m ${msg}`);
const err = (msg) => console.log(`\x1b[31m  ✗\x1b[0m ${msg}`);

async function main() {
  log('Starting complete database seed for Kingdom of Christ Ministries...\n');

  // ──────────────────────────────────────────────
  // 1. CHURCH SETTINGS
  // ──────────────────────────────────────────────
  await prisma.churchSettings.upsert({
    where: { id: 'settings' },
    update: {},
    create: {
      id: 'settings',
      churchName: 'Kingdom of Christ Ministries',
      tagline: 'Building God\'s Kingdom, One Soul at a Time',
      primaryEmail: 'kingofchristministries23@gmail.com',
      contactPhone: '+91 96409 43777',
      address: '15-201, Vivekananda Nagar, Srinivas Nagar, Jeedimetla, Hyderabad, Telangana 500055',
      worshipServices: 'Sunday 10:00 AM - Telugu | Sunday 12:00 PM - English | Wednesday 6:00 PM - Prayer',
      bilingualSupport: true,
      visitorRegistrationEnabled: true,
    },
  });
  ok('Church Settings seeded');

  // ──────────────────────────────────────────────
  // 2. USERS (Admin + Pastor + Members)
  // ──────────────────────────────────────────────
  const users = [
    {
      id: 'user_super_admin_001',
      name: 'Pastor Samuel Valluri',
      email: 'kingofchristministries23@gmail.com',
      password: 'firebase-authenticated',
      role: 'SUPER_ADMIN',
      phone: '+91 96409 43777',
      address: '15-201, Vivekananda Nagar, Jeedimetla, Hyderabad',
    },
    {
      id: 'user_admin_002',
      name: 'Admin Sarah Thomas',
      email: 'admin@kcm-church.com',
      password: 'firebase-authenticated',
      role: 'SUPER_ADMIN',
      phone: '+91 98765 43210',
      address: 'Jeedimetla, Hyderabad',
    },
    {
      id: 'user_pastor_003',
      name: 'Pastor David Raju',
      email: 'pastor.david@kcm-church.com',
      password: 'firebase-authenticated',
      role: 'PASTOR',
      phone: '+91 87654 32109',
      address: 'Kukatpally, Hyderabad',
    },
    {
      id: 'user_member_004',
      name: 'John Babu',
      email: 'john.babu@gmail.com',
      password: 'firebase-authenticated',
      role: 'MEMBER',
      phone: '+91 76543 21098',
      address: 'Kompally, Hyderabad',
    },
    {
      id: 'user_member_005',
      name: 'Mary Sunitha',
      email: 'mary.sunitha@gmail.com',
      password: 'firebase-authenticated',
      role: 'MEMBER',
      phone: '+91 65432 10987',
      address: 'Medchal, Hyderabad',
    },
    {
      id: 'user_member_006',
      name: 'Emmanuel Reddy',
      email: 'emmanuel.reddy@gmail.com',
      password: 'firebase-authenticated',
      role: 'MEMBER',
      phone: '+91 54321 09876',
      address: 'Alwal, Hyderabad',
    },
    {
      id: 'user_member_007',
      name: 'Grace Priya',
      email: 'grace.priya@gmail.com',
      password: 'firebase-authenticated',
      role: 'MEMBER',
      phone: '+91 43210 98765',
      address: 'Bowenpally, Hyderabad',
    },
    {
      id: 'user_member_008',
      name: 'Daniel Rao',
      email: 'daniel.rao@gmail.com',
      password: 'firebase-authenticated',
      role: 'MEMBER',
      phone: '+91 32109 87654',
      address: 'Secundarabad, Hyderabad',
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, phone: user.phone },
      create: user,
    });
  }
  ok(`${users.length} Users seeded (1 Super Admin, 1 Admin, 1 Pastor, 5 Members)`);

  // ──────────────────────────────────────────────
  // 3. PASTOR PROFILES
  // ──────────────────────────────────────────────
  const pastors = [
    {
      name: 'Pastor Samuel Valluri',
      title: 'Senior Pastor & Founder',
      bio: 'Pastor Samuel Valluri founded Kingdom of Christ Ministries in 2008 with a vision to reach the unreached in Hyderabad. With over 20 years of ministry experience, he leads the congregation with wisdom, compassion, and a deep love for God\'s Word. He holds a Master of Divinity from Southern Asia Bible College and is passionate about bilingual worship.',
      email: 'kingofchristministries23@gmail.com',
      phone: '+91 96409 43777',
      image: '/pastor.png',
    },
    {
      name: 'Pastor David Raju',
      title: 'Associate Pastor — Youth & Outreach',
      bio: 'Pastor David Raju leads the youth ministry and community outreach programs. A graduate of Osmania University and trained at Chennai Bible Seminary, he brings energy and vision to reach the next generation for Christ. He oversees Sunday school, VBS, and the annual youth camp.',
      email: 'pastor.david@kcm-church.com',
      phone: '+91 87654 32109',
      image: '/pastor.png',
    },
  ];

  // Delete existing pastors and recreate for clean state
  await prisma.pastor.deleteMany({});
  for (const pastor of pastors) {
    await prisma.pastor.create({ data: pastor });
  }
  ok(`${pastors.length} Pastor profiles seeded`);

  // ──────────────────────────────────────────────
  // 4. SERMONS
  // ──────────────────────────────────────────────
  const sermons = [
    {
      id: 'sermon_001',
      title: 'Walking in Faith — The Abraham Principle',
      description: 'An exploration of Abraham\'s journey of faith and how we can apply the same unwavering trust in God to our modern challenges. This message unpacks Genesis 22 and the ultimate test of faith.',
      pastor: 'Pastor Samuel Valluri',
      date: new Date('2024-06-09T10:00:00Z'),
      videoUrl: 'https://youtube.com/watch?v=example1',
      category: 'Faith',
      tags: ['faith', 'abraham', 'trust', 'genesis'],
      views: 342,
    },
    {
      id: 'sermon_002',
      title: 'The Power of Prayer — Matthew 6:9-13',
      description: 'A deep dive into the Lord\'s Prayer, teaching us not just the words but the posture of heart that transforms our prayer life and draws us closer to our Heavenly Father.',
      pastor: 'Pastor Samuel Valluri',
      date: new Date('2024-06-02T10:00:00Z'),
      videoUrl: 'https://youtube.com/watch?v=example2',
      category: 'Prayer',
      tags: ['prayer', 'matthew', 'lords-prayer', 'worship'],
      views: 287,
    },
    {
      id: 'sermon_003',
      title: 'Renewed Minds — Romans 12:2',
      description: 'How the transformation of our minds through God\'s Word empowers us to discern His perfect will. A practical message on daily spiritual disciplines and renewing our thought life.',
      pastor: 'Pastor David Raju',
      date: new Date('2024-05-26T10:00:00Z'),
      videoUrl: 'https://youtube.com/watch?v=example3',
      category: 'Transformation',
      tags: ['mind', 'transformation', 'romans', 'discipleship'],
      views: 215,
    },
    {
      id: 'sermon_004',
      title: 'Grace Sufficient — 2 Corinthians 12:9',
      description: 'Paul\'s thorn in the flesh teaches us that God\'s grace is enough in every season of weakness, failure, and suffering. A message of hope for those walking through dark valleys.',
      pastor: 'Pastor Samuel Valluri',
      date: new Date('2024-05-19T10:00:00Z'),
      videoUrl: 'https://youtube.com/watch?v=example4',
      category: 'Grace',
      tags: ['grace', 'paul', 'corinthians', 'hope', 'suffering'],
      views: 401,
    },
    {
      id: 'sermon_005',
      title: 'The Great Commission — Go and Make Disciples',
      description: 'Unpacking Matthew 28:18-20, this sermon challenges every believer to step into their role as ambassadors of Christ — in their families, workplaces, and communities.',
      pastor: 'Pastor David Raju',
      date: new Date('2024-05-12T10:00:00Z'),
      videoUrl: 'https://youtube.com/watch?v=example5',
      category: 'Evangelism',
      tags: ['evangelism', 'missions', 'matthew', 'discipleship', 'outreach'],
      views: 178,
    },
    {
      id: 'sermon_006',
      title: 'Fruit of the Spirit — Galatians 5:22-23',
      description: 'A series exploring the nine fruits of the Spirit: love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control — and how they manifest in a Spirit-filled life.',
      pastor: 'Pastor Samuel Valluri',
      date: new Date('2024-05-05T10:00:00Z'),
      videoUrl: 'https://youtube.com/watch?v=example6',
      category: 'Holy Spirit',
      tags: ['holy-spirit', 'galatians', 'character', 'fruit'],
      views: 325,
    },
  ];

  for (const sermon of sermons) {
    await prisma.sermon.upsert({
      where: { id: sermon.id },
      update: { views: sermon.views },
      create: sermon,
    });
  }
  ok(`${sermons.length} Sermons seeded`);

  // ──────────────────────────────────────────────
  // 5. EVENTS
  // ──────────────────────────────────────────────
  const events = [
    {
      id: 'event_001',
      title: 'Sunday Worship Service — Telugu',
      description: 'Weekly Telugu worship service featuring praise & worship, scripture reading, and a powerful sermon. All are welcome! Refreshments served after service.',
      date: new Date('2024-06-16T04:30:00Z'),
      time: '10:00 AM',
      location: 'Main Sanctuary, KCM Church, Jeedimetla',
      category: 'WORSHIP',
    },
    {
      id: 'event_002',
      title: 'Sunday Worship Service — English',
      description: 'Weekly English worship service. Contemporary worship, children\'s ministry available. A warm, welcoming environment for families and visitors.',
      date: new Date('2024-06-16T06:30:00Z'),
      time: '12:00 PM',
      location: 'Main Sanctuary, KCM Church, Jeedimetla',
      category: 'WORSHIP',
    },
    {
      id: 'event_003',
      title: 'Wednesday Prayer Night',
      description: 'Mid-week corporate prayer gathering. We intercede for families, the nation, and the unreached. Open for all members and visitors. Powerful time of prayer and fellowship.',
      date: new Date('2024-06-19T12:30:00Z'),
      time: '6:00 PM',
      location: 'Prayer Hall, KCM Church',
      category: 'PRAYER',
    },
    {
      id: 'event_004',
      title: 'Youth Summer Camp 2024',
      description: 'Three-day annual youth camp for teenagers and young adults (ages 13-25). Workshops, outdoor activities, worship nights, and life-changing sessions on identity in Christ.',
      date: new Date('2024-07-05T03:00:00Z'),
      time: '9:00 AM',
      location: 'Camp Calvary, Vikarabad, Telangana',
      category: 'YOUTH',
      image: '/images/youth-camp.jpg',
    },
    {
      id: 'event_005',
      title: 'Women\'s Empowerment Conference',
      description: 'Annual conference celebrating women of faith. Sessions on spiritual leadership, family, career, and wholeness in Christ. Guest speakers from across India.',
      date: new Date('2024-07-20T04:00:00Z'),
      time: '9:30 AM',
      location: 'KCM Church Hall, Jeedimetla',
      category: 'WOMEN',
    },
    {
      id: 'event_006',
      title: 'Children\'s Vacation Bible School',
      description: 'A week-long VBS for children ages 4-12. Bible stories, crafts, games, and songs that will plant the seeds of faith in the hearts of our youngest members.',
      date: new Date('2024-07-15T04:00:00Z'),
      time: '9:00 AM',
      location: 'Children\'s Ministry Wing, KCM Church',
      category: 'CHILDREN',
    },
    {
      id: 'event_007',
      title: 'Men\'s Prayer Breakfast',
      description: 'Monthly fellowship for men — breakfast together, accountability groups, Bible discussion, and prayer. A space for men to grow in faith and brotherhood.',
      date: new Date('2024-06-29T03:00:00Z'),
      time: '8:00 AM',
      location: 'Fellowship Hall, KCM Church',
      category: 'MEN',
    },
    {
      id: 'event_008',
      title: 'Church Anniversary — 16 Years of Grace',
      description: 'Celebrating 16 years of Kingdom of Christ Ministries! Special anniversary service with guest preachers, testimonies, cultural program, and a grand fellowship lunch.',
      date: new Date('2024-08-10T04:00:00Z'),
      time: '9:00 AM',
      location: 'Main Sanctuary, KCM Church, Jeedimetla',
      category: 'SPECIAL',
      image: '/images/anniversary.jpg',
    },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { id: event.id },
      update: { title: event.title },
      create: event,
    });
  }
  ok(`${events.length} Events seeded`);

  // ──────────────────────────────────────────────
  // 6. EVENT REGISTRATIONS
  // ──────────────────────────────────────────────
  const registrations = [
    { id: 'reg_001', userId: 'user_member_004', eventId: 'event_001' },
    { id: 'reg_002', userId: 'user_member_005', eventId: 'event_001' },
    { id: 'reg_003', userId: 'user_member_006', eventId: 'event_001' },
    { id: 'reg_004', userId: 'user_member_004', eventId: 'event_004' },
    { id: 'reg_005', userId: 'user_member_007', eventId: 'event_004' },
    { id: 'reg_006', userId: 'user_member_005', eventId: 'event_005' },
    { id: 'reg_007', userId: 'user_member_008', eventId: 'event_003' },
  ];

  for (const reg of registrations) {
    await prisma.eventRegistration.upsert({
      where: { userId_eventId: { userId: reg.userId, eventId: reg.eventId } },
      update: {},
      create: reg,
    });
  }
  ok(`${registrations.length} Event Registrations seeded`);

  // ──────────────────────────────────────────────
  // 7. ANNOUNCEMENTS
  // ──────────────────────────────────────────────
  const announcements = [
    {
      id: 'ann_001',
      title: '🎉 Church Anniversary — August 10, 2024',
      content: 'We are celebrating 16 years of God\'s faithfulness! Join us on August 10th for a special anniversary service, testimonies, and fellowship lunch. Invite your friends and family!',
      priority: 'URGENT',
      expiresAt: new Date('2024-08-11T00:00:00Z'),
    },
    {
      id: 'ann_002',
      title: 'Youth Camp Registration Open',
      content: 'Registration is now open for the Youth Summer Camp 2024 (July 5-7). Limited spots available! Cost: ₹500 per person includes accommodation, meals, and all activities. Contact Pastor David to register.',
      priority: 'HIGH',
      expiresAt: new Date('2024-07-01T00:00:00Z'),
    },
    {
      id: 'ann_003',
      title: 'New Small Group — Kompally Area',
      content: 'We are launching a new small group for members in Kompally and Medchal areas. Meeting every Tuesday at 7:00 PM. Led by Brother Emmanuel Reddy. All are welcome!',
      priority: 'NORMAL',
    },
    {
      id: 'ann_004',
      title: 'Tithe & Offerings — Online Payment Available',
      content: 'You can now give your tithes and offerings online through our website. Visit the Donate section and choose your preferred method — UPI, Razorpay, or bank transfer.',
      priority: 'NORMAL',
    },
    {
      id: 'ann_005',
      title: 'Prayer Chain — Join Today',
      content: 'Our 24/7 prayer chain needs volunteers. Sign up to cover a 30-minute prayer slot each week. Contact the church office or submit a prayer request through the website.',
      priority: 'LOW',
    },
  ];

  for (const ann of announcements) {
    await prisma.announcement.upsert({
      where: { id: ann.id },
      update: { title: ann.title, content: ann.content },
      create: ann,
    });
  }
  ok(`${announcements.length} Announcements seeded`);

  // ──────────────────────────────────────────────
  // 8. PRAYER REQUESTS
  // ──────────────────────────────────────────────
  const prayerRequests = [
    {
      id: 'pr_001',
      userId: 'user_member_004',
      title: 'Healing for my mother',
      description: 'My mother has been diagnosed with diabetes and is struggling with her health. Please pray for her complete healing and for our family to trust in God during this difficult time.',
      category: 'HEALTH',
      isAnonymous: false,
      status: 'PRAYING',
    },
    {
      id: 'pr_002',
      userId: 'user_member_005',
      title: 'Financial breakthrough needed',
      description: 'Our family is going through financial difficulties after my husband lost his job. Please intercede for employment and provision from the Lord.',
      category: 'FINANCIAL',
      isAnonymous: false,
      status: 'PRAYING',
    },
    {
      id: 'pr_003',
      userId: 'user_member_006',
      title: 'Guidance for career decision',
      description: 'I have received two job offers and need God\'s wisdom to make the right choice. Please pray that I follow the path God has for my life.',
      category: 'GUIDANCE',
      isAnonymous: false,
      status: 'PENDING',
    },
    {
      id: 'pr_004',
      userId: 'user_member_007',
      title: 'Marriage restoration',
      description: 'Please pray for my marriage. We are going through a very difficult season and need God to intervene and restore our relationship.',
      category: 'FAMILY',
      isAnonymous: true,
      status: 'PRAYING',
    },
    {
      id: 'pr_005',
      userId: 'user_member_008',
      title: 'Thanksgiving — Child born healthy!',
      description: 'Praise God! Our baby boy was born healthy after a complicated pregnancy. We thank the entire church for praying with us. To God be the glory!',
      category: 'THANKSGIVING',
      isAnonymous: false,
      status: 'ANSWERED',
    },
    {
      id: 'pr_006',
      userId: 'user_member_004',
      title: 'Spiritual growth and consistency',
      description: 'Please pray that I remain consistent in my prayer and Bible study. I want to grow deeper in my faith and be a better witness to my colleagues.',
      category: 'SPIRITUAL',
      isAnonymous: false,
      status: 'PENDING',
    },
  ];

  for (const pr of prayerRequests) {
    await prisma.prayerRequest.upsert({
      where: { id: pr.id },
      update: { status: pr.status },
      create: pr,
    });
  }
  ok(`${prayerRequests.length} Prayer Requests seeded`);

  // ──────────────────────────────────────────────
  // 9. DONATIONS
  // ──────────────────────────────────────────────
  const donations = [
    {
      id: 'don_001',
      userId: 'user_member_004',
      amount: 1000,
      currency: 'INR',
      purpose: 'TITHE',
      paymentMethod: 'RAZORPAY',
      donorName: 'John Babu',
      donorEmail: 'john.babu@gmail.com',
      donorPhone: '+91 76543 21098',
      status: 'COMPLETED',
    },
    {
      id: 'don_002',
      userId: 'user_member_005',
      amount: 500,
      currency: 'INR',
      purpose: 'OFFERING',
      paymentMethod: 'RAZORPAY',
      donorName: 'Mary Sunitha',
      donorEmail: 'mary.sunitha@gmail.com',
      status: 'COMPLETED',
    },
    {
      id: 'don_003',
      amount: 5000,
      currency: 'INR',
      purpose: 'BUILDING',
      paymentMethod: 'BANK_TRANSFER',
      donorName: 'Anonymous Donor',
      status: 'COMPLETED',
    },
    {
      id: 'don_004',
      userId: 'user_member_006',
      amount: 2000,
      currency: 'INR',
      purpose: 'MISSIONS',
      paymentMethod: 'RAZORPAY',
      donorName: 'Emmanuel Reddy',
      donorEmail: 'emmanuel.reddy@gmail.com',
      status: 'COMPLETED',
    },
    {
      id: 'don_005',
      amount: 10000,
      currency: 'INR',
      purpose: 'CHARITY',
      paymentMethod: 'BANK_TRANSFER',
      donorName: 'Church Member',
      status: 'COMPLETED',
    },
    {
      id: 'don_006',
      userId: 'user_member_007',
      amount: 750,
      currency: 'INR',
      purpose: 'GENERAL',
      paymentMethod: 'RAZORPAY',
      donorName: 'Grace Priya',
      donorEmail: 'grace.priya@gmail.com',
      status: 'PENDING',
    },
  ];

  for (const don of donations) {
    await prisma.donation.upsert({
      where: { id: don.id },
      update: { status: don.status },
      create: don,
    });
  }
  ok(`${donations.length} Donations seeded (Total: ₹${donations.reduce((s,d)=>s+d.amount,0).toLocaleString('en-IN')})`);

  // ──────────────────────────────────────────────
  // 10. MINISTRIES
  // ──────────────────────────────────────────────
  const ministries = [
    {
      id: 'min_001',
      name: 'Youth Ministry',
      description: 'Equipping the next generation with the Word of God, leadership skills, and a heart for missions. Our youth ministry runs weekly programs, annual camps, and community service projects.',
      leader: 'Pastor David Raju',
      image: '/images/ministry-youth.jpg',
    },
    {
      id: 'min_002',
      name: 'Women\'s Ministry',
      description: 'Empowering women to discover their identity and purpose in Christ. We host monthly fellowships, Bible study groups, skill development workshops, and an annual women\'s conference.',
      leader: 'Sister Sarah Thomas',
      image: '/images/ministry-women.jpg',
    },
    {
      id: 'min_003',
      name: 'Children\'s Ministry',
      description: 'Planting seeds of faith in children ages 4-12 through Sunday school, VBS, children\'s worship, and age-appropriate Biblical curriculum. We invest in the next generation.',
      leader: 'Sister Grace Priya',
      image: '/images/ministry-children.jpg',
    },
    {
      id: 'min_004',
      name: 'Men\'s Ministry',
      description: 'Building men of God through accountability, prayer, and fellowship. Monthly prayer breakfasts, leadership retreats, and mentorship programs for young men in the church.',
      leader: 'Brother Daniel Rao',
      image: '/images/ministry-men.jpg',
    },
    {
      id: 'min_005',
      name: 'Worship Ministry',
      description: 'Leading the congregation into God\'s presence through music, song, and creative arts. Our bilingual worship team serves in both Telugu and English, honoring God with excellence.',
      leader: 'Brother Emmanuel Reddy',
      image: '/images/ministry-worship.jpg',
    },
    {
      id: 'min_006',
      name: 'Outreach & Missions',
      description: 'Taking the Gospel to the unreached — in the slums of Hyderabad, villages of Telangana, and beyond. We support 5 church plants and run regular medical and food relief programs.',
      leader: 'Pastor Samuel Valluri',
      image: '/images/ministry-outreach.jpg',
    },
  ];

  for (const min of ministries) {
    await prisma.ministry.upsert({
      where: { id: min.id },
      update: { name: min.name, leader: min.leader },
      create: min,
    });
  }
  ok(`${ministries.length} Ministries seeded`);

  // ──────────────────────────────────────────────
  // 11. SMALL GROUPS
  // ──────────────────────────────────────────────
  const smallGroups = [
    { id: 'sg_001', name: 'Jeedimetla Connect Group', leader: 'Brother John Babu', location: 'Jeedimetla, Hyderabad', meetingTime: 'Thursday 7:00 PM', attendanceAvg: 14 },
    { id: 'sg_002', name: 'Kompally Family Group', leader: 'Brother Emmanuel Reddy', location: 'Kompally, Hyderabad', meetingTime: 'Tuesday 7:00 PM', attendanceAvg: 11 },
    { id: 'sg_003', name: 'Medchal Bible Study', leader: 'Sister Mary Sunitha', location: 'Medchal, Hyderabad', meetingTime: 'Wednesday 6:30 PM', attendanceAvg: 9 },
    { id: 'sg_004', name: 'Kukatpally Youth Group', leader: 'Brother Daniel Rao', location: 'Kukatpally, Hyderabad', meetingTime: 'Friday 7:00 PM', attendanceAvg: 18 },
    { id: 'sg_005', name: 'Secundarabad Fellowship', leader: 'Sister Grace Priya', location: 'Secundarabad, Hyderabad', meetingTime: 'Saturday 4:00 PM', attendanceAvg: 12 },
  ];

  for (const sg of smallGroups) {
    await prisma.smallGroup.upsert({
      where: { id: sg.id },
      update: { attendanceAvg: sg.attendanceAvg },
      create: sg,
    });
  }
  ok(`${smallGroups.length} Small Groups seeded`);

  // ──────────────────────────────────────────────
  // 12. VOLUNTEERS
  // ──────────────────────────────────────────────
  const volunteers = [
    { id: 'vol_001', name: 'Ravi Kumar', email: 'ravi.kumar@gmail.com', phone: '+91 98001 12345', ministry: 'Worship Ministry', status: 'Active', appliedAt: '2024-01-15' },
    { id: 'vol_002', name: 'Preethi Naidu', email: 'preethi.naidu@gmail.com', phone: '+91 97002 23456', ministry: 'Children\'s Ministry', status: 'Active', appliedAt: '2024-02-10' },
    { id: 'vol_003', name: 'Suresh Babu', email: 'suresh.babu@gmail.com', phone: '+91 96003 34567', ministry: 'Outreach & Missions', status: 'Active', appliedAt: '2024-01-20' },
    { id: 'vol_004', name: 'Anitha Rao', email: 'anitha.rao@gmail.com', phone: '+91 95004 45678', ministry: 'Women\'s Ministry', status: 'Pending', appliedAt: '2024-06-01' },
    { id: 'vol_005', name: 'Kiran Reddy', email: 'kiran.reddy@gmail.com', phone: '+91 94005 56789', ministry: 'Youth Ministry', status: 'Active', appliedAt: '2024-03-05' },
    { id: 'vol_006', name: 'Vijaya Lakshmi', email: 'vijaya.l@gmail.com', phone: '+91 93006 67890', ministry: 'Men\'s Ministry', status: 'Pending', appliedAt: '2024-06-08' },
  ];

  for (const vol of volunteers) {
    await prisma.volunteer.upsert({
      where: { id: vol.id },
      update: { status: vol.status },
      create: vol,
    });
  }
  ok(`${volunteers.length} Volunteers seeded`);

  // ──────────────────────────────────────────────
  // 13. BIBLE STUDIES
  // ──────────────────────────────────────────────
  const bibleStudies = [
    { id: 'bs_001', name: 'Book of Romans Study', leader: 'Pastor Samuel Valluri', time: '7:00 PM', membersCount: 24, day: 'Tuesday' },
    { id: 'bs_002', name: 'Gospel of John — Deep Dive', leader: 'Pastor David Raju', time: '6:30 PM', membersCount: 18, day: 'Wednesday' },
    { id: 'bs_003', name: 'Psalms — Songs of the Heart', leader: 'Sister Mary Sunitha', time: '10:00 AM', membersCount: 15, day: 'Saturday' },
    { id: 'bs_004', name: 'New Believers Class', leader: 'Brother John Babu', time: '5:00 PM', membersCount: 8, day: 'Sunday' },
    { id: 'bs_005', name: 'Proverbs — Wisdom for Life', leader: 'Brother Daniel Rao', time: '7:30 PM', membersCount: 12, day: 'Thursday' },
  ];

  for (const bs of bibleStudies) {
    await prisma.bibleStudy.upsert({
      where: { id: bs.id },
      update: { membersCount: bs.membersCount },
      create: bs,
    });
  }
  ok(`${bibleStudies.length} Bible Studies seeded`);

  // ──────────────────────────────────────────────
  // 14. MEMBER REQUESTS
  // ──────────────────────────────────────────────
  const memberRequests = [
    { id: 'mr_001', name: 'Srinivas Yadav', email: 'srinivas.y@gmail.com', phone: '+91 99001 11111', type: 'Membership', time: '2024-06-10T09:00:00Z', status: 'New' },
    { id: 'mr_002', name: 'Padmaja Kumari', email: 'padmaja.k@gmail.com', phone: '+91 88002 22222', type: 'Baptism', time: '2024-06-08T14:00:00Z', status: 'Approved' },
    { id: 'mr_003', name: 'Vinod Thomas', email: 'vinod.t@gmail.com', phone: '+91 77003 33333', type: 'Counseling', time: '2024-06-12T11:00:00Z', status: 'New' },
    { id: 'mr_004', name: 'Lakshmi Devi', email: 'lakshmi.d@gmail.com', type: 'Visit', time: '2024-06-05T10:00:00Z', status: 'Completed' },
    { id: 'mr_005', name: 'Mohan Babu', email: 'mohan.b@gmail.com', phone: '+91 66004 44444', type: 'Marriage Blessing', time: '2024-06-14T15:00:00Z', status: 'New' },
  ];

  for (const mr of memberRequests) {
    await prisma.memberRequest.upsert({
      where: { id: mr.id },
      update: { status: mr.status },
      create: mr,
    });
  }
  ok(`${memberRequests.length} Member Requests seeded`);

  // ──────────────────────────────────────────────
  // 15. TESTIMONIALS
  // ──────────────────────────────────────────────
  const testimonials = [
    {
      id: 'test_001',
      userId: 'user_member_008',
      content: 'God healed my wife completely from a chronic illness that doctors said was incurable. After three months of prayer with this church, she received total healing. We give all the glory to Jesus!',
      isPublic: true,
    },
    {
      id: 'test_002',
      userId: 'user_member_004',
      content: 'I was deeply depressed and had lost all hope. A church member invited me to KCM, and that Sunday changed my life forever. I surrendered my life to Christ and have never looked back.',
      isPublic: true,
    },
    {
      id: 'test_003',
      userId: 'user_member_005',
      content: 'After years of struggling financially, God opened doors through this church community. Brothers and sisters prayed with us, and within a month, my husband found an excellent job. Hallelujah!',
      isPublic: true,
    },
    {
      id: 'test_004',
      userId: 'user_member_006',
      content: 'My marriage was on the verge of divorce. Pastor Samuel counseled us and the church prayed. Today, our family is restored and stronger than ever. God is faithful!',
      isPublic: false,
    },
  ];

  for (const test of testimonials) {
    await prisma.testimonial.upsert({
      where: { id: test.id },
      update: { isPublic: test.isPublic },
      create: test,
    });
  }
  ok(`${testimonials.length} Testimonials seeded`);

  // ──────────────────────────────────────────────
  // 16. GALLERY
  // ──────────────────────────────────────────────
  const gallery = [
    { id: 'gal_001', title: 'Sunday Worship — June 2024', description: 'Beautiful moments from our Sunday bilingual worship service', imageUrl: '/images/gallery/worship-june-2024.jpg', category: 'Worship' },
    { id: 'gal_002', title: 'Youth Camp 2023 Highlights', description: 'Highlights from our annual youth summer camp at Camp Calvary', imageUrl: '/images/gallery/youth-camp-2023.jpg', category: 'Youth' },
    { id: 'gal_003', title: 'Women\'s Conference 2024', description: 'Empowering women of faith at our annual conference', imageUrl: '/images/gallery/womens-conf-2024.jpg', category: 'Events' },
    { id: 'gal_004', title: 'Community Outreach — Slum Ministry', description: 'Serving the marginalized communities in Hyderabad slums', imageUrl: '/images/gallery/outreach-slum.jpg', category: 'Outreach' },
    { id: 'gal_005', title: 'Christmas Celebration 2023', description: 'Joyful Christmas celebration with the KCM family', imageUrl: '/images/gallery/christmas-2023.jpg', category: 'Special Events' },
    { id: 'gal_006', title: 'Baptism Service — April 2024', description: 'Celebrating new believers through the waters of baptism', imageUrl: '/images/gallery/baptism-april-2024.jpg', category: 'Sacraments' },
  ];

  for (const g of gallery) {
    await prisma.gallery.upsert({
      where: { id: g.id },
      update: { title: g.title },
      create: g,
    });
  }
  ok(`${gallery.length} Gallery items seeded`);

  // ──────────────────────────────────────────────
  // 17. CONTACT MESSAGES
  // ──────────────────────────────────────────────
  const contacts = [
    { id: 'con_001', name: 'Rajesh Kumar', email: 'rajesh.k@gmail.com', phone: '+91 90001 11111', subject: 'Visiting the Church', message: 'Hello, I would like to visit your church this Sunday. Can you please share the exact address and parking details? My family of 4 will be joining.', isRead: true },
    { id: 'con_002', name: 'Sunita Reddy', email: 'sunita.r@gmail.com', subject: 'Prayer Request', message: 'Please pray for my father who is very sick. He has been admitted to the hospital and we are very worried. I need the church to intercede for him.', isRead: false },
    { id: 'con_003', name: 'Peter Abraham', email: 'peter.a@gmail.com', phone: '+91 80002 22222', subject: 'Marriage Counseling', message: 'My wife and I are going through difficulties and would like to schedule a counseling session with Pastor Samuel. Please let us know his availability.', isRead: false },
  ];

  for (const con of contacts) {
    await prisma.contactMessage.upsert({
      where: { id: con.id },
      update: { isRead: con.isRead },
      create: con,
    });
  }
  ok(`${contacts.length} Contact Messages seeded`);

  // ──────────────────────────────────────────────
  // 18. NOTIFICATIONS
  // ──────────────────────────────────────────────
  const notifications = [
    { id: 'notif_001', type: 'prayer_request', title: 'New Prayer Request', content: 'John Babu submitted a prayer request for family healing.', isRead: false, link: '/admin/prayer-requests' },
    { id: 'notif_002', type: 'donation', title: 'New Donation Received', content: '₹5,000 building fund donation received via bank transfer.', isRead: false, link: '/admin/donations' },
    { id: 'notif_003', type: 'member_request', title: 'New Membership Application', content: 'Srinivas Yadav has submitted a membership application.', isRead: true, link: '/admin/member-requests' },
    { id: 'notif_004', type: 'event_registration', title: 'Youth Camp Registrations', content: '5 new registrations for Youth Summer Camp 2024.', isRead: true, link: '/admin/events' },
    { id: 'notif_005', type: 'contact', title: 'New Contact Message', content: 'Peter Abraham is requesting marriage counseling.', isRead: false, link: '/admin/contacts' },
    { id: 'notif_006', type: 'volunteer', title: 'New Volunteer Application', content: 'Vijaya Lakshmi has applied to volunteer in Men\'s Ministry.', isRead: false, link: '/admin/volunteers' },
  ];

  for (const notif of notifications) {
    await prisma.notification.upsert({
      where: { id: notif.id },
      update: { isRead: notif.isRead },
      create: notif,
    });
  }
  ok(`${notifications.length} Notifications seeded`);

  // ──────────────────────────────────────────────
  // 19. ACCOUNTS
  // ──────────────────────────────────────────────
  const accounts = [
    { id: 'acc_001', name: 'General Fund', balance: 145000, description: 'Daily operating expenses, utility payments, and staff salaries.' },
    { id: 'acc_002', name: 'Building Fund', balance: 280000, description: 'Capital collections for church sanctuary expansion projects.' },
    { id: 'acc_003', name: 'Missions Fund', balance: 75000, description: 'Support for rural gospel missions, pastors support, and outreach programs.' },
    { id: 'acc_004', name: 'Charity Fund', balance: 35000, description: 'Emergency relief, believer education supports, and food distributions.' }
  ];

  for (const acc of accounts) {
    await prisma.account.upsert({
      where: { id: acc.id },
      update: { balance: acc.balance, description: acc.description },
      create: acc,
    });
  }
  ok(`${accounts.length} Accounts seeded`);

  // ──────────────────────────────────────────────
  // 20. ATTENDANCE RECORDS
  // ──────────────────────────────────────────────
  const attendanceRecords = [
    {
      id: 'att_001',
      date: new Date('2024-05-12T00:00:00.000Z'),
      serviceType: 'Sunday Worship Service',
      location: 'Subhash Nagar Sanctuary',
      headcount: 450,
      newVisitors: 12,
      notes: 'Main Sunday worship service. Blessed service with powerful sermon.'
    },
    {
      id: 'att_002',
      date: new Date('2024-05-12T00:00:00.000Z'),
      serviceType: 'Sunday Afternoon Prayer',
      location: 'Bahadurpally Location',
      headcount: 180,
      newVisitors: 5,
      notes: 'Afternoon service. Good gathering.'
    },
    {
      id: 'att_003',
      date: new Date('2024-05-10T00:00:00.000Z'),
      serviceType: 'Friday Evening Prayer',
      location: 'Shapur Location',
      headcount: 120,
      newVisitors: 3,
      notes: 'Weekly Friday evening service.'
    }
  ];

  for (const att of attendanceRecords) {
    await prisma.attendanceRecord.upsert({
      where: { id: att.id },
      update: { headcount: att.headcount, newVisitors: att.newVisitors, notes: att.notes },
      create: att,
    });
  }
  ok(`${attendanceRecords.length} Attendance records seeded`);

  // ──────────────────────────────────────────────
  // 21. PLEDGES
  // ──────────────────────────────────────────────
  const pledges = [
    { id: 'plg_001', donorName: 'James Wilson', donorEmail: 'james.wilson@email.com', committedAmount: 50000, paidAmount: 25000, targetDate: new Date('2026-12-31'), purpose: 'Building Fund', status: 'ACTIVE' },
    { id: 'plg_002', donorName: 'Sarah Johnson', donorEmail: 'sarah.j@email.com', committedAmount: 20000, paidAmount: 20000, targetDate: new Date('2026-05-15'), purpose: 'Missions Fund', status: 'FULFILLED' },
    { id: 'plg_003', donorName: 'Michael Brown', donorEmail: 'michael.b@email.com', committedAmount: 10000, paidAmount: 0, targetDate: new Date('2026-09-01'), purpose: 'Youth Fellowship Support', status: 'PENDING' }
  ];

  for (const plg of pledges) {
    await prisma.pledge.upsert({
      where: { id: plg.id },
      update: { paidAmount: plg.paidAmount, status: plg.status },
      create: plg,
    });
  }
  ok(`${pledges.length} Pledges seeded`);

  // ──────────────────────────────────────────────
  // 22. TRANSACTIONS
  // ──────────────────────────────────────────────
  const transactions = [
    { id: 'tx_001', type: 'INFLOW', amount: 15000, category: 'Tithe', description: 'Sunday Morning Tithe Collections', date: new Date('2026-06-07'), account: 'General Fund' },
    { id: 'tx_002', type: 'OUTFLOW', amount: 3500, category: 'Utilities', description: 'Shapur Sanctuary Electricity Bill', date: new Date('2026-06-05'), account: 'General Fund' },
    { id: 'tx_003', type: 'OUTFLOW', amount: 12000, category: 'Charity', description: 'Believer Education Sponsorship Support', date: new Date('2026-06-03'), account: 'Charity Fund' },
    { id: 'tx_004', type: 'INFLOW', amount: 25000, category: 'Pledge Pay', description: 'James Wilson Pledge payment', date: new Date('2026-06-02'), account: 'Building Fund' }
  ];

  for (const tx of transactions) {
    await prisma.transaction.upsert({
      where: { id: tx.id },
      update: { amount: tx.amount, description: tx.description },
      create: tx,
    });
  }
  ok(`${transactions.length} Transactions seeded`);

  // ──────────────────────────────────────────────
  // SUMMARY
  // ──────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log('\x1b[32m✅ DATABASE FULLY SEEDED — Kingdom of Christ Ministries\x1b[0m');
  console.log('='.repeat(60));

  const counts = await Promise.all([
    prisma.user.count(),
    prisma.pastor.count(),
    prisma.sermon.count(),
    prisma.event.count(),
    prisma.eventRegistration.count(),
    prisma.announcement.count(),
    prisma.prayerRequest.count(),
    prisma.donation.count(),
    prisma.ministry.count(),
    prisma.smallGroup.count(),
    prisma.volunteer.count(),
    prisma.bibleStudy.count(),
    prisma.memberRequest.count(),
    prisma.testimonial.count(),
    prisma.gallery.count(),
    prisma.contactMessage.count(),
    prisma.notification.count(),
    prisma.account.count(),
    prisma.attendanceRecord.count(),
    prisma.pledge.count(),
    prisma.transaction.count(),
  ]);

  const labels = [
    'Users','Pastors','Sermons','Events','Registrations','Announcements','PrayerRequests','Donations','Ministries','SmallGroups','Volunteers','BibleStudies','MemberRequests','Testimonials','Gallery','Contacts','Notifications',
    'Accounts','AttendanceRecords','Pledges','Transactions'
  ];
  labels.forEach((label, i) => {
    console.log(`  \x1b[36m${label.padEnd(20)}\x1b[0m ${counts[i]} records`);
  });
  console.log('='.repeat(60));
  console.log('\x1b[33mTotal records: \x1b[0m' + counts.reduce((a,b)=>a+b,0));
  console.log('='.repeat(60));
}

main()
  .catch((e) => {
    console.error('\x1b[31m❌ Seed failed:\x1b[0m', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
