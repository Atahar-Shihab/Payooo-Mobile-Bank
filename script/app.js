(() => {
  const STORAGE_KEY = "payoo-wallet";
  const INITIAL_STATE = { balance: 45000, history: [], redeemed: false };
  const formatMoney = (value) => new Intl.NumberFormat("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  const readState = () => {
    try { return { ...INITIAL_STATE, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) }; }
    catch { return { ...INITIAL_STATE }; }
  };
  const saveState = (state) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const toast = (message, type = "success") => {
    const region = document.querySelector("#toast-region");
    if (!region) return;
    const item = document.createElement("div");
    item.className = `toast toast--${type}`;
    item.innerHTML = `<i class="fa-solid ${type === "success" ? "fa-circle-check" : "fa-circle-exclamation"}"></i><span>${message}</span>`;
    region.append(item);
    setTimeout(() => item.remove(), 3600);
  };
  const isMobile = (value) => /^01\d{9}$/.test(value);
  const isPin = (value) => /^0000$/.test(value);

  function initLogin() {
    const form = document.querySelector("#login-form");
    if (!form) return;
    document.querySelectorAll("[data-password-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const input = document.querySelector(`#${button.dataset.passwordToggle}`);
        const concealed = input.type === "password";
        input.type = concealed ? "text" : "password";
        button.innerHTML = `<i class="fa-regular fa-eye${concealed ? "-slash" : ""}"></i>`;
        button.setAttribute("aria-label", concealed ? "Hide PIN" : "Show PIN");
      });
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(form);
      if (formData.get("mobile") !== "00000000000" || formData.get("pin") !== "0000") {
        toast("Use the provided demo mobile number and PIN.", "error");
        return;
      }
      sessionStorage.setItem("payoo-session", "active");
      window.location.href = "./home.html";
    });
  }

  function initDashboard() {
    if (!document.querySelector("#balance")) return;
    if (sessionStorage.getItem("payoo-session") !== "active") {
      window.location.replace("./index.html");
      return;
    }
    let state = readState();
    let balanceVisible = true;
    const balanceEl = document.querySelector("#balance");
    const historyEl = document.querySelector("#history-container");
    const balanceToggle = document.querySelector("#balance-visibility");
    const typeMeta = {
      "add-money": { label: "Added money", icon: "fa-plus", direction: 1 },
      cashout: { label: "Cash out", icon: "fa-arrow-up-right-dots", direction: -1 },
      transfer: { label: "Sent money", icon: "fa-paper-plane", direction: -1 },
      "pay-bill": { label: "Bill payment", icon: "fa-file-lines", direction: -1 },
      bonus: { label: "Reward redeemed", icon: "fa-gift", direction: 1 }
    };
    const renderBalance = () => { balanceEl.textContent = balanceVisible ? formatMoney(state.balance) : "••••••••"; };
    const renderHistory = () => {
      historyEl.replaceChildren();
      if (!state.history.length) { historyEl.innerHTML = '<p class="empty-history">No transactions yet. Your activity will appear here.</p>'; return; }
      state.history.slice(0, 12).forEach((entry) => {
        const row = document.createElement("div");
        row.className = "history-item";
        row.innerHTML = `<span class="history-item__icon"><i class="fa-solid ${typeMeta[entry.type]?.icon || "fa-receipt"}"></i></span><div class="history-item__body"><strong>${escapeHtml(entry.label)}</strong><small>${escapeHtml(entry.detail)} · ${new Date(entry.at).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}</small></div><span class="history-item__amount ${entry.direction < 0 ? "negative" : ""}">${entry.direction < 0 ? "−" : "+"}৳${formatMoney(entry.amount)}</span>`;
        historyEl.append(row);
      });
    };
    const addTransaction = (type, amount, detail) => {
      const meta = typeMeta[type];
      state.balance += amount * meta.direction;
      state.history.unshift({ type, amount, detail, label: meta.label, direction: meta.direction, at: new Date().toISOString() });
      saveState(state); renderBalance(); renderHistory();
    };
    const setAction = (id) => {
      document.querySelectorAll(".transaction-panel").forEach((panel) => panel.classList.toggle("hidden", panel.id !== id));
      document.querySelectorAll(".action-card").forEach((card) => card.classList.toggle("is-active", card.dataset.action === id));
    };
    document.querySelector("#today-date").textContent = new Date().toLocaleDateString("en-BD", { weekday: "long", day: "numeric", month: "long" });
    document.querySelectorAll(".action-card").forEach((card) => card.addEventListener("click", () => setAction(card.dataset.action)));
    balanceToggle.addEventListener("click", () => { balanceVisible = !balanceVisible; balanceToggle.innerHTML = `<i class="fa-regular fa-eye${balanceVisible ? "" : "-slash"}"></i> ${balanceVisible ? "Hide" : "Show"} balance`; renderBalance(); });
    document.querySelector("#logout-btn").addEventListener("click", () => { sessionStorage.removeItem("payoo-session"); window.location.href = "./index.html"; });
    document.querySelector("#clear-history").addEventListener("click", () => { state.history = []; saveState(state); renderHistory(); toast("Transaction history cleared."); });
    document.querySelectorAll(".transaction-form").forEach((form) => form.addEventListener("submit", (event) => {
      event.preventDefault();
      const type = form.dataset.transaction;
      const data = Object.fromEntries(new FormData(form));
      if (!isPin(data.pin)) { toast("Enter the valid 4-digit demo PIN.", "error"); return; }
      if (["add-money", "cashout", "transfer"].includes(type) && !isMobile(type === "add-money" ? data.account : data.recipient)) { toast("Enter a valid 11-digit Bangladeshi mobile/account number.", "error"); return; }
      if (type === "pay-bill" && (!data.biller.trim() || !data.reference.trim())) { toast("Add the biller and bill reference.", "error"); return; }
      if (type === "bonus") {
        if (data.code.trim().toUpperCase() !== "PAYOO100") { toast("That reward code is not valid.", "error"); return; }
        if (state.redeemed) { toast("This reward has already been redeemed.", "error"); return; }
        state.redeemed = true; addTransaction(type, 100, "PAYOO100 bonus"); form.reset(); toast("৳100 reward added to your wallet!"); return;
      }
      const amount = Number(data.amount);
      if (!Number.isFinite(amount) || amount <= 0) { toast("Enter an amount greater than ৳0.", "error"); return; }
      if (type !== "add-money" && amount > state.balance) { toast("Your wallet balance is not enough for this transaction.", "error"); return; }
      const details = { "add-money": `${data.bank} · ${data.account}`, cashout: `Agent ${data.recipient}`, transfer: `To ${data.recipient}`, "pay-bill": `${data.biller} · ${data.reference}` };
      if (type === "add-money" && !data.bank) { toast("Choose a bank to continue.", "error"); return; }
      addTransaction(type, amount, details[type]); form.reset(); toast(`${typeMeta[type].label} completed successfully.`);
    }));
    renderBalance(); renderHistory();
  }
  initLogin(); initDashboard();
})();
