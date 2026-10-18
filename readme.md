# Payoo — Digital Wallet Experience

Payoo is a portfolio-grade, frontend-only digital wallet and fintech super-app experience. It demonstrates how a modern financial product can feel calm, trustworthy, transparent, and delightful through purposeful interface design, responsive layouts, interactive analytics, and polished feedback states.

> **Disclaimer**: This is an educational demonstration project. It does not connect to actual banking rails or process real monetary transactions.

---

## ✨ Features & Highlights

### 🌐 3D Cinematic Visual Engine & Landing Experience
- **Interactive 3D Holographic Card**: Powered by Three.js (WebGL), featuring realistic metallic embossed textures, gold EMV chip, contactless wave icons, and responsive mouse parallax tilt / 360° drag inspection.
- **Cinematic Camera Moves**: 3 autonomous, switchable camera paths:
  1. **Orbit View**: Slow breathing cinematic dolly that glides around the floating card with depth of field.
  2. **Card Focus**: Macro close-up view with dynamic specular rim lighting following your cursor.
  3. **Wave Flow**: Wide-angle fly-through over the undulating cyber energy ocean.
- **Undulating Cyber Wave**: 1,200+ particle network undulating dynamically to represent live global money movement.
- **Mobile Gyroscope Support**: Tilting a mobile device dynamically tilts the 3D card in real time.

### 💳 Core Wallet & Operations
- **Overview Dashboard**: High-contrast available balance card with privacy toggle, verified wallet badges, and lifetime money in/out stats.
- **6 Quick Action Services**:
  1. **Add Money**: Top up from bank accounts or cards (City Bank, DBBL/Rocket, IBBL, BRAC Bank, Visa/Mastercard) with 10–18 digit account validation and quick-amount chips.
  2. **Send Money**: Free P2P transfers with quick recipient lookup and instant balance deduction.
  3. **Cash Out**: Agent withdrawal with real-time **1.49% fee breakdown preview** (e.g. fee calculation and total deduction transparency).
  4. **Mobile Recharge**: Instant airtime top-up for Grameenphone, Banglalink, Robi, Airtel, and Teletalk with Prepaid/Postpaid selector and quick recharge chips (৳20–৳500).
  5. **Pay Bill**: Utility and ISP bills for DESCO, DPDC, Dhaka WASA, Titas Gas, Carnival Internet, and Link3 with customer reference numbers.
  6. **Request Money**: Split bills or send payment requests with custom notes and automatic notification tracking.

### 🧾 Transaction Receipts & Activity Hub
- **Interactive Receipt Slips**: Click any recent or historical transaction to inspect its official receipt modal featuring a unique Transaction ID, exact timestamp, fee breakdown, counterparty details, post-transaction balance, and 1-click **Copy TXN ID** and **Print Receipt** buttons.
- **Search & Filter Tabs**: Instantly filter transactions by All, Inflow (+), Outflow (−), Transfers, Bills, Recharge, and Cash Out.
- **CSV Data Export**: Export complete transaction history as a downloadable `.csv` file.

### 📊 Real-Time Financial Insights
- **Dynamic Weekly Flow Chart**: Visualizes day-by-day spending across the past 7 days (Mon–Sun) computed dynamically from transaction records, complete with interactive hover tooltips, weekly spend total, and daily average.
- **Category Spending Distribution**: Automatically categorizes outflows into Transfers, Utility & Bills, Cash Out, Recharge, and Savings with proportional progress bars.
- **Interactive Savings Goal ("Dream getaway")**: Track progress toward a ৳60,000 target with options to add ৳500, add ৳1,000, or withdraw funds back into the wallet.

### 👥 People & Notifications
- **Contact Manager ("Your people")**: 1-tap transfers to saved contacts, with an "+ Add a person" modal to save custom contacts.
- **Live Notification Drawer**: Dynamic notification feed triggered by wallet activity with unread badge counter, "Mark all read", and "Clear all" options.
- **User Profile & Controls**: Inspect KYC status, daily/monthly limit progress bars, Web Audio sound effects toggle, and 1-click demo state reset.

### 🎁 Payoo Plus Rewards
- **Welcome Bonus**: Claim ৳100 with promo code `PAYOO100`.
- **Merchant Vouchers**: 1-click copy for partner discount codes (`CAFE50`, `RIDE30`).

### 🎵 Modern Audio Feedback
- Synthesized, zero-dependency audio feedback using the Web Audio API for celebratory transaction chimes and soft interaction clicks (toggleable in profile settings).

---

## 🔑 Demo Access

| Field | Value |
| --- | --- |
| Mobile number | `00000000000` *(or any valid 11-digit `01XXXXXXXXX`)* |
| PIN | `0000` |
| Reward code | `PAYOO100` |

> **Pro Tip**: On the sign-in page, click the **Auto-fill** chip on the demo credential box to populate credentials in one click!

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
│   │   └── app.css           # Design tokens, responsive grid, modal & slip UI
│   ├── logo.png              # Brand identity mark
│   └── opt-1.png..opt-6.png  # Classic service icons
├── script/
│   └── app.js                # Core state engine, transactions, charts, audio, modals
├── index.html                # Sign-in portal with auto-fill & session detection
├── home.html                 # Comprehensive fintech super-app dashboard
└── readme.md                 # Documentation and architecture guide
```

---

## 💾 Local Data & Persistence

Wallet data is saved in browser `localStorage` under `payoo-wallet-v2`. You can:
- Clear transaction history using **Clear** in the Activity tab.
- Reset the entire wallet to factory demo state via **Account Profile → Reset Demo Data**.
