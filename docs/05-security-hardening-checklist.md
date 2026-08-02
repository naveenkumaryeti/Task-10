# Security Hardening Checklist

- [x] No secrets committed in plaintext — all via Bitnami Sealed Secrets
- [x] All containers run as non-root (`runAsNonRoot: true`)
- [x] Root filesystem is read-only (`readOnlyRootFilesystem: true`)
- [x] All Linux capabilities dropped (`capabilities.drop: ["ALL"]`)
- [x] Dedicated ServiceAccount per tier (frontend-sa, backend-sa, database-sa)
- [x] RBAC roles scoped to minimum required verbs/resources
- [x] Default-deny NetworkPolicy, explicit allow rules only for real traffic paths
- [x] TLS enforced end-to-end at the Ingress (HTTP auto-redirects to HTTPS)
- [x] Container images scanned by Trivy in CI; pipeline fails on CRITICAL/HIGH CVEs
- [x] Resource requests & limits set on every container (prevents noisy-neighbor / DoS)
- [x] Readiness/liveness/startup probes on every deployment (auto-recovery)
- [x] Namespace isolation (`zepto` namespace, not `default`)
- [ ] (Optional next step) Enable GKE Workload Identity instead of node service account keys
- [ ] (Optional next step) Enable Pod Security Admission (`restricted` profile) on the namespace
