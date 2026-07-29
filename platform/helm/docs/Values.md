# Helm Configuration & Values Management Guide

## 1. Multi-Environment Architecture

Every chart contains environment-specific values files:

| File | Environment Target | Typical Configurations |
| :--- | :--- | :--- |
| `values.yaml` | Default Baseline | Safe baseline parameters, standard labels, probes |
| `values-production.yaml` | Production HA | High replicas (3+), PDBs enabled, strictly anti-affine, large memory/CPU |
| `values-staging.yaml` | Staging Integration | 2 replicas, medium memory/CPU, staging endpoints |
| `values-development.yaml` | Sandbox Dev | 1 replica, low memory/CPU, local endpoints |
