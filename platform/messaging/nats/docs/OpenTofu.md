# OpenTofu Infrastructure as Code Guide

## Overview
OpenTofu manages the automated provisioning of the NATS messaging infrastructure, namespace setup, and Helm chart deployment.

## IaC Directory Structure
```
platform/messaging/nats/opentofu/
├── main.tf        # Provider definitions (Kubernetes, Helm)
├── variables.tf   # Module variables (replicas, storage class, sizes)
├── nats.tf        # Namespace & Helm release resources
└── outputs.tf     # Terraform output values (internal DNS, namespace)
```

## Provisioning Execution Commands
```bash
# Navigate to OpenTofu module directory
cd platform/messaging/nats/opentofu

# Initialize providers
tofu init

# Perform dry-run plan
tofu plan -out=tfplan

# Apply infrastructure changes
tofu apply tfplan
```
