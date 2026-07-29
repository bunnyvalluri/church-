# Backend Node.js Express Helm Chart - KCM Church

## Overview
Deploys the production Node.js + Express.js + Prisma ORM backend service for KCM Church.

## Features
- **Hook-Driven Database Migration**: Automated `npx prisma migrate deploy` executing as a Helm `pre-install,pre-upgrade` job.
- **HPA & PDB Enabled**: High-availability auto-scaling with PodDisruptionBudget.
- **Subchart Integrations**: Built-in support for CloudNativePG, Redis, Kafka, and NATS subcharts.
