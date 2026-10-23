# Buy Me a Coffee — React + Vite + Tailwind CSS v4

## Start locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL printed by Vite.

## Configure the site

Edit `src/data/site.js` to update your creator profile, GitHub URL, email, and sample projects. You can also set environment variables in `.env`:

```env
VITE_CREATOR_NAME=Your Name
VITE_CREATOR_HANDLE=@yourhandle
VITE_CURRENCY=KES
VITE_PAYMENT_URL=
```

Restart `npm run dev` after changing `.env`.

## Connect real payments

`VITE_PAYMENT_URL` should point to a checkout page that you control or to a provider that explicitly supports your payment flow. The support form passes `amount`, `currency`, and optional `name` / `message` as URL query parameters. Confirm the provider's required format before using this approach.

**Security:** Vite exposes `VITE_*` variables in the browser bundle. Never put payment secret keys, API secrets, passwords, or private credentials in a `VITE_*` variable. For M-Pesa STK Push or any server-verified payment, create a backend endpoint, keep credentials on the server, and verify the provider's callback before showing a payment as successful. This starter does not process or verify payments by itself.

## Pages included

- `/` — Home
- `/support` — Support form with selectable amounts, validation, anonymous option, and message
- `/about` — Creator profile
- `/projects` — Project cards
- `*` — Friendly 404 page

## Build for production

```bash
npm run build
npm run preview
```

The project uses Tailwind CSS v4 through `@tailwindcss/vite` and imports Tailwind in `src/index.css`.
