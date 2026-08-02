# QuikKart Platform — Argo CD, Prometheus & Grafana Guide

A complete reference for accessing, understanding, and operating the three
core platform tools deployed alongside the QuikKart application. Written
for presenting to teammates, reviewers, or stakeholders.

---

# 1. Argo CD — GitOps Continuous Delivery

## 1.1 What It Does
Argo CD continuously watches our GitHub repository and automatically
deploys any change pushed to the `main` branch — without anyone running
`kubectl apply` or `helm upgrade` manually. It is the single source of
truth: whatever is in Git is what runs in the cluster.

## 1.2 Why We Use It
- **Zero manual deployment steps** — push to Git, Argo CD does the rest
- **Self-healing** — if someone manually edits the cluster (`kubectl edit`),
  Argo CD detects the drift and reverts it back to match Git automatically
- **Full audit trail** — every deployment is a Git commit, so "who changed
  what and when" is always traceable
- **Instant rollback** — revert a Git commit, and the cluster reverts too

## 1.3 How to Access the UI
```bash
kubectl port-forward svc/argocd-server -n argocd 8081:443
```
Open: `https://localhost:8081`

## 1.4 How to Log In
- **Username:** `admin`
- **Password:**
  ```bash
  kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
  ```
  (Change this password after first login via the UI, top-right → User Info)

## 1.5 Understanding the Dashboard
On login you see the **Applications** view — one card per deployed
component:
| App Name | What it deploys |
|---|---|
| `zepto-app-of-apps` | The "parent" app that manages the 3 apps below |
| `zepto-frontend` | The website (Nginx + static site) |
| `zepto-backend` | The Node.js API server |
| `zepto-database` | MySQL (via Bitnami Helm chart) |

Each card shows two key indicators:
- **APP HEALTH** — `Healthy` (green) / `Progressing` (blue) / `Degraded` (red)
- **SYNC STATUS** — `Synced` (matches Git) / `OutOfSync` (Git has changes not yet applied)

## 1.6 How to Read an Application's Detail View
Click any app card to open its detail panel:
- **DETAILS** — shows repo URL, target revision (commit), destination namespace
- **DIFF** — shows exact YAML differences between Git and the live cluster
- **The dependency tree** (main panel) — visually shows every Kubernetes
  resource this app owns: ServiceAccount → Deployment/StatefulSet →
  ReplicaSet/Pods → Service. Click any node to see its **Summary**,
  **Events**, and **Logs** tabs — this is the fastest way to debug a
  failing pod without leaving the browser.

## 1.7 How to Manually Sync (Deploy Now Instead of Waiting)
Argo CD checks Git every ~3 minutes automatically. To force it instantly:
1. Click the app card
2. Click **SYNC** (top right)
3. Review the resources listed → click **SYNCHRONIZE**

## 1.8 How to Roll Back
1. Click the app card → the three-dot menu (⋮) next to **LAST SYNC**
2. Or via Git (recommended — keeps history clean):
   ```bash
   git revert <bad-commit-sha>
   git push
   ```
   Argo CD auto-detects and redeploys the reverted state.

## 1.9 Common Things to Check When Something's Wrong
| Symptom | Where to look |
|---|---|
| App stuck "Progressing" | Click the pod node → **Logs** tab |
| Pod shows `ImagePullBackOff` | Click pod → **Events** tab shows the exact pull error |
| "OutOfSync" won't clear | **DIFF** tab shows exactly what field differs |
| Sync fails with repo error | **Settings → Repositories** — check repo is registered/reachable |

---

# 2. Prometheus — Metrics Collection & Monitoring

## 2.1 What It Does
Prometheus continuously scrapes (pulls) metrics from every pod every 15
seconds — CPU, memory, request counts, error rates — and stores up to 15
days of history. It is the data layer that Grafana visualizes.

