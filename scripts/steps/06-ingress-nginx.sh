#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"; source ./00-common.sh
echo "▶ Step 6 — Installing NGINX Ingress Controller"
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx >/dev/null
helm repo update ingress-nginx >/dev/null

# Install WITHOUT --wait first — on flaky/Windows networks the watch
# connection to the GKE API server can drop mid-wait, which helm reports
# as "context canceled" even though the install itself succeeded.
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx \
  -n ingress-nginx --create-namespace --timeout 5m

# Poll for readiness ourselves instead, retrying on transient errors.
echo "Waiting for ingress-nginx controller pod to become Ready..."
for i in $(seq 1 30); do
  if kubectl wait --for=condition=Ready pod \
      -l app.kubernetes.io/component=controller \
      -n ingress-nginx --timeout=20s 2>/dev/null; then
    break
  fi
  echo "  still waiting... ($i/30)"
  sleep 10
done

kubectl get pods -n ingress-nginx
echo "✅ Step 6 done."