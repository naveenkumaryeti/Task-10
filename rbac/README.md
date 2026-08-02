# RBAC — Principle of Least Privilege

| ServiceAccount     | Role              | Can do                                  |
|---------------------|-------------------|------------------------------------------|
| frontend-sa          | frontend-role     | Nothing (no K8s API access at all)       |
| backend-sa            | backend-role      | Read ConfigMaps only                     |
| database-sa           | database-role     | Nothing (no K8s API access at all)       |
| github-actions-sa      | ci-deployer-role  | Deploy/update workloads in `zepto` ns only |

Test RBAC with:
```bash
kubectl auth can-i delete pods --as=system:serviceaccount:zepto:frontend-sa -n zepto
# Expected: no
```
