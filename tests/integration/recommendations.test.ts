import { afterEach, describe, expect, it } from "vitest";
import { POST as recommend } from "@/app/api/recommendations/route";
import { startMsw } from "./msw/server";
import { clearIntegrationEnv, setAnthropicEnv, setOpenAiEnv } from "./env";

startMsw();

describe("AI recommendation integration", () => {
  afterEach(() => {
    clearIntegrationEnv();
  });

  it("uses OpenAI when OPENAI_API_KEY is set", async () => {
    setOpenAiEnv();
    const response = await recommend(
      new Request("http://localhost/api/recommendations", {
        method: "POST",
        body: JSON.stringify({ prompt: "best bitcoin yes bet" }),
      }),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.recommendation.outcome).toBe("YES");
    expect(body.recommendation.marketSlug).toBe("btc-100k-2025");
    expect(body.recommendation.suggestedLimitPrice).toBe("0.55");
  });

  it("falls back to Anthropic when OpenAI is not configured", async () => {
    setAnthropicEnv();
    const response = await recommend(
      new Request("http://localhost/api/recommendations", {
        method: "POST",
        body: JSON.stringify({ prompt: "best bitcoin yes bet" }),
      }),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.recommendation.outcome).toBe("NO");
    expect(body.recommendation.suggestedLimitPrice).toBe("0.45");
  });

  it("fails clearly when no AI credentials are configured", async () => {
    const response = await recommend(
      new Request("http://localhost/api/recommendations", {
        method: "POST",
        body: JSON.stringify({ prompt: "best bitcoin yes bet" }),
      }),
    );
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe("AI_CREDENTIALS_MISSING");
  });
});
