# Network Policy Model (Zero Trust)

1. `default-deny-all.yaml` blocks ALL traffic in the `zepto` namespace by default.
2. `allow-dns.yaml` re-enables DNS lookups (required by every pod).
3. Traffic is then explicitly allowed **only** along the real application path:

```
Internet -> Ingress Controller -> frontend (8080)
frontend -> backend (3000)
backend  -> database / mysql (3306)
```

Validate with:
```bash
kubectl exec -n zepto <frontend-pod> -- curl -m 3 database-service:3306
# Expected: connection timed out (blocked, as intended)

kubectl exec -n zepto <backend-pod> -- curl -m 3 zepto-database-mysql:3306
# Expected: connects successfully
```
