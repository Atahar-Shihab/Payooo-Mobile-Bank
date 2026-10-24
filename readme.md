# Payoo — Digital Wallet Experience

Payoo is a portfolio-grade, frontend-only digital wallet and fintech super-app experience. It demonstrates how a modern financial product can feel calm, trustworthy, transparent, and delightful through purposeful interface design, responsive layouts, interactive analytics, and polished feedback states.

> **Disclaimer**: This is an educational demonstration project. It does not connect to actual banking rails or process real monetary transactions.

---

## ✨ Features & Highlights

### 🌐 Ambient 3D Visual Experience
- **Interactive Holographic Card**: Powered by Three.js (WebGL), featuring realistic metallic embossed textures, gold EMV chip, contactless wave icons, and smooth, refined mouse parallax tilt.
- **Ambient Cyber Wave**: 1,200+ particle network undulating dynamically to represent live global money movement.
- **Calm, Distraction-Free Layout**: Built to institutional fintech standards with clean visual hierarchy and zero intrusive camera toggles.
- **Mobile Gyroscope Support**: Tilting a mobile device dynamically tilts the 3D card in real time.

### 🌗 Dark Mode & Cyber Slate Theme Switcher
- **Instant Theme Toggle**: Seamless switch between crisp Light Mode and obsidian dark Cyber Slate Mode (`Alt + T` or topbar icon).
- High-contrast, glowing neon accents with persistent storage in `localStorage`.

### ⚡ Omnibox Command Palette (`Ctrl + K` / `Cmd + K`)
- Quick-action launcher providing keyboard navigation (`↑` `↓` `Enter`) to search and execute any wallet action, navigate views, toggle theme, export statements, or manage security PIN without touching the mouse.

### 💳 Core Wallet & 8 Quick Action Services
1. **Add Money**: Top up from bank accounts or cards (City Bank, DBBL/Rocket, IBBL, BRAC Bank, Visa/Mastercard) with 8–18 digit account validation and quick-amount chips.
2. **Send Money**: Free P2P transfers with quick recipient lookup and instant balance deduction.
3. **Cash Out**: Agent withdrawal with real-time **1.49% fee breakdown preview**.
4. **Mobile Recharge**: Instant airtime top-up for Grameenphone, Banglalink, Robi, Airtel, and Teletalk with Prepaid/Postpaid selector and quick recharge chips (৳20–৳500).
5. **Pay Bill**: Utility and ISP bills for DESCO, DPDC, Dhaka WASA, Titas Gas, Carnival Internet, and Link3 with customer reference numbers.
6. **Request Money**: Direct peer payment requests with custom notes and automatic notification tracking.
7. **Split Bill (Group Expenses)**: Calculate shared expenses with tip controls (0%, 5%, 10%, 15%), stepper people count, and 1-tap request dispatch to selected contacts.
8. **Scan to Pay (QR)**: Interactive simulated camera viewfinder with animated laser scan line, flashlight toggle, and 1-tap instant merchant detection (Aarong, Shwapno, North End Coffee).

### 📱 My Personal QR Code & Image Export
- Dynamically generated SVG QR Code encoded with user's Payoo ID.
- Verified badge, 1-click **Copy Payoo ID**, and **Save QR Image** (renders SVG to `<canvas>` and exports high-res `.png`).

### 🌍 Global Inward Remittance Calculator
- Live exchange rates for USD, GBP, EUR, SAR, AED, and MYR.
- Computes Bangladesh Government's **2.5% Cash Incentive** automatically.
- Interactive "Simulate Inward Remittance" button crediting foreign funds directly into the wallet with official receipt.

### 🧾 Transaction Receipts & Activity Hub
- **Interactive Receipt Slips**: Click any transaction to inspect its official receipt modal with unique Transaction ID, exact timestamp, fee breakdown, counterparty details, and post-transaction balance.
- **Dedicated Print Stylesheet**: 1-click **Print Receipt** cleanly formats the receipt for paper or PDF without navigation or modal overlays (`@media print`).
- **Multi-Criteria Filtering**: Filter by category (Inflow, Outflow, Transfers, Bills, Recharge, Cash Out) and timeframe (All Time, Today, Past 7 Days, Past 30 Days).
- **CSV Data Export**: Export complete transaction history as a downloadable `.csv` file.

