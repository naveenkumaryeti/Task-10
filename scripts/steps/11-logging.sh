#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"; source ./00-common.sh
cd ../..
echo "▶ Step 11 — Installing Fluent Bit + Elasticsearch + Kibana"

helm repo add elastic https://helm.elastic.co >/dev/null
helm repo add fluent https://fluent.github.io/helm-charts >/dev/null
helm repo update elastic fluent >/dev/null

helm install elasticsearch elastic/elasticsearch -n logging --create-namespace
helm install kibana elastic/kibana -n logging
helm install fluent-bit fluent/fluent-bit -n logging -f logging/fluent-bit-values.yaml

kubectl get pods -n logging
echo "✅ Step 11 done."