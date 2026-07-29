import { KcmKafkaProducerService } from './kafka-producer.service';
import { AuditLogEvent } from './event-schemas';

export class AuditProducer {
  constructor(private producerService: KcmKafkaProducerService) {}

  public async publishAuditLog(event: AuditLogEvent, traceparent?: string): Promise<void> {
    await this.producerService.publishEvent(
      'audit.events',
      event.auditId,
      event,
      'org.kcm.audit.logged',
      traceparent
    );
  }
}
