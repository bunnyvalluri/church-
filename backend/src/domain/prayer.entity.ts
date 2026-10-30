/**
 * src/domain/prayer.entity.ts
 * Prayer Request domain entity with pastoral care routing and privacy scopes.
 */

import { BadRequestError } from '../shared/errors';

export type PrayerPrivacy = 'PUBLIC' | 'MEMBERS_ONLY' | 'PASTORS_ONLY';
export type PrayerStatus = 'PENDING' | 'ASSIGNED' | 'PRAYING' | 'ANSWERED';

export class PrayerRequestEntity {
  constructor(
    public readonly id: string,
    public readonly requesterName: string,
    public readonly requesterEmail: string | null,
    public readonly requesterPhone: string | null,
    public readonly title: string,
    public readonly description: string,
    public readonly isAnonymous: boolean,
    public readonly privacy: PrayerPrivacy,
    public status: PrayerStatus = 'PENDING',
    public assignedPastorId: string | null = null,
    public prayerCount = 0,
    public readonly createdAt: Date = new Date()
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.title || this.title.trim().length === 0) {
      throw new BadRequestError('Prayer title is required.');
    }
    if (!this.description || this.description.trim().length === 0) {
      throw new BadRequestError('Prayer description is required.');
    }
  }

  public assignToPastor(pastorId: string): void {
    this.assignedPastorId = pastorId;
    this.status = 'ASSIGNED';
  }

  public incrementPrayerCount(): void {
    this.prayerCount += 1;
    if (this.status === 'PENDING') {
      this.status = 'PRAYING';
    }
  }

  public markAnswered(): void {
    this.status = 'ANSWERED';
  }
}

