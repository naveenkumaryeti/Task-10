// Wishlist — a simple localStorage-backed set of favorited product IDs.
const WISHLIST_KEY = "qk_wishlist";

const Wishlist = {
  get() {
    try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; }
    catch { return []; }
  },
  has(productId) {
    return Wishlist.get().includes(String(productId));
  },
  toggle(productId) {
    const id = String(productId);
    let list = Wishlist.get();
    const has = list.includes(id);
    list = has ? list.filter((x) => x !== id) : [...list, id];
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    Wishlist.updateBadge();
    return !has; // returns new state (true = now wishlisted)
  },
  count() {
    return Wishlist.get().length;
  },
  updateBadge() {
    const el = document.getElementById("wishlistCount");
    if (el) el.textContent = Wishlist.count();
  },
};

document.addEventListener("DOMContentLoaded", Wishlist.updateBadge);
