# Polymarket Widget

Single-page widget for [Polymarket US](https://docs.polymarket.us/getting-started/quickstart): search markets, inspect the order book, place a YES/NO limit bet, and optionally ask an LLM to recommend a market and outcome.

This repository is the deliverable for a 48-hour challenge. The UI is a Next.js page. Domain rules, use cases, and outbound I/O follow a compact hexagonal layout inspired by a production payouts module (pure domain → application ports → adapters).

## What you can do

1. Search Polymarket US markets (or load active markets with an empty query).
2. Open a market and read bids/asks plus best bid/offer.
3. Preview and place a GTC limit order (`BUY_LONG` = YES, `BUY_SHORT` = NO).
4. Bonus: describe what you want to bet on; AI picks a candidate market, YES/NO, confidence, rationale, and a suggested limit price. The form is filled for you.

Public market data does not need credentials. Placing a bet needs Polymarket US API keys. AI assist needs an OpenAI or Anthropic key.

## Stack (only what the challenge needs)

| Choice | Why it is here |
|--------|----------------|
| **TypeScript** | Official `polymarket-us` SDK is typed; ports stay explicit. |
| **React** | Required for the widget UI. |
| **Next.js App Router** | One page plus route handlers so secrets never reach the browser. |
| **Tailwind CSS** | Responsive layout without a design system. |
| **Vitest + MSW** | Unit tests (mocked ports) and HTTP-contract integration tests. |

Not used: Python/FastAPI (the TypeScript SDK already covers search, book, preview, and orders), wallet/CLOB (that is the global Polymarket product), WebSockets, deposits, or KYC UI.

**APIs**

- Used: [Polymarket US](https://docs.polymarket.us/getting-started/quickstart) via [`polymarket-us`](https://docs.polymarket.us/api-reference/sdks/typescript/quickstart).
- Not used: [global Polymarket CLOB](https://docs.polymarket.com/getting-started/api) (wallet L1/L2 auth, different product).

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

Bounded contexts: `markets` (search + book), `trading` (preview + place), `recommendations` (AI).

## Credentials (environment variables only)

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

If trading keys are missing, search and AI still work; place/preview return `TRADING_CREDENTIALS_MISSING`. If both LLM keys are missing, recommendations return `AI_CREDENTIALS_MISSING`.

`GET /api/status` only returns booleans (`tradingConfigured`, `aiConfigured`). It never echoes secrets.

## VPN

Polymarket US may be geo-restricted. If public requests fail from your region, connect through a VPN and retry.

## Run locally

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

## Tests

- **Unit** (`tests/unit`): slug/price/quantity rules and use cases with mocked ports.
- **Integration** (`tests/integration`): one suite per integrated process, hitting route handlers while MSW stubs Polymarket US, OpenAI, and Anthropic:
  1. Search markets
  2. Load market + book
  3. Preview order
  4. Place order (success + missing credentials)
  5. AI recommendation (OpenAI path, Anthropic fallback, missing credentials)

CI never uses live keys. Trading success tests inject a synthetic 32-byte secret so the SDK can sign; MSW never forwards that request.

## HTTP surface

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/api/status` | none |
| `GET` | `/api/markets/search?q=&limit=` | none |
| `GET` | `/api/markets/[slug]` | none |
| `POST` | `/api/orders/preview` | Polymarket keys |
| `POST` | `/api/orders` | Polymarket keys |
| `POST` | `/api/recommendations` | OpenAI or Anthropic key |

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
