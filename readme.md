# Payoo

Payoo is a polished, responsive demo for a mobile financial-services wallet. It is a frontend-only learning project: no real authentication, payment processing, or sensitive financial data is involved.

## Highlights

- Responsive sign-in and wallet dashboard
- Add money, cash out, send money, pay bills, and redeem rewards
- Friendly validation and in-app success/error feedback
- Transaction activity and balance persisted in browser `localStorage`
- Accessible semantic forms, keyboard-friendly controls, and responsive layouts

## Demo access

| Field | Value |
| --- | --- |
| Mobile number | `00000000000` |
| PIN | `0000` |
| Reward code | `PAYOO100` |

## Run locally

This project has no build step. Open `index.html` in a browser, or serve the folder with any static web server.

```bash
npx serve .
```

## Project structure

```text
assets/
  css/app.css          # Design system and responsive UI
  logo.png             # Brand asset
script/
  app.js               # Auth, state, validation, transactions, rendering
index.html             # Sign-in screen
home.html              # Wallet dashboard
```

## Notes

- Wallet data is stored only in the current browser under `payoo-wallet`.
- Use the “Clear history” action to remove local transaction activity. To reset all demo data, remove the `payoo-wallet` local-storage key in browser developer tools.
- CDN-hosted fonts and icons need an internet connection; the core page remains usable without them.

## Screens

<img src="./ui/Login page.png" width="300" alt="Payoo login screen" />
<img src="./ui/Home Page.png" width="300" alt="Payoo home screen" />
