#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"; source ./00-common.sh
cd ../..
echo "▶ Step 13 — Bootstrapping GitOps (Argo CD Applications)"
kubectl apply -f argocd/project.yaml
kubectl apply -f argocd/app-of-apps.yaml
kubectl get applications -n argocd
echo "✅ Step 13 done."
