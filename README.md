# QuikKart — Production-Grade 3-Tier Quick-Commerce Platform on GKE

A complete GitOps-driven Kubernetes platform: a Zepto-style quick-commerce
website (customer + admin) built on Helm, Argo CD, Bitnami Sealed Secrets,
RBAC, Network Policies, HPA, zero-downtime rolling updates, Ingress+TLS,
Prometheus/Grafana monitoring, Fluent Bit/Elasticsearch/Kibana logging,
and disaster-recovery procedures.

**GCP Project ID:** `zepto-with-gitops`  **GKE Cluster:** `zeptomicroservices`

> Branding note: the storefront uses an original name/logo ("QuikKart")
> rather than reproducing Zepto's actual trademark, while matching its
> quick-commerce look — purple/yellow theme, 10-minute delivery banner,
> category strip, and product-card layout.

## Try it in one command (local)
```bash
./scripts/run-local.sh
```
Then open:
- Website: http://localhost:8080
- Admin portal: http://localhost:8080/admin-login.html → `admin@quikkart.com` / `Admin@123`

## What's on the website
- **Customer side**: home page with hero banner + category sections, full
  category browsing, product search, product detail pages, cart, checkout,
  login/signup, and order history — 12 categories, 45 seeded products.
- **Admin side** (separate login/JWT role): dashboard with live stats,
  product & price/stock management (inline edit + add/delete), category
  management, and order visibility — the "customize rates" panel the
  founder can use in production.

## 3-Tier Structure
```
application/
├── frontend/    # Multi-page vanilla JS site + Nginx, Dockerfile
├── backend/     # Node.js + Express REST API (auth, catalog, orders, admin), Dockerfile
└── database/    # MySQL schema + seed data (deployed via Bitnami Helm chart)
```

## Full Folder Structure
```
zepto-3tier-platform/
├── application/         # 3 source folders: frontend, backend, database
├── helm/                # 3 Helm charts: frontend, backend, database
├── kubernetes/          # Ingress, TLS ClusterIssuer
├── argocd/               # AppProject + 3 Applications + app-of-apps
├── github-actions/workflows/  # CI: build, Trivy scan, push, GitOps commit
├── monitoring/           # Prometheus + Grafana values & dashboards
├── logging/               # Fluent Bit + Elasticsearch + Kibana
├── network-policy/         # Zero-trust default-deny + explicit allows
├── rbac/                    # Namespace, Roles, RoleBindings, ServiceAccounts
├── secrets/                  # Bitnami Sealed Secrets templates + guide
├── scripts/                    # One-shot local run + GKE deploy + secrets generator
├── docker-compose.yml            # Local one-command stack (frontend+backend+MySQL)
└── docs/                          # All 7 required documentation files
```

## Scripts
| Script | Purpose |
|---|---|
| `scripts/run-local.sh` | Full stack locally via Docker Compose, one command |
| `scripts/generate-secrets.sh` | Interactively creates Bitnami Sealed Secrets (safe to commit) |
| `scripts/deploy-all.sh` | Runs all 15 steps in `scripts/steps/` in order, stopping immediately at the first failure so you always know exactly which step broke |
| `scripts/steps/01-...15-....sh` | Each individual deployment step as its own runnable script — e.g. re-run just `./scripts/steps/06-ingress-nginx.sh` to retry one failed piece without repeating everything before it |

## Payment Flow
Checkout is a real 3-stage flow, not a single "place order" click:
1. **Processing Payment** — hits `POST /api/payments/process` (simulated gateway: validates UPI ID / card number, returns a transaction ID)
2. **Payment Successful** — shown with the transaction ID before anything is saved
3. **Order Placed** — only after payment succeeds does `POST /api/orders` run, storing `payment_status` and `transaction_id` against the order (visible to admins on the Orders page)

COD orders skip straight to step 3 (no payment gateway call needed).

## Quick Start (production, GKE)
Read **docs/02-deployment-guide.md** for the full explained walkthrough,
or just run:
```bash
./scripts/generate-secrets.sh   # once, creates sealed secrets
./scripts/deploy-all.sh         # everything else, end to end
```

## Documentation Index
| File | Covers |
|---|---|
| docs/01-architecture-diagram.md | Full system architecture (ASCII diagram) |
| docs/02-deployment-guide.md | Step-by-step setup, explained simply |
| docs/03-rollback-procedure.md | How to undo a bad release |
| docs/04-autoscaling-test-results.md | HPA load-test template & results |
| docs/05-security-hardening-checklist.md | What's hardened and how |
| docs/06-monitoring-setup.md | Prometheus/Grafana access & dashboards |
| docs/07-troubleshooting-guide.md | Common failures and fixes |
| docs/08-installation-order.md | **Pin-point exact install order** — what must happen before what, and why |
| secrets/README.md | **Precise secrets guide** — how to get, seal, apply/unseal, and rotate secrets |

## Cluster Sizing
`zeptomicroservices` is provisioned as 3× `e2-standard-4` nodes (4 vCPU /
16GB RAM each), 100GB disk, autoscaling 3→5 nodes — sized to run the app
alongside Elasticsearch, Kibana, Prometheus, Grafana, and Argo CD
together without pods getting stuck `Pending`. See
`docs/08-installation-order.md` for the full breakdown.

## Key Design Decisions
- **Secrets**: Bitnami Sealed Secrets — plaintext never touches Git; only the in-cluster controller can decrypt.
- **Database**: uses the official, hardened **Bitnami MySQL** Helm chart as a dependency rather than a hand-rolled StatefulSet.
- **GitOps**: Argo CD with `automated: {prune: true, selfHeal: true}` — Git is the single source of truth.
- **Zero downtime**: RollingUpdate strategy (`maxUnavailable: 1, maxSurge: 1`) combined with readiness/liveness/startup probes.
- **Zero trust networking**: default-deny NetworkPolicy, then explicit allow rules only for real traffic (frontend→backend→database).
- **Two auth systems**: customer JWTs (`role: customer`) and admin JWTs (`role: admin`) are issued and verified separately — an admin token can never be used on customer routes or vice versa.
- **Frontend↔backend routing**: Nginx uses an env-templated config (`BACKEND_HOST`/`BACKEND_PORT`) so the same image works unchanged in Docker Compose and Kubernetes.

