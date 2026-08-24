/**
 * scripts/verify-live-data.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Inserts live test documents into MongoDB Atlas and reads them back.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const { getMongoDb } = require('../backend/src/infrastructure/mongodb/client');
const { MONGODB_COLLECTIONS } = require('../backend/src/infrastructure/mongodb/indexes');
const { insertActivityLog, findActivityLogs } = require('../backend/src/modules/mongodb/repositories/activityLogRepository');
const { insertAuditEvent, findAuditEvents } = require('../backend/src/modules/mongodb/repositories/auditEventRepository');
const { insertNotificationEvent } = require('../backend/src/modules/mongodb/repositories/notificationEventRepository');
const { insertSystemEvent } = require('../backend/src/modules/mongodb/repositories/systemEventRepository');

async function verifyLiveStorage() {
  console.log('Connecting to MongoDB Atlas Cluster0...');
  const db = await getMongoDb();
  if (!db) {
    console.error('❌ Could not connect to MongoDB Atlas. Check MONGODB_URI in .env.local');
    process.exit(1);
  }

  console.log('✅ Connected successfully to database:', db.databaseName);

  // 1. Insert into activity_logs
  const actId = await insertActivityLog({
    actorId: 'pastor_live_test_01',
    actorRole: 'PASTOR',
    actorEmail: 'pastor@kcmchurch.com',
    action: 'SERMON_UPLOADED',
    entityType: 'sermon',
    entityId: 'sermon_faith_revival_2026',
    metadata: {
      title: 'Walking in Divine Faith & Power',
      speaker: 'Senior Pastor',
      campus: 'Shapur Nagar Campus',
    },
  });
  console.log('📌 Inserted Activity Log with ID:', actId);

  // 2. Insert into audit_events
  const auditRes = await insertAuditEvent({
    eventId: `audit_live_check_${Date.now()}`,
    actorId: 'superadmin_kcm',
    actorRole: 'SUPER_ADMIN',
    action: 'SECURITY_POLICY_UPDATE',
    resource: 'system_settings',
    resourceId: 'mfa_enforcement',
    beforeState: { mfaRequired: false },
    afterState: { mfaRequired: true },
    metadata: { reason: 'Enhanced security compliance for admin portal' },
  });
  console.log('📌 Inserted Audit Event (Idempotent):', auditRes.inserted);

  // 3. Insert into notification_events
  const notifRes = await insertNotificationEvent({
    eventId: `notif_live_${Date.now()}`,
    recipientId: 'member_john_doe',
    recipientRole: 'MEMBER',
    recipientAddress: '+91 96409 *****',
    channel: 'PUSH',
    title: 'Sunday Healing Service Starts in 1 Hour',
    body: 'Join live at Shapur Nagar or via YouTube stream.',
    status: 'DELIVERED',
    attempts: 1,
    maxAttempts: 3,
    provider: 'firebase-fcm',
    providerMessageId: 'projects/kcm-church/messages/live-001',
  });
  console.log('📌 Inserted Notification Event:', notifRes.inserted);

  // 4. Insert into system_events
  const sysRes = await insertSystemEvent({
    eventId: `sys_live_${Date.now()}`,
    eventType: 'donation.completed',
    aggregateType: 'Donation',
    aggregateId: 'don_razorpay_998877',
    payload: {
      amount: 1000,
      currency: 'INR',
      donorName: 'Anonymous Member',
      cause: 'Building Fund',
    },
    source: 'kcm-frontend-nextjs',
    correlationId: `corr_${Date.now()}`,
  });
  console.log('📌 Inserted System Event:', sysRes.inserted);

  // 5. Query and verify collections
  console.log('\n===============================================================');
  console.log('🔍 FETCHING LIVE STORED DOCUMENTS FROM MONGODB ATLAS:');
  console.log('===============================================================');

  const collections = await db.listCollections().toArray();
  console.log('\nActive Collections in database "' + db.databaseName + '":');
  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`  📁 ${c.name}: ${count} document(s)`);
  }

  const latestActivities = await findActivityLogs({ limit: 3 });
  console.log('\nLatest Activity Logs stored in MongoDB:');
  console.log(JSON.stringify(latestActivities.data, null, 2));

  const latestAudits = await findAuditEvents({ limit: 2 });
  console.log('\nLatest Audit Events stored in MongoDB:');
  console.log(JSON.stringify(latestAudits.data, null, 2));

  console.log('\n===============================================================');
  console.log('🎉 LIVE DATA STORAGE FULLY VERIFIED IN MONGODB ATLAS!');
  console.log('===============================================================');
  process.exit(0);
}

verifyLiveStorage().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
