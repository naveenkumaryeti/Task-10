# Deployment Guide (Step-by-Step, for Beginners)

Every step below explains **what** you're doing and **why**, in plain
language. Run everything from inside the project root folder.

## Step 0 — What you need installed on your laptop
| Tool | Purpose |
|---|---|
| `gcloud` CLI | Talk to Google Cloud |
| `kubectl` | Talk to Kubernetes |
| `helm` | Install packaged apps into Kubernetes |
| `kubeseal` | Encrypt secrets before committing them to Git |
| Docker | Build container images |

## Step 1 — Create the GKE cluster
```bash
gcloud container clusters create zeptomicroservices \
  --zone asia-south1-a \
  --num-nodes 3 \
  --machine-type e2-standard-2
gcloud container clusters get-credentials zeptomicroservices --zone asia-south1-a --project zepto-with-gitops
```
*This spins up 3 real virtual machines that Kubernetes will use to run your app.*

## Step 2 — Create the namespace
```bash
kubectl apply -f rbac/namespace.yaml
```
*A namespace is like a labeled folder inside the cluster — it keeps this project's resources separate from anything else running in the cluster.*

## Step 3 — Install cluster-wide add-ons (one-time, per cluster)
```bash
# Traffic router (turns URLs into routes to your pods)
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx -n ingress-nginx --create-namespace

# Automatic HTTPS certificates
helm repo add jetstack https://charts.jetstack.io
helm install cert-manager jetstack/cert-manager -n cert-manager --create-namespace --set installCRDs=true
kubectl apply -f kubernetes/cluster-issuer.yaml

# Secret encryption controller
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install sealed-secrets bitnami/sealed-secrets -n kube-system

# GitOps engine
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Monitoring stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace -f monitoring/prometheus/values.yaml

# Logging stack
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch -n logging --create-namespace
helm install kibana elastic/kibana -n logging
helm repo add fluent https://fluent.github.io/helm-charts
helm install fluent-bit fluent/fluent-bit -n logging -f logging/fluent-bit-values.yaml
```
*Each `helm install` downloads a ready-made package and configures it for you — you don't write this software yourself, you just wire it up.*

## Step 4 — Create your secrets (passwords), the safe way
```bash
kubectl create secret generic zepto-db-secret --namespace zepto \
  --from-literal=mysql-root-password='ChooseAStrongPassword1!' \
  --from-literal=mysql-password='ChooseAStrongPassword2!' \
  --dry-run=client -o yaml | kubeseal --format yaml > secrets/sealed-db-secret.yaml

kubectl create secret generic zepto-backend-secret --namespace zepto \
  --from-literal=DB_PASSWORD='ChooseAStrongPassword2!' \
  --from-literal=JWT_SECRET='SomeRandomLongString' \
  --from-literal=API_KEY='SomeApiKey' \
  --dry-run=client -o yaml | kubeseal --format yaml > secrets/sealed-backend-secret.yaml

git add secrets/sealed-*.yaml
git commit -m "Add sealed secrets"
git push
```
*`kubeseal` scrambles the password so badly that only your cluster can
unscramble it — this is why it's safe to push to GitHub.*

## Step 5 — Push code and let CI build your images
Push the `application/` folder changes to `main`. GitHub Actions
automatically builds the Docker image, scans it for vulnerabilities
with Trivy, and pushes it to Artifact Registry.

## Step 6 — Bootstrap Argo CD (GitOps)
```bash
kubectl apply -f argocd/project.yaml
kubectl apply -f argocd/app-of-apps.yaml
```
*From this point on, you never run `kubectl apply` or `helm upgrade`
manually again — you just `git push`, and Argo CD notices the change
and rolls it out automatically, usually within 3 minutes.*

## Step 7 — Set up Ingress + HTTPS
```bash
kubectl apply -f kubernetes/ingress.yaml
```
Point your domain's DNS A record to the Ingress controller's external
IP (`kubectl get svc -n ingress-nginx`). cert-manager will then request
a free, real HTTPS certificate from Let's Encrypt automatically.

## Step 8 — Apply RBAC and Network Policies
```bash
kubectl apply -f rbac/roles.yaml
kubectl apply -f rbac/rolebindings.yaml
kubectl apply -f network-policy/
```

## Step 9 — Verify everything is running
```bash
kubectl get pods -n zepto
kubectl get ingress -n zepto
kubectl get hpa -n zepto
argocd app list
```
Then open `https://<your-domain>` in a browser.
