# Grafana Alloy Log Collector Architecture

## Overview
Grafana Alloy is deployed as a Kubernetes DaemonSet across all worker nodes to discover container stdout/stderr logs via Container Runtime Interface (CRI) sockets and system journals.

```
/var/log/pods/*/*/*.log
         |
         v
+------------------+
| CRI Stage        | ---> Parses log header timestamp & stream (stdout/stderr)
+--------+---------+
         |
         v
+------------------+
| JSON Stage       | ---> Extracts correlation_id, trace_id, level, user_id
+--------+---------+
         |
         v
+------------------+
| Labels Stage     | ---> Promotes namespace, app, container, level, category
+--------+---------+
         |
         v
+------------------+
| Loki Push Stage  | ---> Batch buffers 1MB & sends HTTP POST to Loki Gateway
+------------------+
```
