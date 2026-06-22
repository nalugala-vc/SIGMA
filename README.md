<p align="center">
  <img src="public/icon.svg" alt="SIGMA" width="96" height="96" />
</p>

<h1 align="center">SIGMA</h1>

<p align="center">
  <strong>Trade Solana's wildest memecoins.</strong><br />
  <em>don't be mid</em>
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#getting-started">Getting Started</a> ·
  <a href="#environment-variables">Environment</a> ·
  <a href="#deployment">Deploy</a>
</p>

---

## About

**SIGMA** is a fomo.family-style Solana memecoin trading web app. Discover trending tokens, swap in one click with your wallet, track your portfolio, and explore live on-chain activity — all wrapped in a dark, luminous-pink interface.

Sign in with Phantom (or any Solana wallet), Google, or email. Privy provisions an embedded Solana wallet when needed, so anyone can get started without installing a browser extension.

**Brand colors**

| Token | Hex | Usage |
|-------|-----|-------|
| Sigma | `#f02bf2` | Primary accent, buttons, glow |
| Sigma Light | `#ff6bf9` | Hover states, highlights |
| Sigma Dark | `#c026d3` | Secondary accent |
| Background | `#000000` | App shell |

---

## Features

### Landing & auth
- Full-screen landing hero with themed Lottie animation
- Privy authentication: wallet, email, Google
- Embedded Solana wallet auto-created for users without one
- Sigma logo with **don't be mid** tagline and Σ favicon

### Trading dashboard
- **Trending tokens** — hot Solana memecoins from DexScreener (no API key)
- Name, symbol, price, and 24h change with links to `/token/[mint]`
- Wallet panel with SOL balance and deposit options

### Token detail page (`/token/[mint]`)
- Price chart via DexScreener embed
- **Buy / sell** via Jupiter Lite API + Privy wallet signing
- Trades logged to Supabase after each swap
- Tabbed activity view:
  - **Live trades** — pool trades from GeckoTerminal
  - **Holders** — top holders via Solana RPC (`getTokenLargestAccounts`)
  - **Recent activity** — your trade history for that token
- Trader info popup — click any trader address for stats and tier
- Copy mint address button (mint hidden by default)

### Profile (`/profile`)
- Trade history from Supabase
- Net worth chart with historical portfolio snapshots
- Avatar upload to Cloudflare R2
- Wallet summary and shortened address display

