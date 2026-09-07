# Polymarket Widget

Single-page widget for [Polymarket US](https://docs.polymarket.us/getting-started/quickstart): search markets, inspect the order book, place a YES/NO limit bet, and optionally ask an LLM to predict a market and outcome.

## What you can do

**Discover**

- 🔍 Search Polymarket US markets, or load active markets with an empty query
- 📊 Open a market and read bids, asks, and best bid/offer

**Trade**

- 📝 Preview a GTC limit order before you submit
- ✅ Place a YES (`BUY_LONG`) or NO (`BUY_SHORT`) bet

**Predict**

- 🤖 Describe what you want to bet on; AI picks a market, YES/NO, confidence, rationale, and a suggested limit price
- 🧩 The form is filled for you so you can preview or place the bet

Public market data does not need credentials. Placing a bet needs Polymarket US API keys. AI assist needs an OpenAI or Anthropic key.

## Stack

| Technology | Role |
|------------|------|
| **TypeScript** | Typed domain, ports, and the official `polymarket-us` SDK. |
| **React** | Widget UI. |
| **Next.js App Router** | Single page plus route handlers so secrets stay on the server. |
| **Tailwind CSS** | Responsive layout. |
| **Vitest + MSW** | Unit tests (mocked ports) and HTTP-contract integration tests. |
| **[Polymarket US](https://docs.polymarket.us/getting-started/quickstart)** | Market search, order book, preview, and place order via [`polymarket-us`](https://docs.polymarket.us/api-reference/sdks/typescript/quickstart). |
| **OpenAI / Anthropic** | AI market and outcome predictions (OpenAI first, Anthropic if OpenAI is unset). |

## Architecture

Dependency rule: **domain ← application ← adapters**. Route handlers and React components never call Polymarket or an LLM directly.

```text
Widget UI  →  Next.js route handlers  →  use cases  →  ports
                                              │
                    PolymarketUsSdk* adapters ┘
                    OpenAiOrAnthropic adapter ┘
```

| Layer | Location |
|-------|----------|
| Domain | `src/modules/*/domain` |
| Ports (gateways) | `src/modules/*/application/ports` |
| Use cases | `src/modules/*/application/use-cases` |
| Inbound HTTP | `src/app/api/**/route.ts` |
| Inbound UI | `src/modules/markets/adapters/inbound/ui` |
| Outbound | `src/modules/*/adapters/outbound` |
| Composition | `src/composition/container.ts` |

Bounded contexts: `markets` (search + book), `trading` (preview + place), `predictions` (AI).

## 🔐 Credentials

No API keys are hardcoded. Copy `.env.example` to `.env.local` and fill values locally. `.env*` files (except `.env.example`) are gitignored.

```bash
cp .env.example .env.local
```

```
POLYMARKET_KEY_ID=
POLYMARKET_SECRET_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

| Variable | Required for |
|----------|----------------|
| `POLYMARKET_KEY_ID` + `POLYMARKET_SECRET_KEY` | Preview and place bet |
| `OPENAI_API_KEY` | AI assist (preferred) |
| `ANTHROPIC_API_KEY` | AI assist if OpenAI is unset |

Create Polymarket US keys at [polymarket.us/developer](https://polymarket.us/developer) after identity verification in the US app. Keys are shown once.

If trading keys are missing, search and AI still work; place/preview return `TRADING_CREDENTIALS_MISSING`. If both LLM keys are missing, predictions return `AI_CREDENTIALS_MISSING`.

`GET /api/status` only returns booleans (`tradingConfigured`, `aiConfigured`). It never echoes secrets.

## 🛡️ VPN

Polymarket US may be geo-restricted. If public requests fail from your region, connect through a VPN and retry. The widget also shows a short VPN notice on load.

## ▶️ Run locally

Requires **Node.js 18+**.

```bash
npm install
cp .env.example .env.local   # then add keys if you want live trading / AI
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test          # unit + integration
npm run build     # production build
```

## 🧪 Tests

- **Unit** (`tests/unit`): slug/price/quantity rules and use cases with mocked ports.
- **Integration** (`tests/integration`): one suite per integrated process, hitting route handlers while MSW stubs Polymarket US, OpenAI, and Anthropic:
  1. Search markets
  2. Load market + book
  3. Preview order
  4. Place order (success + missing credentials)
  5. AI prediction (OpenAI path, Anthropic fallback, missing credentials)

Tests never use live keys. Trading success tests inject a synthetic 32-byte secret so the SDK can sign; MSW never forwards that request.

## HTTP surface

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/api/status` | none |
| `GET` | `/api/markets/search?q=&limit=` | none |
| `GET` | `/api/markets/[slug]` | none |
| `POST` | `/api/orders/preview` | Polymarket keys |
| `POST` | `/api/orders` | Polymarket keys |
| `POST` | `/api/predictions` | OpenAI or Anthropic key |

Place-bet body:

```json
{
  "marketSlug": "btc-100k-2025",
  "outcome": "YES",
  "quantity": 1,
  "limitPrice": "0.55"
}
```

`YES` maps to `ORDER_INTENT_BUY_LONG`. `NO` maps to `ORDER_INTENT_BUY_SHORT`. Orders are limit + good-till-cancel.

## License

Private challenge deliverable unless the repository owner states otherwise.
