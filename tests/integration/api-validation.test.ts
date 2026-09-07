import { afterEach, describe, expect, it } from "vitest";
import { GET as getStatus } from "@/app/api/status/route";
import { POST as placeOrder } from "@/app/api/orders/route";
import { startMsw } from "./msw/server";
import { clearIntegrationEnv, setOpenAiEnv, setTradingEnv } from "./env";

startMsw();

const validPayload = {
  marketSlug: "btc-100k-2025",
  outcome: "YES",
  quantity: 2,
  limitPrice: "0.55",
};

describe("API validation integration", () => {
  afterEach(() => {
    clearIntegrationEnv();
  });

  it("returns 400 for malformed JSON on POST /api/orders", async () => {
    const response = await placeOrder(
      new Request("http://localhost/api/orders", {
        method: "POST",
        body: "not-json",
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toContain("valid JSON");
  });

  it("returns 400 for an invalid limit price", async () => {
    setTradingEnv();
    const response = await placeOrder(
      new Request("http://localhost/api/orders", {
        method: "POST",
        body: JSON.stringify({ ...validPayload, limitPrice: "1.5" }),
      }),
    );
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("status integration", () => {
  afterEach(() => {
    clearIntegrationEnv();
  });

  it("returns credential booleans from GET /api/status", async () => {
    setTradingEnv();
    setOpenAiEnv();
    const response = await getStatus();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      tradingConfigured: true,
      aiConfigured: true,
    });
  });

  it("reports missing credentials when env vars are unset", async () => {
    const response = await getStatus();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({
      tradingConfigured: false,
      aiConfigured: false,
    });
  });
});
