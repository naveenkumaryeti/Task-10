#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"; source ./00-common.sh
cd ../..
echo "▶ Step 10 — Installing Prometheus + Grafana"

kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

# Create the ConfigMap Grafana's dashboard provider expects — this is
# what was missing, causing the pod to hang in ContainerCreating.
kubectl create configmap zepto-grafana-dashboards \
  --namespace monitoring \
  --from-file=monitoring/grafana-dashboards/zepto-overview.json \
  --dry-run=client -o yaml | kubectl apply -f -

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts >/dev/null
helm repo update prometheus-community >/dev/null

helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace -f monitoring/prometheus/values.yaml --timeout 6m

echo "Waiting for monitoring pods to become Ready..."
for i in $(seq 1 30); do
  if kubectl wait --for=condition=Ready pod --all -n monitoring --timeout=20s 2>/dev/null; then
    break
  fi
  echo "  still waiting... ($i/30)"
  sleep 10
done

kubectl get pods -n monitoring
echo "✅ Step 10 done."