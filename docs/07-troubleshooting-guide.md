# Troubleshooting Guide

## Pod stuck in `Pending`
```bash
kubectl describe pod <pod-name> -n zepto
```
Usually means the cluster is out of CPU/memory. Add a node or lower `resources.requests`.

## Pod stuck in `CrashLoopBackOff`
```bash
kubectl logs <pod-name> -n zepto --previous
```
Check for missing environment variables (often means the Sealed Secret
wasn't unsealed correctly — check `kubectl get secrets -n zepto`).

## `ImagePullBackOff`
Usually a wrong image tag/path, or the cluster's service account lacks
Artifact Registry read permission. Check:
```bash
kubectl describe pod <pod-name> -n zepto | grep -A5 Events
```

## Ingress returns 502/504
```bash
kubectl get endpoints -n zepto
```
If empty, the Service's `selector` doesn't match any pod's `labels` — compare them.

## HTTPS certificate not issuing
```bash
kubectl describe certificate zepto-tls-secret -n zepto
kubectl describe challenge -n zepto
```
Common cause: DNS A record doesn't point at the Ingress external IP yet.

## Argo CD shows "OutOfSync" forever
```bash
argocd app diff zepto-backend
```
Usually a field Kubernetes defaults and Argo CD doesn't know to ignore —
add it under `spec.ignoreDifferences` in the Application manifest.

## Backend can't reach the database
```bash
kubectl exec -n zepto <backend-pod> -- nc -zv zepto-database-mysql 3306
```
If this hangs, check `network-policy/allow-backend-to-database.yaml` —
label selectors must exactly match the MySQL pod's actual labels
(`kubectl get pods -n zepto --show-labels`).
