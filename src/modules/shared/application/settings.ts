export type Settings = {
  polymarketKeyId: string | undefined;
  polymarketSecretKey: string | undefined;
  openaiApiKey: string | undefined;
  anthropicApiKey: string | undefined;
  hasTradingCredentials: boolean;
  hasOpenAi: boolean;
  hasAnthropic: boolean;
};

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function loadSettings(): Settings {
  const polymarketKeyId = readEnv("POLYMARKET_KEY_ID");
  const polymarketSecretKey = readEnv("POLYMARKET_SECRET_KEY");
  const openaiApiKey = readEnv("OPENAI_API_KEY");
  const anthropicApiKey = readEnv("ANTHROPIC_API_KEY");

  return {
    polymarketKeyId,
    polymarketSecretKey,
    openaiApiKey,
    anthropicApiKey,
    hasTradingCredentials: Boolean(polymarketKeyId && polymarketSecretKey),
    hasOpenAi: Boolean(openaiApiKey),
    hasAnthropic: Boolean(anthropicApiKey),
  };
}
