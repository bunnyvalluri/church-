import { KcmKafkaProducerService } from './kafka-producer.service';
import { DonationProcessedEvent } from './event-schemas';

export class DonationProducer {
  constructor(private producerService: KcmKafkaProducerService) {}

  public async publishDonationProcessed(event: DonationProcessedEvent, traceparent?: string): Promise<void> {
    await this.producerService.publishEvent(
      'donation.events',
      event.donationId,
      event,
      'org.kcm.donation.processed',
      traceparent
    );
  }
}
