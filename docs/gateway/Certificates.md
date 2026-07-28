# Certificates — KCM Church Gateway Platform

## Certificate Resource

**File:** [`platform/gateway/certificates/kcm-tls-cert.yaml`](../../platform/gateway/certificates/kcm-tls-cert.yaml)

**Secret Name:** `kcm-tls-cert`  
**Namespace:** `kcm-system`  
**Issuer:** `letsencrypt-prod` (ClusterIssuer)

## Certificate Details

| Property | Value |
|---|---|
| Algorithm | RSA 2048 |
| Duration | 90 days (2160h) |
| Renewal | 15 days before expiry (360h) |
| Rotation Policy | Always (new key on renewal) |
| Subject Organization | Kingdom of Christ Ministries |
| Subject Country | IN (India) |
| Subject Locality | Hyderabad |

## SAN (Subject Alternative Names)

```
kcmchurch.org
www.kcmchurch.org
api.kcmchurch.org
admin.kcmchurch.org
pastor.kcmchurch.org
member.kcmchurch.org
ngo.kcmchurch.org
```

## Automatic Renewal Flow

```
Day 75 (15 days before expiry)
    → cert-manager creates new ACME Order
    → Envoy Gateway serves HTTP-01 challenge
    → Let's Encrypt verifies and issues new cert
    → cert-manager stores new cert in Secret kcm-tls-cert
    → Envoy Gateway hot-reloads TLS certificate (no downtime)
```

## Check Certificate Status

```bash
# Current status
kubectl get certificate kcm-tls-cert -n kcm-system

# Full details
kubectl describe certificate kcm-tls-cert -n kcm-system

# Expiry date
kubectl get secret kcm-tls-cert -n kcm-system \
  -o jsonpath='{.data.tls\.crt}' | base64 -d | \
  openssl x509 -noout -enddate

# All SANs
kubectl get secret kcm-tls-cert -n kcm-system \
  -o jsonpath='{.data.tls\.crt}' | base64 -d | \
  openssl x509 -noout -text | grep DNS:
```

## Staging vs Production

For initial setup:
1. Set `issuerRef.name: letsencrypt-staging` in `kcm-tls-cert.yaml`
2. Validate ACME challenge flow works
3. Delete the staging secret: `kubectl delete secret kcm-tls-cert -n kcm-system`
4. Switch `issuerRef.name: letsencrypt-prod`
5. cert-manager auto-issues production certificate
