import { KcmKafkaProducerService } from '../producers/kafka-producer.service';

export class DlqHandler {
  private producerService: KcmKafkaProducerService;

  constructor() {
    this.producerService = new KcmKafkaProducerService();
  }

  public async sendToDlq(
    originalTopic: string,
    key: string,
    payload: any,
    error: Error,
    traceparent?: string
  ): Promise<void> {
    const dlqTopic = `${originalTopic}.DLQ`;
    console.error(`Routing message key ${key} from ${originalTopic} to DLQ ${dlqTopic} due to error: ${error.message}`);
    
    await this.producerService.publishEvent(
      dlqTopic,
      key,
      {
        originalPayload: payload,
        failureReason: error.message,
        stack: error.stack,
        failedAt: new Date().toISOString()
      },
      'org.kcm.dlq.poisoned_message',
      traceparent
    );
  }
}