### Wallet funding
- **Deposit crypto** — QR code + manual transfer instructions
- **Buy with card** — Privy on-ramp (MoonPay) integration
- Deposit address support via Privy dashboard

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Auth & wallets | [Privy](https://privy.io) |
| Blockchain | Solana mainnet via Alchemy RPC |
| Swaps | [Jupiter Lite API](https://station.jup.ag/docs/apis/swap-api) |
| Database | [Supabase](https://supabase.com) (PostgreSQL) |
| Object storage | [Cloudflare R2](https://developers.cloudflare.com/r2/) |
| Market data | DexScreener, GeckoTerminal |
| Styling | Tailwind CSS 4 |
| Animation | Lottie (`lottie-react`) |

---

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Browser   │────▶│  Next.js API │────▶│    Supabase     │
│  (Privy UI) │     │    Routes    │     │ profiles/trades │
└──────┬──────┘     └──────┬───────┘     └─────────────────┘
       │                   │
       │ sign tx           ├──▶ Jupiter (quote + swap tx)
       ▼                   ├──▶ DexScreener (trending, prices)
┌─────────────┐            ├──▶ GeckoTerminal (live trades)
│   Solana    │            ├──▶ Alchemy RPC (balances, holders)
│  mainnet    │            └──▶ Cloudflare R2 (avatars)
└─────────────┘
```

**Swap flow**

1. User enters amount on token page → `POST /api/swap/prepare`
2. Server fetches Jupiter quote and builds unsigned transaction
3. Privy signs and sends transaction from user's wallet
4. Client logs trade → `POST /api/trades/log` → Supabase

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A [Privy](https://dashboard.privy.io) app (Solana mainnet)
- A [Supabase](https://supabase.com) project
- An [Alchemy](https://alchemy.com) Solana RPC URL (or another mainnet RPC)
- A [Cloudflare R2](https://developers.cloudflare.com/r2/) bucket (for avatars)
- A funded Solana wallet for testing swaps (SOL for fees + trade size)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd sigma
npm install
```

### 2. Environment variables

Create `.env.local` in the project root:

```bash
# Privy
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# Solana RPC (Alchemy recommended)
NEXT_PUBLIC_SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_SOLANA_RPC_WSS=wss://solana-mainnet.g.alchemy.com/v2/YOUR_KEY

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudflare R2 (avatar uploads)
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-public-r2-domain.com

# Optional: hosted Lottie JSON (defaults to /crypto-bitcoin.json)
NEXT_PUBLIC_LOTTIE_URL=
```

### 3. Database setup

Run the schema in Supabase **SQL Editor**:

```bash
# File: supabase/schema.sql
```

This creates `profiles`, `trades`, and `portfolio_snapshots` tables with indexes and RLS policies. API routes use the service role key server-side.

### 4. Privy dashboard

In [Privy Dashboard](https://dashboard.privy.io):

1. Create an app and copy `NEXT_PUBLIC_PRIVY_APP_ID`
2. Enable login methods: wallet, email, Google
3. Configure **Solana mainnet** embedded wallets
4. Under **Money movement → Onramps**, enable fiat on-ramps (MoonPay) and deposit address if you want card + crypto funding
5. Set appearance theme to `#000000` and accent to `#f02bf2` (also configured in code)

### 5. Cloudflare R2

1. Create a bucket for avatar uploads
2. Create API tokens with read/write access
3. Enable public access or bind a custom domain for `R2_PUBLIC_URL`
4. Avatars are stored at `avatars/{privyUserId}/{timestamp}.{ext}`

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run start   # production server
npm run lint    # ESLint
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_PRIVY_APP_ID` | Yes | Privy application ID |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Yes | Solana mainnet HTTP RPC |
| `NEXT_PUBLIC_SOLANA_RPC_WSS` | Yes | Solana mainnet WebSocket RPC |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role (server only) |
| `R2_ACCOUNT_ID` | Yes | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | Yes | R2 API access key |
| `R2_SECRET_ACCESS_KEY` | Yes | R2 API secret |
| `R2_BUCKET_NAME` | Yes | R2 bucket name |
| `R2_PUBLIC_URL` | Yes | Public base URL for uploaded files |
| `NEXT_PUBLIC_LOTTIE_URL` | No | Remote Lottie JSON URL (falls back to `/crypto-bitcoin.json`) |

> Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` / `R2_SECRET_ACCESS_KEY` to the client.

---

## Project Structure

```
sigma/
├── app/
│   ├── api/                  # API routes
│   │   ├── portfolio/        # Net worth + snapshots
│   │   ├── profile/          # User profile + avatar upload
│   │   ├── swap/prepare/     # Jupiter quote + tx build
│   │   ├── token/[mint]/     # Token data, holders, live trades, trader stats
│   │   ├── trades/           # Trade history + logging
│   │   └── trending/         # DexScreener trending pairs
│   ├── profile/              # Profile page
│   ├── token/[mint]/         # Token detail page
│   ├── page.tsx              # Landing (guest) / dashboard (auth)
│   └── providers.tsx         # Privy + Solana RPC config
├── components/               # UI components
├── hooks/                    # useUserProfile, useSyncUser
├── lib/                      # Jupiter, Solana, Supabase, R2, market data
├── public/                   # Static assets, icon.svg, Lottie JSON
└── supabase/schema.sql       # Database schema
```

---

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/trending` | GET | Trending Solana pairs from DexScreener |
| `/api/token/[mint]` | GET | Token metadata and market data |
| `/api/token/[mint]/holders` | GET | Top token holders (Solana RPC) |
| `/api/token/[mint]/live-trades` | GET | Recent pool trades (GeckoTerminal) |
| `/api/token/[mint]/trader` | GET | Trader stats for a wallet on a token |
| `/api/swap/prepare` | POST | Jupiter quote + unsigned swap transaction |
| `/api/trades` | GET | User trade history |
| `/api/trades/log` | POST | Log a completed swap |
| `/api/portfolio` | GET | Portfolio value + save snapshot |
| `/api/profile` | GET | User profile |
| `/api/profile/avatar` | POST | Upload avatar to R2 |
| `/api/sync-user` | POST | Upsert Privy user into Supabase |
| `/api/wallet/balance` | GET | Wallet SOL balance |

---

## Deployment

### Vercel (recommended)

1. Push the repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add all environment variables from the table above
4. Deploy

### Post-deploy checklist

- [ ] Privy allowed domains include your production URL
- [ ] Supabase schema has been applied
- [ ] R2 bucket is publicly readable at `R2_PUBLIC_URL`
- [ ] Test sign-in, deposit, buy, sell, and profile avatar upload
- [ ] Confirm MoonPay on-ramp works in production (sandbox off)

---

## Funding Your Wallet

Users need SOL for transaction fees and swaps.

1. **Deposit crypto** — open the wallet panel, scan the QR code, send SOL from Phantom or any exchange to the embedded wallet address
2. **Buy with card** — use Privy's MoonPay on-ramp (minimum amounts set by MoonPay)

Manual flow: scan QR → copy address → send SOL from an external wallet → wait for confirmation → balance updates on the dashboard.

---

## Security Notes

- Server-side API routes use `SUPABASE_SERVICE_ROLE_KEY` and never expose it to the browser
- Swap transactions are built server-side but signed client-side by the user's Privy wallet
- Avatar uploads are validated (type + 2MB max) before R2 upload
- RLS is enabled on Supabase tables; client access is restricted until Privy-verified policies are added

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |

---

<p align="center">
  <img src="public/icon.svg" alt="Σ" width="32" height="32" />
  <br />
  <strong>SIGMA</strong> · don't be mid
</p>
