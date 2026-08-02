# Kubernetes Base Manifests

- `cluster-issuer.yaml` — cert-manager ClusterIssuer using Let's Encrypt
  (HTTP-01 challenge) to auto-issue a real TLS certificate.
- `ingress.yaml` — path-based routing:
  - `/`     -> frontend-service (port 80)
  - `/api`  -> backend-service (port 3000)
  - HTTPS enforced, TLS cert stored in `zepto-tls-secret` (auto-created by cert-manager).

Prerequisites (installed once per cluster, not part of this app's GitOps):
```bash
# NGINX Ingress Controller
helm install ingress-nginx ingress-nginx/ingress-nginx -n ingress-nginx --create-namespace

# cert-manager
helm install cert-manager jetstack/cert-manager -n cert-manager --create-namespace --set installCRDs=true
```
