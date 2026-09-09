import { afterEach, describe, expect, it } from "vitest";
import { POST as previewOrder } from "@/app/api/orders/preview/route";
import { POST as placeOrder } from "@/app/api/orders/route";
import { startMsw } from "./msw/server";
import { clearIntegrationEnv, setTradingEnv } from "./env";

startMsw();

const payload = {
  marketSlug: "btc-100k-2025",
  outcome: "YES",
  quantity: 2,
  limitPrice: "0.55",
};

describe("preview order integration", () => {
  afterEach(() => {
    clearIntegrationEnv();
  });

  it("previews a limit order when trading credentials are present", async () => {
    setTradingEnv();
    const response = await previewOrder(
      new Request("http://localhost/api/orders/preview", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.preview.estimatedCost).toBe("1.10");
    expect(body.preview.quantity).toBe(2);
  });

  it("fails clearly when trading credentials are missing", async () => {
    const response = await previewOrder(
      new Request("http://localhost/api/orders/preview", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe("TRADING_CREDENTIALS_MISSING");
  });
});

describe("place order integration", () => {
  afterEach(() => {
    clearIntegrationEnv();
  });

  it("places an order against Polymarket US", async () => {
    setTradingEnv();
    const response = await placeOrder(
      new Request("http://localhost/api/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.order.id).toBe("order-123");
  });

  it("fails clearly when trading credentials are missing", async () => {
    const response = await placeOrder(
      new Request("http://localhost/api/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    );
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe("TRADING_CREDENTIALS_MISSING");
  });
});
