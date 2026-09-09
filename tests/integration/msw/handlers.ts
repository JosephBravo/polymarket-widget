import { http, HttpResponse } from "msw";

export const sampleMarket = {
  id: 456,
  slug: "btc-100k-2025",
  title: "Will Bitcoin reach $100k?",
  outcome: "Yes",
  active: true,
  closed: false,
  volume: 1200,
  liquidity: 800,
};

export const sampleBook = {
  marketSlug: "btc-100k-2025",
  bids: [{ px: { value: "0.54", currency: "USD" }, qty: "10" }],
  offers: [{ px: { value: "0.56", currency: "USD" }, qty: "12" }],
  state: "MARKET_STATE_OPEN",
};

export const sampleBbo = {
  marketSlug: "btc-100k-2025",
  bestBid: { value: "0.54", currency: "USD" },
  bestAsk: { value: "0.56", currency: "USD" },
};

export const handlers = [
  http.get("https://gateway.polymarket.us/v1/search", ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get("query") ?? "";
    if (query === "100k") {
      return HttpResponse.json({ events: [] });
    }
    return HttpResponse.json({
      events: [
        {
          id: 123,
          slug: "bitcoin-price",
          title: "Bitcoin Price Markets",
          active: true,
          closed: false,
          archived: false,
          featured: false,
          markets: [sampleMarket],
        },
      ],
    });
  }),
  http.get("https://gateway.polymarket.us/v1/markets", () =>
    HttpResponse.json({ markets: [sampleMarket] }),
  ),
  http.get("https://gateway.polymarket.us/v1/market/slug/btc-100k-2025", () =>
    HttpResponse.json({ market: sampleMarket }),
  ),
  http.get("https://gateway.polymarket.us/v1/market/slug/unknown-market", () =>
    HttpResponse.json({ message: "not found" }, { status: 404 }),
  ),
  http.get("https://gateway.polymarket.us/v1/markets/btc-100k-2025/book", () =>
    HttpResponse.json(sampleBook),
  ),
  http.get("https://gateway.polymarket.us/v1/markets/btc-100k-2025/bbo", () =>
    HttpResponse.json(sampleBbo),
  ),
  http.post("https://api.polymarket.us/v1/order/preview", () =>
    HttpResponse.json({
      order: {
        id: "preview-1",
        marketSlug: "btc-100k-2025",
        side: "ORDER_SIDE_BUY",
        type: "ORDER_TYPE_LIMIT",
        price: { value: "0.55", currency: "USD" },
        quantity: 2,
        cumQuantity: 0,
        leavesQuantity: 2,
        tif: "TIME_IN_FORCE_GOOD_TILL_CANCEL",
        intent: "ORDER_INTENT_BUY_LONG",
        state: "ORDER_STATE_PENDING_NEW",
        cashOrderQty: { value: "1.10", currency: "USD" },
      },
    }),
  ),
  http.post("https://api.polymarket.us/v1/orders", () =>
    HttpResponse.json({
      id: "order-123",
      executions: [
        {
          id: "exec-1",
          type: "EXECUTION_TYPE_NEW",
          order: {
            id: "order-123",
            marketSlug: "btc-100k-2025",
            side: "ORDER_SIDE_BUY",
            type: "ORDER_TYPE_LIMIT",
            price: { value: "0.55", currency: "USD" },
            quantity: 2,
            cumQuantity: 0,
            leavesQuantity: 2,
            tif: "TIME_IN_FORCE_GOOD_TILL_CANCEL",
            intent: "ORDER_INTENT_BUY_LONG",
            state: "ORDER_STATE_PENDING_NEW",
          },
        },
      ],
    }),
  ),
  http.post("https://api.openai.com/v1/chat/completions", () =>
    HttpResponse.json({
      choices: [
        {
          message: {
            role: "assistant",
            content: JSON.stringify({
              marketSlug: "btc-100k-2025",
              outcome: "YES",
              confidence: 0.72,
              rationale: "Bitcoin momentum and listed liquidity support a YES position.",
              suggestedLimitPrice: "0.55",
            }),
          },
        },
      ],
    }),
  ),
  http.post("https://api.anthropic.com/v1/messages", () =>
    HttpResponse.json({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            marketSlug: "btc-100k-2025",
            outcome: "NO",
            confidence: 0.61,
            rationale: "The ask side looks expensive relative to recent range.",
            suggestedLimitPrice: "0.45",
          }),
        },
      ],
    }),
  ),
];
