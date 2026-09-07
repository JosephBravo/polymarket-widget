import { parseMarketSlug } from "@/modules/shared/domain/market-slug";
import { Price } from "@/modules/shared/domain/price";
import {
  type OutcomeSide,
  intentFromOutcome,
  parseQuantity,
  type BetOrder,
} from "@/modules/trading/domain/order";
import type {
  OrderPreview,
  TradingGateway,
} from "@/modules/trading/application/ports/trading-gateway";

export type PreviewOrderRequest = {
  marketSlug: string;
  outcome: OutcomeSide;
  quantity: number;
  limitPrice: string;
};

export class PreviewOrder {
  constructor(private readonly trading: TradingGateway) {}

  async execute(request: PreviewOrderRequest): Promise<OrderPreview> {
    return this.trading.preview(toBetOrder(request));
  }
}

export function toBetOrder(request: PreviewOrderRequest): BetOrder {
  return {
    marketSlug: parseMarketSlug(request.marketSlug),
    intent: intentFromOutcome(request.outcome),
    quantity: parseQuantity(request.quantity),
    limitPrice: Price.parse(request.limitPrice),
  };
}
