import { KcmKafkaConsumerService } from './kafka-consumer.service';

export class SearchConsumer {
  private consumerService: KcmKafkaConsumerService;

  constructor() {
    this.consumerService = new KcmKafkaConsumerService('kcm-search-indexing-group');
  }

  public async start(): Promise<void> {
    await this.consumerService.subscribeAndListen(
      ['member.events', 'pastor.events', 'event.events', 'media.events'],
      async (data, key, headers) => {
        console.log(`[Search Indexer] Updating search index for resource key: ${key}`);
        // Reindex media, sermons, and member records in search store
      }
    );
  }
}
