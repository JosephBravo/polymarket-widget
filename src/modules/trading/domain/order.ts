import type { MarketSlug } from "@/modules/shared/domain/market-slug";
import type { Price } from "@/modules/shared/domain/price";
import { ValidationError } from "@/modules/shared/domain/errors";
import { parseMarketSlug } from "@/modules/shared/domain/market-slug";
import { Price as PriceVo } from "@/modules/shared/domain/price";
import {
  OutcomeSide,
  type OutcomeSide as OutcomeSideType,
} from "@/modules/shared/domain/outcome";

export { OutcomeSide };

export const OrderIntent = {
  BUY_LONG: "BUY_LONG",
  BUY_SHORT: "BUY_SHORT",
} as const;

export type OrderIntent = (typeof OrderIntent)[keyof typeof OrderIntent];

export function intentFromOutcome(side: OutcomeSideType): OrderIntent {
  return side === OutcomeSide.YES ? OrderIntent.BUY_LONG : OrderIntent.BUY_SHORT;
}

export type BetOrder = {
  marketSlug: MarketSlug;
  intent: OrderIntent;
  quantity: number;
  limitPrice: Price;
};

export type BetOrderRequest = {
  marketSlug: string;
  outcome: OutcomeSideType;
  quantity: number;
  limitPrice: string;
};

export function parseQuantity(value: number): number {
  if (!Number.isInteger(value) || value < 1 || value > 10_000) {
    throw new ValidationError("Quantity must be a whole number between 1 and 10000");
  }
  return value;
}

export function betOrderFromRequest(request: BetOrderRequest): BetOrder {
  return {
    marketSlug: parseMarketSlug(request.marketSlug),
    intent: intentFromOutcome(request.outcome),
    quantity: parseQuantity(request.quantity),
    limitPrice: PriceVo.parse(request.limitPrice),
  };
}
