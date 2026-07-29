import { Kafka, Producer, ProducerRecord, RecordMetadata, CompressionTypes } from 'kafkajs';
import { CloudEvent } from './event-schemas';

export class KcmKafkaProducerService {
  private kafka: Kafka;
  private producer: Producer;
  private isConnected = false;

  constructor() {
    const brokers = (process.env.KAFKA_BROKERS || 'kcm-kafka.messaging.svc.cluster.local:9092').split(',');
    
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'kcm-backend-producer',
      brokers,
      ssl: process.env.KAFKA_SSL_ENABLED === 'true',
      sasl: process.env.KAFKA_SASL_ENABLED === 'true' ? {
        mechanism: 'scram-sha-512',
        username: process.env.KAFKA_SASL_USERNAME || 'kcm-producer-user',
        password: process.env.KAFKA_SASL_PASSWORD || 'secret-producer-password'
      } : undefined,
      retry: {
        initialRetryTime: 300,
        retries: 8
      }
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: false,
      idempotent: true,
      maxInFlightRequests: 1,
      transactionTimeout: 30000
    });
  }

  public async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.producer.connect();
      this.isConnected = true;
      console.log('KCM Kafka Producer connected successfully.');
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.producer.disconnect();
      this.isConnected = false;
      console.log('KCM Kafka Producer disconnected.');
    }
  }

  public async publishEvent<T>(
    topic: string,
    key: string,
    eventData: T,
    eventType: string,
    traceparent?: string
  ): Promise<RecordMetadata[]> {
    await this.connect();

    const cloudEvent: CloudEvent<T> = {
      specversion: '1.0',
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      source: process.env.SERVICE_NAME || 'kcm-backend-service',
      type: eventType,
      datacontenttype: 'application/json',
      time: new Date().toISOString(),
      data: eventData,
      traceparent
    };

    const record: ProducerRecord = {
      topic,
      messages: [
        {
          key: Buffer.from(key),
          value: JSON.stringify(cloudEvent),
          headers: {
            'content-type': 'application/cloudevents+json',
            'traceparent': traceparent || ''
          }
        }
      ],
      compression: CompressionTypes.ZSTD,
      acks: -1 // Equivalent to acks=all
    };

    return await this.producer.send(record);
  }
}
