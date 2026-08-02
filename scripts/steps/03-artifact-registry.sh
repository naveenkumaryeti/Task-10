#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"; source ./00-common.sh
echo "▶ Step 3 — Creating Artifact Registry repo (skips if it exists)"
gcloud artifacts repositories describe "$REPO" --location="$REGION" >/dev/null 2>&1 || \
  gcloud artifacts repositories create "$REPO" --repository-format=docker --location="$REGION"
gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet
echo "✅ Step 3 done."
