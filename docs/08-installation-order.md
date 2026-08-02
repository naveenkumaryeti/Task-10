# Exact Installation Order (Pin-Point Checklist)

Follow this order exactly. Each step depends on the one before it.
Scripts referenced are in `scripts/steps/` — run them individually to
debug, or run `scripts/deploy-all.sh` to run all of them in this order.

| # | What | Script | Why this order |
|---|---|---|---|
| 1 | Install local tools: `gcloud`, `kubectl`, `helm`, `docker`, `kubeseal` | — (manual, one-time) | Everything below needs these |
| 2 | `gcloud auth login` + set project `zepto-with-gitops` | `steps/01-set-project.sh` | All later `gcloud`/`kubectl` calls target this project |
| 3 | Create GKE cluster `zeptomicroservices` — 3× `e2-standard-4` nodes, 100GB disk, autoscale 3→5 | `steps/02-create-cluster.sh` | Must exist before anything can be installed into it. Sized to fit the app + Prometheus/Grafana + Elasticsearch/Kibana/Fluent Bit + Argo CD together — a smaller machine type will cause Elasticsearch/Kibana pods to stay `Pending` (insufficient memory) |
| 4 | Create Artifact Registry repo `prod-repo` | `steps/03-artifact-registry.sh` | Needed before pushing images |
| 5 | Build & push frontend/backend Docker images | `steps/04-build-push-images.sh` | Helm charts reference these image tags — must exist before deploying |
| 6 | Create the `zepto` namespace | `steps/05-create-namespace.sh` | Everything app-related lives inside it |
| 7 | Install NGINX Ingress Controller | `steps/06-ingress-nginx.sh` | cert-manager's HTTP-01 challenge (next step) routes through this |
| 8 | Install cert-manager + apply ClusterIssuer | `steps/07-cert-manager.sh` | Must exist before the app's Ingress (step 14) requests a TLS cert |
| 9 | Install Sealed Secrets controller | `steps/08-sealed-secrets-controller.sh` | Must be running before you can seal (encrypt) or apply (decrypt) any secret |
| 10 | Install Argo CD | `steps/09-argocd.sh` | Must exist before GitOps bootstrap (step 13) |
| 11 | Install Prometheus + Grafana | `steps/10-monitoring.sh` | Independent of the app; install anytime after cluster exists, but grouped here to keep add-ons together |
| 12 | Install Elasticsearch + Kibana + Fluent Bit (right-sized: 1 ES node, 1Gi–2Gi RAM) | `steps/11-logging.sh` | Heaviest add-on — installed last among add-ons so cluster autoscaling has already provisioned capacity from earlier installs |
| 13 | **Generate + apply Sealed Secrets** (see `secrets/README.md` for full detail) | `./scripts/generate-secrets.sh` then `steps/12-apply-secrets.sh` | Must happen AFTER step 9 (controller must exist to encrypt against its key) and BEFORE step 14 (backend/database pods need these secrets to start) |
| 14 | Bootstrap GitOps — apply Argo CD `AppProject` + `app-of-apps` (deploys frontend, backend, database Helm charts) | `steps/13-gitops-bootstrap.sh` | This is what actually deploys your 3-tier app. Requires steps 9 (Argo CD) and 13 (secrets) to already be done |
| 15 | Apply Ingress, RBAC, Network Policies | `steps/14-ingress-rbac-netpol.sh` | Requires the app's Services (from step 14) to already exist — Ingress and NetworkPolicy both reference them by name/label |
| 16 | Verify — wait for pods, print external IP | `steps/15-verify.sh` | Final check |

## After step 16 — one manual action required
Point your domain's DNS **A record** at the external IP printed by
step 16. HTTPS activates automatically within a few minutes once
cert-manager's Let's Encrypt challenge completes.

## Resource sizing summary (why the cluster changed)
| Add-on | Approx. memory needed |
|---|---|
| Elasticsearch (1 node, right-sized) | ~1–2 GB |
| Kibana | ~0.5–1 GB |
| Prometheus + Grafana | ~1–1.5 GB |
| Argo CD | ~0.5 GB |
| ingress-nginx + cert-manager | ~0.5 GB |
| App (frontend + backend + MySQL, 3 replicas each min) | ~2–3 GB |
| **Total minimum** | **~6–9 GB**, plus Kubernetes system overhead (~1–2 GB per node) |

`e2-standard-2` (8GB RAM) per node was not enough headroom once you add
system overhead — this is why the cluster was resized to
`e2-standard-4` (16GB RAM) × 3 nodes with autoscaling to 5.
