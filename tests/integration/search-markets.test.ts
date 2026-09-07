import { afterEach, describe, expect, it } from "vitest";
import { GET as searchMarkets } from "@/app/api/markets/search/route";
import { startMsw } from "./msw/server";
import { clearIntegrationEnv } from "./env";

startMsw();

describe("search markets integration", () => {
  afterEach(() => {
    clearIntegrationEnv();
  });

  it("returns flattened markets from Polymarket US search", async () => {
    const response = await searchMarkets(
      new Request("http://localhost/api/markets/search?q=bitcoin&limit=10"),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.markets).toEqual([
      expect.objectContaining({
        slug: "btc-100k-2025",
        title: "Will Bitcoin reach $100k?",
      }),
    ]);
  });

  it("lists active markets when the query is empty", async () => {
    const response = await searchMarkets(
      new Request("http://localhost/api/markets/search?q="),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.markets[0].slug).toBe("btc-100k-2025");
  });
});
