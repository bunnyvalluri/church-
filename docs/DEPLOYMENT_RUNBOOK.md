# Deployment & Emergency Operations Runbook

## 1. Standard Production Deployment Procedure

```bash
# Step 1: Execute local verification suite
npm run i18n:check
npm run lint
npm run typecheck

# Step 2: Test deployment health monitor against target environment
npm run health:monitor

# Step 3: Push changes to main branch
git push origin main
```

---

## 2. Emergency Manual Rollback Procedures

### Scenario A: Vercel Serverless Production Rollback
1. Open the [Vercel Dashboard](https://vercel.com).
2. Select the `church-` project and navigate to the **Deployments** tab.
3. Locate the previous healthy deployment marked with green health tags.
4. Click the three dots (`...`) and select **Instant Rollback**.
5. Vercel routes 100% of global DNS and edge traffic to the selected deployment within < 300ms.

### Scenario B: Kubernetes / Argo Rollout
```bash
# Check current rollout status
kubectl argo rollouts status kcm-portal-rollout -n kcm-system

# Undo last rollout deployment
kubectl argo rollouts undo kcm-portal-rollout -n kcm-system
```