### 📊 Real-Time Financial Insights
- **Dynamic Weekly Flow Chart**: Visualizes day-by-day spending across the past 7 days (Mon–Sun) computed dynamically from transaction records, complete with interactive hover tooltips, weekly spend total, and daily average.
- **Category Spending Distribution**: Automatically categorizes outflows into Transfers, Utility & Bills, Cash Out, Recharge, and Savings with proportional progress bars.
- **Interactive Savings Goal ("Dream getaway")**: Track progress toward a ৳60,000 target with options to add ৳500, add ৳1,000, or withdraw funds back into the wallet.

### 👥 People, Security & Controls
- **Contact Manager Suite**: Quick-action buttons to Send, Request, or Delete contacts.
- **Security PIN Management**: Update the 4-digit transaction authorization PIN via dedicated modal.
- **Full JSON Backup & Restore**: Export complete wallet state as a `.json` backup file.
- **Live Notification Center**: Dynamic feed with unread badge counter, "Mark all read", and "Clear all".

### 🎁 Payoo Plus Rewards
- **Welcome Bonus**: Claim ৳100 with promo code `PAYOO100`.
- **Merchant Vouchers**: 1-click copy for partner discount codes (`CAFE50`, `RIDE30`).

### 🎵 Modern Audio Feedback
- Synthesized, zero-dependency audio feedback using the Web Audio API for celebratory transaction chimes, barcode scanner beeps, and soft interaction clicks.

### 📲 Progressive Web App (PWA)
- Web App Manifest (`manifest.json`) and Service Worker (`sw.js`) for offline asset caching and standalone installation.

---

## 🔑 Demo Access

| Field | Value |
| --- | --- |
| Mobile number | `00000000000` *(or any valid 11-digit `01XXXXXXXXX`)* |
| PIN | `0000` |
| Reward code | `PAYOO100` |

> **Pro Tip**: On the sign-in page, click the **Auto-fill** chip on the demo credential box to populate credentials in one click!

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl + K` / `Cmd + K` | Open Omnibox Command Palette |
| `Alt + T` | Toggle Dark / Light Theme |
| `Esc` | Close any open modal or command palette |

---

## 🚀 Run Locally

No compiler or build step is required. Open `index.html` directly in your browser, or serve the repository with any static file server:

```bash
# Using npx serve
npx serve .

# Or using Python 3
python -m http.server 3000
```

---

## 🌐 GitHub Pages Deployment

The repository includes a GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) that builds and deploys directly to GitHub Pages on every push to `main`.

For this repository, the dashboard direct URL is:

```text
https://atahar-shihab.github.io/Payooo-Mobile-Bank/home.html
```

---

## 📁 Project Architecture

```text
Payooo-Mobile-Bank/
├── .github/workflows/
│   └── deploy-pages.yml      # Automated GitHub Pages CI/CD workflow
├── assets/
│   ├── css/
│   │   └── app.css           # Design tokens, dark mode, responsive grid, modal & slip UI
│   ├── logo.png              # Brand identity mark
│   └── opt-1.png..opt-6.png  # Classic service icons
├── script/
│   ├── app.js                # Core state engine, QR generator, split bill, remittance, audio
│   └── landing-3d.js         # Three.js 3D WebGL holographic card & cyber particle wave
├── index.html                # 3D cinematic landing page with interactive sign-in portal
├── home.html                 # Comprehensive fintech super-app dashboard
├── manifest.json             # Progressive Web App manifest
├── sw.js                     # Service worker for offline asset caching
└── readme.md                 # Documentation and architecture guide
```

---

## 💾 Local Data & Persistence

Wallet data is saved in browser `localStorage` under `payoo-wallet-v2`. You can:
- Clear transaction history using **Clear** in the Activity tab.
- Reset the entire wallet to factory demo state via **Account Profile → Reset Demo Data**.
- Export and download your entire wallet state as JSON via **Account Profile → Export JSON**.
