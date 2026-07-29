import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { DlqHandler } from './dlq-handler';

export interface MessageHandler<T = any> {
  (data: T, key: string, headers: Record<string, string>): Promise<void>;
}

export class KcmKafkaConsumerService {
  private kafka: Kafka;
  private consumer: Consumer;
  private dlqHandler: DlqHandler;

  constructor(groupId: string) {
    const brokers = (process.env.KAFKA_BROKERS || 'kcm-kafka.messaging.svc.cluster.local:9092').split(',');
    
    this.kafka = new Kafka({
      clientId: `kcm-consumer-${groupId}`,
      brokers,
      ssl: process.env.KAFKA_SSL_ENABLED === 'true',
      sasl: process.env.KAFKA_SASL_ENABLED === 'true' ? {
        mechanism: 'scram-sha-512',
        username: process.env.KAFKA_SASL_USERNAME || 'kcm-consumer-user',
        password: process.env.KAFKA_SASL_PASSWORD || 'secret-consumer-password'
      } : undefined
    });

    this.consumer = this.kafka.consumer({
      groupId,
      allowAutoTopicCreation: false,
      sessionTimeout: 30000,
      heartbeatInterval: 3000
    });

    this.dlqHandler = new DlqHandler();
  }

  public async subscribeAndListen<T>(
    topics: string[],
    handler: MessageHandler<T>
  ): Promise<void> {
    await this.consumer.connect();
    console.log(`KCM Consumer connected for topics: ${topics.join(', ')}`);

    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
    }

    await this.consumer.run({
      autoCommit: false,
      eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
        const key = message.key ? message.key.toString() : '';
        const rawValue = message.value ? message.value.toString() : '';
        const headers: Record<string, string> = {};
        
        if (message.headers) {
          for (const [k, v] of Object.entries(message.headers)) {
            headers[k] = v ? v.toString() : '';
          }
        }

        try {
          const parsedPayload = JSON.parse(rawValue);
          await handler(parsedPayload, key, headers);

          // Manual offset commit after successful execution
          await this.consumer.commitOffsets([
            { topic, partition, offset: (BigInt(message.offset) + BigInt(1)).toString() }
          ]);
        } catch (error: any) {
          console.error(`Error processing message offset ${message.offset} on topic ${topic}:`, error);
          await this.dlqHandler.sendToDlq(topic, key, rawValue, error, headers['traceparent']);
          
          // Commit offset after DLQ routing to prevent consumer blocking
          await this.consumer.commitOffsets([
            { topic, partition, offset: (BigInt(message.offset) + BigInt(1)).toString() }
          ]);
        }
      }
    });
  }

  public async disconnect(): Promise<void> {
    await this.consumer.disconnect();
    console.log('KCM Consumer disconnected.');
  }
}
