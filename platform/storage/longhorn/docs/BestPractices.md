# Production Best Practices (Longhorn & CNCF)

## Architectural Best Practices

1. **Dedicated Storage Nodes / SSDs**:
   - Utilize high-speed NVMe/SSD storage for database workloads (`longhorn-cloudnativepg`).
   - Dedicated disk mounts for Longhorn (`/var/lib/longhorn`) distinct from OS root disk `/`.

2. **Replica Count & Anti-Affinity**:
   - Always run `defaultReplicaCount: 3` for production workloads across distinct physical nodes or availability zones.
   - Enable `replicaZoneSoftAntiAffinity: true` and `replicaSoftAntiAffinity: true`.

3. **Database Data Locality**:
   - Use `dataLocality: strict-local` for CloudNativePG PostgreSQL to eliminate network overhead for local reads/writes while keeping synchronous remote replicas for failover.

4. **Resource Guarantees**:
   - Allocate CPU requests for Longhorn Instance Manager (`guaranteedEngineCPU: 250m`) to prevent CPU throttling from stalling storage IO under heavy load.

5. **Regular S3 Backup Verification**:
   - Schedule automated monthly backup restore dry-runs into a staging environment to guarantee disaster recovery readiness.
