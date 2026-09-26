# Runbook: Certificate Expiry & TLS Failure

## 1. Symptoms & Trigger Conditions
- Alert: `SSLCertExpiringSoon` (< 14 days) or `TLSCertificateInvalid`.
- Browsers display `NET::ERR_CERT_COMMON_NAME_INVALID` or SSL handshake errors.

## 2. Immediate Diagnostic Actions
1. **Check cert-manager Certificate Resources**:
   ```bash
   kubectl get certificate,certificaterequest,order,challenge -n kcm-system
   ```
2. **Inspect Cert-Manager Controller Logs**:
   ```bash
   kubectl logs -n cert-manager -l app=cert-manager --tail=100
   ```

## 3. Containment & Remediation
- **Manual Renewal Trigger**:
  ```bash
  cmctl renew kcm-tls-cert -n kcm-system
  ```
- **Vercel / Edge Certificate Fallback**:
  If using Vercel DNS, verify automated Let's Encrypt managed SSL renewal in Vercel Domain Settings.

## 4. Verification
- Verify SSL certificate expiry using OpenSSL:
  ```bash
  openssl s_client -connect kcmchurch.vercel.app:443 -servername kcmchurch.vercel.app < /dev/null 2>/dev/null | openssl x509 -noout -dates
  ```
