#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"; source ./00-common.sh
echo "▶ Step 1 — Setting active GCP project to $PROJECT_ID"
gcloud config set project "$PROJECT_ID"
echo "✅ Step 1 done."
