const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

p.pastor.updateMany({
  where: { image: '/images/pastor-david.jpg' },
  data: { image: '/pastor.png' }
}).then(function(r) {
  console.log('Fixed david:', r.count, 'records');
  return p.pastor.findMany({ select: { name: true, image: true } });
}).then(function(pastors) {
  pastors.forEach(function(pa) { console.log(' -', pa.name, '->', pa.image); });
  p.$disconnect();
  console.log('ALL pastor images fixed!');
}).catch(function(e) {
  console.error('Error:', e.message);
  p.$disconnect();
});
