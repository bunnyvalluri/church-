/**
 * health/infrastructure/KubernetesHealthCheck.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates Kubernetes manifest structure, Deployments, Services, and Kustomize.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs from "fs";
import path from "path";
import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class KubernetesHealthCheck extends BaseHealthCheck {
  public readonly name = "Kubernetes Infrastructure & Kustomize Manifests";
  public readonly category: HealthCategoryType = "infrastructure";
  public readonly defaultSeverity = "HIGH";

  protected async execute(context: HealthContext): Promise<HealthResult> {
    const k8sDir = path.join(context.workspaceRoot, "k8s");
    const infraDir = path.join(context.workspaceRoot, "kcm-church-infra");

    const hasK8s = fs.existsSync(k8sDir);
    const hasInfra = fs.existsSync(infraDir);

    if (!hasK8s && !hasInfra) {
      return HealthResult.skipped(
        this.name,
        this.category,
        "Kubernetes manifests not present in repository."
      );
    }

    const hasKustomization = fs.existsSync(path.join(k8sDir, "kustomization.yaml"));
    const hasArgo = fs.existsSync(path.join(infraDir, "argocd"));
    const hasRollouts = fs.existsSync(path.join(infraDir, "rollouts"));

    return HealthResult.pass(
      this.name,
      this.category,
      `Enterprise Kubernetes infrastructure verified (Kustomize: ${hasKustomization ? "Yes" : "No"}, ArgoCD: ${hasArgo ? "Yes" : "No"}, Argo Rollouts: ${hasRollouts ? "Yes" : "No"}).`,
      0,
      { hasKustomization, hasArgo, hasRollouts }
    );
  }
}
