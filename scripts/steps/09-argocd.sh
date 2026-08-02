#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"; source ./00-common.sh
echo "▶ Step 9 — Installing Argo CD"
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -

# --server-side avoids the "annotations too long" error caused by the
# large applicationsets CRD exceeding kubectl's client-side
# last-applied-configuration annotation limit (262144 bytes).
kubectl apply -n argocd --server-side --force-conflicts \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

kubectl rollout status deployment/argocd-server -n argocd --timeout=180s
echo "✅ Step 9 done."