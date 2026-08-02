#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"; source ./00-common.sh
cd ../..   # project root
echo "▶ Step 4 — Building & pushing Docker images"
docker build -t "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/zepto-frontend:latest" ./application/frontend
docker push "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/zepto-frontend:latest"
docker build -t "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/zepto-backend:latest" ./application/backend
docker push "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/zepto-backend:latest"
echo "✅ Step 4 done."
