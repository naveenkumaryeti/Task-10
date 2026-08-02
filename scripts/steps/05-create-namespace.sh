#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"; source ./00-common.sh
cd ../..
echo "▶ Step 5 — Creating namespace '$NAMESPACE'"
kubectl apply -f rbac/namespace.yaml
kubectl get namespace "$NAMESPACE"
echo "✅ Step 5 done."
