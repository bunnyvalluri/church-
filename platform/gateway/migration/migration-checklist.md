# ==============================================================================
# Kingdom of Christ Ministries — Zero-Downtime Migration Checklist
# NGINX Ingress → Envoy Gateway (Gateway API)
# ==============================================================================

## Overview

This checklist documents every step to migrate from NGINX Ingress to Envoy Gateway
with zero downtime. Work through each phase in order. Validate before proceeding.

---

## Pre-Migration Checklist

- [ ] Kubernetes cluster version >= 1.28 (required for Gateway API v1)
- [ ] `cert-manager` installed and healthy
- [ ] Prometheus + Grafana operational (for rollback signals)
- [ ] Argo CD connected to repo
- [ ] DNS records noted (current NGINX LB IP)
- [ ] Backup all existing Ingress resources: `kubectl get ingress -A -o yaml > ingress-backup.yaml`
- [ ] Argo Rollouts rollouts paused: `kubectl argo rollouts pause kcm-frontend -n kcm-system`

---

## Phase 1: Install Envoy Gateway (Parallel to NGINX)

```bash
# 1. Create namespace
kubectl apply -f platform/gateway/install/namespace.yaml

# 2. Install Envoy Gateway via Helm
helm install envoy-gateway oci://docker.io/envoyproxy/gateway-helm \
  --version v1.8.3 \
  --namespace envoy-gateway-system \
  --create-namespace \
  --values platform/gateway/install/envoy-gateway-helm-values.yaml \
  --wait

# 3. Verify controller is running
kubectl get pods -n envoy-gateway-system
kubectl logs -n envoy-gateway-system -l app.kubernetes.io/name=envoy-gateway --tail=50
```

**Validation:** `kubectl get pods -n envoy-gateway-system | grep Running`

---

## Phase 2: Install GatewayClass and EnvoyProxy Config

```bash
kubectl apply -f platform/gateway/gatewayclass/kcm-gatewayclass.yaml
kubectl apply -f platform/gateway/gatewayclass/envoy-proxy-config.yaml

# Validate GatewayClass is Accepted
kubectl get gatewayclass kcm-gateway-class
# Expected: ACCEPTED=True
```

**Validation:**
```bash
kubectl get gatewayclass kcm-gateway-class -o jsonpath='{.status.conditions[0].status}'
# Must return: True
```

---

## Phase 3: Install cert-manager (if not already installed)

```bash
helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.15.3 \
  --set installCRDs=true \
  --wait

# Apply ClusterIssuers (STAGING first)
kubectl apply -f platform/gateway/tls/cluster-issuer-staging.yaml

# Verify issuer is Ready
kubectl get clusterissuer letsencrypt-staging
# Expected: READY=True
```

---

## Phase 4: Create Gateway (Get External IP)

```bash
kubectl apply -f platform/gateway/gateways/kcm-gateway.yaml

# Wait for Gateway to get external IP
kubectl get gateway kcm-gateway -n kcm-system --watch
# Wait for ADDRESS field to be populated

GATEWAY_IP=$(kubectl get gateway kcm-gateway -n kcm-system \
  -o jsonpath='{.status.addresses[0].value}')
echo "Gateway IP: $GATEWAY_IP"
```

**Validation:** Gateway shows `Programmed=True`
```bash
kubectl get gateway kcm-gateway -n kcm-system \
  -o jsonpath='{.status.conditions[?(@.type=="Programmed")].status}'
# Must return: True
```

---

## Phase 5: Apply HTTPRoutes (Test with Staging TLS)

```bash
# Apply all HTTPRoutes
kubectl apply -f platform/gateway/httproutes/

# Apply HTTP → HTTPS redirect
kubectl apply -f platform/gateway/tls/http-redirect-route.yaml

# Verify routes are accepted
kubectl get httproute -n kcm-system
# All should show: Accepted=True, ResolvedRefs=True
```

---

## Phase 6: DNS Cutover (The Critical Step)

> **⚠️ CAUTION:** This step shifts real user traffic. Perform during low-traffic window.

```bash
# 1. Note current NGINX LB IP
NGINX_IP=$(kubectl get ingress kcm-ingress -n kcm-system \
  -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Current NGINX IP: $NGINX_IP"
echo "New Gateway IP: $GATEWAY_IP"

# 2. Update DNS A records (replace with your DNS provider commands):
# GCP Cloud DNS:
# gcloud dns record-sets transaction start --zone=kcmchurch-org
# gcloud dns record-sets transaction add "$GATEWAY_IP" --name="kcmchurch.org." --ttl=60 --type=A --zone=kcmchurch-org
# gcloud dns record-sets transaction execute --zone=kcmchurch-org

# 3. Test new routing (before DNS propagation — use /etc/hosts):
echo "$GATEWAY_IP kcmchurch.org api.kcmchurch.org" | sudo tee -a /etc/hosts
curl -v http://kcmchurch.org/health
curl -v https://kcmchurch.org --insecure  # staging cert — ignore cert error

# 4. Once DNS propagates, verify:
curl -v https://kcmchurch.org
```

