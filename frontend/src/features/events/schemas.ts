import { z } from 'zod';

export interface ChurchEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  campusId?: string;
  capacity?: number;
  registeredCount: number;
  imageUrl?: string;
  category: 'WORSHIP' | 'BIBLE_STUDY' | 'YOUTH' | 'CONFERENCE' | 'COMMUNITY' | 'PRAYER';
  isVirtual?: boolean;
  virtualLink?: string;
  requiresRegistration: boolean;
}

export const eventRegistrationSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  attendeeName: z.string().min(2, 'Name is required'),
  attendeeEmail: z.string().email('Valid email is required'),
  attendeePhone: z.string().min(10, 'Valid phone number is required'),
  seatsReserved: z.number().int().min(1).max(5).default(1),
  specialNotes: z.string().max(300).optional(),
});

export type EventRegistrationData = z.infer<typeof eventRegistrationSchema>;

