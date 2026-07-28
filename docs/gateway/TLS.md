# TLS & Certificates — KCM Church

## Overview

All KCM Church traffic is encrypted using TLS 1.2+. Certificates are automatically provisioned and renewed by **cert-manager** using **Let's Encrypt** (ACME HTTP-01 challenge via Gateway API).

## Certificate Coverage

| Domain | Type |
|---|---|
| `kcmchurch.org` | Primary |
| `www.kcmchurch.org` | Alias |
| `api.kcmchurch.org` | API subdomain |
| `admin.kcmchurch.org` | Admin portal |
| `pastor.kcmchurch.org` | Pastor portal |
| `member.kcmchurch.org` | Member portal |
| `ngo.kcmchurch.org` | NGO portal |

## Certificate Lifecycle

```
cert-manager detects Certificate resource
    → Creates ACME Order
    → Envoy Gateway serves ACME HTTP-01 challenge at /.well-known/acme-challenge/
    → Let's Encrypt validates
    → cert-manager stores cert in Secret: kcm-tls-cert
    → Gateway listener references Secret
    → Auto-renews 15 days before expiry (90-day cert)
```

## Issuers

| Issuer | Purpose | Use When |
|---|---|---|
| `letsencrypt-staging` | Testing ACME flow | Initial setup, testing |
| `letsencrypt-prod` | Production trusted certs | Production only |

## TLS Configuration

- **Minimum TLS version:** 1.2
- **Maximum TLS version:** 1.3
- **ALPN:** h2, http/1.1
- **Ciphers:** ECDHE-ECDSA/RSA + AES-GCM/CHACHA20 only
- **Key size:** RSA 2048

## Commands

```bash
# Check certificate status
kubectl get certificate kcm-tls-cert -n kcm-system

# Check certificate expiry
kubectl get certificate kcm-tls-cert -n kcm-system \
  -o jsonpath='{.status.notAfter}'

# Force certificate renewal
kubectl annotate certificate kcm-tls-cert -n kcm-system \
  cert-manager.io/issue-temporary-certificate="true"

# Check ClusterIssuer status
kubectl get clusterissuer letsencrypt-prod -o yaml
```

## Alerts

- `TLSCertificateExpiringSoon` — warns 14 days before expiry
- `TLSCertificateExpired` — critical when cert has expired
- `TLSHandshakeFailures` — warns on >1 failure/sec
