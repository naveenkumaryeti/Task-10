# Rollback Procedure

Because we use GitOps (Argo CD), rolling back is a Git operation, not a
Kubernetes operation — you never need to remember `kubectl` rollback commands.

## Option A — Revert the bad commit (recommended)
```bash
git log --oneline           # find the bad commit
git revert <bad-commit-sha>
git push
```
Argo CD detects the new commit and automatically re-deploys the
previous, working state within ~3 minutes.

## Option B — Roll back from the Argo CD UI/CLI (faster, temporary)
```bash
argocd app history zepto-backend
argocd app rollback zepto-backend <ID-from-history>
```
⚠️ Note: this only fixes the *cluster*. Also revert the Git commit
afterwards (Option A), or the next auto-sync will undo your rollback
because Git is the source of truth.

## Option C — Emergency manual rollback (if Argo CD itself is down)
```bash
helm rollback frontend <REVISION> -n zepto
helm history frontend -n zepto     # to find REVISION number
```

## What "good" looks like after a rollback
```bash
kubectl get pods -n zepto -w        # all pods Running, no CrashLoopBackOff
kubectl rollout status deployment/backend -n zepto
```
