import { describe, expect, it, vi } from "vitest";
import { Price } from "@/modules/shared/domain/price";
import { parseMarketSlug } from "@/modules/shared/domain/market-slug";
import { loadSettings } from "@/modules/shared/application/settings";
import {
  OrderIntent,
  OutcomeSide,
  intentFromOutcome,
  parseQuantity,
} from "@/modules/trading/domain/order";
import { SearchMarkets } from "@/modules/markets/application/use-cases/search-markets";
import { RecommendMarket } from "@/modules/recommendations/application/use-cases/recommend-market";
import type { MarketCatalog } from "@/modules/markets/application/ports/market-catalog";
import type { Market } from "@/modules/markets/domain/market";

describe("domain", () => {
  it("parses market slugs and prices", () => {
    expect(parseMarketSlug("BTC-100k-2025")).toBe("btc-100k-2025");
    expect(Price.parse("0.55").toDecimalString()).toBe("0.55");
    expect(() => Price.parse("1.5")).toThrow();
    expect(parseQuantity(3)).toBe(3);
    expect(() => parseQuantity(0)).toThrow();
    expect(intentFromOutcome(OutcomeSide.YES)).toBe(OrderIntent.BUY_LONG);
    expect(intentFromOutcome(OutcomeSide.NO)).toBe(OrderIntent.BUY_SHORT);
  });

  it("loads settings from the environment without defaults", () => {
    delete process.env.POLYMARKET_KEY_ID;
    delete process.env.POLYMARKET_SECRET_KEY;
    const settings = loadSettings();
    expect(settings.polymarketKeyId).toBeUndefined();
    expect(settings.hasTradingCredentials).toBe(false);
  });
});

describe("search markets use case", () => {
  it("rejects an invalid limit", async () => {
    const catalog: MarketCatalog = {
      search: vi.fn(),
      getBySlug: vi.fn(),
      getBook: vi.fn(),
    };
    const useCase = new SearchMarkets(catalog);
    await expect(useCase.execute({ query: "btc", limit: 0 })).rejects.toThrow(
      "Limit must be between 1 and 50",
    );
    expect(catalog.search).not.toHaveBeenCalled();
  });
});

describe("recommend market use case", () => {
  it("asks the assistant using catalog candidates", async () => {
    const market: Market = {
      slug: parseMarketSlug("btc-100k-2025"),
      title: "Will Bitcoin reach $100k?",
      outcome: "Yes",
      active: true,
      closed: false,
    };
    const catalog: MarketCatalog = {
      search: vi.fn().mockResolvedValue([market]),
      getBySlug: vi.fn(),
      getBook: vi.fn(),
    };
    const assistant = {
      recommend: vi.fn().mockResolvedValue({
        marketSlug: market.slug,
        outcome: OutcomeSide.YES,
        confidence: 0.8,
        rationale: "Test",
        suggestedLimitPrice: "0.55",
      }),
    };
    const useCase = new RecommendMarket(catalog, assistant);
    const result = await useCase.execute({ prompt: "bitcoin upside" });
    expect(catalog.search).toHaveBeenCalledWith("bitcoin upside", 8);
    expect(result.recommendation.outcome).toBe("YES");
  });
});
