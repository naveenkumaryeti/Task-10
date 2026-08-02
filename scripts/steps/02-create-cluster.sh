#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"; source ./00-common.sh

# Sized for the FULL stack running together: app (3 tiers) + Prometheus/Grafana
# + Elasticsearch/Kibana/Fluent Bit + Argo CD + ingress-nginx + cert-manager.
# e2-standard-2 (2 vCPU/8GB) is NOT enough — Elasticsearch alone requests
# ~2GB+ per pod. e2-standard-4 (4 vCPU/16GB) x3 nodes gives ~48GB RAM /
# 12 vCPU total, with autoscaling up to 5 nodes under load.
echo "▶ Step 2 — Creating GKE cluster '$CLUSTER_NAME' (skips if it already exists)"
if ! gcloud container clusters describe "$CLUSTER_NAME" --zone "$ZONE" >/dev/null 2>&1; then
  gcloud container clusters create "$CLUSTER_NAME" \
    --zone "$ZONE" \
    --num-nodes 3 \
    --machine-type e2-standard-4 \
    --disk-type pd-balanced \
    --disk-size 100 \
    --enable-autoscaling --min-nodes 3 --max-nodes 5 \
    --enable-ip-alias
else
  echo "  Cluster already exists, skipping creation."
fi
gcloud container clusters get-credentials "$CLUSTER_NAME" --zone "$ZONE"
kubectl cluster-info
echo ""
echo "  Node capacity check:"
kubectl get nodes -o custom-columns=NAME:.metadata.name,CPU:.status.capacity.cpu,MEMORY:.status.capacity.memory
echo "✅ Step 2 done."