## 2.2 Why We Use It
- Industry-standard, purpose-built for Kubernetes metrics
- Powers autoscaling decisions (HPA reads the same metrics)
- Lets us query raw numbers directly when Grafana dashboards aren't enough
- Enables alerting on thresholds (e.g. CPU > 80% for 5 minutes)

## 2.3 How to Access the UI
```bash
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
```
Open: `http://localhost:9090`
No login required (internal tool, access controlled via `kubectl` RBAC).

## 2.4 How to Use It — Step by Step

**Check what's being monitored:**
Top nav → **Status → Targets** — every target should show `State: UP`.
If something is `DOWN`, click it for the exact scrape error.

**Run your first query:**
Default landing page (**Graph** tab) → type:
```
up
```
→ click **Execute** → switch to the **Graph** sub-tab to see it plotted.

**Useful real queries for this project:**
```promql
sum(rate(container_cpu_usage_seconds_total{namespace="zepto"}[5m])) by (pod)
container_memory_working_set_bytes{namespace="zepto"}
kube_pod_container_status_restarts_total{namespace="zepto"}
sum(rate(http_requests_total{namespace="zepto"}[5m])) by (service)
```

**Check alert rules:**
Top nav → **Alerts** — shows configured rules and their state
(`Inactive`/`Pending`/`Firing`). Empty by default until custom rules are added.

**Confirm data retention:**
**Status → Runtime & Build Information** → `storageRetention: 15d`

## 2.5 Where Prometheus Fits in the Bigger Picture
```
Pods expose /metrics → Prometheus scrapes every 15s → stores time-series data
                                                              ↓
                                    Grafana queries Prometheus → renders dashboards
                                                              ↓
                                    HPA queries the same metrics → auto-scales pods
```

---

# 3. Grafana — Dashboards & Visualization

## 3.1 What It Does
Grafana turns Prometheus's raw numbers into readable dashboards, graphs,
and alerts — the tool you'd actually show in a meeting or check daily,
rather than writing PromQL by hand every time.

## 3.2 Why We Use It
- Pre-built visual dashboards for at-a-glance health checks
- Historical trend graphs (not just current snapshot)
- Alerting with Slack/email notifications
- One tool for both infrastructure and business metrics

## 3.3 How to Access the UI
```bash
kubectl port-forward -n monitoring svc/prometheus-grafana 3001:80
```
Open: `http://localhost:3001`

## 3.4 How to Log In
- **Username:** `admin`
- **Password:** `ChangeMe123!` (default, set in `monitoring/prometheus/values.yaml`)
- **Change it immediately:** top-right avatar → **Change Password**

## 3.5 How to Use It — Step by Step

**View the pre-built dashboard:**
Left sidebar → **Dashboards** → folder **Zepto** → **Zepto Platform Overview**
Shows: CPU per pod, memory per pod, pod restart count, request rate, error rate.

**Confirm the datasource is healthy:**
Left sidebar → **Connections → Data sources** → **Prometheus** → **Save & Test**
→ should show green "Data source is working"

**Explore metrics ad-hoc (no dashboard needed):**
Left sidebar → **Explore** → select **Prometheus** → run any PromQL query
→ instantly plotted, useful for one-off investigation.

**Edit an existing panel:**
Open the dashboard → click a panel title → **Edit** → adjust query/visualization
→ **Apply** → **Save dashboard** (top right) to persist.

**Set up an alert:**
Open a panel → **Edit** → **Alert** tab → **Create alert rule** → set threshold
condition → add a **Contact point** (Slack webhook, email) → **Save**.

**Auto-refresh live data:**
Top-right of any dashboard → refresh interval dropdown (`5s`/`30s`/`1m`).

## 3.6 Presenting This to the Team
When explaining this stack to others, the mental model to lead with:

> "Argo CD is **how we deploy** — push to Git, it happens automatically.
> Prometheus is **how we collect data** — it's always scraping every pod.
> Grafana is **how we look at that data** — dashboards instead of raw numbers."

All three are already installed and pre-configured for this project —
no one needs to set them up again, only access, read, and act on them.
