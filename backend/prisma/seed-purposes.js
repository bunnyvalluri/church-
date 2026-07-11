const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding branches...');
  const branches = [
    { name: 'Shapur Nagar' },
    { name: 'Subhash Nagar' },
    { name: 'Bahadurpally' }
  ];

  for (const b of branches) {
    await prisma.branch.upsert({
      where: { name: b.name },
      update: {},
      create: { name: b.name }
    });
  }
  console.log('Branches seeded.');

  console.log('Seeding donation purposes...');
  const purposes = [
    {
      code: 'TITHE',
      nameEn: 'Tithe',
      nameTe: 'దశమ భాగము (Tithe)',
      nameHi: 'दशमांश (Tithe)',
      descEn: '10% of monthly income to support the ministry.',
      descTe: 'నెలవారీ ఆదాయంలో 10% దేవుని సేవకు ఇవ్వడం.',
      descHi: 'मंत्रालय का समर्थन करने के लिए मासिक आय का 10%।',
      sortOrder: 1,
      isActive: true
    },
    {
      code: 'OFFERING',
      nameEn: 'Online Offering',
      nameTe: 'ఆరాధన కానుక (Offering)',
      nameHi: 'पूजा की भेंट (Offering)',
      descEn: 'General offerings to support church operations and worship.',
      descTe: 'ఆరాధన మరియు సంఘ అవసరాల కొరకు ఇచ్చే కానుక.',
      descHi: 'चर्च के संचालन और पूजा का समर्थन करने के लिए सामान्य प्रसाद।',
      sortOrder: 2,
      isActive: true
    },
    {
      code: 'BUILDING',
      nameEn: 'Building Fund',
      nameTe: 'భవన నిర్మాణ నిధి (Building Fund)',
      nameHi: 'भवन निर्माण निधि (Building Fund)',
      descEn: 'For church construction, expansion, and facilities maintenance.',
      descTe: 'నూతన మందిర నిర్మాణం మరియు స్థల సేకరణ కొరకు.',
      descHi: 'चर्च निर्माण, विस्तार और सुविधाओं के रखरखाव के लिए।',
      sortOrder: 3,
      isActive: true
    },
    {
      code: 'MISSIONS',
      nameEn: 'Missions',
      nameTe: 'సువార్త సేవ నిధి (Missions)',
      nameHi: 'मिशनरी सेवा (Missions)',
      descEn: 'Supporting local evangelism and global outreach missions.',
      descTe: 'సువార్త సేవకులు మరియు పరిచర్యలను ఆదుకోవడానికి.',
      descHi: 'स्थानीय इंजीलवाद और वैश्विक आउटरीच मिशनों का समर्थन करना।',
      sortOrder: 4,
      isActive: true
    },
    {
      code: 'CHARITY',
      nameEn: 'Benevolence',
      nameTe: 'ధర్మకార్యములు (Charity)',
      nameHi: 'परोपकार (Charity)',
      descEn: 'Assisting widows, orphans, and families in financial distress.',
      descTe: 'విధవరాండ్రులు, అనాధలు మరియు పేద కుటుంబాలకు సహాయం చేయడానికి.',
      descHi: 'विधवाओं, अनाथों और वित्तीय संकट में परिवारों की सहायता करना।',
      sortOrder: 5,
      isActive: true
    },
    {
      code: 'SPECIAL',
      nameEn: 'Special Offering',
      nameTe: 'ప్రత్యేక కానుక (Special)',
      nameHi: 'विशेष भेंट (Special)',
      descEn: 'Vows, thanksgiving offerings, or special pledge gifts.',
      descTe: 'మ్రొక్కుబడులు, కృతజ్ఞతా కూడికలు లేదా ప్రత్యేక కానుకలు.',
      descHi: 'मन्नत, धन्यवाद प्रसाद, या विशेष प्रतिज्ञा उपहार।',
      sortOrder: 6,
      isActive: true
    }
  ];

  for (const p of purposes) {
    await prisma.donationPurpose.upsert({
      where: { code: p.code },
      update: {
        nameEn: p.nameEn,
        nameTe: p.nameTe,
        nameHi: p.nameHi,
        descEn: p.descEn,
        descTe: p.descTe,
        descHi: p.descHi,
        sortOrder: p.sortOrder,
        isActive: p.isActive
      },
      create: p
    });
  }
  console.log('Donation purposes seeded successfully.');
}

main()
  .catch(err => {
    console.error('Error seeding purposes:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
