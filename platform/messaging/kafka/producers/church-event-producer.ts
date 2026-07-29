import { KcmKafkaProducerService } from './kafka-producer.service';
import { ChurchEventCreatedEvent } from './event-schemas';

export class ChurchEventProducer {
  constructor(private producerService: KcmKafkaProducerService) {}

  public async publishChurchEventCreated(event: ChurchEventCreatedEvent, traceparent?: string): Promise<void> {
    await this.producerService.publishEvent(
      'event.events',
      event.eventId,
      event,
      'org.kcm.church.event.created',
      traceparent
    );
  }
}
