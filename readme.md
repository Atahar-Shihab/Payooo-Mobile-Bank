# Payoo — Digital Wallet Experience

Payoo is a portfolio-grade, frontend-only digital wallet experience. It demonstrates how a financial product can feel calm, trustworthy, and useful through purposeful interface design, responsive layouts, and polished interaction states.

> This is a learning project. It does not connect to a bank or process real payments.

## Experience highlights

- A fully responsive fintech dashboard with desktop sidebar and mobile bottom navigation
- Secure demo sign-in, persistent wallet state, and balance privacy control
- Complete transaction flows for adding money, transfers, cash outs, bill payments, and rewards
- Validated inputs, friendly error messages, success receipts, and transaction history search
- Financial context: money-in/out totals, weekly activity visualization, a savings goal, contacts, and rewards
- Accessible structure: semantic controls, visible labels, keyboard-friendly dialogs, and live feedback

## Demo access

| Field | Value |
| --- | --- |
| Mobile number | `00000000000` |
| PIN | `0000` |
| Reward code | `PAYOO100` |

## Run locally

No build step is required. Open `index.html`, or serve the directory with a static server:

```bash
npx serve .
```

## GitHub Pages deployment

The included workflow deploys every push to `main` using GitHub Actions.

1. Open the repository’s **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push to `main` (or run the “Deploy static site to GitHub Pages” workflow manually).

For this repository, the dashboard’s direct URL is:

```text
https://atahar-shihab.github.io/Payooo-Mobile-Bank/home.html
```

`https://atahar-shihab.github.io/home.html` is a different GitHub Pages site, so it correctly returns 404.

## Project structure

```text
.github/workflows/
  deploy-pages.yml     # GitHub Pages deployment
assets/
  css/app.css          # Design system and responsive UI
  logo.png             # Existing brand asset
script/
  app.js               # Auth, state, modals, transactions, and rendering
index.html             # Sign-in experience
home.html              # Wallet application dashboard
```

## Local data

The browser stores demo state under `payoo-wallet-v2`. Use **Clear** in the activity feed to remove transactions, or delete that local-storage key in browser developer tools to reset the full demo state.
