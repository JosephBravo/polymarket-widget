import { resetContainer } from "@/composition/container";

const SYNTHETIC_SECRET = Buffer.from(new Uint8Array(32).fill(1)).toString("base64");

export function clearIntegrationEnv() {
  delete process.env.POLYMARKET_KEY_ID;
  delete process.env.POLYMARKET_SECRET_KEY;
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  resetContainer();
}

export function setTradingEnv() {
  resetContainer();
  process.env.POLYMARKET_KEY_ID = "test-key-id";
  process.env.POLYMARKET_SECRET_KEY = SYNTHETIC_SECRET;
}

export function setOpenAiEnv() {
  resetContainer();
  process.env.OPENAI_API_KEY = "sk-test";
  delete process.env.ANTHROPIC_API_KEY;
}

export function setAnthropicEnv() {
  resetContainer();
  delete process.env.OPENAI_API_KEY;
  process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
}
