# Production Deployment Guide

## Prerequisites
- A Kubernetes cluster (v1.24+ recommended)
- `kubectl` configured with cluster access
- `helm` v3 installed
- `kustomize` v4+ installed
- An Ingress Controller (e.g., NGINX Ingress Controller) installed
- Cert-Manager installed (for TLS)

## CI/CD Pipeline
The application uses GitHub Actions for continuous deployment.
1. Push to the `main` branch.
2. The pipeline builds OCI-compliant images for both Frontend and Backend.
3. Trivy scans the images for vulnerabilities.
4. Images are pushed to GitHub Container Registry (GHCR).
5. Helm upgrades the `kcm-portal` release using Kustomize production overlays.

## Manual Deployment

If you need to deploy manually:

### 1. Build and Push Images
```bash
docker build -t ghcr.io/your-org/kcm-frontend:latest -f Dockerfile .
docker build -t ghcr.io/your-org/kcm-backend:latest -f backend/Dockerfile backend
docker push ghcr.io/your-org/kcm-frontend:latest
docker push ghcr.io/your-org/kcm-backend:latest
```

### 2. Deploy using Helm and Kustomize
We use Helm to template the charts, and Kustomize is used on top of it.
```bash
# Render templates and apply via Kustomize
kustomize build deploy/kustomize/overlays/production | kubectl apply -f -
```
*Alternatively, you can deploy using Helm directly if you don't use Kustomize overlays:*
```bash
helm upgrade --install kcm-portal deploy/helm/kcm-portal -f deploy/kustomize/overlays/production/values-production.yaml -n kcm-production --create-namespace
```

### 3. Verify Deployment
```bash
kubectl get pods -n kcm-production
kubectl get ingress -n kcm-production
```

## Secrets Management
By default, the Helm chart creates a dummy secret. For production, you MUST use a robust secrets manager.
- **Sealed Secrets**: Encrypt secrets in your repo and let the Sealed Secrets controller decrypt them in the cluster.
- **External Secrets Operator**: Sync secrets from AWS Secrets Manager, GCP Secret Manager, or HashiCorp Vault.
Update `deploy/helm/kcm-portal/templates/secret.yaml` or completely replace it with your preferred `ExternalSecret` custom resource.
