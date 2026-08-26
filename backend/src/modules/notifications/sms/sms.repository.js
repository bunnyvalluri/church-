/**
 * backend/src/modules/notifications/sms/sms.repository.js
 * ─────────────────────────────────────────────────────────────────────────────
 * PostgreSQL / Prisma repository layer for SMS records, member preferences,
 * and audit logs.
 * ─────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const { PrismaClient } = require('@prisma/client');
const { SMS_STATUS } = require('./sms.constants');

class SMSRepository {
  /**
   * @param {PrismaClient} [prisma]
   */
  constructor(prisma) {
    this.prisma = prisma || new PrismaClient();
  }

  /**
   * Creates a new SMS message record. If duplicate idempotency key is found, returns existing record.
   *
   * @param {Object} data
   * @returns {Promise<any>}
   */
  async createMessage(data) {
    if (data.idempotencyKey) {
      const existing = await this.prisma.smsMessage.findUnique({
        where: { idempotencyKey: data.idempotencyKey },
      });
      if (existing) {
        return { message: existing, isDuplicate: true };
      }
    }

    const message = await this.prisma.smsMessage.create({
      data: {
        notificationId: data.notificationId || null,
        memberId: data.memberId || null,
        phoneNumber: data.phoneNumber,
        normalizedPhoneNumber: data.normalizedPhoneNumber,
        message: data.message,
        provider: data.provider || 'httpsms',
        providerMessageId: data.providerMessageId || null,
        idempotencyKey: data.idempotencyKey || null,
        status: data.status || SMS_STATUS.QUEUED,
        attempts: data.attempts || 0,
        maxAttempts: data.maxAttempts || 3,
        scheduledAt: data.scheduledAt || null,
        expiresAt: data.expiresAt || null,
        metadata: data.metadata || {},
      },
    });

    return { message, isDuplicate: false };
  }

  /**
   * Finds an SMS message by internal CUID.
   * @param {string} id
   */
  async findById(id) {
    return this.prisma.smsMessage.findUnique({
      where: { id },
      include: {
        member: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
  }

  /**
   * Finds an SMS message by provider tracking ID.
   * @param {string} providerMessageId
   */
  async findByProviderMessageId(providerMessageId) {
    if (!providerMessageId) return null;
    return this.prisma.smsMessage.findUnique({
      where: { providerMessageId },
    });
  }

  /**
   * Finds an SMS message by idempotency key.
   * @param {string} idempotencyKey
   */
  async findByIdempotencyKey(idempotencyKey) {
    if (!idempotencyKey) return null;
    return this.prisma.smsMessage.findUnique({
      where: { idempotencyKey },
    });
  }

  /**
   * Updates status and metadata of an SMS message.
   *
   * @param {string} id
   * @param {Object} updateData
   */
  async updateMessage(id, updateData) {
    return this.prisma.smsMessage.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Queries pending or retryable messages ready for queue processing.
   *
   * @param {number} [limit=50]
   */
  async findPendingMessages(limit = 50) {
    const now = new Date();
    return this.prisma.smsMessage.findMany({
      where: {
        status: { in: [SMS_STATUS.QUEUED, SMS_STATUS.RETRYING] },
        OR: [
          { scheduledAt: null },
          { scheduledAt: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: now } },
            ],
          },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  /**
   * Lists messages with filtering, search, and pagination for admin dashboard.
   *
   * @param {Object} [params]
   * @param {number} [params.page=1]
   * @param {number} [params.limit=20]
   * @param {string} [params.status]
   * @param {string} [params.search]
   * @param {Date} [params.startDate]
   * @param {Date} [params.endDate]
   */
  async listMessages({ page = 1, limit = 20, status, search, startDate, endDate } = {}) {
    const skip = (Math.max(1, page) - 1) * limit;
    const where = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        { normalizedPhoneNumber: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { providerMessageId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [total, items] = await Promise.all([
      this.prisma.smsMessage.count({ where }),
      this.prisma.smsMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          member: { select: { id: true, name: true, email: true, phone: true } },
        },
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Aggregates SMS statistics across all time and recent delivery metrics.
   */
  async getStats() {
    const [
      total,
      queued,
      processing,
      sent,
      delivered,
      failed,
      retrying,
      expired,
      cancelled,
    ] = await Promise.all([
      this.prisma.smsMessage.count(),
      this.prisma.smsMessage.count({ where: { status: SMS_STATUS.QUEUED } }),
      this.prisma.smsMessage.count({ where: { status: SMS_STATUS.PROCESSING } }),
      this.prisma.smsMessage.count({ where: { status: SMS_STATUS.SENT } }),
      this.prisma.smsMessage.count({ where: { status: SMS_STATUS.DELIVERED } }),
      this.prisma.smsMessage.count({ where: { status: SMS_STATUS.FAILED } }),
      this.prisma.smsMessage.count({ where: { status: SMS_STATUS.RETRYING } }),
      this.prisma.smsMessage.count({ where: { status: SMS_STATUS.EXPIRED } }),
      this.prisma.smsMessage.count({ where: { status: SMS_STATUS.CANCELLED } }),
    ]);

    const deliveryRate = total > 0 ? Number(((delivered / total) * 100).toFixed(1)) : 0;
    const failureRate = total > 0 ? Number(((failed / total) * 100).toFixed(1)) : 0;

    return {
      total,
      queued,
      processing,
      sent,
      delivered,
      failed,
      retrying,
      expired,
      cancelled,
      deliveryRate,
      failureRate,
    };
  }

  /**
   * Retrieves or creates default notification preferences for a member.
   *
   * @param {string} userId
   */
  async getMemberPreference(userId) {
    if (!userId) return null;

    let pref = await this.prisma.memberNotificationPreference.findUnique({
      where: { userId },
    });

    if (!pref) {
      pref = await this.prisma.memberNotificationPreference.create({
        data: {
          userId,
          smsEnabled: true,
          emailEnabled: true,
          pushEnabled: true,
          events: true,
          sundayService: true,
          prayerMeetings: true,
          sermons: true,
          specialPrograms: true,
          donations: true,
          emergencyAlerts: true,
          youthPrograms: true,
        },
      });
    }

    return pref;
  }

  /**
   * Updates notification preferences for a member.
   *
   * @param {string} userId
   * @param {Object} data
   */
  async updateMemberPreference(userId, data) {
    return this.prisma.memberNotificationPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  /**
   * Records an audit log for an SMS administrative event.
   *
   * @param {Object} data
   */
  async recordAuditLog(data) {
    try {
      return await this.prisma.smsAuditLog.create({
        data: {
          userId: data.userId || null,
          role: data.role || null,
          action: data.action,
          recipientCount: data.recipientCount || 1,
          template: data.template || null,
          provider: data.provider || 'httpsms',
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
          status: data.status || 'SUCCESS',
          metadata: data.metadata || {},
        },
      });
    } catch (err) {
      console.warn('[SMSRepository] Failed to write SMS audit log:', err.message);
      return null;
    }
  }
}

module.exports = { SMSRepository };
