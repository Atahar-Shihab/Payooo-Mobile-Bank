(() => {
  const STORAGE_KEY = "payoo-wallet-v2";
  const SESSION_KEY = "payoo-session";
  const INITIAL_STATE = {
    balance: 45000,
    goal: 18400,
    redeemed: false,
    history: [
      { type: "add-money", amount: 12000, direction: 1, label: "Added money", detail: "City Bank · •••• 3218", at: "2026-10-17T10:10:00+06:00" },
      { type: "pay-bill", amount: 1850, direction: -1, label: "DESCO bill payment", detail: "Electricity · Oct 2026", at: "2026-10-16T16:30:00+06:00" },
      { type: "transfer", amount: 2500, direction: -1, label: "Sent to Nusrat A.", detail: "01700 000 001", at: "2026-10-15T20:15:00+06:00" },
      { type: "cashout", amount: 1000, direction: -1, label: "Cash out", detail: "Agent · 01800 000 002", at: "2026-10-14T12:05:00+06:00" }
    ]
  };
  const TYPE_META = {
    "add-money": { icon: "fa-arrow-down", className: "positive", label: "Added money" },
    cashout: { icon: "fa-money-bill-transfer", className: "negative", label: "Cash out" },
    transfer: { icon: "fa-paper-plane", className: "negative", label: "Sent money" },
    "pay-bill": { icon: "fa-file-lines", className: "negative", label: "Bill payment" },
    bonus: { icon: "fa-gift", className: "positive", label: "Reward redeemed" },
    goal: { icon: "fa-piggy-bank", className: "negative", label: "Added to savings" }
  };
  const money = (value) => new Intl.NumberFormat("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  const safe = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  const getState = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return stored ? { ...INITIAL_STATE, ...stored } : structuredClone(INITIAL_STATE);
    } catch { return structuredClone(INITIAL_STATE); }
  };
  const storeState = (state) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const isPin = (value) => /^0000$/.test(value);
  const isPhone = (value) => /^01\d{9}$/.test(value);
  const shortDate = (value) => new Date(value).toLocaleDateString("en-BD", { day: "numeric", month: "short" });
  const toast = (message, kind = "success") => {
    const region = document.querySelector("#toast-region");
    if (!region) return;
    const notification = document.createElement("div");
    notification.className = `toast toast--${kind}`;
    notification.innerHTML = `<i class="fa-solid ${kind === "success" ? "fa-circle-check" : "fa-circle-exclamation"}"></i><span>${safe(message)}</span>`;
    region.append(notification);
    setTimeout(() => notification.remove(), 3600);
  };

  function initLogin() {
    const form = document.querySelector("#login-form");
    if (!form) return;
    document.querySelectorAll("[data-password-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const input = document.querySelector(`#${button.dataset.passwordToggle}`);
        const masked = input.type === "password";
        input.type = masked ? "text" : "password";
        button.innerHTML = `<i class="fa-regular fa-eye${masked ? "-slash" : ""}"></i>`;
        button.setAttribute("aria-label", masked ? "Hide PIN" : "Show PIN");
      });
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      if (data.get("mobile") !== "00000000000" || data.get("pin") !== "0000") {
        toast("Use the demo mobile number and PIN shown below.", "error");
        return;
      }
      sessionStorage.setItem(SESSION_KEY, "active");
      window.location.assign("./home.html");
    });
  }

  function initDashboard() {
    if (!document.querySelector("#balance")) return;
    if (sessionStorage.getItem(SESSION_KEY) !== "active") { window.location.replace("./index.html"); return; }
    let state = getState();
    let balanceVisible = true;
    let selectedView = "overview";
    const modal = document.querySelector("#transaction-modal");
    const modalContent = document.querySelector("#modal-content");
    const modalStep = document.querySelector("#modal-step");
    const activityPreview = document.querySelector("#activity-preview");
    const historyContainer = document.querySelector("#history-container");
    const renderBalance = () => document.querySelector("#balance").textContent = balanceVisible ? money(state.balance) : "••••••••";
    const renderTotals = () => {
      const income = state.history.filter((item) => item.direction > 0).reduce((total, item) => total + item.amount, 0);
      const spend = state.history.filter((item) => item.direction < 0).reduce((total, item) => total + item.amount, 0);
      document.querySelector("#income-total").textContent = `৳${money(income)}`;
      document.querySelector("#spend-total").textContent = `৳${money(spend)}`;
      const percentage = Math.min(Math.round((state.goal / 60000) * 100), 100);
      document.querySelector("#goal-progress").style.width = `${percentage}%`;
      document.querySelector("#goal-label").textContent = `${percentage}%`;
      document.querySelector("#goal-saved").textContent = `৳${money(state.goal)} saved`;
    };
    const activityMarkup = (item) => {
      const meta = TYPE_META[item.type] || TYPE_META.transfer;
      return `<div class="activity-row"><span class="activity-row__icon"><i class="fa-solid ${meta.icon}"></i></span><div class="activity-row__text"><strong>${safe(item.label)}</strong><small>${safe(item.detail)} · ${shortDate(item.at)}</small></div><span class="activity-row__amount ${meta.className}">${item.direction < 0 ? "−" : "+"}৳${money(item.amount)}</span></div>`;
    };
    const renderActivity = (query = "") => {
      const items = state.history.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query.toLowerCase()));
      activityPreview.innerHTML = state.history.slice(0, 3).map(activityMarkup).join("") || '<p class="empty-history">No activity yet.</p>';
      historyContainer.innerHTML = items.map(activityMarkup).join("") || '<p class="empty-history">No transactions match your search.</p>';
    };
    const save = () => { storeState(state); renderBalance(); renderTotals(); renderActivity(); };
    const addTransaction = (type, amount, detail, label = TYPE_META[type].label) => {
      const direction = TYPE_META[type].className === "positive" ? 1 : -1;
      state.balance += amount * direction;
      state.history.unshift({ type, amount, direction, label, detail, at: new Date().toISOString() });
      save();
    };
    const closeModal = () => { if (modal.open) modal.close(); };
    const openModal = () => { if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", ""); };
    const navigate = (view) => {
      selectedView = view;
      document.querySelectorAll(".app-view").forEach((item) => item.classList.toggle("hidden", item.id !== `${view}-view`));
      document.querySelectorAll("[data-view]").forEach((item) => item.classList.toggle("is-active", item.dataset.view === view));
      document.querySelector("#page-heading").textContent = view === "overview" ? "Good morning, Shihab ✦" : ({ activity: "Your activity", insights: "Money insights", rewards: "Payoo rewards" })[view];
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.querySelector(".sidebar").classList.remove("is-open");
    };
    const transactionTemplates = {
      "add-money": { title: "Add money", description: "Top up your wallet from a connected bank account.", fields: `<label>Choose bank<select name="bank"><option value="">Select your bank</option><option>City Bank</option><option>DBBL</option><option>IBBL</option></select></label><label>Account number<input name="account" maxlength="11" inputmode="numeric" placeholder="11-digit account number" /></label><label>Amount<input name="amount" inputmode="decimal" placeholder="Enter amount" /></label>` },
      transfer: { title: "Send money", description: "Send instantly to any Payoo wallet, free of charge.", fields: `<label>Recipient number<input name="recipient" maxlength="11" inputmode="numeric" placeholder="01XXXXXXXXX" value="{{recipient}}" /></label><label>Amount<input name="amount" inputmode="decimal" placeholder="Enter amount" /></label>` },
      cashout: { title: "Cash out", description: "Withdraw securely from a nearby Payoo agent.", fields: `<label>Agent number<input name="recipient" maxlength="11" inputmode="numeric" placeholder="01XXXXXXXXX" /></label><label>Amount<input name="amount" inputmode="decimal" placeholder="Enter amount" /></label>` },
      "pay-bill": { title: "Pay a bill", description: "A better way to stay on top of your essentials.", fields: `<label>Biller name<input name="biller" placeholder="e.g. DESCO" /></label><label>Bill reference<input name="reference" placeholder="Bill or customer number" /></label><label>Amount<input name="amount" inputmode="decimal" placeholder="Enter amount" /></label>` },
      bonus: { title: "Claim your reward", description: "A little something from Payoo, just for you.", fields: `<label>Reward code<input name="code" placeholder="Enter PAYOO100" /></label>` }
    };
    const showSuccess = (title, amount, detail) => {
      modalStep.textContent = "TRANSACTION COMPLETE";
      modalContent.innerHTML = `<div class="success-state"><i class="fa-solid fa-check"></i><h2>${safe(title)}</h2><p>Your wallet has been updated.</p><div class="receipt"><div><span>Amount</span><strong>৳${money(amount)}</strong></div><div><span>Details</span><strong>${safe(detail)}</strong></div><div><span>Time</span><strong>Just now</strong></div></div><button id="done-btn" class="button button--primary" type="button">Back to wallet</button></div>`;
      document.querySelector("#done-btn").addEventListener("click", closeModal);
    };
    const openTransaction = (type, recipient = "") => {
      const template = transactionTemplates[type];
      if (!template) return;
      modalStep.textContent = "SECURE TRANSACTION";
      modalContent.innerHTML = `<div class="modal-content"><h2>${template.title}</h2><p>${template.description}</p><form id="transaction-form" class="modal-form" data-type="${type}">${template.fields.replace("{{recipient}}", safe(recipient))}<label>4-digit PIN<input name="pin" type="password" inputmode="numeric" maxlength="4" placeholder="Enter your PIN" /></label><button class="button button--primary" type="submit">Continue <i class="fa-solid fa-arrow-right"></i></button></form><div class="security-strip"><i class="fa-solid fa-shield-heart"></i><span>Protected with Payoo security</span></div></div>`;
      openModal();
      document.querySelector("#transaction-form").addEventListener("submit", (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget));
        if (!isPin(data.pin)) { toast("Enter the valid demo PIN (0000).", "error"); return; }
        if (type === "bonus") {
          if (data.code.trim().toUpperCase() !== "PAYOO100") { toast("That reward code is not valid.", "error"); return; }
          if (state.redeemed) { toast("This reward was already claimed.", "error"); return; }
          state.redeemed = true; addTransaction("bonus", 100, "Welcome reward · PAYOO100"); showSuccess("Reward claimed!", 100, "PAYOO100 bonus"); return;
        }
        const amount = Number(data.amount);
        if (!Number.isFinite(amount) || amount <= 0) { toast("Enter an amount greater than ৳0.", "error"); return; }
        if (type !== "add-money" && amount > state.balance) { toast("Your available balance is not enough.", "error"); return; }
        if (type === "add-money" && (!data.bank || !isPhone(data.account))) { toast("Choose a bank and enter a valid 11-digit account number.", "error"); return; }
        if (["transfer", "cashout"].includes(type) && !isPhone(data.recipient)) { toast("Enter a valid 11-digit mobile number.", "error"); return; }
        if (type === "pay-bill" && (!data.biller.trim() || !data.reference.trim())) { toast("Add the biller and bill reference.", "error"); return; }
        const detail = { "add-money": `${data.bank} · ${data.account}`, transfer: `To ${data.recipient}`, cashout: `Agent · ${data.recipient}`, "pay-bill": `${data.biller} · ${data.reference}` }[type];
        const label = type === "transfer" ? "Sent money" : TYPE_META[type].label;
        addTransaction(type, amount, detail, label); showSuccess(type === "add-money" ? "Money added!" : type === "pay-bill" ? "Bill paid!" : `${template.title} complete!`, amount, detail);
      });
    };
    document.querySelector("#today-date").textContent = new Date().toLocaleDateString("en-BD", { weekday: "long", day: "numeric", month: "long" });
    document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => navigate(button.dataset.view)));
    document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => openTransaction(button.dataset.action)));
    document.querySelectorAll("[data-contact]").forEach((button) => button.addEventListener("click", () => openTransaction("transfer", button.dataset.contact)));
    document.querySelector("#balance-visibility").addEventListener("click", () => { balanceVisible = !balanceVisible; renderBalance(); document.querySelector("#balance-visibility").innerHTML = `<i class="fa-regular fa-eye${balanceVisible ? "" : "-slash"}"></i>`; });
    document.querySelector("#logout-btn").addEventListener("click", () => { sessionStorage.removeItem(SESSION_KEY); window.location.assign("./index.html"); });
    document.querySelector("#modal-close").addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
    document.querySelector("#notification-btn").addEventListener("click", () => document.querySelector("#notification-modal").showModal());
    document.querySelector("[data-close-notifications]").addEventListener("click", () => document.querySelector("#notification-modal").close());
    document.querySelector("#mobile-menu").addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("is-open"));
    document.querySelector("#history-search").addEventListener("input", (event) => renderActivity(event.target.value));
    document.querySelector("#clear-history").addEventListener("click", () => { state.history = []; save(); toast("Your transaction history was cleared."); });
    document.querySelector("#save-goal").addEventListener("click", () => { if (state.balance < 500) { toast("Your available balance is not enough.", "error"); return; } state.goal += 500; addTransaction("goal", 500, "Dream getaway fund"); toast("৳500 moved into your savings goal."); });
    renderBalance(); renderTotals(); renderActivity(); navigate(selectedView);
  }
  initLogin(); initDashboard();
})();
