# Secrets — How to Get, Seal, Verify, and Unseal (Precise Steps)

Bitnami Sealed Secrets is a **one-way encryption** system: you encrypt
("seal") a secret on your laptop using the cluster's public key, commit
the sealed file to Git, and only the controller running inside that
exact cluster can decrypt ("unseal") it. Nobody else — not even you,
without the cluster — can reverse it.

---

## PART A — Install the controller (do this once per cluster)

This is already automated by `scripts/steps/08-sealed-secrets-controller.sh`.
Manually, it is:
```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm upgrade --install sealed-secrets bitnami/sealed-secrets -n kube-system --wait
```

Verify the controller is actually running before continuing:
```bash
kubectl get pods -n kube-system -l app.kubernetes.io/name=sealed-secrets
# STATUS must show "Running"
```

---

## PART B — Install `kubeseal` on your laptop (matches the controller)

- **macOS**: `brew install kubeseal`
- **Windows (Git Bash)**: download the `.tar.gz` from
  https://github.com/bitnami-labs/sealed-secrets/releases (get the
  `kubeseal-<version>-windows-amd64.tar.gz` asset), extract `kubeseal.exe`,
  and place it somewhere on your `PATH`.
- **Linux**:
  ```bash
  KUBESEAL_VERSION=0.27.1
  curl -OL https://github.com/bitnami-labs/sealed-secrets/releases/download/v${KUBESEAL_VERSION}/kubeseal-${KUBESEAL_VERSION}-linux-amd64.tar.gz
  tar -xvzf kubeseal-${KUBESEAL_VERSION}-linux-amd64.tar.gz kubeseal
  sudo install -m 755 kubeseal /usr/local/bin/kubeseal
  ```

Verify it can see your cluster's public key:
```bash
kubeseal --fetch-cert --controller-name=sealed-secrets --controller-namespace=kube-system
# Should print a PEM certificate block, not an error
```

---

## PART C — Where the actual secret VALUES come from

You decide these yourself — they are not generated for you:
| Secret | What to put | Example |
|---|---|---|
| `mysql-root-password` | A strong password for the MySQL root user | `R00t#Secure2026!` |
| `mysql-password` | A strong password for the app's DB user (`zepto`) | `App#DbPass2026!` |
| `JWT_SECRET` | A long random string — used to sign login tokens | Generate with: `openssl rand -base64 32` |
| `API_KEY` | Any random string, placeholder for a future 3rd-party integration | Generate with: `openssl rand -hex 16` |

The easiest way to get all of these correctly is the interactive helper —
it also runs `kubeseal` for you:
```bash
./scripts/generate-secrets.sh
```
It writes `secrets/sealed-db-secret.yaml` and `secrets/sealed-backend-secret.yaml` — commit both to Git.

---

## PART D — Doing it manually (step by step, if you want full control)

### 1. Create the plain Secret locally (never apply this directly, never commit it)
```bash
kubectl create secret generic zepto-db-secret \
  --namespace zepto \
  --from-literal=mysql-root-password='R00t#Secure2026!' \
  --from-literal=mysql-password='App#DbPass2026!' \
  --dry-run=client -o yaml > /tmp/db-secret-plain.yaml
```

### 2. Seal it (this is the encryption step)
```bash
kubeseal --format yaml \
  --controller-name=sealed-secrets --controller-namespace=kube-system \
  < /tmp/db-secret-plain.yaml > secrets/sealed-db-secret.yaml

rm /tmp/db-secret-plain.yaml   # delete the plaintext version immediately
```

### 3. Repeat for the backend secret
```bash
kubectl create secret generic zepto-backend-secret \
  --namespace zepto \
  --from-literal=DB_HOST='zepto-database-mysql' \
  --from-literal=DB_USER='zepto' \
  --from-literal=DB_NAME='zeptodb' \
  --from-literal=DB_PASSWORD='App#DbPass2026!' \
  --from-literal=JWT_SECRET="$(openssl rand -base64 32)" \
  --from-literal=API_KEY="$(openssl rand -hex 16)" \
  --dry-run=client -o yaml > /tmp/backend-secret-plain.yaml

kubeseal --format yaml \
  --controller-name=sealed-secrets --controller-namespace=kube-system \
  < /tmp/backend-secret-plain.yaml > secrets/sealed-backend-secret.yaml

rm /tmp/backend-secret-plain.yaml
```

### 4. Commit the SEALED files only
```bash
git add secrets/sealed-db-secret.yaml secrets/sealed-backend-secret.yaml
git commit -m "Add sealed secrets"
git push
```
✅ Safe to push — `encryptedData` inside these files is cipher text.

---

## PART E — Applying / "Unsealing" in the cluster

You never manually decrypt anything. Applying the SealedSecret to the
cluster IS the unseal step — the controller watches for `SealedSecret`
objects and automatically decrypts them into a normal `Secret`:
```bash
kubectl apply -f secrets/sealed-db-secret.yaml
kubectl apply -f secrets/sealed-backend-secret.yaml
```
(This is exactly what `scripts/steps/12-apply-secrets.sh` does.)

### Verify it actually unsealed correctly
```bash
kubectl get secrets -n zepto
# You should see zepto-db-secret and zepto-backend-secret listed

kubectl get secret zepto-backend-secret -n zepto -o jsonpath='{.data.JWT_SECRET}' | base64 -d
# Prints your original JWT secret back — proof the round-trip worked
```
If `kubectl get secrets -n zepto` does NOT show them a few seconds after
applying, check the controller logs:
```bash
kubectl logs -n kube-system -l app.kubernetes.io/name=sealed-secrets --tail=50
```
Common cause: the SealedSecret's `metadata.namespace` doesn't match
where you applied it — sealed data is bound to a specific namespace/name
by default and won't decrypt anywhere else.

---

## PART F — Rotating a secret later

1. Create a NEW plain secret with the new value (Part D, step 1)
2. Seal it again (Part D, step 2) — this overwrites `secrets/sealed-*.yaml`
3. Commit + push
4. Argo CD (self-healing) re-applies it automatically within ~3 minutes,
   or force it immediately:
   ```bash
   kubectl apply -f secrets/sealed-backend-secret.yaml
   kubectl rollout restart deployment/backend -n zepto
   ```
