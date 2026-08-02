# Database Layer

Deployed via the **Bitnami MySQL Helm chart** (see `/helm/database`) for
hardened, non-root, patched images — not a custom Dockerfile.

## Schema
- `users` — customer accounts (signup/login)
- `admin_users` — separate admin accounts (production customization portal)
- `categories` — 12 seeded categories (Fruits & Veg, Dairy, Snacks, etc.)
- `products` — 45 seeded products with price, MRP, stock, image
- `orders` / `order_items` — customer orders and line items

## Default Admin Login
```
Email:    admin@quikkart.com
Password: Admin@123
```
⚠️ Change this password immediately after first login in any real deployment
(update via `UPDATE admin_users SET password_hash = ...` with a new bcrypt hash,
or build an admin "change password" flow before going to real production).

Credentials for the DB connection itself are never stored here — see
`/secrets` (Bitnami Sealed Secrets).
