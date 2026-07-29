// CloudEvents v1.0 Compliant Event Schemas for KCM Church Event Platform

export interface CloudEvent<T = any> {
  specversion: "1.0";
  id: string;
  source: string;
  type: string;
  datacontenttype: "application/json";
  subject?: string;
  time: string; // ISO 8601 string
  data: T;
  traceparent?: string;
}

export interface UserRegisteredEvent {
  userId: string;
  email: string;
  role: "MEMBER" | "PASTOR" | "ADMIN";
  registeredAt: string;
}

export interface DonationProcessedEvent {
  donationId: string;
  donorUserId: string;
  amount: number;
  currency: string;
  campaignId: string;
  paymentMethod: "CARD" | "BANK_TRANSFER" | "PAYPAL";
  status: "SUCCESS" | "FAILED";
  timestamp: string;
}

export interface ChurchEventCreatedEvent {
  eventId: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  organizerUserId: string;
}

export interface MediaUploadedEvent {
  mediaId: string;
  title: string;
  mediaType: "SERMON_AUDIO" | "SERVICE_VIDEO" | "BULLETIN_PDF";
  storageUrl: string;
  uploadedByUserId: string;
}

export interface AuditLogEvent {
  auditId: string;
  actorUserId: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  ipAddress: string;
  timestamp: string;
}
