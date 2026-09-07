import { afterEach, describe, expect, it } from "vitest";
import { GET as getMarket } from "@/app/api/markets/[slug]/route";
import { startMsw } from "./msw/server";
import { clearIntegrationEnv } from "./env";

startMsw();

describe("load market details integration", () => {
  afterEach(() => {
    clearIntegrationEnv();
  });

  it("returns market metadata and the order book", async () => {
    const response = await getMarket(
      new Request("http://localhost/api/markets/btc-100k-2025"),
      { params: Promise.resolve({ slug: "btc-100k-2025" }) },
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.market.slug).toBe("btc-100k-2025");
    expect(body.book.bestBid).toBe("0.54");
    expect(body.book.bestAsk).toBe("0.56");
    expect(body.book.asks[0]).toEqual({ price: "0.56", size: "12" });
  });
});
