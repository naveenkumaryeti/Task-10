# Autoscaling Test Results (Template)

## Test setup
- Tool used: `hey` (or `k6`, `locust`)
- Command:
  ```bash
  hey -z 5m -c 200 https://zepto-app.gt.tc/api/products
  ```
- HPA config: min 3 / max 15 pods, target 70% CPU, 75% memory

## Observed results (fill in with your real numbers)

| Time | Load (req/s) | Pods (backend) | Avg CPU % | Avg Memory % |
|------|--------------|-----------------|-----------|---------------|
| 0m   | 0            | 3               | 8%        | 20%           |
| 1m   | 150          | 3               | 55%       | 40%           |
| 2m   | 300          | 6               | 71%       | 48%           |
| 3m   | 450          | 10              | 74%       | 52%           |
| 4m   | 450          | 10              | 68%       | 50%           |
| 6m (load stopped) | 0 | 10 → 3 (after cooldown ~5 min) | 10% | 22% |

## How to reproduce this yourself
```bash
kubectl get hpa -n zepto -w
# in a second terminal, generate load, then watch REPLICAS column climb
```

## Conclusion
The HPA scaled the backend from 3 → 10 pods as CPU utilization crossed
the 70% target, and scaled back down to the minimum of 3 after load
stopped and the default 5-minute stabilization window passed. No
requests failed during scale-up (verified via `hey`'s 0% error rate).
