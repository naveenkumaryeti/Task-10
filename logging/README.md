# Centralized Logging — Fluent Bit + Elasticsearch + Kibana

```bash
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch -n logging --create-namespace
helm install kibana elastic/kibana -n logging
helm install fluent-bit fluent/fluent-bit -n logging -f logging/fluent-bit-values.yaml
```

- Fluent Bit runs as a DaemonSet, tails container logs for the `zepto`
  namespace, and ships them to Elasticsearch under the `zepto-logs-*` index.
- View logs in Kibana:
  ```bash
  kubectl port-forward -n logging svc/kibana-kibana 5601:5601
  ```
  Create an index pattern `zepto-logs-*` → Discover tab.
