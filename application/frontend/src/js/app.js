function renderHeader(activeCategoryId) {
  const user = JSON.parse(localStorage.getItem("qk_user") || "null");
  const avatarHTML = user
    ? (user.profile_pic
        ? `<img src="${user.profile_pic}" alt="" style="width:26px;height:26px;border-radius:50%;object-fit:cover;">`
        : `<span style="width:26px;height:26px;border-radius:50%;background:var(--brand-purple);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;">${user.name.charAt(0).toUpperCase()}</span>`)
    : "";
  const authBlock = user
    ? `<div class="user-menu" id="userMenu">
        <button class="btn btn-outline user-menu-btn" id="userMenuBtn">${avatarHTML}<span>Hi, ${user.name.split(" ")[0]}</span> ▾</button>
        <div class="user-dropdown" id="userDropdown">
          <a href="account.html">👤 Profile</a>
          <a href="account.html?tab=orders">📦 My Orders</a>
          <a href="#" id="headerLogout">🚪 Logout</a>
        </div>
      </div>`
    : `<a href="login.html" class="btn btn-outline">Login</a>`;

  document.getElementById("app-header").innerHTML = `
    <div class="topbar">
      <div class="container">
        <span class="delivery-time">Delivery in <span>10 minutes</span></span>
        <span>India's quickest grocery delivery — QuikKart</span>
      </div>
    </div>
    <header class="main-header">
      <div class="container header-inner">
        <a href="index.html" class="logo-link">
          <svg width="130" height="36" viewBox="0 0 140 40" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="36" height="36" rx="10" fill="#6A0DAD"/>
            <path d="M9 12 L27 12 L11 24 L27 24" stroke="#FFD500" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="42" y="27" font-family="Arial" font-size="22" font-weight="800" fill="#6A0DAD">Quik</text>
            <text x="88" y="27" font-family="Arial" font-size="22" font-weight="800" fill="#FFB300">Kart</text>
          </svg>
        </a>
        <div class="location-box" id="locationBox">
          <div class="loc-title">📍 Delivery in 10 mins</div>
          <div class="loc-sub" id="locSub">Detecting location...</div>
        </div>
        <div class="search-box">
          <span>🔍</span>
          <input id="globalSearch" type="text" placeholder="Search for milk, fruits, snacks...">
        </div>
        <div class="header-actions">
          ${authBlock}
          <a href="cart.html" class="cart-btn">🛒 Cart <span class="cart-count" id="cartCount">0</span></a>
        </div>
      </div>
      <nav class="category-strip">
        <div class="container" id="categoryStrip"></div>
      </nav>
    </header>
  `;

  const search = document.getElementById("globalSearch");
  search.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && search.value.trim()) {
      window.location.href = `search.html?q=${encodeURIComponent(search.value.trim())}`;
    }
  });

  initLiveLocation();

  document.getElementById("categoryStrip").innerHTML = DEMO_CATEGORIES.map(
    (c) => `<a href="category.html?id=${c.id}" class="${activeCategoryId == c.id ? "active" : ""}">${c.emoji} ${c.name}</a>`
  ).join("");

  if (user) {
    const menuBtn = document.getElementById("userMenuBtn");
    const dropdown = document.getElementById("userDropdown");
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("open");
    });
    document.addEventListener("click", () => dropdown.classList.remove("open"));
    document.getElementById("headerLogout").addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("qk_token");
      localStorage.removeItem("qk_user");
      window.location.href = "index.html";
    });
  }

  Cart.updateBadge();
}

function renderFooter() {
  document.getElementById("app-footer").innerHTML = `
    <footer>
      <div class="container">
        <div class="footer-grid">
          <div>
            <h4>QuikKart</h4>
            <ul>
              <li>About Us</li><li>Careers</li><li>Blog</li><li>Press</li>
            </ul>
          </div>
          <div>
            <h4>Customer Service</h4>
            <ul><li>Help Center</li><li>Track Order</li><li>Returns</li></ul>
          </div>
          <div>
            <h4>Categories</h4>
            <ul>${DEMO_CATEGORIES.slice(0, 4).map((c) => `<li>${c.name}</li>`).join("")}</ul>
          </div>
          <div>
            <h4>For Business</h4>
            <ul><li>Admin Login</li><li>Sell on QuikKart</li><li>Advertise</li></ul>
          </div>
        </div>
        <div class="copyright">© 2026 QuikKart Technologies Pvt. Ltd. — Demo project for portfolio/education purposes.</div>
      </div>
    </footer>
  `;
}

