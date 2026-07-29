# JetStream Persistence & Stream Engine Architecture

## Overview
JetStream provides persistence, message deduplication, durable subscriptions, stream replay, and Key-Value/Object store capabilities for KCM Church.

## Configured Streams Overview

| Stream Name | Storage | Replicas | Retention Policy | Max Age | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `KCM_EVENTS_STREAM` | File | 3 | Limits | 7 Days | Core Domain Events (`auth`, `users`, `members`, `pastors`) |
| `KCM_NOTIFICATIONS_STREAM` | File | 3 | WorkQueue | N/A | Email, SMS, Push Notification Job Queue |
| `KCM_MEDIA_STREAM` | File | 3 | WorkQueue | N/A | Sermon Video Transcoding & Processing |
| `KCM_AUDIT_STREAM` | File | 3 | Limits | 90 Days | Immutable Security & Donation Audit Logs |
| `KCM_PRAYER_STREAM` | File | 3 | Limits | 30 Days | Real-time Prayer Requests & Intercession |

## Consumer Delivery Policies
- **Explicit Acknowledgments (`ackPolicy: explicit`)**: Every message must be explicitly acknowledged by worker routines.
- **Max Deliveries (`maxDeliver: 3 to 5`)**: Automatically moves unprocessable messages to Dead Letter Queue after max retries.
- **De-duplication Window**: 2 minutes deduplication window based on `Nats-Msg-Id` headers.
