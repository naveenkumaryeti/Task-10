#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"; source ./00-common.sh
cd ../..
echo "▶ Step 7 — Installing cert-manager + ClusterIssuer"
helm repo add jetstack https://charts.jetstack.io >/dev/null
helm repo update jetstack >/dev/null

# Install WITHOUT --wait — same flaky-connection "context canceled" issue
# as ingress-nginx. Poll readiness ourselves instead.
helm upgrade --install cert-manager jetstack/cert-manager \
  -n cert-manager --create-namespace --set installCRDs=true --timeout 5m

echo "Waiting for cert-manager pods to become Ready..."
for i in $(seq 1 30); do
  if kubectl wait --for=condition=Ready pod --all -n cert-manager --timeout=20s 2>/dev/null; then
    break
  fi
  echo "  still waiting... ($i/30)"
  sleep 10
done

kubectl get pods -n cert-manager
kubectl apply -f kubernetes/cluster-issuer.yaml
echo "✅ Step 7 done."