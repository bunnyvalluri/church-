# Point-in-Time Recovery (PITR) Guide

## Recovery Process
CloudNativePG allows recovering to any arbitrary microsecond timestamp within the 30-day WAL retention period.

```yaml
bootstrap:
  recovery:
    source: kcm-db-cluster
    targetTime: "2026-07-29 02:00:00.000000+00"
```
