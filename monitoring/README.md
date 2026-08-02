# Monitoring — Prometheus + Grafana

## Install
```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring --create-namespace -f monitoring/prometheus/values.yaml
```

## Dashboards
`grafana-dashboards/zepto-overview.json` is auto-loaded into Grafana's
"Zepto" folder and shows:
- CPU usage per pod
- Memory usage per pod
- Pod restart count
- HTTP request rate
- HTTP 5xx error rate

Access Grafana:
```bash
kubectl port-forward -n monitoring svc/prometheus-grafana 3001:80
# open http://localhost:3001  (user: admin)
```

Prometheus targets: `kubectl port-forward -n monitoring svc/prometheus-operated 9090:9090` → `http://localhost:9090/targets`
