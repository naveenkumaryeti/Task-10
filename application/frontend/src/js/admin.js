function requireAdmin() {
  const admin = JSON.parse(localStorage.getItem("qk_admin") || "null");
  const token = localStorage.getItem("qk_admin_token");
  if (!admin || !token) {
    window.location.href = "admin-login.html";
    return null;
  }
  return admin;
}

function renderAdminSidebar(active) {
  const admin = JSON.parse(localStorage.getItem("qk_admin") || "null");
  const links = [
    { id: "dashboard", href: "admin-dashboard.html", label: "📊 Dashboard" },
    { id: "products", href: "admin-products.html", label: "🛒 Products & Pricing" },
    { id: "categories", href: "admin-categories.html", label: "🗂️ Categories" },
    { id: "orders", href: "admin-orders.html", label: "📦 Orders" },
    { id: "customers", href: "admin-customers.html", label: "👥 Customers" },
  ];
  const avatarHTML = admin && admin.profile_pic
    ? `<img src="${admin.profile_pic}" alt="" style="width:34px;height:34px;border-radius:50%;object-fit:cover;">`
    : `<div style="width:34px;height:34px;border-radius:50%;background:var(--brand-purple);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;">${admin ? admin.name.charAt(0).toUpperCase() : "A"}</div>`;

  document.getElementById("app-header").innerHTML = `
    <div class="admin-shell">
      <aside class="admin-sidebar">
        <div class="logo-row">
          <svg width="120" height="32" viewBox="0 0 140 40" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="36" height="36" rx="10" fill="#FFD500"/>
            <path d="M9 12 L27 12 L11 24 L27 24" stroke="#6A0DAD" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="42" y="27" font-family="Arial" font-size="20" font-weight="800" fill="#fff">Quik</text>
            <text x="86" y="27" font-family="Arial" font-size="20" font-weight="800" fill="#FFD500">Admin</text>
          </svg>
        </div>
        <nav>
          ${links.map(l => `<a href="${l.href}" class="${active === l.id ? "active" : ""}">${l.label}</a>`).join("")}
          <a href="#" id="adminLogout" style="margin-top:20px;color:#ffb4b4;">🚪 Logout</a>
        </nav>
      </aside>
      <div class="admin-main" id="adminMain">
        <div class="admin-topbar">
          <h2>${links.find(l => l.id === active)?.label.replace(/^\S+\s/, "") || ""}</h2>
          <a href="admin-profile.html" style="display:flex;align-items:center;gap:10px;color:inherit;">
            <span>👋 ${admin ? admin.name : ""}</span>
            ${avatarHTML}
          </a>
        </div>
        <div id="adminContent"></div>
      </div>
    </div>`;

  document.getElementById("adminLogout").addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("qk_admin_token");
    localStorage.removeItem("qk_admin");
    window.location.href = "admin-login.html";
  });
}
