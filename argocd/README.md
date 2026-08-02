# GitOps with Argo CD

## Install Argo CD
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

## Bootstrap this project
```bash
kubectl apply -f argocd/project.yaml
kubectl apply -f argocd/app-of-apps.yaml
```
This deploys `zepto-frontend`, `zepto-backend`, and `zepto-database` Applications automatically.

## Behaviour
- **Automatic sync** — any commit to `main` is deployed within ~3 minutes (or instantly via webhook).
- **Self-healing** — `selfHeal: true` means if someone runs `kubectl edit` directly on the cluster, Argo CD reverts it back to match Git.
- **Rollback** — Argo CD keeps full history of every synced Git commit:
  ```bash
  argocd app history zepto-backend
  argocd app rollback zepto-backend <HISTORY_ID>
  ```
  Or simply `git revert` the bad commit — Argo CD auto-syncs the reverted state.
