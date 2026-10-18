(() => {
  const STORAGE_KEY = "payoo-wallet-v2";
  const SESSION_KEY = "payoo-session";
  const USER_MOBILE_KEY = "payoo-user-mobile";

  const INITIAL_STATE = {
    balance: 45000,
    goal: 18400,
    goalTarget: 60000,
    redeemed: false,
    soundEnabled: true,
    contacts: [
      { name: "Nusrat A.", phone: "01700000001", avatar: "avatar--violet", initials: "NA" },
      { name: "Rafi K.", phone: "01800000002", avatar: "avatar--orange", initials: "RK" },
      { name: "Samia M.", phone: "01900000003", avatar: "avatar--mint", initials: "SM" }
    ],
    notifications: [
      { id: "notif-1", title: "Security verification active", detail: "Two-step authorization is enabled for all outgoing transfers.", at: "2026-10-18T09:00:00+06:00", read: false },
      { id: "notif-2", title: "Weekend bill discount", detail: "Pay DESCO or WASA this weekend to earn up to ৳50 cashback.", at: "2026-10-17T18:00:00+06:00", read: false },
      { id: "notif-3", title: "Wallet verified", detail: "Tier-2 KYC verification completed successfully.", at: "2026-10-16T12:00:00+06:00", read: true }
    ],
    history: [
      { id: "TXN-88F92A", type: "add-money", amount: 12000, fee: 0, direction: 1, label: "Added money", detail: "City Bank · •••• 3218", at: "2026-10-17T10:10:00+06:00", balanceAfter: 45000 },
      { id: "TXN-77C81B", type: "pay-bill", amount: 1850, fee: 0, direction: -1, label: "DESCO bill payment", detail: "Electricity · Oct 2026", at: "2026-10-16T16:30:00+06:00", balanceAfter: 33000 },
      { id: "TXN-66B70C", type: "transfer", amount: 2500, fee: 0, direction: -1, label: "Sent to Nusrat A.", detail: "01700 000 001", at: "2026-10-15T20:15:00+06:00", balanceAfter: 34850 },
      { id: "TXN-55A69D", type: "cashout", amount: 1000, fee: 14.9, direction: -1, label: "Cash out", detail: "Agent · 01800 000 002", at: "2026-10-14T12:05:00+06:00", balanceAfter: 37350 }
    ]
  };

  const TYPE_META = {
    "add-money": { icon: "fa-arrow-down", className: "positive", label: "Added money" },
    cashout: { icon: "fa-money-bill-transfer", className: "negative", label: "Cash out" },
    transfer: { icon: "fa-paper-plane", className: "negative", label: "Sent money" },
    recharge: { icon: "fa-mobile-screen-button", className: "negative", label: "Mobile recharge" },
    "pay-bill": { icon: "fa-file-lines", className: "negative", label: "Bill payment" },
    request: { icon: "fa-hand-holding-dollar", className: "positive", label: "Money requested" },
    bonus: { icon: "fa-gift", className: "positive", label: "Reward redeemed" },
    goal: { icon: "fa-piggy-bank", className: "negative", label: "Added to savings" },
    "goal-withdraw": { icon: "fa-vault", className: "positive", label: "Withdrawn from savings" }
  };

  const money = (value) =>
    new Intl.NumberFormat("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0);

  const safe = (value) =>
    String(value ?? "").replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[c]);

  const getState = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!stored) return structuredClone(INITIAL_STATE);
      return {
        ...INITIAL_STATE,
        ...stored,
        contacts: Array.isArray(stored.contacts) ? stored.contacts : INITIAL_STATE.contacts,
        notifications: Array.isArray(stored.notifications) ? stored.notifications : INITIAL_STATE.notifications,
        history: Array.isArray(stored.history) ? stored.history : INITIAL_STATE.history
      };
    } catch {
      return structuredClone(INITIAL_STATE);
    }
  };

  const storeState = (state) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  const isPin = (value) => String(value).trim() === "0000";
  const isPhone = (value) => {
    const val = String(value).trim();
    return /^01\d{9}$/.test(val) || val === "00000000000";
  };
  const isAccount = (value) => /^\d{8,18}$/.test(String(value).trim());

  const shortDate = (value) => {
    try {
      return new Date(value).toLocaleDateString("en-BD", { day: "numeric", month: "short" });
    } catch {
      return "Recent";
    }
  };

  const fullDateTime = (value) => {
    try {
      return new Date(value).toLocaleDateString("en-BD", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "Just now";
    }
  };

  const playSound = (kind, enabled = true) => {
    if (!enabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (kind === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (kind === "tap") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      }
    } catch {
      // Audio autoplay policy or device without audio
    }
  };

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

    // Check if user already has an active session
    const sessionActive = sessionStorage.getItem(SESSION_KEY) === "active";
    const sessionBanner = document.querySelector("#active-session-banner");
    if (sessionActive && sessionBanner) {
      sessionBanner.classList.remove("hidden");
    }

    // Toggle PIN visibility
    document.querySelectorAll("[data-password-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        const input = document.querySelector(`#${button.dataset.passwordToggle}`);
        if (!input) return;
        const masked = input.type === "password";
        input.type = masked ? "text" : "password";
        button.innerHTML = `<i class="fa-regular fa-eye${masked ? "-slash" : ""}"></i>`;
        button.setAttribute("aria-label", masked ? "Hide PIN" : "Show PIN");
      });
    });

    // Auto-fill demo credentials on click
    const demoBadge = document.querySelector("#demo-badge");
    if (demoBadge) {
      const fillDemo = () => {
        const numInput = document.querySelector("#input-number");
        const pinInput = document.querySelector("#input-pin");
        if (numInput && pinInput) {
          numInput.value = "00000000000";
          pinInput.value = "0000";
          toast("Demo credentials filled! Click 'Sign in' to continue.");
        }
      };
      demoBadge.addEventListener("click", fillDemo);
      demoBadge.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          fillDemo();
        }
      });
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const mobile = String(data.get("mobile") || "").trim();
      const pin = String(data.get("pin") || "").trim();

      if (!isPhone(mobile) || !isPin(pin)) {
        toast("Please enter a valid mobile number and demo PIN (0000).", "error");
        return;
      }

      sessionStorage.setItem(SESSION_KEY, "active");
      sessionStorage.setItem(USER_MOBILE_KEY, mobile);
      window.location.assign("./home.html");
    });
  }

  function initDashboard() {
    if (!document.querySelector("#balance")) return;

    // Protect dashboard view with active session check
    if (sessionStorage.getItem(SESSION_KEY) !== "active") {
      window.location.replace("./index.html");
      return;
    }

    let state = getState();
    let balanceVisible = true;
    let selectedView = "overview";
    let activeFilter = "all";

    const userMobile = sessionStorage.getItem(USER_MOBILE_KEY) || "01700000000";
    const userInitials = userMobile === "00000000000" ? "AS" : userMobile.slice(-2);

    // Dialog elements
    const transactionModal = document.querySelector("#transaction-modal");
    const transactionModalContent = document.querySelector("#modal-content");
    const transactionModalStep = document.querySelector("#modal-step");

    const receiptModal = document.querySelector("#receipt-modal");
    const receiptContent = document.querySelector("#receipt-content");

    const notificationModal = document.querySelector("#notification-modal");
    const notifList = document.querySelector("#notif-list");
    const notifBadge = document.querySelector("#notif-badge");

    const profileModal = document.querySelector("#profile-modal");
    const profileContent = document.querySelector("#profile-content");

    const contactModal = document.querySelector("#contact-modal");

    const activityPreview = document.querySelector("#activity-preview");
    const historyContainer = document.querySelector("#history-container");

    // Dynamic greeting based on current time
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good morning";
      if (hour < 17) return "Good afternoon";
      return "Good evening";
    };

    const updateHeading = (view) => {
      const pageHeading = document.querySelector("#page-heading");
      if (!pageHeading) return;
      if (view === "overview") {
        pageHeading.innerHTML = `${getGreeting()}, Shihab <span>✦</span>`;
      } else {
        const titles = {
          activity: "Your Activity",
          insights: "Financial Insights",
          rewards: "Payoo Rewards"
        };
        pageHeading.textContent = titles[view] || "Payoo Wallet";
      }
    };

    // Render balance
    const renderBalance = () => {
      const balanceEl = document.querySelector("#balance");
      if (balanceEl) {
        balanceEl.textContent = balanceVisible ? money(state.balance) : "••••••••";
      }
      const maskEl = document.querySelector("#account-mask");
      if (maskEl) {
        maskEl.textContent = `•••• ${userMobile.slice(-4)}`;
      }
      const initialsEl = document.querySelector("#user-initials");
      if (initialsEl) {
        initialsEl.textContent = userInitials;
      }
    };

    // Render Weekly Activity Chart
    const renderWeeklyChart = () => {
      const chartEl = document.querySelector("#weekly-chart");
      const weekTotalEl = document.querySelector("#chart-week-total");
      const dailyAvgEl = document.querySelector("#chart-daily-avg");
      if (!chartEl) return;

      const daySpends = [0, 0, 0, 0, 0, 0, 0]; // Mon to Sun
      const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      state.history.forEach((tx) => {
        if (tx.direction < 0) {
          const txDate = new Date(tx.at);
          if (txDate >= sevenDaysAgo) {
            // Day index: Monday is 0, Sunday is 6
            const dayOfWeek = (txDate.getDay() + 6) % 7;
            daySpends[dayOfWeek] += Number(tx.amount) || 0;
          }
        }
      });

      const totalWeekSpend = daySpends.reduce((acc, curr) => acc + curr, 0);
      const maxSpend = Math.max(...daySpends, 2000);

      if (weekTotalEl) weekTotalEl.textContent = `৳${money(totalWeekSpend)}`;
      if (dailyAvgEl) dailyAvgEl.textContent = `৳${money(totalWeekSpend / 7)}`;

      chartEl.innerHTML = daySpends
        .map((amount, idx) => {
          const pct = Math.max(Math.round((amount / maxSpend) * 100), 10);
          return `<span style="--size:${pct}%;" title="${dayNames[idx]}: ৳${money(amount)}">
            <div class="chart-tooltip">${dayNames[idx]}<br /><strong>৳${money(amount)}</strong></div>
          </span>`;
        })
        .join("");
    };

    // Render Category Breakdown
    const renderCategoryBreakdown = () => {
      const listEl = document.querySelector("#category-list");
      if (!listEl) return;

      const categories = {
        transfer: { label: "Money Transfers", amount: 0, color: "#6955f6" },
        "pay-bill": { label: "Utility & Bills", amount: 0, color: "#876ad7" },
        cashout: { label: "Agent Cash Out", amount: 0, color: "#f5a049" },
        recharge: { label: "Mobile Recharge", amount: 0, color: "#19b889" },
        goal: { label: "Savings & Goals", amount: 0, color: "#22a981" }
      };

      let totalOutflow = 0;
      state.history.forEach((tx) => {
        if (tx.direction < 0) {
          const cat = categories[tx.type] || categories.transfer;
          cat.amount += Number(tx.amount) || 0;
          totalOutflow += Number(tx.amount) || 0;
        }
      });

      if (totalOutflow === 0) {
        listEl.innerHTML = '<p class="muted" style="font-size:0.78rem; padding:12px 0;">No spending recorded yet.</p>';
        return;
      }

      const rows = Object.values(categories)
        .filter((cat) => cat.amount > 0)
        .sort((a, b) => b.amount - a.amount)
        .map((cat) => {
          const pct = Math.round((cat.amount / totalOutflow) * 100);
          return `
            <div class="category-item">
              <div class="category-meta">
                <span>${cat.label}</span>
                <span>৳${money(cat.amount)} (${pct}%)</span>
              </div>
              <div class="category-track">
                <div class="category-fill" style="width: ${pct}%; background: ${cat.color};"></div>
              </div>
            </div>
          `;
        });

      listEl.innerHTML = rows.join("");
    };

    // Render Totals & Goal
    const renderTotals = () => {
      const income = state.history
        .filter((item) => item.direction > 0)
        .reduce((total, item) => total + Number(item.amount), 0);
      const spend = state.history
        .filter((item) => item.direction < 0)
        .reduce((total, item) => total + Number(item.amount), 0);

      const incomeEl = document.querySelector("#income-total");
      const spendEl = document.querySelector("#spend-total");
      if (incomeEl) incomeEl.textContent = `৳${money(income)}`;
      if (spendEl) spendEl.textContent = `৳${money(spend)}`;

      const percentage = Math.min(Math.round((state.goal / (state.goalTarget || 60000)) * 100), 100);
      const goalProgress = document.querySelector("#goal-progress");
      const goalLabel = document.querySelector("#goal-label");
      const goalSaved = document.querySelector("#goal-saved");
      if (goalProgress) goalProgress.style.width = `${percentage}%`;
      if (goalLabel) goalLabel.textContent = `${percentage}%`;
      if (goalSaved) goalSaved.textContent = `৳${money(state.goal)} saved`;

      renderWeeklyChart();
      renderCategoryBreakdown();
    };

    // Render Saved Contacts
    const renderContacts = () => {
      const container = document.querySelector("#contacts-list");
      if (!container) return;
      container.innerHTML = state.contacts
        .map(
          (c) => `
          <button class="contact" data-contact="${safe(c.phone)}" type="button">
            <span class="avatar ${safe(c.avatar)}">${safe(c.initials)}</span>
            <strong>${safe(c.name)}</strong>
            <small>${safe(c.phone)}</small>
          </button>
        `
        )
        .join("");

      container.querySelectorAll("[data-contact]").forEach((btn) => {
        btn.addEventListener("click", () => openTransaction("transfer", btn.dataset.contact));
      });
    };

    // Render Notifications
    const renderNotifications = () => {
      if (!notifList) return;
      const unreadCount = state.notifications.filter((n) => !n.read).length;
      if (notifBadge) {
        notifBadge.style.display = unreadCount > 0 ? "block" : "none";
      }

      if (state.notifications.length === 0) {
        notifList.innerHTML = '<p class="empty-history">No notifications right now.</p>';
        return;
      }

      notifList.innerHTML = state.notifications
        .map(
          (n) => `
          <div class="notif-item ${n.read ? "" : "is-unread"}">
            <div class="notif-item__icon"><i class="fa-solid fa-bell"></i></div>
            <div class="notif-item__content">
              <strong>${safe(n.title)}</strong>
              <p>${safe(n.detail)}</p>
              <small>${shortDate(n.at)}</small>
            </div>
          </div>
        `
        )
        .join("");
    };

    // Activity Markup
    const activityMarkup = (item) => {
      const meta = TYPE_META[item.type] || TYPE_META.transfer;
      const isPositive = item.direction > 0;
      return `
        <div class="activity-row" data-txid="${safe(item.id)}" tabindex="0" role="button" title="Click to view receipt">
          <span class="activity-row__icon"><i class="fa-solid ${meta.icon}"></i></span>
          <div class="activity-row__text">
            <strong>${safe(item.label)}</strong>
            <small>${safe(item.detail)} · ${shortDate(item.at)}</small>
          </div>
          <span class="activity-row__amount ${meta.className}">
            ${isPositive ? "+" : "−"}৳${money(item.amount)}
          </span>
          <i class="activity-row__action fa-solid fa-chevron-right"></i>
        </div>
      `;
    };

    // Attach click listener on activity rows to open receipt
    const bindActivityRowEvents = (container) => {
      container.querySelectorAll(".activity-row").forEach((row) => {
        row.addEventListener("click", () => {
          const txId = row.dataset.txid;
          const found = state.history.find((t) => t.id === txId);
          if (found) openReceipt(found);
        });
      });
    };

    // Render Activity Feed
    const renderActivity = (query = "", filter = activeFilter) => {
      let filtered = state.history;

      if (filter === "inflow") {
        filtered = filtered.filter((i) => i.direction > 0);
      } else if (filter === "outflow") {
        filtered = filtered.filter((i) => i.direction < 0);
      } else if (filter !== "all") {
        filtered = filtered.filter((i) => i.type === filter);
      }

      if (query.trim()) {
        const q = query.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.detail.toLowerCase().includes(q) ||
            (item.id && item.id.toLowerCase().includes(q))
        );
      }

      if (activityPreview) {
        activityPreview.innerHTML =
          state.history.slice(0, 4).map(activityMarkup).join("") ||
          '<p class="empty-history">No activity recorded yet.</p>';
        bindActivityRowEvents(activityPreview);
      }

      if (historyContainer) {
        historyContainer.innerHTML =
          filtered.map(activityMarkup).join("") ||
          '<p class="empty-history">No transactions match your criteria.</p>';
        bindActivityRowEvents(historyContainer);
      }
    };

    // Save state helper
    const save = () => {
      storeState(state);
      renderBalance();
      renderTotals();
      renderContacts();
      renderNotifications();
      renderActivity(document.querySelector("#history-search")?.value || "", activeFilter);
    };

    // Add transaction to history
    const addTransaction = (type, amount, detail, label = TYPE_META[type].label, fee = 0) => {
      const direction = TYPE_META[type].className === "positive" ? 1 : -1;
      const totalDelta = amount * direction - (direction < 0 ? fee : 0);
      state.balance += totalDelta;

      const txId = `TXN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      state.history.unshift({
        id: txId,
        type,
        amount,
        fee,
        direction,
        label,
        detail,
        at: new Date().toISOString(),
        balanceAfter: state.balance
      });

      // Also generate notification
      state.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: label,
        detail: `${direction > 0 ? "Received" : "Paid"} ৳${money(amount)} (${detail})`,
        at: new Date().toISOString(),
        read: false
      });

      playSound("success", state.soundEnabled);
      save();
    };

    // Modal helpers
    const closeModal = () => {
      if (transactionModal && transactionModal.open) transactionModal.close();
    };
    const openModal = () => {
      if (!transactionModal) return;
      if (typeof transactionModal.showModal === "function") transactionModal.showModal();
      else transactionModal.setAttribute("open", "");
    };

    // Navigation
    const navigate = (view) => {
      selectedView = view;
      document.querySelectorAll(".app-view").forEach((item) => {
        item.classList.toggle("hidden", item.id !== `${view}-view`);
      });
      document.querySelectorAll("[data-view]").forEach((item) => {
        item.classList.toggle("is-active", item.dataset.view === view);
      });
      updateHeading(view);
      window.scrollTo({ top: 0, behavior: "smooth" });
      document.querySelector(".sidebar")?.classList.remove("is-open");
    };

    // Transaction form templates
    const transactionTemplates = {
      "add-money": {
        title: "Add money",
        description: "Top up your Payoo wallet instantly from a bank account or debit card.",
        fields: `
          <label>Payment source
            <select name="bank" required>
              <option value="">Select bank or card</option>
              <option value="City Bank">City Bank</option>
              <option value="DBBL / Rocket">DBBL / Rocket</option>
              <option value="IBBL">Islami Bank (IBBL)</option>
              <option value="BRAC Bank">BRAC Bank</option>
              <option value="Visa / Mastercard">Visa / Mastercard</option>
            </select>
          </label>
          <label>Bank account / Card number
            <input name="account" maxlength="18" inputmode="numeric" placeholder="10 to 18-digit account/card" required />
          </label>
          <label>Amount (৳)
            <input name="amount" id="amount-input" inputmode="decimal" placeholder="Enter amount" required />
          </label>
          <div class="quick-amounts">
            <button type="button" class="amount-chip" data-amt="500">৳500</button>
            <button type="button" class="amount-chip" data-amt="1000">৳1,000</button>
            <button type="button" class="amount-chip" data-amt="2000">৳2,000</button>
            <button type="button" class="amount-chip" data-amt="5000">৳5,000</button>
          </div>
        `
      },
      transfer: {
        title: "Send money",
        description: "Instant transfer to any Payoo user, 100% free of charge.",
        fields: `
          <label>Recipient number
            <input name="recipient" maxlength="11" inputmode="numeric" placeholder="01XXXXXXXXX" value="{{recipient}}" required />
          </label>
          <label>Amount (৳)
            <input name="amount" id="amount-input" inputmode="decimal" placeholder="Enter amount" required />
          </label>
          <div class="quick-amounts">
            <button type="button" class="amount-chip" data-amt="500">৳500</button>
            <button type="button" class="amount-chip" data-amt="1000">৳1,000</button>
            <button type="button" class="amount-chip" data-amt="2000">৳2,000</button>
            <button type="button" class="amount-chip" data-amt="5000">৳5,000</button>
          </div>
        `
      },
      cashout: {
        title: "Cash out",
        description: "Withdraw cash securely from an authorized Payoo agent.",
        fields: `
          <label>Agent number
            <input name="recipient" maxlength="11" inputmode="numeric" placeholder="01XXXXXXXXX" required />
          </label>
          <label>Amount (৳)
            <input name="amount" id="cashout-amount-input" inputmode="decimal" placeholder="Enter amount" required />
          </label>
          <div class="quick-amounts">
            <button type="button" class="amount-chip" data-amt="500">৳500</button>
            <button type="button" class="amount-chip" data-amt="1000">৳1,000</button>
            <button type="button" class="amount-chip" data-amt="2000">৳2,000</button>
            <button type="button" class="amount-chip" data-amt="5000">৳5,000</button>
          </div>
          <div id="fee-preview" class="fee-breakdown">
            <span>Agent fee (1.49%): <strong>৳0.00</strong></span>
            <span>Total deduction from balance: <strong>৳0.00</strong></span>
          </div>
        `
      },
      recharge: {
        title: "Mobile recharge",
        description: "Instant airtime top-up for any Bangladeshi mobile operator.",
        fields: `
          <label>Mobile operator
            <select name="operator" required>
              <option value="Grameenphone">Grameenphone</option>
              <option value="Banglalink">Banglalink</option>
              <option value="Robi">Robi</option>
              <option value="Airtel">Airtel</option>
              <option value="Teletalk">Teletalk</option>
            </select>
          </label>
          <div class="pill-radio-group">
            <label class="pill-radio"><input type="radio" name="plan" value="Prepaid" checked /> Prepaid</label>
            <label class="pill-radio"><input type="radio" name="plan" value="Postpaid" /> Postpaid</label>
          </div>
          <label>Mobile number
            <input name="recipient" maxlength="11" inputmode="numeric" placeholder="01XXXXXXXXX" value="{{recipient}}" required />
          </label>
          <label>Amount (৳)
            <input name="amount" id="amount-input" inputmode="decimal" placeholder="Enter recharge amount" required />
          </label>
          <div class="quick-amounts">
            <button type="button" class="amount-chip" data-amt="20">৳20</button>
            <button type="button" class="amount-chip" data-amt="50">৳50</button>
            <button type="button" class="amount-chip" data-amt="100">৳100</button>
            <button type="button" class="amount-chip" data-amt="200">৳200</button>
            <button type="button" class="amount-chip" data-amt="500">৳500</button>
          </div>
        `
      },
      "pay-bill": {
        title: "Pay a bill",
        description: "Conveniently pay utility, electricity, water, and internet bills.",
        fields: `
          <label>Biller organization
            <select name="biller" required>
              <option value="DESCO Electricity">DESCO Electricity</option>
              <option value="DPDC Electricity">DPDC Electricity</option>
              <option value="Dhaka WASA">Dhaka WASA</option>
              <option value="Titas Gas">Titas Gas</option>
              <option value="Carnival Internet">Carnival Internet</option>
              <option value="Link3 Technologies">Link3 Technologies</option>
            </select>
          </label>
          <label>Bill or customer reference number
            <input name="reference" placeholder="Enter customer reference number" required />
          </label>
          <label>Amount (৳)
            <input name="amount" id="amount-input" inputmode="decimal" placeholder="Enter bill amount" required />
          </label>
          <div class="quick-amounts">
            <button type="button" class="amount-chip" data-amt="500">৳500</button>
            <button type="button" class="amount-chip" data-amt="1500">৳1,500</button>
            <button type="button" class="amount-chip" data-amt="2500">৳2,500</button>
          </div>
        `
      },
      request: {
        title: "Request money",
        description: "Ask a friend or family member for a payment or split a bill.",
        fields: `
          <label>Request from mobile number
            <input name="recipient" maxlength="11" inputmode="numeric" placeholder="01XXXXXXXXX" required />
          </label>
          <label>Amount (৳)
            <input name="amount" id="amount-input" inputmode="decimal" placeholder="Enter request amount" required />
          </label>
          <label>Purpose or note
            <input name="note" placeholder="e.g. Dinner share, Project contribution" />
          </label>
        `
      },
      bonus: {
        title: "Claim welcome reward",
        description: "Redeem your exclusive Payoo welcome bonus promo voucher.",
        fields: `
          <label>Reward promo code
            <input name="code" placeholder="Enter PAYOO100" value="PAYOO100" required />
          </label>
        `
      }
    };

    // Show transaction success screen
    const showSuccess = (title, amount, detail, txId) => {
      transactionModalStep.textContent = "TRANSACTION COMPLETE";
      transactionModalContent.innerHTML = `
        <div class="success-state">
          <i class="fa-solid fa-check"></i>
          <h2>${safe(title)}</h2>
          <p>Your wallet transaction has been verified and applied.</p>
          <div class="receipt">
            <div><span>Transaction ID</span><strong>${safe(txId || "TXN-OK")}</strong></div>
            <div><span>Amount</span><strong>৳${money(amount)}</strong></div>
            <div><span>Details</span><strong>${safe(detail)}</strong></div>
            <div><span>New Balance</span><strong>৳${money(state.balance)}</strong></div>
            <div><span>Time</span><strong>Just now</strong></div>
          </div>
          <button id="done-btn" class="button button--primary" type="button">Back to wallet</button>
        </div>
      `;
      document.querySelector("#done-btn")?.addEventListener("click", closeModal);
    };

    // Open transaction modal
    const openTransaction = (type, recipient = "") => {
      const template = transactionTemplates[type];
      if (!template) return;

      playSound("tap", state.soundEnabled);
      transactionModalStep.textContent = "SECURE TRANSACTION";
      transactionModalContent.innerHTML = `
        <div class="modal-content">
          <h2>${template.title}</h2>
          <p>${template.description}</p>
          <form id="transaction-form" class="modal-form" data-type="${type}">
            ${template.fields.replace(/{{recipient}}/g, safe(recipient))}
            <label>4-digit PIN
              <input name="pin" type="password" inputmode="numeric" maxlength="4" placeholder="Enter 0000" required />
            </label>
            <button class="button button--primary" type="submit">Confirm & Transact <i class="fa-solid fa-arrow-right"></i></button>
          </form>
          <div class="security-strip"><i class="fa-solid fa-shield-heart"></i><span>End-to-end encrypted with Payoo security</span></div>
        </div>
      `;

      // Bind quick amounts chips
      transactionModalContent.querySelectorAll(".amount-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          const targetInput =
            transactionModalContent.querySelector("#amount-input") ||
            transactionModalContent.querySelector("#cashout-amount-input");
          if (targetInput) {
            targetInput.value = chip.dataset.amt;
            targetInput.dispatchEvent(new Event("input"));
            targetInput.focus();
          }
        });
      });

      // Cashout fee live calculation
      const cashoutInput = transactionModalContent.querySelector("#cashout-amount-input");
      const feePreview = transactionModalContent.querySelector("#fee-preview");
      if (cashoutInput && feePreview) {
        cashoutInput.addEventListener("input", () => {
          const val = Number(cashoutInput.value) || 0;
          const fee = Math.round(val * 0.0149 * 100) / 100;
          const total = val + fee;
          feePreview.innerHTML = `
            <span>Agent fee (1.49%): <strong>৳${money(fee)}</strong></span>
            <span>Total deduction from balance: <strong>৳${money(total)}</strong></span>
          `;
        });
      }

      openModal();

      const form = document.querySelector("#transaction-form");
      if (!form) return;

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form));

        if (!isPin(data.pin)) {
          toast("Please enter the demo PIN (0000).", "error");
          return;
        }

        if (type === "bonus") {
          const code = String(data.code || "").trim().toUpperCase();
          if (code !== "PAYOO100") {
            toast("The promo code you entered is invalid.", "error");
            return;
          }
          if (state.redeemed) {
            toast("You have already claimed this welcome reward.", "error");
            return;
          }
          state.redeemed = true;
          addTransaction("bonus", 100, "Welcome reward · PAYOO100");
          showSuccess("Reward claimed!", 100, "PAYOO100 welcome reward", state.history[0]?.id);
          return;
        }

        const amount = Number(data.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
          toast("Please enter an amount greater than ৳0.", "error");
          return;
        }

        if (type === "add-money") {
          if (!data.bank || !isAccount(data.account)) {
            toast("Please choose a bank and enter a valid account or card number (10-18 digits).", "error");
            return;
          }
          const detail = `${data.bank} · •••• ${String(data.account).slice(-4)}`;
          addTransaction("add-money", amount, detail, "Added money");
          showSuccess("Money added!", amount, detail, state.history[0]?.id);
          return;
        }

        if (type === "cashout") {
          if (!isPhone(data.recipient)) {
            toast("Please enter a valid 11-digit agent mobile number.", "error");
            return;
          }
          const fee = Math.round(amount * 0.0149 * 100) / 100;
          const totalCost = amount + fee;
          if (totalCost > state.balance) {
            toast("Your available balance is not enough to cover amount and agent fee.", "error");
            return;
          }
          const detail = `Agent · ${data.recipient}`;
          addTransaction("cashout", amount, detail, "Cash out", fee);
          showSuccess("Cash out successful!", amount, `${detail} (Fee: ৳${money(fee)})`, state.history[0]?.id);
          return;
        }

        if (type === "recharge") {
          if (!isPhone(data.recipient)) {
            toast("Please enter a valid 11-digit mobile number.", "error");
            return;
          }
          if (amount > state.balance) {
            toast("Your available balance is not enough for this recharge.", "error");
            return;
          }
          const detail = `${data.operator} (${data.plan || "Prepaid"}) · ${data.recipient}`;
          addTransaction("recharge", amount, detail, "Mobile recharge");
          showSuccess("Recharge successful!", amount, detail, state.history[0]?.id);
          return;
        }

        if (type === "transfer") {
          if (!isPhone(data.recipient)) {
            toast("Please enter a valid 11-digit recipient number.", "error");
            return;
          }
          if (amount > state.balance) {
            toast("Your available balance is not enough for this transfer.", "error");
            return;
          }
          const detail = `To ${data.recipient}`;
          addTransaction("transfer", amount, detail, "Sent money");
          showSuccess("Money sent!", amount, detail, state.history[0]?.id);
          return;
        }

        if (type === "pay-bill") {
          if (!data.biller || !String(data.reference).trim()) {
            toast("Please select a biller and provide a customer reference number.", "error");
            return;
          }
          if (amount > state.balance) {
            toast("Your available balance is not enough to pay this bill.", "error");
            return;
          }
          const detail = `${data.biller} · Ref ${data.reference}`;
          addTransaction("pay-bill", amount, detail, "Bill payment");
          showSuccess("Bill payment complete!", amount, detail, state.history[0]?.id);
          return;
        }

        if (type === "request") {
          if (!isPhone(data.recipient)) {
            toast("Please enter a valid 11-digit mobile number to request money.", "error");
            return;
          }
          const noteText = data.note ? ` · ${data.note}` : "";
          const detail = `Requested from ${data.recipient}${noteText}`;
          // Money requests do not deduct immediately; notify user
          toast(`Money request for ৳${money(amount)} sent to ${data.recipient}.`);
          state.notifications.unshift({
            id: `notif-${Date.now()}`,
            title: "Money Request Sent",
            detail: `You requested ৳${money(amount)} from ${data.recipient}`,
            at: new Date().toISOString(),
            read: false
          });
          save();
          closeModal();
        }
      });
    };

    // Open receipt modal
    const openReceipt = (tx) => {
      if (!receiptModal || !receiptContent) return;
      playSound("tap", state.soundEnabled);
      const isPositive = tx.direction > 0;
      const meta = TYPE_META[tx.type] || TYPE_META.transfer;

      receiptContent.innerHTML = `
        <div class="receipt-slip">
          <div class="receipt-slip__header">
            <div class="receipt-slip__brand"><img src="./assets/logo.png" alt="Payoo" /><span>payoo</span></div>
            <span class="receipt-slip__badge"><i class="fa-solid fa-circle-check"></i> Transaction Completed</span>
            <div class="receipt-slip__amount ${meta.className}">
              ${isPositive ? "+" : "−"}৳${money(tx.amount)}
            </div>
            <p class="receipt-slip__title">${safe(tx.label)}</p>
          </div>
          <div class="receipt-table">
            <div><span>Transaction ID</span><strong>${safe(tx.id || "TXN-88F92A")}</strong></div>
            <div><span>Date & Time</span><strong>${fullDateTime(tx.at)}</strong></div>
            <div><span>Service Type</span><strong>${safe(meta.label)}</strong></div>
            <div><span>Counterparty / Details</span><strong>${safe(tx.detail)}</strong></div>
            <div><span>Fee / Charge</span><strong>${tx.fee ? `৳${money(tx.fee)}` : "৳0.00 (Free)"}</strong></div>
            <div><span>Balance After</span><strong>৳${money(tx.balanceAfter ?? state.balance)}</strong></div>
            <div><span>Status</span><strong style="color:var(--mint);"><i class="fa-solid fa-shield-check"></i> Verified</strong></div>
          </div>
          <div class="receipt-actions">
            <button id="copy-txid-btn" class="subtle-button" type="button"><i class="fa-regular fa-copy"></i> Copy ID</button>
            <button id="print-receipt-btn" class="button button--dark" type="button"><i class="fa-solid fa-print"></i> Print Slip</button>
          </div>
        </div>
      `;

      document.querySelector("#copy-txid-btn")?.addEventListener("click", () => {
        navigator.clipboard?.writeText(tx.id || "");
        toast("Transaction ID copied to clipboard!");
      });

      document.querySelector("#print-receipt-btn")?.addEventListener("click", () => {
        window.print();
      });

      if (typeof receiptModal.showModal === "function") receiptModal.showModal();
      else receiptModal.setAttribute("open", "");
    };

    // Open Profile Modal
    const openProfile = () => {
      if (!profileModal || !profileContent) return;
      playSound("tap", state.soundEnabled);

      profileContent.innerHTML = `
        <div class="profile-hero">
          <span class="profile-avatar-lg">${safe(userInitials)}</span>
          <div>
            <h3>Shihab Atahar</h3>
            <p>+880 ${safe(userMobile)}</p>
            <span class="profile-badge"><i class="fa-solid fa-circle-check"></i> KYC Verified · Tier 2</span>
          </div>
        </div>
        <div class="profile-limits">
          <div class="profile-limit-bar">
            <div><span>Daily Transaction Limit</span><strong>৳25,000 / ৳100,000</strong></div>
            <div class="limit-track"><div class="limit-fill" style="width:25%;"></div></div>
          </div>
          <div class="profile-limit-bar">
            <div><span>Monthly Limit</span><strong>৳85,000 / ৳500,000</strong></div>
            <div class="limit-track"><div class="limit-fill" style="width:17%;"></div></div>
          </div>
        </div>
        <div class="profile-settings">
          <div class="setting-row">
            <span>Audio Sound Effects</span>
            <label class="switch">
              <input type="checkbox" id="sound-toggle" ${state.soundEnabled ? "checked" : ""} />
              <span class="slider"></span>
            </label>
          </div>
          <button id="reset-data-btn" class="danger-button" type="button">
            <i class="fa-solid fa-rotate-left"></i> Reset Demo Data to Default
          </button>
          <button id="profile-logout-btn" class="subtle-button" type="button">
            <i class="fa-solid fa-arrow-right-from-bracket"></i> Sign out of Payoo
          </button>
        </div>
      `;

      document.querySelector("#sound-toggle")?.addEventListener("change", (e) => {
        state.soundEnabled = e.target.checked;
        save();
        toast(`Sound effects ${state.soundEnabled ? "enabled" : "disabled"}.`);
      });

      document.querySelector("#reset-data-btn")?.addEventListener("click", () => {
        if (confirm("Reset wallet state, transactions, and goals to initial demo data?")) {
          localStorage.removeItem(STORAGE_KEY);
          state = getState();
          save();
          profileModal.close();
          toast("Demo data reset successfully.");
        }
      });

      document.querySelector("#profile-logout-btn")?.addEventListener("click", () => {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.assign("./index.html");
      });

      if (typeof profileModal.showModal === "function") profileModal.showModal();
      else profileModal.setAttribute("open", "");
    };

    // Open Notifications
    const openNotifications = () => {
      if (!notificationModal) return;
      playSound("tap", state.soundEnabled);
      renderNotifications();
      if (typeof notificationModal.showModal === "function") notificationModal.showModal();
      else notificationModal.setAttribute("open", "");
    };

    // Open Add Contact Modal
    const openAddContact = () => {
      if (!contactModal) return;
      playSound("tap", state.soundEnabled);
      const form = document.querySelector("#add-contact-form");
      if (form) form.reset();
      if (typeof contactModal.showModal === "function") contactModal.showModal();
      else contactModal.setAttribute("open", "");
    };

    // Export History to CSV
    const exportHistoryToCSV = () => {
      if (state.history.length === 0) {
        toast("No transactions to export.", "error");
        return;
      }

      const headers = ["Transaction ID", "Date", "Service", "Details", "Direction", "Amount (BDT)", "Fee (BDT)"];
      const rows = state.history.map((tx) => [
        `"${tx.id || ""}"`,
        `"${new Date(tx.at).toISOString()}"`,
        `"${tx.label || tx.type}"`,
        `"${tx.detail || ""}"`,
        `"${tx.direction > 0 ? "INFLOW" : "OUTFLOW"}"`,
        tx.amount,
        tx.fee || 0
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `payoo_transactions_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast("Transaction history exported to CSV!");
    };

    // Event Listeners setup
    const todayEl = document.querySelector("#today-date");
    if (todayEl) {
      todayEl.textContent = new Date().toLocaleDateString("en-BD", {
        weekday: "long",
        day: "numeric",
        month: "long"
      });
    }

    // Navigation triggers
    document.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", () => navigate(button.dataset.view));
    });

    // Quick Action cards
    document.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => openTransaction(button.dataset.action));
    });

    // Balance visibility toggle
    document.querySelector("#balance-visibility")?.addEventListener("click", () => {
      balanceVisible = !balanceVisible;
      renderBalance();
      const btn = document.querySelector("#balance-visibility");
      if (btn) btn.innerHTML = `<i class="fa-regular fa-eye${balanceVisible ? "" : "-slash"}"></i>`;
    });

    // Profile & Notification triggers
    document.querySelector("#profile-btn")?.addEventListener("click", openProfile);
    document.querySelector("#notification-btn")?.addEventListener("click", openNotifications);

    document.querySelector("#profile-close")?.addEventListener("click", () => profileModal.close());
    document.querySelector("#receipt-close")?.addEventListener("click", () => receiptModal.close());
    document.querySelector("[data-close-notifications]")?.addEventListener("click", () => notificationModal.close());

    // Mark notifications read
    document.querySelector("#mark-read-btn")?.addEventListener("click", () => {
      state.notifications.forEach((n) => (n.read = true));
      save();
      toast("All notifications marked as read.");
    });

    // Clear notifications
    document.querySelector("#clear-notif-btn")?.addEventListener("click", () => {
      state.notifications = [];
      save();
      toast("Notifications cleared.");
    });

    // Add contact form submit
    document.querySelector("#add-contact-btn")?.addEventListener("click", openAddContact);
    document.querySelector("#contact-close")?.addEventListener("click", () => contactModal.close());

    const addContactForm = document.querySelector("#add-contact-form");
    if (addContactForm) {
      addContactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const data = new FormData(addContactForm);
        const name = String(data.get("name") || "").trim();
        const phone = String(data.get("phone") || "").trim();

        if (!name || !isPhone(phone)) {
          toast("Please enter a name and a valid 11-digit mobile number.", "error");
          return;
        }

        const colors = ["avatar--violet", "avatar--orange", "avatar--mint"];
        const initials = name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        state.contacts.push({
          name,
          phone,
          avatar: colors[state.contacts.length % colors.length],
          initials: initials || "NA"
        });

        save();
        contactModal.close();
        toast(`${name} added to your people!`);
      });
    }

    // Modal click out to close
    [transactionModal, receiptModal, notificationModal, profileModal, contactModal].forEach((diag) => {
      if (!diag) return;
      diag.addEventListener("click", (e) => {
        if (e.target === diag) diag.close();
      });
    });

    document.querySelector("#modal-close")?.addEventListener("click", closeModal);

    // Sidebar toggle on mobile
    document.querySelector("#mobile-menu")?.addEventListener("click", () => {
      document.querySelector(".sidebar")?.classList.toggle("is-open");
    });

    // History search & filters
    const searchInput = document.querySelector("#history-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        renderActivity(e.target.value, activeFilter);
      });
    }

    document.querySelectorAll("#activity-filters .filter-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        document.querySelectorAll("#activity-filters .filter-pill").forEach((p) => p.classList.remove("is-active"));
        pill.classList.add("is-active");
        activeFilter = pill.dataset.filter;
        renderActivity(searchInput?.value || "", activeFilter);
      });
    });

    // Export CSV & Clear history
    document.querySelector("#export-csv")?.addEventListener("click", exportHistoryToCSV);

    document.querySelector("#clear-history")?.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear your transaction history?")) {
        state.history = [];
        save();
        toast("Your transaction history was cleared.");
      }
    });

    // Savings goal buttons
    document.querySelector("#save-goal")?.addEventListener("click", () => {
      if (state.balance < 500) {
        toast("Your available balance is not enough to save ৳500.", "error");
        return;
      }
      state.goal += 500;
      addTransaction("goal", 500, "Dream getaway savings fund");
      toast("৳500 moved into your savings goal!");
    });

    document.querySelector("#save-goal-1000")?.addEventListener("click", () => {
      if (state.balance < 1000) {
        toast("Your available balance is not enough to save ৳1,000.", "error");
        return;
      }
      state.goal += 1000;
      addTransaction("goal", 1000, "Dream getaway savings fund");
      toast("৳1,000 moved into your savings goal!");
    });

    document.querySelector("#withdraw-goal")?.addEventListener("click", () => {
      if (state.goal < 500) {
        toast("Your savings goal has less than ৳500.", "error");
        return;
      }
      state.goal -= 500;
      addTransaction("goal-withdraw", 500, "Withdrawn from savings goal");
      toast("৳500 transferred from savings back to your wallet!");
    });

    // Copy promo code buttons in Rewards
    document.querySelectorAll(".copy-promo").forEach((btn) => {
      btn.addEventListener("click", () => {
        const code = btn.dataset.code;
        navigator.clipboard?.writeText(code);
        toast(`Promo code ${code} copied to clipboard!`);
      });
    });

    // Sign out button
    document.querySelector("#logout-btn")?.addEventListener("click", () => {
      sessionStorage.removeItem(SESSION_KEY);
      window.location.assign("./index.html");
    });

    // Initial render
    renderBalance();
    renderTotals();
    renderContacts();
    renderNotifications();
    renderActivity();
    navigate(selectedView);
  }

  initLogin();
  initDashboard();
})();
