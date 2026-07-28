# OpenTofu — KCM Church Gateway Infrastructure

## Module Structure

```
platform/opentofu/
├── main.tf              # Provider configuration (K8s, Helm, kubectl)
├── gateway.tf           # Module instantiation
├── variables.tf         # Root variables
└── modules/
    ├── gateway/         # Envoy Gateway Helm release + GatewayClass
    │   ├── main.tf
    │   ├── variables.tf
    │   └── outputs.tf
    ├── cert-manager/    # cert-manager Helm + ClusterIssuers
    │   └── main.tf
    └── dns/             # DNS records (cloud provider specific)
        └── main.tf
```

## Providers

| Provider | Source | Version | Purpose |
|---|---|---|---|
| `kubernetes` | `hashicorp/kubernetes` | ~> 2.26 | Namespace, Service, ConfigMap |
| `helm` | `hashicorp/helm` | ~> 2.12 | Envoy Gateway + cert-manager |
| `kubectl` | `alekc/kubectl` | ~> 2.0 | GatewayClass, ClusterIssuers |

## Variables

| Variable | Default | Description |
|---|---|---|
| `envoy_gateway_version` | `v1.8.3` | Helm chart version |
| `cert_manager_version` | `v1.15.3` | cert-manager version |
| `gateway_namespace` | `envoy-gateway-system` | Gateway controller namespace |
| `gateway_replicas` | `2` | Controller replicas (HA) |
| `letsencrypt_email` | `admin@kcmchurch.org` | ACME registration email |
| `kubeconfig_path` | `~/.kube/config` | Cluster kubeconfig |

## Usage

```bash
cd platform/opentofu

# Initialize providers and modules
tofu init

# Preview changes
tofu plan \
  -var "letsencrypt_email=admin@kcmchurch.org" \
  -var "kubeconfig_path=$HOME/.kube/config"

# Apply (requires explicit approval)
tofu apply \
  -var "letsencrypt_email=admin@kcmchurch.org" \
  -var "kubeconfig_path=$HOME/.kube/config"

# Check outputs
tofu output gateway_external_ip
tofu output envoy_gateway_version
```

## Outputs

| Output | Description |
|---|---|
| `gateway_external_ip` | External IP of the Gateway load balancer |
| `envoy_gateway_version` | Deployed Envoy Gateway version |
| `cert_manager_version` | Deployed cert-manager version |
| `gateway_namespace` | Gateway controller namespace |
