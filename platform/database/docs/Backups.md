# Backup & Retention Policy Documentation

## Strategy
- **Continuous Archiving**: PostgreSQL WAL files are shipped to S3 in real-time (`gzip` compressed).
- **Automated Base Backups**: Daily physical snapshots executed at 02:00 AM UTC via `ScheduledBackup`.
- **Retention Period**: 30 Days automatic retention policy managed by CloudNativePG Barman engine.
