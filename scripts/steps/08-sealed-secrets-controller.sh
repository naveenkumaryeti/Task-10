#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"; source ./00-common.sh
echo "▶ Step 8 — Installing Bitnami Sealed Secrets controller"
helm repo add bitnami https://charts.bitnami.com/bitnami >/dev/null
helm repo update bitnami >/dev/null
helm upgrade --install sealed-secrets bitnami/sealed-secrets -n kube-system --wait --timeout 5m
kubectl get pods -n kube-system -l app.kubernetes.io/name=sealed-secrets
echo "✅ Step 8 done."