---

## Phase 7: Switch to Production TLS

```bash
# 1. Update issuerRef in certificate to production
kubectl apply -f platform/gateway/tls/cluster-issuer-prod.yaml
kubectl apply -f platform/gateway/certificates/kcm-tls-cert.yaml

# 2. Monitor certificate issuance
kubectl get certificate kcm-tls-cert -n kcm-system --watch
# Expected: READY=True within 5 minutes

# 3. Verify certificate
kubectl describe certificate kcm-tls-cert -n kcm-system | grep -A5 "Status:"
```

---

## Phase 8: Apply Security and Traffic Policies

```bash
kubectl apply -f platform/gateway/security/
kubectl apply -f platform/gateway/policies/
```

**Validate rate limiting:**
```bash
# Test that rate limiting works
for i in $(seq 1 50); do curl -s -o /dev/null -w "%{http_code}\n" https://api.kcmchurch.org/api/health; done
# Should see 429 responses after limit exceeded
```

---

## Phase 9: Migrate Argo Rollouts

```bash
# 1. Ensure Gateway API Rollouts plugin is installed
kubectl get cm argo-rollouts-config -n argo-rollouts -o yaml | grep gateway-api

# 2. Resume paused rollouts (now using Gateway API traffic routing)
kubectl argo rollouts resume kcm-frontend -n kcm-system
kubectl argo rollouts resume kcm-backend-api -n kcm-system

# 3. Verify Rollout status
kubectl argo rollouts get rollout kcm-frontend -n kcm-system --watch
```

---

## Phase 10: Validate Everything

```bash
# Gateway status
kubectl get gateway -n kcm-system
kubectl get httproute -n kcm-system
kubectl get gatewayclass

# Certificate status
kubectl get certificate -n kcm-system

# Security policies
kubectl get securitypolicy -n kcm-system
kubectl get backendtrafficpolicy -n kcm-system
kubectl get clienttrafficpolicy -n kcm-system

# End-to-end tests
curl -I https://kcmchurch.org
curl -I https://api.kcmchurch.org/health
curl -I http://kcmchurch.org  # Should return 301 redirect

# Grafana: check the "KCM — Envoy Gateway Metrics" dashboard
```

---

## Phase 11: Remove NGINX Ingress (After 48-Hour Validation)

> Only perform this step after 48 hours of healthy gateway operation.

```bash
# 1. Verify NGINX Ingress is receiving NO traffic
kubectl top pods -n ingress-nginx
# Traffic should be near-zero

# 2. Remove NGINX Ingress resource
kubectl delete -f k8s/ingress.yaml
kubectl delete -f platform/rollouts/services-and-ingress.yaml  # Remove NGINX Ingress section only

# 3. Archive (don't delete) the NGINX Ingress files
git mv k8s/ingress.yaml k8s/ingress.yaml.deprecated
git commit -m "chore: archive NGINX Ingress after Gateway API migration complete"
```

---

## Rollback Procedure

If anything goes wrong after DNS cutover:

```bash
# 1. Immediately revert DNS A record to NGINX IP
# (update in your DNS provider to $NGINX_IP)

# 2. NGINX Ingress is still running — traffic resumes automatically
# 3. Pause Rollouts
kubectl argo rollouts pause kcm-frontend -n kcm-system
kubectl argo rollouts pause kcm-backend-api -n kcm-system

# 4. Investigate issue
kubectl logs -n envoy-gateway-system -l app.kubernetes.io/name=envoy-gateway
kubectl describe gateway kcm-gateway -n kcm-system
kubectl describe httproute kcm-frontend-route -n kcm-system
```

---

## Success Criteria

- [ ] `kubectl get gateway kcm-gateway -n kcm-system` shows `Programmed=True`
- [ ] `curl https://kcmchurch.org` returns `200 OK`
- [ ] `curl http://kcmchurch.org` returns `301 → https://kcmchurch.org`
- [ ] `curl https://api.kcmchurch.org/health` returns `200 OK`
- [ ] TLS certificate shows `Ready=True` and is issued by `letsencrypt-prod`
- [ ] Grafana Gateway dashboard shows live metrics
- [ ] Argo Rollouts canary weight shifting works through HTTPRoute
- [ ] No errors in `kubectl logs -n envoy-gateway-system` for 24 hours
