#!/usr/bin/env bash
# ============================================================================
# QuikKart — One-shot production deployment to GKE
# Runs each step in scripts/steps/ one at a time and stops immediately if
# any step fails, so you always know exactly which step broke.
#
# To debug a single failing step yourself, run it directly, e.g.:
#   ./scripts/steps/06-ingress-nginx.sh
# ============================================================================
set -euo pipefail
cd "$(dirname "$0")/steps"

STEPS=(
  01-set-project.sh
  02-create-cluster.sh
  03-artifact-registry.sh
  04-build-push-images.sh
  05-create-namespace.sh
  06-ingress-nginx.sh
  07-cert-manager.sh
  08-sealed-secrets-controller.sh
  09-argocd.sh
  10-monitoring.sh
  11-logging.sh
  12-apply-secrets.sh
  13-gitops-bootstrap.sh
  14-ingress-rbac-netpol.sh
  15-verify.sh
)

echo "=================================================================="
echo "  QuikKart — Full Production Deployment (${#STEPS[@]} steps)"
echo "=================================================================="

for cmd in gcloud kubectl helm docker; do
  command -v $cmd >/dev/null 2>&1 || { echo "❌ '$cmd' is required but not installed. Aborting."; exit 1; }
done

for step in "${STEPS[@]}"; do
  echo ""
  echo "------------------------------------------------------------------"
  echo "Running: $step"
  echo "------------------------------------------------------------------"
  if ! ./"$step"; then
    echo ""
    echo "❌ FAILED at $step"
    echo "   Fix the error above, then either:"
    echo "   a) re-run just this step:  ./scripts/steps/$step"
    echo "   b) or re-run the full deployment: ./scripts/deploy-all.sh"
    echo "   (already-completed steps are safe to re-run — they skip existing resources)"
    exit 1
  fi
done

echo ""
echo "=================================================================="
echo "✅ All ${#STEPS[@]} steps completed successfully!"
echo "=================================================================="
