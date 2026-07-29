# Production Kafka Topic Architecture & Schemas

## Topic Matrix

| Topic Name | Partitions | RF | min.insync | Retention | Cleanup Policy | Compression |
|---|---|---|---|---|---|---|
| `user.events` | 6 | 3 | 2 | 30 Days | delete | zstd |
| `auth.events` | 6 | 3 | 2 | 30 Days | delete | zstd |
| `member.events` | 6 | 3 | 2 | 90 Days | compact | zstd |
| `pastor.events` | 3 | 3 | 2 | 90 Days | compact | zstd |
| `prayer.events` | 6 | 3 | 2 | 60 Days | delete | zstd |
| `donation.events` | 12 | 3 | 2 | 7 Years | compact,delete | zstd |
| `event.events` | 6 | 3 | 2 | 60 Days | delete | zstd |
| `media.events` | 6 | 3 | 2 | 30 Days | delete | zstd |
| `notification.events` | 12 | 3 | 2 | 7 Days | delete | snappy |
| `audit.events` | 12 | 3 | 2 | 7 Years | compact,delete | zstd |
| `email.events` | 6 | 3 | 2 | 7 Days | delete | snappy |
| `sms.events` | 6 | 3 | 2 | 7 Days | delete | snappy |
| `analytics.events` | 12 | 3 | 2 | 90 Days | delete | zstd |

## Partitioning Strategy
- **Key-Based Partitioning**: All events are keyed by domain entity ID (e.g., `userId`, `donationId`, `eventId`) ensuring sequential order per entity.
