# Monitoring Setup Summary

- **Prometheus** (kube-prometheus-stack) scrapes metrics from all pods
  every 15s and retains 15 days of history.
- **ServiceMonitor** objects (`monitoring/prometheus/servicemonitor-backend.yaml`)
  tell Prometheus where to find each service's `/metrics` endpoint.
- **Grafana** auto-loads the `Zepto Platform Overview` dashboard showing:
  CPU per pod, memory per pod, pod restart count, request rate, error rate.
- Access:
  ```bash
  kubectl port-forward -n monitoring svc/prometheus-grafana 3001:80
  kubectl port-forward -n monitoring svc/prometheus-operated 9090:9090
  ```
- Recommended alert rules to add later: high error rate (>5% 5xx over 5m),
  pod restart loops (>3 restarts in 10m), HPA maxed out for >15m.
