#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"; source ./00-common.sh
cd ../..
echo "▶ Step 14 — Applying Ingress, RBAC, and Network Policies"
kubectl apply -f kubernetes/ingress.yaml
kubectl apply -f rbac/roles.yaml
kubectl apply -f rbac/rolebindings.yaml
kubectl apply -f network-policy/
echo "✅ Step 14 done."
