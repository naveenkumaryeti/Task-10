#!/usr/bin/env bash
# ============================================================================
# QuikKart — Full Cleanup Script
# Removes EVERYTHING created for this project: GKE cluster, Artifact
# Registry, Workload Identity Federation, local Docker images/containers,
# and local kubeconfig context. Run this to avoid ongoing GCP billing.
# ============================================================================
set -uo pipefail

PROJECT_ID="zepto-with-gitops"
CLUSTER_NAME="zeptomicroservices"
ZONE="asia-south1-a"
REGION="asia-south1"
REPO="prod-repo"

echo "=================================================================="
echo "  QuikKart — Full Cleanup"
echo "  This will DELETE the GKE cluster, Artifact Registry repo, WIF"
echo "  pool, service account, local Docker images/containers/volumes."
echo "=================================================================="
read -rp "Type 'DELETE' to confirm: " CONFIRM
[ "$CONFIRM" = "DELETE" ] || { echo "Aborted."; exit 1; }

echo ""
echo "▶ 1/8 — Deleting GKE cluster '$CLUSTER_NAME'"
gcloud container clusters delete "$CLUSTER_NAME" --zone "$ZONE" --project "$PROJECT_ID" --quiet || echo "  (already deleted or not found)"

echo ""
echo "▶ 2/8 — Deleting Artifact Registry repo '$REPO'"
gcloud artifacts repositories delete "$REPO" --location "$REGION" --project "$PROJECT_ID" --quiet || echo "  (already deleted or not found)"

echo ""
echo "▶ 3/8 — Deleting Workload Identity Federation provider & pool"
gcloud iam workload-identity-pools providers delete "github-provider" \
  --project="$PROJECT_ID" --location="global" --workload-identity-pool="github-pool" --quiet || echo "  (not found)"
gcloud iam workload-identity-pools delete "github-pool" \
  --project="$PROJECT_ID" --location="global" --quiet || echo "  (not found)"

echo ""
echo "▶ 4/8 — Deleting CI service account"
gcloud iam service-accounts delete "github-ci@$PROJECT_ID.iam.gserviceaccount.com" \
  --project="$PROJECT_ID" --quiet || echo "  (not found)"

echo ""
echo "▶ 5/8 — Removing cert-manager ClusterIssuer's Let's Encrypt account (if kubeconfig still points at a live cluster, ignore errors)"
kubectl delete clusterissuer letsencrypt-prod --ignore-not-found=true 2>/dev/null || true

echo ""
echo "▶ 6/8 — Removing local kubeconfig context for this cluster"
kubectl config delete-context "gke_${PROJECT_ID}_${ZONE}_${CLUSTER_NAME}" 2>/dev/null || true
kubectl config delete-cluster "gke_${PROJECT_ID}_${ZONE}_${CLUSTER_NAME}" 2>/dev/null || true

echo ""
echo "▶ 7/8 — Stopping & removing local Docker Compose stack (containers + volumes)"
cd "$(dirname "$0")/.."
docker compose down -v 2>/dev/null || true

echo ""
echo "▶ 8/8 — Removing local Docker images built for this project"
docker rmi -f \
  "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/zepto-frontend:latest" \
  "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/zepto-backend:latest" \
  quikkart-frontend quikkart-backend 2>/dev/null || true
docker image prune -f >/dev/null 2>&1 || true

echo ""
echo "=================================================================="
echo "✅ Cleanup complete."
echo "   Verify no charges remain: https://console.cloud.google.com/billing"
echo "   (Artifact Registry, GKE, and Load Balancer/IP resources are the"
echo "    most common sources of leftover billing — double check there.)"
echo "=================================================================="
