#!/usr/bin/env bash
# Generates real Bitnami Sealed Secrets. See secrets/README.md for the
# full manual walkthrough — this script automates the same steps.
set -euo pipefail

NAMESPACE="zepto"
CTRL_NAME="sealed-secrets"
CTRL_NS="kube-system"

command -v kubeseal >/dev/null 2>&1 || { echo "❌ kubeseal not found. See secrets/README.md Part B to install it."; exit 1; }

echo "🔎 Checking sealed-secrets controller is reachable..."
kubeseal --fetch-cert --controller-name="$CTRL_NAME" --controller-namespace="$CTRL_NS" >/dev/null || {
  echo "❌ Cannot reach the controller. Run scripts/steps/08-sealed-secrets-controller.sh first."
  exit 1
}
echo "✅ Controller reachable."
echo ""

echo "🔐 Generating sealed secrets for namespace '$NAMESPACE'"
echo "   (press Enter to auto-generate a strong random value for any field)"
echo ""

read -srp "MySQL root password [Enter = random]: " MYSQL_ROOT_PASSWORD; echo
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-$(openssl rand -base64 18)}"

read -srp "MySQL app user password [Enter = random]: " MYSQL_PASSWORD; echo
MYSQL_PASSWORD="${MYSQL_PASSWORD:-$(openssl rand -base64 18)}"

read -srp "JWT signing secret [Enter = random]: " JWT_SECRET; echo
JWT_SECRET="${JWT_SECRET:-$(openssl rand -base64 32)}"

read -srp "API key [Enter = random]: " API_KEY; echo
API_KEY="${API_KEY:-$(openssl rand -hex 16)}"

kubectl create secret generic zepto-db-secret --namespace "$NAMESPACE" \
  --from-literal=mysql-root-password="$MYSQL_ROOT_PASSWORD" \
  --from-literal=mysql-password="$MYSQL_PASSWORD" \
  --dry-run=client -o yaml | \
  kubeseal --format yaml --controller-name="$CTRL_NAME" --controller-namespace="$CTRL_NS" \
  > secrets/sealed-db-secret.yaml

kubectl create secret generic zepto-backend-secret --namespace "$NAMESPACE" \
  --from-literal=DB_HOST="zepto-database-mysql" \
  --from-literal=DB_USER="zepto" \
  --from-literal=DB_NAME="zeptodb" \
  --from-literal=DB_PASSWORD="$MYSQL_PASSWORD" \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --from-literal=API_KEY="$API_KEY" \
  --dry-run=client -o yaml | \
  kubeseal --format yaml --controller-name="$CTRL_NAME" --controller-namespace="$CTRL_NS" \
  > secrets/sealed-backend-secret.yaml

echo ""
echo "✅ Created:"
echo "   secrets/sealed-db-secret.yaml"
echo "   secrets/sealed-backend-secret.yaml"
echo ""
echo "   These are encrypted — safe to commit to Git."
echo "   Apply them with: kubectl apply -f secrets/sealed-db-secret.yaml -f secrets/sealed-backend-secret.yaml"
echo "   Or just run: ./scripts/steps/12-apply-secrets.sh"
