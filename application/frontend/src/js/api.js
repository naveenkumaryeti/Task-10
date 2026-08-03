// Central place to talk to the backend. Falls back gracefully if the
// backend isn't reachable (e.g. static preview) using DEMO_DATA below.
const API_BASE = window.__API_BASE__ || "/api";

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("qk_token");
  const adminToken = localStorage.getItem("qk_admin_token");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (path.startsWith("/admin") && adminToken) headers["Authorization"] = `Bearer ${adminToken}`;
  else if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

const Api = {
  // Auth
  signup: (payload) => apiRequest("/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => apiRequest("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  adminLogin: (payload) => apiRequest("/admin/login", { method: "POST", body: JSON.stringify(payload) }),

  // Catalog
  getCategories: () => apiRequest("/categories"),
  getProducts: (categoryId) => apiRequest(categoryId ? `/products?category=${categoryId}` : "/products"),
  getProduct: (id) => apiRequest(`/products/${id}`),
  searchProducts: (q) => apiRequest(`/products?search=${encodeURIComponent(q)}`),

  // Payment
  processPayment: (payload) => apiRequest("/payments/process", { method: "POST", body: JSON.stringify(payload) }),

  // Orders
  placeOrder: (payload) => apiRequest("/orders", { method: "POST", body: JSON.stringify(payload) }),
  getMyOrders: () => apiRequest("/orders/my"),

  // Admin (protected)
  adminGetProducts: () => apiRequest("/admin/products"),
  adminCreateProduct: (payload) => apiRequest("/admin/products", { method: "POST", body: JSON.stringify(payload) }),
  adminUpdateProduct: (id, payload) => apiRequest(`/admin/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  adminDeleteProduct: (id) => apiRequest(`/admin/products/${id}`, { method: "DELETE" }),
  adminGetOrders: () => apiRequest("/admin/orders"),
  adminGetStats: () => apiRequest("/admin/stats"),
  adminGetCategories: () => apiRequest("/admin/categories"),
  adminCreateCategory: (payload) => apiRequest("/admin/categories", { method: "POST", body: JSON.stringify(payload) }),
  adminGetCustomers: () => apiRequest("/admin/customers"),
};
