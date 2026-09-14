import { Price } from "@/modules/shared/domain/price";

export function estimateMaxOrderCost(
  quantity: number,
  limitPrice: string,
): string | null {
  if (!Number.isInteger(quantity) || quantity < 1) {
    return null;
  }

  try {
    const price = Price.parse(limitPrice);
    const cost = quantity * Number(price.toDecimalString());
    return cost.toFixed(2);
  } catch {
    return null;
  }
}

export function computeSpread(
  bestBid: string | undefined,
  bestAsk: string | undefined,
): string | null {
  if (!bestBid || !bestAsk) {
    return null;
  }

  const spread = Number(bestAsk) - Number(bestBid);
  if (!Number.isFinite(spread) || spread < 0) {
    return null;
  }

  return spread.toFixed(4);
}
