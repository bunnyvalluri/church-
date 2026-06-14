const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
Promise.all([
  p.user.count(),
  p.pastor.count(),
  p.sermon.count(),
  p.event.count(),
  p.announcement.count(),
  p.prayerRequest.count(),
  p.donation.count(),
  p.ministry.count(),
  p.smallGroup.count(),
  p.volunteer.count(),
  p.bibleStudy.count(),
  p.memberRequest.count(),
  p.testimonial.count(),
  p.gallery.count(),
  p.contactMessage.count(),
  p.notification.count(),
]).then(([u,pa,s,e,a,pr,d,m,sg,vol,bs,mr,t,g,c,n]) => {
  console.log('=== LIVE DATABASE STATUS — KCM Portal ===');
  console.log('Users:          ' + u);
  console.log('Pastors:        ' + pa);
  console.log('Sermons:        ' + s);
  console.log('Events:         ' + e);
  console.log('Announcements:  ' + a);
  console.log('PrayerRequests: ' + pr);
  console.log('Donations:      ' + d);
  console.log('Ministries:     ' + m);
  console.log('SmallGroups:    ' + sg);
  console.log('Volunteers:     ' + vol);
  console.log('BibleStudies:   ' + bs);
  console.log('MemberRequests: ' + mr);
  console.log('Testimonials:   ' + t);
  console.log('Gallery:        ' + g);
  console.log('Contacts:       ' + c);
  console.log('Notifications:  ' + n);
  const total = u+pa+s+e+a+pr+d+m+sg+vol+bs+mr+t+g+c+n;
  console.log('=========================================');
  console.log('TOTAL RECORDS:  ' + total);
  console.log('=========================================');
  p.$disconnect();
}).catch(e => { console.error('Error:', e.message); p.$disconnect(); });
