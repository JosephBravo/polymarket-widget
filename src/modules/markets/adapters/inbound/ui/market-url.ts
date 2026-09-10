export const MARKET_QUERY_PARAM = "market";

export function buildMarketShareUrl(slug: string, origin = ""): string {
  const base = origin || "";
  return `${base}/?${MARKET_QUERY_PARAM}=${encodeURIComponent(slug)}`;
}
