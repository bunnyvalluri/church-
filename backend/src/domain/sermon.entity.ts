/**
 * src/domain/sermon.entity.ts
 * Sermon domain entity for biblical teaching records, audio/video streams, and engagement.
 */

import { BadRequestError } from '../shared/errors';

export class SermonEntity {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly preacher: string,
    public readonly scripture: string,
    public readonly date: Date,
    public readonly videoUrl?: string | null,
    public readonly audioUrl?: string | null,
    public readonly branchId?: string | null,
    public viewCount = 0,
    public likeCount = 0
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.title || this.title.trim().length === 0) {
      throw new BadRequestError('Sermon title is required.');
    }
    if (!this.preacher || this.preacher.trim().length === 0) {
      throw new BadRequestError('Preacher name is required.');
    }
  }

  public recordView(): void {
    this.viewCount += 1;
  }

  public recordLike(): void {
    this.likeCount += 1;
  }
}

