# KCM Real-Time WebSocket & Socket.io Architecture

## 1. Connection Lifecycle & Authentication
Real-time messaging for live stream chat, pastor announcements, and admin dashboards is provided via Socket.io:

```
[Browser / Mobile Client] ──(Connect with JWT in auth payload)──> [Socket.io Gateway]
                                                                        |
                                                                        v
                                                          [Validate Session Token]
                                                                        |
                                                                        v
                                                         [Join Authorized Rooms]
                                                         (e.g. branch:shapur, role:pastor)
```

## 2. Room Authorization & Isolation
- **Branch Rooms**: Clients may only join rooms for branches they belong to or public live stream rooms (`room:livestream`).
- **Administrative Channels**: Broadcast channels (`channel:admin-alerts`) require `ADMIN` or `SUPER_ADMIN` JWT claims.
- **Heartbeat & Disconnection**: 25-second ping interval, 60-second timeout with automatic client reconnect backoff.
