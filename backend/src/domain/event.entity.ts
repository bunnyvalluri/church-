/**
 * src/domain/event.entity.ts
 * Church Event entity with seat allocation and registration invariants.
 */

import { BadRequestError } from '../shared/errors';

export class EventEntity {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly slug: string,
    public readonly description: string,
    public readonly date: Date,
    public readonly time: string,
    public readonly location: string,
    public readonly branchId: string | null,
    public readonly registrationRequired: boolean,
    public readonly registrationLimit: number | null,
    public remainingSeats: number | null,
    public readonly status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'COMPLETED' = 'PUBLISHED'
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.title || this.title.trim().length === 0) {
      throw new BadRequestError('Event title is required.');
    }
  }

  public canRegister(): boolean {
    if (!this.registrationRequired) return true;
    if (this.remainingSeats !== null && this.remainingSeats <= 0) return false;
    return this.status === 'PUBLISHED';
  }

  public reserveSeat(): void {
    if (!this.canRegister()) {
      throw new BadRequestError('Event registration is full or closed.');
    }
    if (this.remainingSeats !== null) {
      this.remainingSeats -= 1;
    }
  }
}

