#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"; source ./00-common.sh
cd ../..
echo "▶ Step 12 — Applying Sealed Secrets to the cluster"
if [ -f secrets/sealed-db-secret.yaml ] && [ -f secrets/sealed-backend-secret.yaml ]; then
  kubectl apply -f secrets/sealed-db-secret.yaml
  kubectl apply -f secrets/sealed-backend-secret.yaml
else
  echo "❌ secrets/sealed-db-secret.yaml or sealed-backend-secret.yaml not found."
  echo "   Run ./scripts/generate-secrets.sh first, then re-run this step."
  exit 1
fi
echo "✅ Step 12 done."
