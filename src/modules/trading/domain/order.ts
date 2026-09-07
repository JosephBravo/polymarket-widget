import type { MarketSlug } from "@/modules/shared/domain/market-slug";
import type { Price } from "@/modules/shared/domain/price";
import { ValidationError } from "@/modules/shared/domain/errors";

export const OrderIntent = {
  BUY_LONG: "BUY_LONG",
  BUY_SHORT: "BUY_SHORT",
} as const;

export type OrderIntent = (typeof OrderIntent)[keyof typeof OrderIntent];

export const OutcomeSide = {
  YES: "YES",
  NO: "NO",
} as const;

export type OutcomeSide = (typeof OutcomeSide)[keyof typeof OutcomeSide];

export function intentFromOutcome(side: OutcomeSide): OrderIntent {
  return side === OutcomeSide.YES ? OrderIntent.BUY_LONG : OrderIntent.BUY_SHORT;
}

export function outcomeFromIntent(intent: OrderIntent): OutcomeSide {
  return intent === OrderIntent.BUY_LONG ? OutcomeSide.YES : OutcomeSide.NO;
}

export type BetOrder = {
  marketSlug: MarketSlug;
  intent: OrderIntent;
  quantity: number;
  limitPrice: Price;
};

export function parseQuantity(value: number): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new ValidationError("Quantity must be a whole number of at least 1");
  }
  return value;
}