function currency(n) {
  return `₹${Number(n).toFixed(0)}`;
}

function discountPercent(price, mrp) {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

// Try the real backend first; silently fall back to embedded demo data
// so the site is always fully browsable (e.g. static preview / offline).
async function loadCategories() {
  try { return await Api.getCategories(); } catch { return DEMO_CATEGORIES; }
}
async function loadProducts(categoryId) {
  try { return await Api.getProducts(categoryId); } catch {
    return categoryId ? DEMO_PRODUCTS.filter((p) => p.category_id == categoryId) : DEMO_PRODUCTS;
  }
}
async function loadProduct(id) {
  try { return await Api.getProduct(id); } catch {
    return DEMO_PRODUCTS.find((p) => p.id == id);
  }
}
async function searchCatalog(q) {
  try { return await Api.searchProducts(q); } catch {
    const lower = q.toLowerCase();
    return DEMO_PRODUCTS.filter((p) => p.name.toLowerCase().includes(lower));
  }
}

function productCardHTML(p) {
  const disc = discountPercent(p.price, p.mrp);
  const qty = Cart.get()[p.id] || 0;
  return `
    <div class="product-card" data-id="${p.id}">
      ${disc > 0 ? `<div class="discount-badge">${disc}% OFF</div>` : ""}
      <a href="product.html?id=${p.id}" class="p-img"><img src="${p.image_url}" alt="${p.name}" loading="lazy"></a>
      <div class="p-weight">${p.weight}</div>
      <a href="product.html?id=${p.id}"><div class="p-name">${p.name}</div></a>
      <div class="p-price-row">
        <div><span class="p-price">${currency(p.price)}</span>${disc > 0 ? `<span class="p-mrp">${currency(p.mrp)}</span>` : ""}</div>
        <div class="cart-control" data-id="${p.id}">
          ${qty > 0
            ? `<div class="qty-control"><button class="dec">−</button><span>${qty}</span><button class="inc">+</button></div>`
            : `<button class="add-btn add-to-cart">ADD</button>`}
        </div>
      </div>
    </div>`;
}

function wireProductGrid(container) {
  container.addEventListener("click", (e) => {
    const card = e.target.closest(".product-card");
    if (!card) return;
    const id = card.dataset.id;
    if (e.target.classList.contains("add-to-cart")) {
      Cart.add(id, 1);
      refreshCartControl(card, id);
    } else if (e.target.classList.contains("inc")) {
      Cart.add(id, 1);
      refreshCartControl(card, id);
    } else if (e.target.classList.contains("dec")) {
      const current = Cart.get()[id] || 0;
      Cart.setQty(id, current - 1);
      refreshCartControl(card, id);
    }
  });
}

function refreshCartControl(card, id) {
  const qty = Cart.get()[id] || 0;
  const holder = card.querySelector(".cart-control");
  holder.innerHTML = qty > 0
    ? `<div class="qty-control"><button class="dec">−</button><span>${qty}</span><button class="inc">+</button></div>`
    : `<button class="add-btn add-to-cart">ADD</button>`;
}


// ---------------------------------------------------------------------
// Real-time delivery location — uses the browser Geolocation API, then
// reverse-geocodes the coordinates to a human-readable city/state via
// OpenStreetMap's free Nominatim API (no API key required).
// ---------------------------------------------------------------------
function initLiveLocation() {
  const locSub = document.getElementById("locSub");
  if (!locSub) return;

  if (!("geolocation" in navigator)) {
    locSub.textContent = "Hyderabad, Telangana, India";
    return;
  }

  // Cache the resolved location for 15 minutes so we don't re-hit the
  // geolocation prompt / reverse-geocode API on every single page load.
  const cached = JSON.parse(sessionStorage.getItem("qk_location") || "null");
  if (cached && Date.now() - cached.ts < 15 * 60 * 1000) {
    locSub.textContent = cached.label;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
        );
        const data = await res.json();
        const a = data.address || {};
        const city = a.city || a.town || a.village || a.suburb || a.county || "Your area";
        const state = a.state || "";
        const label = state ? `${city}, ${state}` : city;
        locSub.textContent = label;
        sessionStorage.setItem("qk_location", JSON.stringify({ label, ts: Date.now() }));
      } catch {
        locSub.textContent = "Location detected";
      }
    },
    () => {
      // Permission denied or unavailable — fall back gracefully.
      locSub.textContent = "Enable location for accurate delivery";
    },
    { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
  );
}
