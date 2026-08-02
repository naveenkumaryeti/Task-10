# How to Get Each GitHub Actions Secret

## 1. `WIF_PROVIDER` and `WIF_SERVICE_ACCOUNT`
```bash
gcloud config set project zepto-with-gitops

# Create the service account
gcloud iam service-accounts create github-ci --display-name="GitHub Actions CI"

# Give it push access to Artifact Registry
gcloud projects add-iam-policy-binding zepto-with-gitops \
  --member="serviceAccount:github-ci@zepto-with-gitops.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Create the Workload Identity Pool + Provider
gcloud iam workload-identity-pools create "github-pool" --location="global"

gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --location="global" --workload-identity-pool="github-pool" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='naveenkumaryeti/Task-10'"

# Get your project number 483587630959
gcloud projects describe zepto-with-gitops --format="value(projectNumber)"

# Allow GitHub to impersonate the service account (replace PROJECT_NUMBER and repo)
gcloud iam service-accounts add-iam-policy-binding \
  github-ci@zepto-with-gitops.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/483587630959/locations/global/workloadIdentityPools/github-pool-v2/attribute.repository/naveenkumaryeti/Task-10"
```
- **`WIF_SERVICE_ACCOUNT`** = `github-ci@zepto-with-gitops.iam.gserviceaccount.com`
- **`WIF_PROVIDER`** = output of:
  ```bash
  gcloud iam workload-identity-pools providers describe "github-provider" \
    --location="global" --workload-identity-pool="github-pool" --format="value(name)"
  ```
  (looks like `projects/123456789/locations/global/workloadIdentityPools/github-pool/providers/github-provider`)

## 2. `SLACK_WEBHOOK_URL`
1. Go to https://api.slack.com/apps → **Create New App** → **From scratch**
2. Name it, pick your workspace
3. Left sidebar → **Incoming Webhooks** → toggle **Activate Incoming Webhooks** ON
4. Click **Add New Webhook to Workspace** → choose the channel → **Allow**
5. Copy the generated URL (starts with `https://hooks.slack.com/services/...`) — that is `SLACK_WEBHOOK_URL`

## 3. `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN`
1. Log in at https://hub.docker.com
2. **`DOCKERHUB_USERNAME`** = your Docker Hub login username (top-right)
3. Go to **Account Settings → Security → New Access Token**
4. Name it (e.g. `github-actions`), permission **Read & Write**, click **Generate**
5. Copy the token immediately (shown only once) — that is `DOCKERHUB_TOKEN`

## Add them to GitHub
Repo → **Settings → Secrets and variables → Actions → New repository secret** → add each name/value pair above exactly as named.
