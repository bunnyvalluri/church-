import { KcmKafkaConsumerService } from './kafka-consumer.service';

export class AuditConsumer {
  private consumerService: KcmKafkaConsumerService;

  constructor() {
    this.consumerService = new KcmKafkaConsumerService('kcm-audit-processing-group');
  }

  public async start(): Promise<void> {
    await this.consumerService.subscribeAndListen(
      ['audit.events'],
      async (data, key, headers) => {
        console.log(`[Audit Worker] Indexing audit log event: ${key} into long-term audit store.`);
        // Write to PostgreSQL / CloudNativePG audit archive
      }
    );
  }
}
