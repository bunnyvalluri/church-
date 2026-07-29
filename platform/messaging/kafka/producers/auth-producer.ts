import { KcmKafkaProducerService } from './kafka-producer.service';
import { UserRegisteredEvent } from './event-schemas';

export class AuthProducer {
  constructor(private producerService: KcmKafkaProducerService) {}

  public async publishUserRegistered(event: UserRegisteredEvent, traceparent?: string): Promise<void> {
    await this.producerService.publishEvent(
      'auth.events',
      event.userId,
      event,
      'org.kcm.auth.user.registered',
      traceparent
    );
  }
}
