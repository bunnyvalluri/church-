# Unified Alerting Specification

**Project**: Kingdom of Christ Ministries (KCM Church)  

---

## Alert Rules Reference

### Critical Infrastructure Alerts (`monitoring/alerts/infrastructure-alerts.yaml`)
- `KubernetesNodeNotReady`: Node in NotReady status > 2m (Critical)
- `HighClusterCPUUsage`: Cluster CPU > 85% for 5m (Warning)
- `HighClusterMemoryUsage`: Cluster Memory > 90% for 5m (Critical)
- `KubernetesDiskSpaceCritical`: Disk usage > 85% (Critical)
- `PodCrashLoopBackOff`: Pod restart rate > 2 in 5m (Critical)
- `SSLCertificateExpiringSoon`: SSL Cert expiry < 14 days (Warning)

### Application Alerts (`monitoring/alerts/application-alerts.yaml`)
- `DatabaseDown`: PostgreSQL `pg_up == 0` (Critical)
- `RedisCacheDown`: Redis `redis_up == 0` (Critical)
- `HighAPIErrorRate`: HTTP 5xx Error Rate > 2% (Critical)
- `HighAPILatency`: P95 API Latency > 2s (Warning)
- `ArgoCDAppSyncFailed`: Argo CD App OutOfSync > 10m (Warning)
