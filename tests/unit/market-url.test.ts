import { describe, expect, it } from "vitest";
import {
  MARKET_QUERY_PARAM,
  buildMarketShareUrl,
} from "@/modules/markets/adapters/inbound/ui/market-url";

describe("buildMarketShareUrl", () => {
  it("builds a share URL with the market query param", () => {
    expect(buildMarketShareUrl("btc-100k-2025", "http://localhost:3000")).toBe(
      `http://localhost:3000/?${MARKET_QUERY_PARAM}=btc-100k-2025`,
    );
  });

  it("encodes special characters in the slug", () => {
    expect(buildMarketShareUrl("market/with spaces", "https://example.com")).toBe(
      `https://example.com/?${MARKET_QUERY_PARAM}=market%2Fwith%20spaces`,
    );
  });
});
