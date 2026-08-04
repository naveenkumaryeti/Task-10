// Lightweight toast notifications — replaces jarring alert()/confirm()
// popups with non-blocking, auto-dismissing messages in the corner.
const Toast = {
  show(message, type = "success", duration = 2800) {
    let host = document.getElementById("toastHost");
    if (!host) {
      host = document.createElement("div");
      host.id = "toastHost";
      host.className = "toast-host";
      document.body.appendChild(host);
    }
    const icons = { success: "✅", error: "❌", info: "ℹ️" };
    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
    host.appendChild(el);

    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 250);
    }, duration);
  },
  success(msg, duration) { Toast.show(msg, "success", duration); },
  error(msg, duration) { Toast.show(msg, "error", duration); },
  info(msg, duration) { Toast.show(msg, "info", duration); },

  // Promise-based confirm dialog to replace window.confirm() with a
  // styled, non-blocking modal that matches the site's design.
  confirm(message, { confirmText = "Confirm", cancelText = "Cancel" } = {}) {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "modal-overlay";
      overlay.innerHTML = `
        <div class="modal-box" style="max-width:360px;text-align:center;">
          <p style="font-size:15px;margin-bottom:20px;">${message}</p>
          <div class="modal-actions">
            <button class="btn btn-outline" id="toastCancelBtn">${cancelText}</button>
            <button class="btn btn-primary" id="toastConfirmBtn" style="background:var(--danger);">${confirmText}</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      overlay.querySelector("#toastCancelBtn").addEventListener("click", () => { overlay.remove(); resolve(false); });
      overlay.querySelector("#toastConfirmBtn").addEventListener("click", () => { overlay.remove(); resolve(true); });
      overlay.addEventListener("click", (e) => { if (e.target === overlay) { overlay.remove(); resolve(false); } });
    });
  },
};
