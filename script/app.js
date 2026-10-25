(() => {
  const STORAGE_KEY = "payoo-wallet-v2";
  const SESSION_KEY = "payoo-session";
  const USER_MOBILE_KEY = "payoo-user-mobile";
  const THEME_KEY = "payoo-theme";

  const INITIAL_STATE = {
    balance: 45000,
    goal: 18400,
    goalTarget: 60000,
    monthlyBudget: 25000,
    goldGrams: 1.25,
    goldMarketPrice: 11850,
    redeemed: false,
    soundEnabled: true,
    theme: "light",
    pin: "0000",
    virtualCard: {
      number: "4532 8891 7623 9184",
      holder: "SHIHAB ATAHAR",
      expiry: "10/29",
      cvv: "782",
      frozen: false,
      onlineActive: true,
      intlActive: false,
      spendLimit: 30000,
      currentSpent: 8450
    },
    vaults: [
      { id: "vault-1", name: "Dream Getaway", target: 60000, saved: 18400, icon: "fa-umbrella-beach", color: "#6955f6" },
      { id: "vault-2", name: "Emergency Fund", target: 30000, saved: 12000, icon: "fa-shield-halved", color: "#19b889" },
      { id: "vault-3", name: "Tech & Gadgets", target: 25000, saved: 7500, icon: "fa-laptop", color: "#38bdf8" },
      { id: "vault-4", name: "Eid Shopping", target: 15000, saved: 5000, icon: "fa-gift", color: "#f5a049" }
    ],
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
    "goal-withdraw": { icon: "fa-vault", className: "positive", label: "Withdrawn from savings" },
    split: { icon: "fa-users-viewfinder", className: "positive", label: "Split bill requested" }
  };

  const REMITTANCE_RATES = {
    USD: 121.50,
    GBP: 156.80,
    EUR: 131.20,
    SAR: 32.40,
    AED: 33.08,
    MYR: 27.90
  };
  const INCENTIVE_PERCENT = 0.025; // 2.5% Bangladesh Govt Cash Incentive

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
        pin: stored.pin || INITIAL_STATE.pin,
        theme: stored.theme || INITIAL_STATE.theme,
        monthlyBudget: Number(stored.monthlyBudget) || INITIAL_STATE.monthlyBudget,
        goldGrams: typeof stored.goldGrams === "number" ? stored.goldGrams : INITIAL_STATE.goldGrams,
        goldMarketPrice: Number(stored.goldMarketPrice) || INITIAL_STATE.goldMarketPrice,
        virtualCard: stored.virtualCard ? { ...INITIAL_STATE.virtualCard, ...stored.virtualCard } : structuredClone(INITIAL_STATE.virtualCard),
        vaults: Array.isArray(stored.vaults) && stored.vaults.length ? stored.vaults : structuredClone(INITIAL_STATE.vaults),
        contacts: Array.isArray(stored.contacts) ? stored.contacts : INITIAL_STATE.contacts,
        notifications: Array.isArray(stored.notifications) ? stored.notifications : INITIAL_STATE.notifications,
        history: Array.isArray(stored.history) ? stored.history : INITIAL_STATE.history
      };
    } catch {
      return structuredClone(INITIAL_STATE);
    }
  };

  const storeState = (state) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

  const isPin = (value, expected = "0000") => String(value).trim() === String(expected).trim();
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

  // Smooth easing number animation for balances
  const animateNumber = (element, start, end, duration = 650, prefix = "", suffix = "") => {
    if (!element) return;
    const s = Number(start) || 0;
    const e = Number(end) || 0;
    if (Math.abs(s - e) < 0.01) {
      element.textContent = `${prefix}${money(e)}${suffix}`;
      return;
    }
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const val = s + (e - s) * ease;
      element.textContent = `${prefix}${money(val)}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
      else element.textContent = `${prefix}${money(e)}${suffix}`;
    };
    requestAnimationFrame(step);
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
      } else if (kind === "beep") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (kind === "card-flip") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.08);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (kind === "freeze") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(1046.5, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.35);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (kind === "gold") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(1318.5, now); // E6
        osc.frequency.setValueAtTime(1567.98, now + 0.08); // G6
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (kind === "error") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // Audio policy safe
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

  // Lightweight Zero-Dependency Canvas Confetti Particle FX
  const triggerConfetti = (count = 65) => {
    const canvas = document.querySelector("#confetti-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#6955f6", "#29dfb2", "#ffd066", "#ff7399", "#38bdf8", "#ffffff"];
    const pieces = Array.from({ length: count }, () => ({
      x: canvas.width * 0.5 + (Math.random() - 0.5) * 240,
      y: canvas.height * 0.38,
      w: Math.random() * 8 + 5,
      h: Math.random() * 8 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 14,
      vy: Math.random() * -10 - 4,
      gravity: 0.34,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 12,
      alpha: 1
    }));

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      pieces.forEach((p) => {
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.alpha -= 0.009;
        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      });
      if (alive) {
        animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animId);
      }
    };
    render();
  };


  // High-fidelity Client-Side SVG QR Code Generator
  const generateQRSvg = (payload, size = 210) => {
    const n = 25; // 25x25 matrix
    const grid = Array.from({ length: n }, () => Array(n).fill(0));

    // Place 7x7 Finder Pattern helper
    const placeFinder = (startX, startY) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            grid[startY + r][startX + c] = 1;
          }
        }
      }
    };

    // Top-Left, Top-Right, Bottom-Left finders
    placeFinder(0, 0);
    placeFinder(n - 7, 0);
    placeFinder(0, n - 7);

    // Separators (white space around finders)
    for (let i = 0; i < 8; i++) {
      grid[7][i] = 0;
      grid[i][7] = 0;
      grid[7][n - 1 - i] = 0;
      grid[i][n - 8] = 0;
      grid[n - 8][i] = 0;
      grid[n - 1 - i][7] = 0;
    }

    // Timing tracks
    for (let i = 8; i < n - 8; i++) {
      grid[6][i] = i % 2 === 0 ? 1 : 0;
      grid[i][6] = i % 2 === 0 ? 1 : 0;
    }

    // Alignment pattern at bottom right
    const alignX = 18, alignY = 18;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        if (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) {
          grid[alignY + r][alignX + c] = 1;
        }
      }
    }

    // Hash the payload for deterministic pseudo-data modules
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      hash = (hash << 5) - hash + payload.charCodeAt(i);
      hash |= 0;
    }

    // Populate data modules avoiding reserved spaces
    let bitIndex = 0;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const inTL = r < 9 && c < 9;
        const inTR = r < 9 && c >= n - 9;
        const inBL = r >= n - 9 && c < 9;
        const inTiming = r === 6 || c === 6;
        const inAlign = r >= alignY - 2 && r <= alignY + 2 && c >= alignX - 2 && c <= alignX + 2;

        if (!inTL && !inTR && !inBL && !inTiming && !inAlign) {
          const pseudoBit = ((hash >> (bitIndex % 31)) ^ (r * c)) & 1;
          const mask = (r + c) % 2 === 0 ? 1 : 0;
          grid[r][c] = pseudoBit ^ mask;
          bitIndex++;
        }
      }
    }

    // Build SVG Rectangles
    let rects = "";
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (grid[r][c] === 1) {
          rects += `<rect x="${c}" y="${r}" width="1" height="1" fill="#1b1a33" />`;
        }
      }
    }

    return `
      <svg viewBox="0 0 ${n} ${n}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">
        <rect width="${n}" height="${n}" fill="#ffffff" />
        ${rects}
        <circle cx="${n / 2}" cy="${n / 2}" r="2.2" fill="#6955f6" />
        <circle cx="${n / 2}" cy="${n / 2}" r="1.6" fill="#ffffff" />
        <circle cx="${n / 2}" cy="${n / 2}" r="1.1" fill="#6955f6" />
      </svg>
    `;
  };

  function initLogin() {
    const form = document.querySelector("#login-form");
    if (!form) return;

    const sessionActive = sessionStorage.getItem(SESSION_KEY) === "active";
    const sessionBanner = document.querySelector("#active-session-banner");
    if (sessionActive && sessionBanner) {
      sessionBanner.classList.remove("hidden");
    }

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

      const currentState = getState();
      const validPin = currentState.pin || "0000";

      if (!isPhone(mobile) || !isPin(pin, validPin)) {
        toast(`Please enter a valid mobile number and PIN (${validPin}).`, "error");
        return;
      }

      sessionStorage.setItem(SESSION_KEY, "active");
      sessionStorage.setItem(USER_MOBILE_KEY, mobile);
      window.location.assign("./home.html");
    });
  }

  function initDashboard() {
    if (!document.querySelector("#balance")) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("demo") === "true" || params.get("demo") === "1" || !sessionStorage.getItem(SESSION_KEY)) {
      sessionStorage.setItem(SESSION_KEY, "active");
      sessionStorage.setItem(USER_MOBILE_KEY, "00000000000");
    }

    let state = getState();
    let balanceVisible = true;
    let selectedView = "overview";
    let activeFilter = "all";
    let activePeriod = "all";
    let previousBalance = state.balance;

    const userMobile = sessionStorage.getItem(USER_MOBILE_KEY) || "01700000000";
    const userInitials = userMobile === "00000000000" ? "AS" : userMobile.slice(-2);

    // Apply Saved Theme
    const applyTheme = (theme) => {
      const root = document.documentElement;
      root.setAttribute("data-theme", theme);
      state.theme = theme;
      localStorage.setItem(THEME_KEY, theme);
      const btn = document.querySelector("#theme-toggle-btn");
      if (btn) {
        btn.innerHTML = `<i class="fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}"></i>`;
        btn.setAttribute("title", `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode (Alt+T)`);
      }
    };

    const toggleTheme = () => {
      const current = document.documentElement.getAttribute("data-theme") || "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      save();
      toast(`Switched to ${next} theme.`);
    };

    const savedTheme = localStorage.getItem(THEME_KEY) || state.theme || "light";
    applyTheme(savedTheme);

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
    const qrModal = document.querySelector("#qr-modal");
    const scanQrModal = document.querySelector("#scan-qr-modal");
    const splitBillModal = document.querySelector("#split-bill-modal");
    const pinModal = document.querySelector("#pin-modal");
    const commandPaletteModal = document.querySelector("#command-palette-modal");

    const activityPreview = document.querySelector("#activity-preview");
    const historyContainer = document.querySelector("#history-container");

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
          rewards: "Payoo Rewards",
          cards: "Cards & Security",
          vaults: "Vaults & Gold"
        };
        pageHeading.textContent = titles[view] || "Payoo Wallet";
      }
    };

    // Render balance with smooth animation
    const renderBalance = (animated = true) => {
      const balanceEl = document.querySelector("#balance");
      if (balanceEl) {
        if (!balanceVisible) {
          balanceEl.textContent = "••••••••";
        } else if (animated) {
          animateNumber(balanceEl, previousBalance, state.balance, 500);
          previousBalance = state.balance;
        } else {
          balanceEl.textContent = money(state.balance);
        }
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
      const totalEl = document.querySelector("#chart-week-total");
      const avgEl = document.querySelector("#chart-daily-avg");
      if (!chartEl) return;

      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const dayTotals = [0, 0, 0, 0, 0, 0, 0];

      // Sum actual outflows across recent transactions
      state.history.forEach((tx) => {
        if (tx.direction < 0) {
          const d = new Date(tx.at).getDay(); // 0 is Sun
          const idx = d === 0 ? 6 : d - 1; // map Mon=0 .. Sun=6
          dayTotals[idx] += tx.amount;
        }
      });

      // Default baseline fallback if empty
      const defaultVals = [1200, 2400, 850, 3100, 1850, 4200, 950];
      const finalTotals = dayTotals.map((val, i) => Math.max(val, defaultVals[i]));
      const maxVal = Math.max(...finalTotals, 1);
      const weekSum = finalTotals.reduce((a, b) => a + b, 0);

      if (totalEl) totalEl.textContent = `৳${money(weekSum)}`;
      if (avgEl) avgEl.textContent = `৳${money(weekSum / 7)}`;

      chartEl.innerHTML = finalTotals.map((amt, idx) => {
        const pct = Math.min(100, Math.max(12, Math.round((amt / maxVal) * 100)));
        return `
          <div class="chart-col" style="height: 0%;" data-target-height="${pct}%">
            <div class="chart-tooltip">${days[idx]}: ৳${money(amt)} (${pct}%)</div>
          </div>
        `;
      }).join("");

      // Trigger spring growth on next frame
      requestAnimationFrame(() => {
        chartEl.querySelectorAll(".chart-col").forEach((col, idx) => {
          setTimeout(() => {
            col.style.height = col.dataset.targetHeight;
          }, idx * 45);
        });
      });
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

    // Render Saved Contacts with Quick Actions (Send / Request / Delete)
    const renderContacts = () => {
      const container = document.querySelector("#contacts-list");
      if (!container) return;

      if (state.contacts.length === 0) {
        container.innerHTML = '<p class="muted" style="font-size:0.75rem; text-align:center; padding:15px 0;">No saved contacts. Tap + to add one.</p>';
        return;
      }

      container.innerHTML = state.contacts
        .map(
          (c, idx) => `
          <div class="contact-row-wrapper">
            <button class="contact" data-contact="${safe(c.phone)}" type="button" title="Send money to ${safe(c.name)}">
              <span class="avatar ${safe(c.avatar)}">${safe(c.initials)}</span>
              <strong>${safe(c.name)}</strong>
              <small>${safe(c.phone)}</small>
            </button>
            <div class="contact-actions">
              <button class="contact-action-btn" type="button" data-send-to="${safe(c.phone)}" title="Send money"><i class="fa-solid fa-paper-plane"></i></button>
              <button class="contact-action-btn" type="button" data-request-from="${safe(c.phone)}" title="Request money"><i class="fa-solid fa-hand-holding-dollar"></i></button>
              <button class="contact-action-btn contact-action-btn--delete" type="button" data-delete-idx="${idx}" title="Remove contact"><i class="fa-regular fa-trash-can"></i></button>
            </div>
          </div>
        `
        )
        .join("");

      container.querySelectorAll(".contact").forEach((btn) => {
        btn.addEventListener("click", () => openTransaction("transfer", btn.dataset.contact));
      });

      container.querySelectorAll("[data-send-to]").forEach((btn) => {
        btn.addEventListener("click", () => openTransaction("transfer", btn.dataset.sendTo));
      });

      container.querySelectorAll("[data-request-from]").forEach((btn) => {
        btn.addEventListener("click", () => openTransaction("request", btn.dataset.requestFrom));
      });

      container.querySelectorAll("[data-delete-idx]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const idx = Number(btn.dataset.deleteIdx);
          const contactName = state.contacts[idx]?.name || "Contact";
          if (confirm(`Remove ${contactName} from your saved contacts?`)) {
            state.contacts.splice(idx, 1);
            save();
            toast(`${contactName} removed.`);
          }
        });
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

    const bindActivityRowEvents = (container) => {
      container.querySelectorAll(".activity-row").forEach((row) => {
        row.addEventListener("click", () => {
          const txId = row.dataset.txid;
          const found = state.history.find((t) => t.id === txId);
          if (found) openReceipt(found);
        });
      });
    };

    // Filter Activity with multi-criteria: Category + Time Period + Search Query
    const renderActivity = (query = "", filter = activeFilter, period = activePeriod) => {
      let filtered = state.history;

      // 1. Category Filter
      if (filter === "inflow") {
        filtered = filtered.filter((i) => i.direction > 0);
      } else if (filter === "outflow") {
        filtered = filtered.filter((i) => i.direction < 0);
      } else if (filter !== "all") {
        filtered = filtered.filter((i) => i.type === filter);
      }

      // 2. Period Filter
      if (period !== "all") {
        const now = new Date();
        if (period === "today") {
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          filtered = filtered.filter((i) => new Date(i.at) >= startOfToday);
        } else if (period === "7days") {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter((i) => new Date(i.at) >= sevenDaysAgo);
        } else if (period === "30days") {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter((i) => new Date(i.at) >= thirtyDaysAgo);
        }
      }

      // 3. Search Query
      if (query.trim()) {
        const q = query.toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.detail.toLowerCase().includes(q) ||
            (item.id && item.id.toLowerCase().includes(q)) ||
            String(item.amount).includes(q)
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

    const save = () => {
      storeState(state);
      renderBalance(true);
      renderTotals();
      renderContacts();
      renderNotifications();
      renderActivity(document.querySelector("#history-search")?.value || "", activeFilter, activePeriod);
    };

    // Add transaction to history
    const addTransaction = (type, amount, detail, label = TYPE_META[type]?.label || "Transaction", fee = 0) => {
      const direction = TYPE_META[type]?.className === "positive" ? 1 : -1;
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
      if (view === "insights") renderWeeklyChart();
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
            <input name="recipient" maxlength="11" inputmode="numeric" placeholder="01XXXXXXXXX" value="{{recipient}}" required />
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
      if (type === "split-bill") {
        openSplitBill();
        return;
      }
      if (type === "scan-qr") {
        openScanQR();
        return;
      }

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
              <input name="pin" type="password" inputmode="numeric" maxlength="4" placeholder="Enter PIN (${state.pin || "0000"})" required />
            </label>
            <button class="button button--primary" type="submit">Confirm & Transact <i class="fa-solid fa-arrow-right"></i></button>
          </form>
          <div class="security-strip"><i class="fa-solid fa-shield-heart"></i><span>End-to-end encrypted with Payoo security</span></div>
        </div>
      `;

      // Quick amount chips
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

      // Cashout fee live preview
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

        const requiredPin = state.pin || "0000";
        if (!isPin(data.pin, requiredPin)) {
          toast(`Incorrect PIN. Please enter your 4-digit PIN (${requiredPin}).`, "error");
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
            toast("Please choose a bank and enter a valid account or card number (8-18 digits).", "error");
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

    // Open Profile Modal with Theme, PIN change, & Backup
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
          <div class="setting-row">
            <span>Interface Dark Mode</span>
            <button id="profile-theme-btn" class="subtle-button" type="button">
              <i class="fa-solid ${state.theme === "dark" ? "fa-sun" : "fa-moon"}"></i> ${state.theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
          <div class="setting-row">
            <span>Security PIN (••••)</span>
            <button id="profile-change-pin-btn" class="subtle-button" type="button">
              <i class="fa-solid fa-key"></i> Change PIN
            </button>
          </div>
          <div class="setting-row">
            <span>Data Statement Backup</span>
            <button id="profile-export-json-btn" class="subtle-button" type="button">
              <i class="fa-solid fa-file-code"></i> Export JSON
            </button>
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

      document.querySelector("#profile-theme-btn")?.addEventListener("click", () => {
        toggleTheme();
        openProfile();
      });

      document.querySelector("#profile-change-pin-btn")?.addEventListener("click", () => {
        profileModal.close();
        openChangePin();
      });

      document.querySelector("#profile-export-json-btn")?.addEventListener("click", () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
        const dlAnchor = document.createElement("a");
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", `payoo_wallet_backup_${Date.now()}.json`);
        dlAnchor.click();
        toast("Wallet JSON backup downloaded!");
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

    // Open Change PIN Modal
    const openChangePin = () => {
      if (!pinModal) return;
      playSound("tap", state.soundEnabled);
      const form = document.querySelector("#change-pin-form");
      if (form) form.reset();
      if (typeof pinModal.showModal === "function") pinModal.showModal();
      else pinModal.setAttribute("open", "");
    };

    // Open My Personal QR Code Modal
    const openMyQR = () => {
      if (!qrModal) return;
      playSound("tap", state.soundEnabled);

      const qrContainer = document.querySelector("#qr-canvas-container");
      const nameEl = document.querySelector("#qr-name");
      const phoneEl = document.querySelector("#qr-phone");
      const avatarEl = document.querySelector("#qr-avatar");

      if (nameEl) nameEl.textContent = "Shihab Atahar";
      if (phoneEl) phoneEl.textContent = `+880 ${userMobile}`;
      if (avatarEl) avatarEl.textContent = userInitials;

      if (qrContainer) {
        const qrPayload = `payoo://pay?to=${userMobile}&name=Shihab+Atahar`;
        qrContainer.innerHTML = generateQRSvg(qrPayload, 190);
      }

      if (typeof qrModal.showModal === "function") qrModal.showModal();
      else qrModal.setAttribute("open", "");
    };

    // Open Scan to Pay Modal
    const openScanQR = () => {
      if (!scanQrModal) return;
      playSound("tap", state.soundEnabled);
      if (typeof scanQrModal.showModal === "function") scanQrModal.showModal();
      else scanQrModal.setAttribute("open", "");
    };

    // Open Split Bill Modal
    const openSplitBill = () => {
      if (!splitBillModal) return;
      playSound("tap", state.soundEnabled);

      let peopleCount = 3;
      const countDisplay = document.querySelector("#split-count-display");
      const minusBtn = document.querySelector("#split-minus-btn");
      const plusBtn = document.querySelector("#split-plus-btn");
      const totalInput = document.querySelector("#split-total-input");
      const tipSelect = document.querySelector("#split-tip-select");
      const perPersonEl = document.querySelector("#split-per-person");
      const grossTotalEl = document.querySelector("#split-gross-total");
      const contactsContainer = document.querySelector("#split-contacts-checkboxes");

      const updateCalculation = () => {
        const base = Number(totalInput?.value) || 0;
        const tipPct = Number(tipSelect?.value) || 0;
        const gross = base + (base * tipPct) / 100;
        const perPerson = peopleCount > 0 ? gross / peopleCount : 0;

        if (countDisplay) countDisplay.textContent = `${peopleCount} people`;
        if (perPersonEl) perPersonEl.textContent = `৳${money(perPerson)}`;
        if (grossTotalEl) grossTotalEl.textContent = `৳${money(gross)}`;
      };

      if (contactsContainer) {
        contactsContainer.innerHTML = state.contacts
          .map(
            (c, i) => `
            <label class="split-checkbox-item">
              <input type="checkbox" name="splitContact" value="${safe(c.phone)}" ${i < 2 ? "checked" : ""} />
              <span class="avatar ${safe(c.avatar)}" style="width:26px; height:26px; font-size:0.58rem;">${safe(c.initials)}</span>
              <span>${safe(c.name)} (${safe(c.phone)})</span>
            </label>
          `
          )
          .join("");
      }

      if (minusBtn) {
        minusBtn.onclick = () => {
          if (peopleCount > 2) {
            peopleCount--;
            updateCalculation();
          }
        };
      }
      if (plusBtn) {
        plusBtn.onclick = () => {
          if (peopleCount < 12) {
            peopleCount++;
            updateCalculation();
          }
        };
      }

      totalInput?.addEventListener("input", updateCalculation);
      tipSelect?.addEventListener("change", updateCalculation);
      updateCalculation();

      if (typeof splitBillModal.showModal === "function") splitBillModal.showModal();
      else splitBillModal.setAttribute("open", "");
    };

    // Open Command Palette (Ctrl+K)
    const openCommandPalette = () => {
      if (!commandPaletteModal) return;
      playSound("tap", state.soundEnabled);

      const searchInput = document.querySelector("#palette-search");
      const resultsContainer = document.querySelector("#palette-results");
      if (searchInput) searchInput.value = "";

      const actions = [
        { id: "send", title: "Send Money (P2P)", desc: "Instant transfer without fees", icon: "fa-paper-plane", group: "Services", run: () => openTransaction("transfer") },
        { id: "add", title: "Add Money", desc: "Top up from Bank / Card", icon: "fa-plus", group: "Services", run: () => openTransaction("add-money") },
        { id: "cashout", title: "Cash Out (Agent)", desc: "1.49% transparent fee", icon: "fa-money-bill-transfer", group: "Services", run: () => openTransaction("cashout") },
        { id: "recharge", title: "Mobile Airtime Recharge", desc: "GP, Robi, BL, Airtel, Teletalk", icon: "fa-mobile-screen", group: "Services", run: () => openTransaction("recharge") },
        { id: "bill", title: "Pay Utility Bill", desc: "DESCO, WASA, DPDC, Internet", icon: "fa-file-invoice-dollar", group: "Services", run: () => openTransaction("pay-bill") },
        { id: "request", title: "Request Money", desc: "Direct payment request", icon: "fa-hand-holding-dollar", group: "Services", run: () => openTransaction("request") },
        { id: "split", title: "Split Group Expense", desc: "Calculate and dispatch requests", icon: "fa-users-viewfinder", group: "Services", run: () => openSplitBill() },
        { id: "scan", title: "Scan QR Code to Pay", desc: "Viewfinder camera scan", icon: "fa-qrcode", group: "Services", run: () => openScanQR() },
        { id: "myqr", title: "My Personal QR Code", desc: "Show to receive money", icon: "fa-qrcode", group: "Services", run: () => openMyQR() },
        { id: "bonus", title: "Redeem Welcome Reward (৳100)", desc: "Use code PAYOO100", icon: "fa-gift", group: "Services", run: () => openTransaction("bonus") },
        { id: "nav-overview", title: "Navigate: Overview", desc: "Wallet balance & summary", icon: "fa-grid-2", group: "Navigation", run: () => navigate("overview") },
        { id: "nav-activity", title: "Navigate: Activity Feed", desc: "Transaction history & receipts", icon: "fa-arrow-right-arrow-left", group: "Navigation", run: () => navigate("activity") },
        { id: "nav-insights", title: "Navigate: Insights", desc: "7-day trends & categories", icon: "fa-chart-pie", group: "Navigation", run: () => navigate("insights") },
        { id: "nav-rewards", title: "Navigate: Rewards", desc: "Payoo Plus discounts", icon: "fa-sparkles", group: "Navigation", run: () => navigate("rewards") },
        { id: "theme", title: "Toggle Dark / Light Theme", desc: `Currently ${state.theme}`, icon: "fa-moon", group: "Preferences", run: () => toggleTheme() },
        { id: "pin", title: "Change Security PIN", desc: "Update 4-digit password", icon: "fa-key", group: "Preferences", run: () => openChangePin() },
        { id: "contact", title: "Add New Contact", desc: "Save person for quick transfers", icon: "fa-user-plus", group: "Preferences", run: () => openAddContact() },
        { id: "export", title: "Export CSV Statement", desc: "Download table of records", icon: "fa-file-csv", group: "Preferences", run: () => exportHistoryToCSV() },
        { id: "statement", title: "Official Account Statement", desc: "View formal bank statement & print PDF", icon: "fa-file-invoice", group: "Preferences", run: () => document.querySelector("#view-statement-btn")?.click() },
        { id: "nav-cards", title: "Navigate: Cards & Security", desc: "Virtual Platinum Card & controls", icon: "fa-credit-card", group: "Navigation", run: () => navigate("cards") },
        { id: "nav-vaults", title: "Navigate: Vaults & Gold", desc: "Savings goals, budget & 24K gold", icon: "fa-vault", group: "Navigation", run: () => navigate("vaults") },
        { id: "flip-card", title: "Flip Virtual Card (3D)", desc: "Inspect CVV and magnetic stripe", icon: "fa-arrows-rotate", group: "Cards", run: () => { navigate("cards"); setTimeout(toggleCardFlip, 150); } },
        { id: "freeze-card", title: "Freeze / Unfreeze Card", desc: "Instantly pause card transactions", icon: "fa-snowflake", group: "Cards", run: () => { const sw = document.querySelector("#card-freeze-toggle"); if (sw) { sw.checked = !sw.checked; sw.dispatchEvent(new Event("change")); } } },
        { id: "new-vault", title: "Create Savings Vault", desc: "Start a new savings goal target", icon: "fa-piggy-bank", group: "Vaults", run: () => document.querySelector("#create-vault-btn")?.click() },
        { id: "gold-trade", title: "Payoo 24K Digital Gold", desc: "Buy or sell fractional gold", icon: "fa-coins", group: "Vaults", run: () => openGoldTrade("buy") },
        { id: "ai-coach", title: "Payoo Intelligence (AI Coach)", desc: "Ask smart financial questions", icon: "fa-wand-magic-sparkles", group: "Intelligence", run: () => document.querySelector("#ai-coach-btn")?.click() },
        { id: "lock-wallet", title: "Lock Wallet Screen", desc: "Require PIN or biometric unlock", icon: "fa-lock", group: "Security", run: () => document.querySelector("#lock-wallet-btn")?.click() }
      ];

      let selectedIndex = 0;

      const renderResults = (query = "") => {
        if (!resultsContainer) return;
        const q = query.toLowerCase().trim();
        const filtered = actions.filter((a) => a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q) || a.group.toLowerCase().includes(q));

        if (filtered.length === 0) {
          resultsContainer.innerHTML = '<p class="muted" style="padding: 20px; text-align: center; font-size: 0.8rem;">No actions match your search.</p>';
          return;
        }

        selectedIndex = Math.min(selectedIndex, filtered.length - 1);
        if (selectedIndex < 0) selectedIndex = 0;

        let lastGroup = "";
        let html = "";
        filtered.forEach((act, idx) => {
          if (act.group !== lastGroup) {
            html += `<div class="palette-group-title">${safe(act.group)}</div>`;
            lastGroup = act.group;
          }
          html += `
            <button class="palette-item ${idx === selectedIndex ? "is-selected" : ""}" type="button" data-palette-idx="${idx}">
              <i class="fa-solid ${act.icon}"></i>
              <span>${safe(act.title)}</span>
              <span class="palette-item__desc">${safe(act.desc)}</span>
            </button>
          `;
        });

        resultsContainer.innerHTML = html;

        resultsContainer.querySelectorAll("[data-palette-idx]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const idx = Number(btn.dataset.paletteIdx);
            commandPaletteModal.close();
            filtered[idx]?.run();
          });
        });
      };

      if (searchInput) {
        searchInput.oninput = (e) => {
          selectedIndex = 0;
          renderResults(e.target.value);
        };

        searchInput.onkeydown = (e) => {
          const items = resultsContainer?.querySelectorAll(".palette-item");
          if (!items || items.length === 0) return;

          if (e.key === "ArrowDown") {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % items.length;
            renderResults(searchInput.value);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            renderResults(searchInput.value);
          } else if (e.key === "Enter") {
            e.preventDefault();
            const selectedBtn = items[selectedIndex];
            selectedBtn?.click();
          }
        };
      }

      renderResults();

      if (typeof commandPaletteModal.showModal === "function") commandPaletteModal.showModal();
      else commandPaletteModal.setAttribute("open", "");

      setTimeout(() => searchInput?.focus(), 50);
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

    // Global Inward Remittance Calculator Setup
    const initRemittanceCalculator = () => {
      const amtInput = document.querySelector("#remit-amount");
      const curSelect = document.querySelector("#remit-currency");
      const baseEl = document.querySelector("#remit-base");
      const incEl = document.querySelector("#remit-incentive");
      const totalEl = document.querySelector("#remit-total");
      const claimBtn = document.querySelector("#claim-remit-btn");

      const updateRemit = () => {
        const amt = Number(amtInput?.value) || 0;
        const cur = curSelect?.value || "USD";
        const rate = REMITTANCE_RATES[cur] || 121.50;
        const base = amt * rate;
        const incentive = base * INCENTIVE_PERCENT;
        const total = base + incentive;

        if (baseEl) baseEl.textContent = `৳${money(base)}`;
        if (incEl) incEl.textContent = `+৳${money(incentive)}`;
        if (totalEl) totalEl.textContent = `৳${money(total)}`;
        return { amt, cur, base, incentive, total };
      };

      amtInput?.addEventListener("input", updateRemit);
      curSelect?.addEventListener("change", updateRemit);
      updateRemit();

      claimBtn?.addEventListener("click", () => {
        const { amt, cur, total } = updateRemit();
        if (amt <= 0) {
          toast("Please enter a valid foreign amount.", "error");
          return;
        }
        const detail = `From ${cur} (${amt} ${cur}) · 2.5% Govt Incentive included`;
        addTransaction("add-money", total, detail, "Inward Remittance");
        toast(`৳${money(total)} credited to your wallet from overseas!`);
      });
    };

    // Setup Event Listeners
    const todayEl = document.querySelector("#today-date");
    if (todayEl) {
      todayEl.textContent = new Date().toLocaleDateString("en-BD", {
        weekday: "long",
        day: "numeric",
        month: "long"
      });
    }

    document.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", () => navigate(button.dataset.view));
    });

    document.querySelectorAll("[data-action]").forEach((button) => {
      button.addEventListener("click", () => openTransaction(button.dataset.action));
    });

    document.querySelector("#balance-visibility")?.addEventListener("click", () => {
      balanceVisible = !balanceVisible;
      renderBalance(false);
      const btn = document.querySelector("#balance-visibility");
      if (btn) btn.innerHTML = `<i class="fa-regular fa-eye${balanceVisible ? "" : "-slash"}"></i>`;
    });

    // Topbar Action buttons
    document.querySelector("#search-trigger-btn")?.addEventListener("click", openCommandPalette);
    document.querySelector("#theme-toggle-btn")?.addEventListener("click", toggleTheme);
    document.querySelector("#my-qr-btn")?.addEventListener("click", openMyQR);
    document.querySelector("#profile-btn")?.addEventListener("click", openProfile);
    document.querySelector("#notification-btn")?.addEventListener("click", openNotifications);

    // Modal Close buttons
    document.querySelector("#profile-close")?.addEventListener("click", () => profileModal?.close());
    document.querySelector("#receipt-close")?.addEventListener("click", () => receiptModal?.close());
    document.querySelector("#qr-close")?.addEventListener("click", () => qrModal?.close());
    document.querySelector("#scan-qr-close")?.addEventListener("click", () => scanQrModal?.close());
    document.querySelector("#split-close")?.addEventListener("click", () => splitBillModal?.close());
    document.querySelector("#pin-close")?.addEventListener("click", () => pinModal?.close());
    document.querySelector("#palette-close")?.addEventListener("click", () => commandPaletteModal?.close());
    document.querySelector("[data-close-notifications]")?.addEventListener("click", () => notificationModal?.close());

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
    document.querySelector("#contact-close")?.addEventListener("click", () => contactModal?.close());

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
        contactModal?.close();
        toast(`${name} added to your people!`);
      });
    }

    // Change PIN form submit
    const changePinForm = document.querySelector("#change-pin-form");
    if (changePinForm) {
      changePinForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const data = new FormData(changePinForm);
        const currentPin = String(data.get("currentPin") || "").trim();
        const newPin = String(data.get("newPin") || "").trim();
        const confirmPin = String(data.get("confirmPin") || "").trim();

        const expected = state.pin || "0000";
        if (!isPin(currentPin, expected)) {
          toast("Current PIN is incorrect.", "error");
          return;
        }

        if (!/^\d{4}$/.test(newPin)) {
          toast("New PIN must be exactly 4 digits.", "error");
          return;
        }

        if (newPin !== confirmPin) {
          toast("New PIN and confirmation do not match.", "error");
          return;
        }

        state.pin = newPin;
        save();
        pinModal?.close();
        toast("Security PIN updated successfully!");
      });
    }

    // Split Bill form submit
    const splitBillForm = document.querySelector("#split-bill-form");
    if (splitBillForm) {
      splitBillForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const checkedContacts = Array.from(splitBillForm.querySelectorAll("input[name='splitContact']:checked")).map(
          (cb) => cb.value
        );

        const totalInput = document.querySelector("#split-total-input");
        const tipSelect = document.querySelector("#split-tip-select");
        const countDisplay = document.querySelector("#split-count-display");

        const base = Number(totalInput?.value) || 0;
        const tipPct = Number(tipSelect?.value) || 0;
        const peopleCount = parseInt(countDisplay?.textContent || "3", 10) || 3;
        const gross = base + (base * tipPct) / 100;
        const perPerson = gross / peopleCount;

        if (checkedContacts.length === 0) {
          toast("Select at least one contact to send requests.", "error");
          return;
        }

        checkedContacts.forEach((phone) => {
          state.notifications.unshift({
            id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            title: "Split Bill Request Sent",
            detail: `Requested ৳${money(perPerson)} share from ${phone}`,
            at: new Date().toISOString(),
            read: false
          });
        });

        playSound("success", state.soundEnabled);
        save();
        splitBillModal?.close();
        toast(`Split requests for ৳${money(perPerson)} dispatched to ${checkedContacts.length} contacts!`);
      });
    }

    // QR Code actions (Copy ID and Download QR Image)
    document.querySelector("#copy-qr-link-btn")?.addEventListener("click", () => {
      navigator.clipboard?.writeText(userMobile);
      toast("Payoo ID copied to clipboard!");
    });

    document.querySelector("#download-qr-btn")?.addEventListener("click", () => {
      const svg = document.querySelector("#qr-canvas-container svg");
      if (!svg) return;
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20, 360, 360);
        const a = document.createElement("a");
        a.download = `payoo_qr_${userMobile}.png`;
        a.href = canvas.toDataURL("image/png");
        a.click();
        toast("QR code image downloaded!");
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    });

    // Scanner Torch & Merchant Quick Simulate
    const torchBtn = document.querySelector("#scanner-torch-btn");
    if (torchBtn) {
      torchBtn.addEventListener("click", () => {
        torchBtn.classList.toggle("is-active");
        toast(`Flashlight ${torchBtn.classList.contains("is-active") ? "on" : "off"}.`);
      });
    }

    document.querySelectorAll(".merchant-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        const merchant = pill.dataset.merchant;
        const phone = pill.dataset.phone;
        playSound("beep", state.soundEnabled);
        toast(`Scanned merchant: ${merchant}`);
        scanQrModal?.close();
        setTimeout(() => {
          openTransaction("transfer", phone);
        }, 200);
      });
    });

    // Global Keyboard Shortcut: Ctrl+K / Cmd+K / Alt+T
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openCommandPalette();
      } else if (e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        toggleTheme();
      }
    });

    // Dialog backdrop click to close
    [transactionModal, receiptModal, notificationModal, profileModal, contactModal, qrModal, scanQrModal, splitBillModal, pinModal, commandPaletteModal].forEach((diag) => {
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

    // History search
    const searchInput = document.querySelector("#history-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        renderActivity(e.target.value, activeFilter, activePeriod);
      });
    }

    // Category filter pills
    document.querySelectorAll("#activity-filters .filter-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        document.querySelectorAll("#activity-filters .filter-pill").forEach((p) => p.classList.remove("is-active"));
        pill.classList.add("is-active");
        activeFilter = pill.dataset.filter;
        renderActivity(searchInput?.value || "", activeFilter, activePeriod);
      });
    });

    // Period timeframe filter pills
    document.querySelectorAll("#period-filters .filter-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        document.querySelectorAll("#period-filters .filter-pill").forEach((p) => p.classList.remove("is-active"));
        pill.classList.add("is-active");
        activePeriod = pill.dataset.period;
        renderActivity(searchInput?.value || "", activeFilter, activePeriod);
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

    // Initialize Remittance Calculator
    initRemittanceCalculator();


    // -------------------------------------------------------------
    // VIRTUAL PLATINUM CARD CONTROLLER
    // -------------------------------------------------------------
    const renderVirtualCard = () => {
      const panDisplay = document.querySelector("#card-pan-display");
      const holderDisplay = document.querySelector("#card-holder-display");
      const expiryDisplay = document.querySelector("#card-expiry-display");
      const limitDisplay = document.querySelector("#card-limit-display");
      const limitSlider = document.querySelector("#card-limit-slider");
      const freezeToggle = document.querySelector("#card-freeze-toggle");
      const onlineToggle = document.querySelector("#card-online-toggle");
      const intlToggle = document.querySelector("#card-intl-toggle");
      const freezeOverlay = document.querySelector("#card-freeze-overlay");
      const spentDisplay = document.querySelector("#card-spent-display");

      if (!panDisplay) return;

      const card = state.virtualCard;
      panDisplay.textContent = card.number.replace(/(\d{4})\s\d{4}\s\d{4}\s(\d{4})/, "$1 •••• •••• $2");
      if (holderDisplay) holderDisplay.textContent = card.holder;
      if (expiryDisplay) expiryDisplay.textContent = card.expiry;
      if (limitDisplay) limitDisplay.textContent = `৳${money(card.spendLimit)}`;
      if (limitSlider) limitSlider.value = card.spendLimit;
      if (spentDisplay) spentDisplay.textContent = `৳${money(card.currentSpent)}`;

      if (freezeToggle) freezeToggle.checked = card.frozen;
      if (onlineToggle) onlineToggle.checked = card.onlineActive;
      if (intlToggle) intlToggle.checked = card.intlActive;
      if (freezeOverlay) freezeOverlay.classList.toggle("hidden", !card.frozen);
    };

    // 3D Flip Card
    const virtualCardEl = document.querySelector("#virtual-card");
    const flipCardBtn = document.querySelector("#flip-card-btn");
    const toggleCardFlip = () => {
      if (!virtualCardEl) return;
      playSound("card-flip", state.soundEnabled);
      virtualCardEl.classList.toggle("is-flipped");
    };
    virtualCardEl?.addEventListener("click", (e) => {
      if (e.target.closest("button") || e.target.closest(".subtle-button")) return;
      toggleCardFlip();
    });
    flipCardBtn?.addEventListener("click", toggleCardFlip);

    // Reveal CVV for 15 seconds
    let cvvTimer = null;
    document.querySelector("#reveal-cvv-btn")?.addEventListener("click", () => {
      const cvvDisplay = document.querySelector("#card-cvv-display");
      const btn = document.querySelector("#reveal-cvv-btn");
      if (!cvvDisplay) return;
      playSound("tap", state.soundEnabled);

      if (cvvTimer) {
        clearInterval(cvvTimer);
        cvvTimer = null;
        cvvDisplay.textContent = "•••";
        if (btn) btn.innerHTML = `<i class="fa-regular fa-eye"></i> Reveal CVV (15s)`;
        return;
      }

      cvvDisplay.textContent = state.virtualCard.cvv;
      let remaining = 15;
      if (btn) btn.innerHTML = `<i class="fa-regular fa-eye-slash"></i> Hiding in ${remaining}s...`;

      cvvTimer = setInterval(() => {
        remaining--;
        if (remaining <= 0) {
          clearInterval(cvvTimer);
          cvvTimer = null;
          cvvDisplay.textContent = "•••";
          if (btn) btn.innerHTML = `<i class="fa-regular fa-eye"></i> Reveal CVV (15s)`;
        } else {
          if (btn) btn.innerHTML = `<i class="fa-regular fa-eye-slash"></i> Hiding in ${remaining}s...`;
        }
      }, 1000);
    });

    // Copy card number
    document.querySelector("#copy-card-num-btn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      navigator.clipboard?.writeText(state.virtualCard.number.replace(/\s+/g, ""));
      playSound("tap", state.soundEnabled);
      toast("Virtual Card Number copied to clipboard!");
    });

    // Freeze toggle
    document.querySelector("#card-freeze-toggle")?.addEventListener("change", (e) => {
      state.virtualCard.frozen = e.target.checked;
      save();
      renderVirtualCard();
      if (state.virtualCard.frozen) {
        playSound("freeze", state.soundEnabled);
        toast("Virtual card frozen. All card transactions paused.");
      } else {
        playSound("tap", state.soundEnabled);
        toast("Virtual card unfrozen. Ready for payments.");
      }
    });

    // Online toggle
    document.querySelector("#card-online-toggle")?.addEventListener("change", (e) => {
      state.virtualCard.onlineActive = e.target.checked;
      save();
      playSound("tap", state.soundEnabled);
      toast(`Online e-commerce ${state.virtualCard.onlineActive ? "enabled" : "disabled"}.`);
    });

    // Intl toggle
    document.querySelector("#card-intl-toggle")?.addEventListener("change", (e) => {
      state.virtualCard.intlActive = e.target.checked;
      save();
      playSound("tap", state.soundEnabled);
      toast(`International roaming ${state.virtualCard.intlActive ? "enabled" : "disabled"}.`);
    });

    // Spend limit slider
    document.querySelector("#card-limit-slider")?.addEventListener("input", (e) => {
      const val = Number(e.target.value);
      state.virtualCard.spendLimit = val;
      document.querySelector("#card-limit-display").textContent = `৳${money(val)}`;
      save();
    });

    // Regenerate card details
    document.querySelector("#regenerate-card-btn")?.addEventListener("click", () => {
      const randNum = () => Math.floor(1000 + Math.random() * 9000);
      state.virtualCard.number = `4532 ${randNum()} ${randNum()} ${randNum()}`;
      state.virtualCard.cvv = String(Math.floor(100 + Math.random() * 900));
      save();
      renderVirtualCard();
      playSound("success", state.soundEnabled);
      triggerConfetti(45);
      toast("New Virtual Platinum Card credentials issued!");
    });

    // View Card PIN
    document.querySelector("#card-export-pin-btn")?.addEventListener("click", () => {
      playSound("tap", state.soundEnabled);
      toast(`Your 4-digit Card ATM/POS PIN is: ${state.pin}`);
    });

    // -------------------------------------------------------------
    // VAULTS & SAVINGS BUDGET HUB
    // -------------------------------------------------------------
    const renderVaults = () => {
      const container = document.querySelector("#vaults-container");
      if (!container) return;

      container.innerHTML = state.vaults.map((vault) => {
        const pct = Math.min(100, Math.round((vault.saved / vault.target) * 100));
        return `
          <article class="vault-card" data-vault-id="${vault.id}">
            <div>
              <div class="vault-card__top">
                <div class="vault-icon-circle" style="background: ${vault.color};">
                  <i class="fa-solid ${vault.icon}"></i>
                </div>
                <span class="vault-pct">${pct}%</span>
              </div>
              <h3>${safe(vault.name)}</h3>
              <div class="vault-amounts">
                <strong>৳${money(vault.saved)}</strong>
                <span>of ৳${money(vault.target)}</span>
              </div>
              <div class="vault-track">
                <div class="vault-fill" style="width: ${pct}%; background: ${vault.color};"></div>
              </div>
            </div>
            <div class="vault-actions">
              <button class="button button--soft button--sm vault-deposit-btn" data-id="${vault.id}" type="button"><i class="fa-solid fa-plus"></i> Deposit</button>
              <button class="button button--soft button--sm vault-withdraw-btn" data-id="${vault.id}" type="button"><i class="fa-solid fa-minus"></i> Withdraw</button>
            </div>
          </article>
        `;
      }).join("");

      container.querySelectorAll(".vault-deposit-btn").forEach((btn) => {
        btn.addEventListener("click", () => openVaultActionModal(btn.dataset.id, "deposit"));
      });
      container.querySelectorAll(".vault-withdraw-btn").forEach((btn) => {
        btn.addEventListener("click", () => openVaultActionModal(btn.dataset.id, "withdraw"));
      });
    };

    const renderBudget = () => {
      const budgetSpentEl = document.querySelector("#budget-spent-val");
      const budgetTotalEl = document.querySelector("#budget-total-val");
      const budgetFillEl = document.querySelector("#budget-bar-fill");
      const statusPill = document.querySelector("#budget-status-pill");
      const dailyEl = document.querySelector("#budget-daily-allowance");

      if (!budgetSpentEl) return;

      const now = new Date();
      const thisMonthOutflow = state.history
        .filter((tx) => tx.direction < 0)
        .reduce((sum, tx) => sum + tx.amount, 0);

      const totalBudget = state.monthlyBudget || 25000;
      const pct = Math.min(100, Math.round((thisMonthOutflow / totalBudget) * 100));

      budgetSpentEl.textContent = `৳${money(thisMonthOutflow)}`;
      budgetTotalEl.textContent = `৳${money(totalBudget)}`;
      if (budgetFillEl) budgetFillEl.style.width = `${pct}%`;

      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysRemaining = Math.max(1, daysInMonth - now.getDate());
      const remainingBudget = Math.max(0, totalBudget - thisMonthOutflow);
      const dailyAllowance = remainingBudget / daysRemaining;

      if (dailyEl) dailyEl.textContent = `৳${money(dailyAllowance)} / day`;

      if (statusPill) {
        if (pct < 70) {
          statusPill.className = "budget-status-pill budget-status-pill--healthy";
          statusPill.innerHTML = `<i class="fa-solid fa-circle-check"></i> On Track (${pct}%)`;
        } else if (pct <= 90) {
          statusPill.className = "budget-status-pill budget-status-pill--warn";
          statusPill.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Watch Out (${pct}%)`;
        } else {
          statusPill.className = "budget-status-pill budget-status-pill--over";
          statusPill.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Over Budget (${pct}%)`;
        }
      }
    };

    // Vault Action Modal
    const vaultActionModal = document.querySelector("#vault-action-modal");
    const openVaultActionModal = (vaultId, actionType) => {
      const vault = state.vaults.find((v) => v.id === vaultId);
      if (!vault || !vaultActionModal) return;

      playSound("tap", state.soundEnabled);
      document.querySelector("#vault-action-id").value = vaultId;
      document.querySelector("#vault-action-type").value = actionType;
      document.querySelector("#vault-action-title").textContent = actionType === "deposit" ? `Deposit to ${vault.name}` : `Withdraw from ${vault.name}`;
      document.querySelector("#vault-action-desc").textContent = actionType === "deposit"
        ? `Transfer money from your available balance (৳${money(state.balance)}) into ${vault.name}.`
        : `Move money from ${vault.name} (৳${money(vault.saved)}) back into your main wallet.`;
      document.querySelector("#vault-action-submit-btn").textContent = actionType === "deposit" ? "Confirm Deposit" : "Confirm Withdrawal";

      const form = document.querySelector("#vault-action-form");
      form.reset();

      if (typeof vaultActionModal.showModal === "function") vaultActionModal.showModal();
      else vaultActionModal.setAttribute("open", "");
    };

    document.querySelector("#vault-action-close")?.addEventListener("click", () => {
      vaultActionModal?.close();
    });

    document.querySelector("#vault-action-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const vaultId = document.querySelector("#vault-action-id").value;
      const actionType = document.querySelector("#vault-action-type").value;
      const amount = Number(document.querySelector("#vault-action-amount").value);
      const pin = document.querySelector("#vault-action-pin").value;

      if (!isPin(pin, state.pin)) {
        playSound("error", state.soundEnabled);
        toast("Incorrect 4-digit PIN.", "error");
        return;
      }

      const vault = state.vaults.find((v) => v.id === vaultId);
      if (!vault) return;

      if (actionType === "deposit") {
        if (state.balance < amount) {
          playSound("error", state.soundEnabled);
          toast("Insufficient wallet balance for this deposit.", "error");
          return;
        }
        state.balance -= amount;
        vault.saved += amount;
        addTransaction("goal", amount, `Deposited to ${vault.name}`);
        playSound("success", state.soundEnabled);
        triggerConfetti(50);
        toast(`৳${money(amount)} deposited into ${vault.name}!`);
      } else {
        if (vault.saved < amount) {
          playSound("error", state.soundEnabled);
          toast("Vault balance is lower than withdrawal amount.", "error");
          return;
        }
        vault.saved -= amount;
        state.balance += amount;
        addTransaction("goal-withdraw", amount, `Withdrawn from ${vault.name}`);
        playSound("success", state.soundEnabled);
        toast(`৳${money(amount)} withdrawn from ${vault.name} into wallet!`);
      }

      save();
      renderBalance(true);
      renderVaults();
      renderBudget();
      renderFinancialHealthScore();
      vaultActionModal?.close();
    });

    // New Vault Modal
    const newVaultModal = document.querySelector("#new-vault-modal");
    document.querySelector("#create-vault-btn")?.addEventListener("click", () => {
      playSound("tap", state.soundEnabled);
      document.querySelector("#new-vault-form")?.reset();
      if (typeof newVaultModal.showModal === "function") newVaultModal.showModal();
      else newVaultModal.setAttribute("open", "");
    });
    document.querySelector("#new-vault-close")?.addEventListener("click", () => {
      newVaultModal?.close();
    });
    document.querySelector("#new-vault-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.querySelector("#new-vault-name").value.trim();
      const target = Number(document.querySelector("#new-vault-target").value);
      const initial = Number(document.querySelector("#new-vault-initial").value) || 0;
      const icon = document.querySelector("#new-vault-icon").value;

      if (initial > 0 && state.balance < initial) {
        playSound("error", state.soundEnabled);
        toast("Insufficient wallet balance for initial deposit.", "error");
        return;
      }

      const colors = ["#6955f6", "#19b889", "#38bdf8", "#f5a049", "#ee7d68", "#a855f7"];
      const newVault = {
        id: `vault-${Date.now()}`,
        name,
        target,
        saved: initial,
        icon,
        color: colors[state.vaults.length % colors.length]
      };

      if (initial > 0) {
        state.balance -= initial;
        addTransaction("goal", initial, `Initial deposit to ${name}`);
      }

      state.vaults.push(newVault);
      save();
      renderBalance(true);
      renderVaults();
      renderBudget();
      renderFinancialHealthScore();
      newVaultModal?.close();
      playSound("success", state.soundEnabled);
      triggerConfetti(60);
      toast(`Savings vault "${name}" created successfully!`);
    });

    // -------------------------------------------------------------
    // PAYOO 24K DIGITAL GOLD CONTROLLER
    // -------------------------------------------------------------
    const renderGold = () => {
      const priceEl = document.querySelector("#gold-live-price");
      const gramsEl = document.querySelector("#gold-holding-grams");
      const bdtEl = document.querySelector("#gold-holding-bdt");

      if (!priceEl) return;

      const price = state.goldMarketPrice || 11850;
      const grams = state.goldGrams || 1.25;
      const portfolioVal = grams * price;

      priceEl.textContent = `৳${money(price)}`;
      if (gramsEl) gramsEl.textContent = `${grams.toFixed(4)} g`;
      if (bdtEl) bdtEl.textContent = `৳${money(portfolioVal)}`;
    };

    // Subtle market tick
    setInterval(() => {
      const delta = (Math.random() - 0.49) * 15;
      state.goldMarketPrice = Math.max(10000, Math.round(state.goldMarketPrice + delta));
      renderGold();
    }, 12000);

    const goldTradeModal = document.querySelector("#gold-trade-modal");
    const openGoldTrade = (mode = "buy") => {
      if (!goldTradeModal) return;
      playSound("tap", state.soundEnabled);
      document.querySelector("#gold-trade-mode").value = mode;
      document.querySelector("#gold-trade-title").textContent = mode === "buy" ? "Buy 24K Digital Gold" : "Sell 24K Digital Gold";
      document.querySelector("#gold-input-label").childNodes[0].textContent = mode === "buy" ? "Amount in BDT (৳)" : "Weight to Sell in Grams (g)";
      document.querySelector("#gold-trade-rate").textContent = `৳${money(state.goldMarketPrice)} / g`;
      document.querySelector("#gold-trade-submit-btn").textContent = mode === "buy" ? "Authorize Gold Purchase" : "Authorize Gold Sale";

      const input = document.querySelector("#gold-trade-input");
      input.value = mode === "buy" ? "1000" : (state.goldGrams * 0.5).toFixed(4);
      updateGoldPreview(mode);

      if (typeof goldTradeModal.showModal === "function") goldTradeModal.showModal();
      else goldTradeModal.setAttribute("open", "");
    };

    const updateGoldPreview = (mode) => {
      const inputVal = Number(document.querySelector("#gold-trade-input").value) || 0;
      const preview = document.querySelector("#gold-trade-weight-preview");
      if (!preview) return;
      if (mode === "buy") {
        const grams = inputVal / state.goldMarketPrice;
        preview.textContent = `${grams.toFixed(4)} g`;
      } else {
        const bdt = inputVal * state.goldMarketPrice;
        preview.textContent = `৳${money(bdt)}`;
      }
    };

    document.querySelector("#gold-trade-input")?.addEventListener("input", () => {
      const mode = document.querySelector("#gold-trade-mode").value;
      updateGoldPreview(mode);
    });

    document.querySelector("#buy-gold-trigger-btn")?.addEventListener("click", () => openGoldTrade("buy"));
    document.querySelector("#sell-gold-trigger-btn")?.addEventListener("click", () => openGoldTrade("sell"));
    document.querySelector("#gold-trade-close")?.addEventListener("click", () => goldTradeModal?.close());

    document.querySelector("#gold-trade-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const mode = document.querySelector("#gold-trade-mode").value;
      const inputVal = Number(document.querySelector("#gold-trade-input").value);
      const pin = document.querySelector("#gold-trade-pin").value;

      if (!isPin(pin, state.pin)) {
        playSound("error", state.soundEnabled);
        toast("Incorrect 4-digit PIN.", "error");
        return;
      }

      if (mode === "buy") {
        if (state.balance < inputVal) {
          playSound("error", state.soundEnabled);
          toast("Insufficient wallet balance to buy gold.", "error");
          return;
        }
        const gramsPurchased = inputVal / state.goldMarketPrice;
        state.balance -= inputVal;
        state.goldGrams += gramsPurchased;
        addTransaction("transfer", inputVal, `Bought ${gramsPurchased.toFixed(4)}g 24K Digital Gold`);
        playSound("gold", state.soundEnabled);
        triggerConfetti(55);
        toast(`Purchased ${gramsPurchased.toFixed(4)}g of 24K gold!`);
      } else {
        if (state.goldGrams < inputVal) {
          playSound("error", state.soundEnabled);
          toast("You do not hold that much gold to sell.", "error");
          return;
        }
        const bdtProceeds = inputVal * state.goldMarketPrice;
        state.goldGrams -= inputVal;
        state.balance += bdtProceeds;
        addTransaction("add-money", bdtProceeds, `Sold ${inputVal.toFixed(4)}g Digital Gold`);
        playSound("gold", state.soundEnabled);
        toast(`Sold ${inputVal.toFixed(4)}g of gold for ৳${money(bdtProceeds)}!`);
      }

      save();
      renderBalance(true);
      renderGold();
      renderFinancialHealthScore();
      goldTradeModal?.close();
    });

    // -------------------------------------------------------------
    // FINANCIAL HEALTH & TRUST SCORE GAUGE
    // -------------------------------------------------------------
    const renderFinancialHealthScore = () => {
      const scoreEl = document.querySelector("#score-number-display");
      const arcEl = document.querySelector("#score-gauge-arc");
      const tierEl = document.querySelector("#score-tier-tag");

      if (!scoreEl) return;

      const totalSaved = state.vaults.reduce((sum, v) => sum + v.saved, 0);
      const savingsFactor = Math.min(250, (totalSaved / 30000) * 250);
      const balanceFactor = Math.min(200, (state.balance / 40000) * 200);
      const txCount = state.history.length;
      const historyFactor = Math.min(150, txCount * 15);
      const baseScore = 250;

      const totalScore = Math.min(850, Math.max(300, Math.round(baseScore + savingsFactor + balanceFactor + historyFactor)));

      scoreEl.textContent = String(totalScore);

      const pct = (totalScore - 300) / (850 - 300);
      const dashOffset = Math.round(283 * (1 - pct));
      if (arcEl) arcEl.style.strokeDashoffset = String(dashOffset);

      if (tierEl) {
        if (totalScore >= 750) tierEl.textContent = "TIER 1 • EXCELLENT";
        else if (totalScore >= 670) tierEl.textContent = "TIER 2 • VERY GOOD";
        else tierEl.textContent = "TIER 3 • GOOD";
      }
    };

    // -------------------------------------------------------------
    // AI MONEY COACH (PAYOO INTELLIGENCE)
    // -------------------------------------------------------------
    const initAICoach = () => {
      const aiDialog = document.querySelector("#ai-coach-dialog");
      const chatBody = document.querySelector("#ai-chat-body");
      const form = document.querySelector("#ai-chat-form");
      const input = document.querySelector("#ai-user-input");

      const appendMsg = (sender, text) => {
        if (!chatBody) return;
        const msg = document.createElement("div");
        msg.className = `ai-chat-bubble ai-chat-bubble--${sender}`;
        msg.innerHTML = text;
        chatBody.append(msg);
        chatBody.scrollTop = chatBody.scrollHeight;
      };

      const handleQuery = (promptType, customText = "") => {
        playSound("tap", state.soundEnabled);
        let userText = customText;
        let reply = "";

        if (promptType === "spending") {
          userText = "Can you give me a spending summary?";
          const outflows = state.history.filter((tx) => tx.direction < 0);
          const totalOutflow = outflows.reduce((s, tx) => s + tx.amount, 0);
          reply = `You have completed <strong>${outflows.length} outflow transactions</strong> totaling <strong>৳${money(totalOutflow)}</strong>. Your largest spending is concentrated in Transfers and Bills.`;
        } else if (promptType === "biggest") {
          userText = "What was my biggest expense?";
          const outflows = state.history.filter((tx) => tx.direction < 0);
          if (outflows.length === 0) {
            reply = "You haven't recorded any outflow transactions yet!";
          } else {
            const biggest = outflows.reduce((max, tx) => (tx.amount > max.amount ? tx : max), outflows[0]);
            reply = `Your highest single expense was <strong>৳${money(biggest.amount)}</strong> for <em>${safe(biggest.label)}</em> (${shortDate(biggest.at)}).`;
          }
        } else if (promptType === "budget") {
          userText = "Any tips to optimize my budget?";
          reply = `You have <strong>৳${money(state.balance)}</strong> in available cash and <strong>৳${money(state.vaults.reduce((s,v)=>s+v.saved,0))}</strong> tucked into savings vaults. Allocating another 5% to your <em>Emergency Fund</em> will push your Financial Health Score past 800!`;
        } else if (promptType === "gold") {
          userText = "How is my 24K gold investment doing?";
          const val = state.goldGrams * state.goldMarketPrice;
          reply = `You currently hold <strong>${state.goldGrams.toFixed(4)} grams</strong> of 24K Gold valued at <strong>৳${money(val)}</strong> (Rate: ৳${money(state.goldMarketPrice)}/g). Gold is up +6.8% since your initial deposit.`;
        } else {
          userText = customText;
          reply = `Based on your live ledger (Balance: <strong>৳${money(state.balance)}</strong>), your account is in strong health. You can comfortably afford everyday payments while keeping your savings goals on track.`;
        }

        appendMsg("user", safe(userText));

        setTimeout(() => {
          playSound("beep", state.soundEnabled);
          appendMsg("bot", reply);
        }, 300);
      };

      document.querySelector("#ai-coach-btn")?.addEventListener("click", () => {
        playSound("tap", state.soundEnabled);
        if (chatBody && chatBody.children.length === 0) {
          appendMsg("bot", `Hello Shihab! I'm <strong>Payoo Intelligence</strong>. Your current available balance is <strong>৳${money(state.balance)}</strong> across <strong>${state.vaults.length} vaults</strong>. How can I help you analyze your money today?`);
        }
        if (typeof aiDialog.showModal === "function") aiDialog.showModal();
        else aiDialog.setAttribute("open", "");
      });

      document.querySelector("#ai-coach-close")?.addEventListener("click", () => aiDialog?.close());

      document.querySelectorAll(".ai-chip").forEach((chip) => {
        chip.addEventListener("click", () => handleQuery(chip.dataset.prompt));
      });

      form?.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = input.value.trim();
        if (!query) return;
        input.value = "";
        handleQuery("custom", query);
      });
    };

    // -------------------------------------------------------------
    // OFFICIAL BANK STATEMENT GENERATOR
    // -------------------------------------------------------------
    const initBankStatement = () => {
      const statementDialog = document.querySelector("#statement-dialog");
      const statementContent = document.querySelector("#statement-content");

      document.querySelector("#view-statement-btn")?.addEventListener("click", () => {
        if (!statementContent) return;
        playSound("tap", state.soundEnabled);

        const now = new Date();
        const totalInflow = state.history.filter((tx) => tx.direction > 0).reduce((s, tx) => s + tx.amount, 0);
        const totalOutflow = state.history.filter((tx) => tx.direction < 0).reduce((s, tx) => s + tx.amount, 0);

        const rows = state.history.map((tx) => {
          const isPos = tx.direction > 0;
          return `
            <tr>
              <td>${shortDate(tx.at)}</td>
              <td><code>${tx.id}</code></td>
              <td>${safe(tx.label)}</td>
              <td>${safe(tx.detail || "-")}</td>
              <td style="color: ${isPos ? "#19b889" : "#ee7d68"}; font-weight: 700;">
                ${isPos ? "+" : "-"}৳${money(tx.amount)}
              </td>
              <td style="font-weight: 700;">৳${money(tx.balanceAfter || state.balance)}</td>
            </tr>
          `;
        }).join("");

        statementContent.innerHTML = `
          <div class="statement-header">
            <div class="statement-header-brand">
              <img src="./assets/logo.png" alt="Payoo Logo" />
              <span>pay<span>oo</span> MFS</span>
            </div>
            <div style="text-align: right; font-size: 0.82rem; color: #6a6784;">
              <strong style="display: block; color: #1a1932; font-size: 1rem;">ACCOUNT STATEMENT</strong>
              <span>Licensed by Bangladesh Bank</span><br />
              <span>Generated: ${now.toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
          </div>

          <div class="statement-meta-grid">
            <div class="statement-meta-block">
              <p>ACCOUNT HOLDER</p>
              <strong>Shihab Atahar</strong>
              <div style="color: #6a6784; font-size: 0.8rem;">Mobile: +880 ${safe(userMobile)}</div>
              <div style="color: #6a6784; font-size: 0.8rem;">KYC Tier: Tier-2 Fully Verified</div>
            </div>
            <div class="statement-meta-block" style="text-align: right;">
              <p>WALLET ACCOUNT NUMBER</p>
              <strong style="font-family: monospace;">PAYOO-BD-${safe(userMobile)}</strong>
              <div style="color: #6a6784; font-size: 0.8rem;">Currency: Bangladeshi Taka (BDT ৳)</div>
              <div style="color: #6a6784; font-size: 0.8rem;">Statement ID: STMT-${Date.now().toString(36).toUpperCase()}</div>
            </div>
          </div>

          <div class="statement-summary-boxes">
            <div class="summary-box">
              <p>Opening Balance</p>
              <strong>৳${money(previousBalance)}</strong>
            </div>
            <div class="summary-box">
              <p>Total Credits (+)</p>
              <strong style="color: #19b889;">+৳${money(totalInflow)}</strong>
            </div>
            <div class="summary-box">
              <p>Total Debits (−)</p>
              <strong style="color: #ee7d68;">−৳${money(totalOutflow)}</strong>
            </div>
            <div class="summary-box">
              <p>Closing Balance</p>
              <strong style="color: #6955f6;">৳${money(state.balance)}</strong>
            </div>
          </div>

          <table class="statement-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>TX ID</th>
                <th>Description</th>
                <th>Channel / Ref</th>
                <th>Amount</th>
                <th>Balance After</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="statement-footer-seal">
            <div class="statement-seal-badge">
              <i class="fa-solid fa-stamp"></i>
              <div>
                <strong>PAYOO DIGITAL SETTLEMENT VERIFIED</strong>
                <div>Client-Side Cryptographic Ledger Integrity Guarantee</div>
              </div>
            </div>
            <div style="text-align: right; font-size: 0.78rem; color: #8a88a0;">
              <div>Authorized Electronic Certificate</div>
              <strong style="color: #1a1932;">CHIEF FINANCIAL SYSTEMS ARCHITECT</strong>
            </div>
          </div>
        `;

        if (typeof statementDialog.showModal === "function") statementDialog.showModal();
        else statementDialog.setAttribute("open", "");
      });

      document.querySelector("#statement-close")?.addEventListener("click", () => statementDialog?.close());
      document.querySelector("#print-statement-btn")?.addEventListener("click", () => window.print());
    };

    // -------------------------------------------------------------
    // SCREEN LOCK (BIOMETRIC & PIN LOCK)
    // -------------------------------------------------------------
    const initScreenLock = () => {
      const overlay = document.querySelector("#screen-lock-overlay");
      const timeEl = document.querySelector("#lock-clock-time");
      const dateEl = document.querySelector("#lock-clock-date");
      const dots = document.querySelectorAll(".lock-dot");
      let enteredPin = "";

      const updateClock = () => {
        const now = new Date();
        if (timeEl) {
          timeEl.textContent = now.toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit", hour12: false });
        }
        if (dateEl) {
          dateEl.textContent = now.toLocaleDateString("en-BD", { weekday: "long", day: "numeric", month: "long" });
        }
      };
      setInterval(updateClock, 1000);
      updateClock();

      const updateDots = () => {
        dots.forEach((dot, idx) => {
          dot.classList.toggle("filled", idx < enteredPin.length);
        });
      };

      const unlock = () => {
        playSound("success", state.soundEnabled);
        overlay.classList.add("hidden");
        enteredPin = "";
        updateDots();
        toast("Wallet unlocked!");
      };

      const handleKey = (key) => {
        if (enteredPin.length < 4) {
          enteredPin += key;
          playSound("tap", state.soundEnabled);
          updateDots();

          if (enteredPin.length === 4) {
            setTimeout(() => {
              if (enteredPin === state.pin || enteredPin === "0000") {
                unlock();
              } else {
                playSound("error", state.soundEnabled);
                overlay.classList.add("lock-shake");
                setTimeout(() => {
                  overlay.classList.remove("lock-shake");
                  enteredPin = "";
                  updateDots();
                }, 450);
                toast("Incorrect PIN. Try 0000.", "error");
              }
            }, 120);
          }
        }
      };

      document.querySelector("#lock-wallet-btn")?.addEventListener("click", () => {
        playSound("freeze", state.soundEnabled);
        overlay.classList.remove("hidden");
        enteredPin = "";
        updateDots();
        updateClock();
      });

      overlay?.querySelectorAll(".keypad-btn[data-key]").forEach((btn) => {
        btn.addEventListener("click", () => handleKey(btn.dataset.key));
      });

      document.querySelector("#lock-clear-btn")?.addEventListener("click", () => {
        enteredPin = "";
        playSound("tap", state.soundEnabled);
        updateDots();
      });

      document.querySelector("#lock-backspace-btn")?.addEventListener("click", () => {
        if (enteredPin.length > 0) {
          enteredPin = enteredPin.slice(0, -1);
          playSound("tap", state.soundEnabled);
          updateDots();
        }
      });

      document.querySelector("#biometric-unlock-btn")?.addEventListener("click", () => {
        playSound("card-flip", state.soundEnabled);
        toast("Touch ID / Face ID verified successfully!");
        setTimeout(unlock, 350);
      });
    };

    // Initial render
    renderBalance(false);
    renderTotals();
    renderContacts();
    renderNotifications();
    renderActivity();
    renderVirtualCard();
    renderVaults();
    renderBudget();
    renderGold();
    renderFinancialHealthScore();

    // -------------------------------------------------------------
    // INTERACTIVE 3D MOUSE PARALLAX TILT & SPECULAR GLARE
    // -------------------------------------------------------------
    const initTiltPhysics = () => {
      const cards = document.querySelectorAll(".tilt-card");
      cards.forEach((card) => {
        card.addEventListener("mousemove", (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const rotateX = ((y / rect.height) - 0.5) * -12;
          const rotateY = ((x / rect.width) - 0.5) * 12;

          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
          card.style.setProperty("--mouse-x", `${x}px`);
          card.style.setProperty("--mouse-y", `${y}px`);
        });

        card.addEventListener("mouseleave", () => {
          card.style.transform = "";
        });
      });
    };

    // -------------------------------------------------------------
    // AUDIO VISUALIZER / SOUND FX TOGGLE CONTROLLER
    // -------------------------------------------------------------
    const initAudioVisualizer = () => {
      const btn = document.querySelector("#soundwave-toggle-btn");
      const label = document.querySelector("#soundwave-label");
      if (!btn) return;

      const updateBtnUI = () => {
        btn.classList.toggle("is-muted", !state.soundEnabled);
        if (label) label.textContent = state.soundEnabled ? "FX" : "OFF";
        btn.setAttribute("title", `Sound Effects: ${state.soundEnabled ? "Active (Click to mute)" : "Muted (Click to enable)"}`);
      };
      updateBtnUI();

      btn.addEventListener("click", () => {
        state.soundEnabled = !state.soundEnabled;
        save();
        updateBtnUI();
        if (state.soundEnabled) {
          playSound("tap", true);
          toast("Audio synthesized sound effects enabled.");
        } else {
          toast("Sound effects muted.");
        }
      });
    };

    initScreenLock();
    initAICoach();
    initBankStatement();
    initTiltPhysics();
    initAudioVisualizer();
    navigate(selectedView);
  }

  initLogin();
  initDashboard();
})();
