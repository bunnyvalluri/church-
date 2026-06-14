const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const parseDate = (dateStr) => {
  if (!dateStr) return new Date();
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
};

async function main() {
  console.log('Starting seed process...');

  // 1. Seed Users
  const usersFile = path.join(__dirname, 'fallback_users.json');
  if (fs.existsSync(usersFile)) {
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    console.log(`Seeding ${users.length} users...`);
    for (const user of users) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: {
          name: user.name,
          role: user.role,
          image: user.image,
          phone: user.phone,
          address: user.address,
        },
        create: {
          id: user.id,
          email: user.email,
          name: user.name,
          password: user.password || 'firebase-authenticated',
          role: user.role,
          image: user.image,
          phone: user.phone,
          address: user.address,
          createdAt: parseDate(user.createdAt),
          updatedAt: parseDate(user.updatedAt),
        },
      });
    }
  }

  // 2. Seed Events
  const eventsFile = path.join(__dirname, 'fallback_events.json');
  if (fs.existsSync(eventsFile)) {
    const events = JSON.parse(fs.readFileSync(eventsFile, 'utf8'));
    console.log(`Seeding ${events.length} events...`);
    for (const event of events) {
      await prisma.event.upsert({
        where: { id: event.id },
        update: {
          title: event.title,
          description: event.description,
          date: parseDate(event.date),
          time: event.time,
          location: event.location,
          image: event.image,
          category: event.category,
        },
        create: {
          id: event.id,
          title: event.title,
          description: event.description,
          date: parseDate(event.date),
          time: event.time,
          location: event.location,
          image: event.image,
          category: event.category,
          createdAt: parseDate(event.createdAt),
          updatedAt: parseDate(event.updatedAt),
        },
      });
    }
  }

  // 3. Seed Event Registrations
  const registrationsFile = path.join(__dirname, 'fallback_registrations.json');
  if (fs.existsSync(registrationsFile)) {
    const registrations = JSON.parse(fs.readFileSync(registrationsFile, 'utf8'));
    console.log(`Seeding ${registrations.length} registrations...`);
    for (const reg of registrations) {
      // Ensure user and event exist in database before creating registration
      const userExists = await prisma.user.findUnique({ where: { id: reg.userId } });
      const eventExists = await prisma.event.findUnique({ where: { id: reg.eventId } });
      if (userExists && eventExists) {
        await prisma.eventRegistration.upsert({
          where: {
            userId_eventId: {
              userId: reg.userId,
              eventId: reg.eventId,
            },
          },
          update: {},
          create: {
            id: reg.id,
            userId: reg.userId,
            eventId: reg.eventId,
            createdAt: parseDate(reg.createdAt),
          },
        });
      }
    }
  }

  // 4. Seed Donations
  const donationsFile = path.join(__dirname, 'fallback_donations.json');
  if (fs.existsSync(donationsFile)) {
    const donations = JSON.parse(fs.readFileSync(donationsFile, 'utf8'));
    console.log(`Seeding ${donations.length} donations...`);
    for (const donation of donations) {
      // If userId is provided, ensure user exists
      const userExists = donation.userId ? await prisma.user.findUnique({ where: { id: donation.userId } }) : null;
      await prisma.donation.upsert({
        where: { id: donation.id },
        update: {
          status: donation.status,
          razorpayPaymentId: donation.razorpayPaymentId,
          razorpaySignature: donation.razorpaySignature,
        },
        create: {
          id: donation.id,
          userId: userExists ? donation.userId : null,
          amount: parseFloat(donation.amount),
          currency: donation.currency || 'INR',
          purpose: donation.purpose,
          paymentMethod: donation.paymentMethod || 'RAZORPAY',
          stripeId: donation.stripeId,
          razorpayOrderId: donation.razorpayOrderId,
          razorpayPaymentId: donation.razorpayPaymentId,
          razorpaySignature: donation.razorpaySignature,
          donorName: donation.donorName,
          donorEmail: donation.donorEmail,
          donorPhone: donation.donorPhone,
          status: donation.status,
          createdAt: parseDate(donation.createdAt),
          updatedAt: parseDate(donation.updatedAt),
        },
      });
    }
  }

  // 5. Seed Announcements
  const announcementsFile = path.join(__dirname, 'fallback_announcements.json');
  if (fs.existsSync(announcementsFile)) {
    const announcements = JSON.parse(fs.readFileSync(announcementsFile, 'utf8'));
    console.log(`Seeding ${announcements.length} announcements...`);
    for (const announcement of announcements) {
      await prisma.announcement.upsert({
        where: { id: announcement.id },
        update: {
          title: announcement.title,
          content: announcement.content,
          priority: announcement.priority,
          expiresAt: announcement.expiresAt ? parseDate(announcement.expiresAt) : null,
        },
        create: {
          id: announcement.id,
          title: announcement.title,
          content: announcement.content,
          priority: announcement.priority,
          expiresAt: announcement.expiresAt ? parseDate(announcement.expiresAt) : null,
          createdAt: parseDate(announcement.createdAt),
          updatedAt: parseDate(announcement.updatedAt),
        },
      });
    }
  }

  // 6. Seed Notifications
  const notificationsFile = path.join(__dirname, 'fallback_notifications.json');
  if (fs.existsSync(notificationsFile)) {
    const notifications = JSON.parse(fs.readFileSync(notificationsFile, 'utf8'));
    console.log(`Seeding ${notifications.length} notifications...`);
    for (const notif of notifications) {
      await prisma.notification.upsert({
        where: { id: notif.id },
        update: {
          isRead: notif.isRead,
        },
        create: {
          id: notif.id,
          type: notif.type,
          title: notif.title,
          content: notif.content,
          isRead: notif.isRead,
          link: notif.link,
          createdAt: parseDate(notif.createdAt),
        },
      });
    }
  }

  console.log('Seed process completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
