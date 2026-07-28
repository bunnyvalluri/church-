terraform {
  required_version = ">= 1.6.0"
  required_providers {
    grafana = {
      source  = "grafana/grafana"
      version = "~> 2.11.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.27.0"
    }
  }
  backend "s3" {
    bucket         = "kcm-terraform-state-prod"
    key            = "observability/grafana/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "kcm-terraform-locks"
  }
}

provider "grafana" {
  url  = var.grafana_url
  auth = var.grafana_api_token
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}
