# Architecture Diagram

```
                         ┌─────────────────────────┐
                         │   GitHub Repository      │
                         │  (application + helm +   │
                         │   argocd + k8s manifests)│
                         └────────────┬─────────────┘
                                      │ push to main
                                      ▼
                         ┌─────────────────────────┐
                         │     GitHub Actions        │
                         │ build → Trivy scan → push │
                         └────────────┬─────────────┘
                                      ▼
                         ┌─────────────────────────┐
                         │   GCP Artifact Registry   │
                         └────────────┬─────────────┘
                                      ▼
                         ┌─────────────────────────┐
                         │        Argo CD            │
                         │ watches Git, auto-syncs,  │
                         │   self-heals drift         │
                         └────────────┬─────────────┘
                                      ▼
        ┌────────────────────────────────────────────────────────┐
        │                 GKE Cluster — namespace: zepto           │
        │                                                           │
        │   ┌───────────┐    ┌───────────┐    ┌────────────────┐  │
        │   │ Frontend  │───▶│ Backend   │───▶│ Database (MySQL │  │
        │   │ (Nginx)   │    │ (Node.js) │    │  via Bitnami)   │  │
        │   │ 3 replicas│    │ 3 replicas│    │  StatefulSet    │  │
        │   │ HPA 3-15  │    │ HPA 3-15  │    │  10Gi PVC       │  │
        │   └─────┬─────┘    └─────┬─────┘    └────────┬────────┘  │
        │         │                │                    │           │
        │   Network Policies restrict traffic to only these arrows  │
        │         │                                                 │
        │   ┌─────▼─────────────────────────────────────────────┐  │
        │   │  Ingress (NGINX) + TLS via cert-manager             │  │
        │   └─────┬─────────────────────────────────────────────┘  │
        └─────────┼──────────────────────────────────────────────┘
                   ▼
             Internet Users (HTTPS)

  Observability side-car stack (separate namespaces):
  Prometheus + Grafana (metrics)   |   Fluent Bit + Elasticsearch + Kibana (logs)
```

Secrets (DB password, JWT secret, API key) flow separately: **Bitnami
Sealed Secrets** encrypts them locally → committed to Git safely →
decrypted only inside the cluster → injected into pods as env vars.
