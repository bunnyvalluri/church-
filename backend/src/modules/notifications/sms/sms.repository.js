/**
 * backend/src/modules/notifications/sms/sms.repository.js
 * ─────────────────────────────────────────────────────────────────────────────
 * PostgreSQL / Prisma repository layer for SMS records, member preferences,
 * and audit logs with robust offline & defensive schema handling.
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

  get smsModel() {
    return this.prisma.smsMessage || this.prisma.sms_messages || null;
  }

  get prefModel() {
    return this.prisma.memberNotificationPreference || this.prisma.member_notification_preferences || null;
  }

  get auditModel() {
    return this.prisma.smsAuditLog || this.prisma.sms_audit_logs || null;
  }

  /**
   * Creates a new SMS message record. If duplicate idempotency key is found, returns existing record.
   *
   * @param {Object} data
   * @returns {Promise<any>}
   */
  async createMessage(data) {
    if (!this.smsModel) {
      // Fallback in-memory synthetic record
      const synthetic = {
        id: `sms_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        ...data,
        status: data.status || SMS_STATUS.QUEUED,
        attempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return { message: synthetic, isDuplicate: false };
    }

    if (data.idempotencyKey) {
      const existing = await this.smsModel.findUnique({
        where: { idempotencyKey: data.idempotencyKey },
      });
      if (existing) {
        return { message: existing, isDuplicate: true };
      }
    }

    const message = await this.smsModel.create({
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
    if (!this.smsModel) return null;
    return this.smsModel.findUnique({
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
    if (!providerMessageId || !this.smsModel) return null;
    return this.smsModel.findUnique({
      where: { providerMessageId },
    });
  }

  /**
   * Finds an SMS message by idempotency key.
   * @param {string} idempotencyKey
   */
  async findByIdempotencyKey(idempotencyKey) {
    if (!idempotencyKey || !this.smsModel) return null;
    return this.smsModel.findUnique({
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
    if (!this.smsModel) return { id, ...updateData };
    return this.smsModel.update({
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
    const model = this.smsModel;
    if (!model || typeof model.findMany !== 'function') return [];
    const now = new Date();
    try {
      return await model.findMany({
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
    } catch {
      return [];
    }
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
    if (!this.smsModel) {
      return { items: [], total: 0, page, limit, totalPages: 1 };
    }

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

    try {
      const [total, items] = await Promise.all([
        this.smsModel.count({ where }),
        this.smsModel.findMany({
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
    } catch {
      return { items: [], total: 0, page, limit, totalPages: 1 };
    }
  }

  /**
   * Aggregates SMS statistics across all time and recent delivery metrics.
   */
  async getStats() {
    if (!this.smsModel) {
      return {
        total: 0,
        queued: 0,
        processing: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        retrying: 0,
        expired: 0,
        cancelled: 0,
        deliveryRate: 0,
        failureRate: 0,
      };
    }

    try {
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
        this.smsModel.count(),
        this.smsModel.count({ where: { status: SMS_STATUS.QUEUED } }),
        this.smsModel.count({ where: { status: SMS_STATUS.PROCESSING } }),
        this.smsModel.count({ where: { status: SMS_STATUS.SENT } }),
        this.smsModel.count({ where: { status: SMS_STATUS.DELIVERED } }),
        this.smsModel.count({ where: { status: SMS_STATUS.FAILED } }),
        this.smsModel.count({ where: { status: SMS_STATUS.RETRYING } }),
        this.smsModel.count({ where: { status: SMS_STATUS.EXPIRED } }),
        this.smsModel.count({ where: { status: SMS_STATUS.CANCELLED } }),
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
    } catch {
      return {
        total: 0,
        queued: 0,
        processing: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        retrying: 0,
        expired: 0,
        cancelled: 0,
        deliveryRate: 0,
        failureRate: 0,
      };
    }
  }

  /**
   * Retrieves or creates default notification preferences for a member.
   *
   * @param {string} userId
   */
  async getMemberPreference(userId) {
    if (!userId || !this.prefModel) return null;

    try {
      let pref = await this.prefModel.findUnique({
        where: { userId },
      });

      if (!pref) {
        pref = await this.prefModel.create({
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
    } catch {
      return {
        userId,
        smsEnabled: true,
        emailEnabled: true,
        pushEnabled: true,
        events: true,
      };
    }
  }

  /**
   * Updates notification preferences for a member.
   *
   * @param {string} userId
   * @param {Object} data
   */
  async updateMemberPreference(userId, data) {
    if (!userId || !this.prefModel) return { userId, ...data };
    try {
      return await this.prefModel.upsert({
        where: { userId },
        create: { userId, ...data },
        update: data,
      });
    } catch {
      return { userId, ...data };
    }
  }

  /**
   * Records an audit log for an SMS administrative event.
   *
   * @param {Object} data
   */
  async recordAuditLog(data) {
    if (!this.auditModel) return null;
    try {
      return await this.auditModel.create({
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
