# Secret Scanning Documentation

## Overview
Trivy Secret Scanning guards against accidental leakage of sensitive credentials, API tokens, database connection strings, and private keys across source code, Git history, container layers, and Kubernetes resources.

---

## 1. Secret Detection Patterns

| Category | Pattern Target | Example Match | Severity |
| :--- | :--- | :--- | :--- |
| **Firebase Auth** | Private Key | `-----BEGIN PRIVATE KEY-----` | CRITICAL |
| **PostgreSQL** | Database Connection String | `postgresql://<USER>:<PASSWORD>@<HOST>:5432/<DB>` | CRITICAL |
| **Cloudinary** | API Secret | `cloudinary://<API_KEY>:<SECRET>@<CLOUD_NAME>` | HIGH |
| **RSA / SSH** | Private Keys | `-----BEGIN RSA PRIVATE KEY-----` | CRITICAL |
| **JWT / Tokens** | Bearer Tokens | `eyJhbGciOiJIUzI1Ni...` | HIGH |

---

## 2. Prevention & Incident Mitigation
- **Pre-commit Scan**: Local developer check `trivy fs --security-checks secret .`
- **PR Gate**: GitHub Actions blocks PR if secret detected in diff.
- **Runtime Secret Scan**: Trivy Operator scans mounted ConfigMaps and environment blocks.
