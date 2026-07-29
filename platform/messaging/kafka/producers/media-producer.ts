import { KcmKafkaProducerService } from './kafka-producer.service';
import { MediaUploadedEvent } from './event-schemas';

export class MediaProducer {
  constructor(private producerService: KcmKafkaProducerService) {}

  public async publishMediaUploaded(event: MediaUploadedEvent, traceparent?: string): Promise<void> {
    await this.producerService.publishEvent(
      'media.events',
      event.mediaId,
      event,
      'org.kcm.media.uploaded',
      traceparent
    );
  }
}
