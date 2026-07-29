import { KcmKafkaConsumerService } from './kafka-consumer.service';

export class NotificationConsumer {
  private consumerService: KcmKafkaConsumerService;

  constructor() {
    this.consumerService = new KcmKafkaConsumerService('kcm-notification-service-group');
  }

  public async start(): Promise<void> {
    await this.consumerService.subscribeAndListen(
      ['notification.events', 'email.events', 'sms.events'],
      async (data, key, headers) => {
        console.log(`[Notification Worker] Processing event ${data.type || 'notification'} for key: ${key}`);
        // Dispatch Email / SMS / Push Notification logic here
      }
    );
  }
}
