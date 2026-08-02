#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"; source ./00-common.sh
echo "▶ Step 15 — Waiting for pods to become ready and printing final status"
kubectl wait --for=condition=Ready pods --all -n "$NAMESPACE" --timeout=300s || true
echo ""
echo "Pods:"; kubectl get pods -n "$NAMESPACE"
echo ""
echo "Ingress (find your external IP here):"; kubectl get ingress -n "$NAMESPACE"
echo ""
echo "✅ Step 15 done. Point your domain's DNS A record at the ADDRESS above."
echo "   Admin portal: https://<your-domain>/admin-login.html"
echo "   Default admin: admin@quikkart.com / Admin@123 (change immediately)"
