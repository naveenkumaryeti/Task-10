// Simple client-side cart persisted in localStorage as { [productId]: qty }
const CART_KEY = "qk_cart";

const Cart = {
  get() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; }
    catch { return {}; }
  },
  save(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    Cart.updateBadge();
  },
  add(productId, qty = 1) {
    const cart = Cart.get();
    cart[productId] = (cart[productId] || 0) + qty;
    Cart.save(cart);
  },
  setQty(productId, qty) {
    const cart = Cart.get();
    if (qty <= 0) delete cart[productId];
    else cart[productId] = qty;
    Cart.save(cart);
  },
  remove(productId) {
    const cart = Cart.get();
    delete cart[productId];
    Cart.save(cart);
  },
  clear() {
    localStorage.removeItem(CART_KEY);
    Cart.updateBadge();
  },
  totalItems() {
    return Object.values(Cart.get()).reduce((a, b) => a + b, 0);
  },
  updateBadge() {
    const el = document.getElementById("cartCount");
    if (el) el.textContent = Cart.totalItems();
  },
};

document.addEventListener("DOMContentLoaded", Cart.updateBadge);
