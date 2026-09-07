import type { BetOrder } from "@/modules/trading/domain/order";

export type OrderPreview = {
  marketSlug: string;
  intent: BetOrder["intent"];
  quantity: number;
  limitPrice: string;
  estimatedCost?: string;
  state?: string;
};

export type PlacedOrder = {
  id: string;
  marketSlug: string;
  intent: BetOrder["intent"];
  quantity: number;
  limitPrice: string;
  state?: string;
};

export interface TradingGateway {
  preview(order: BetOrder): Promise<OrderPreview>;
  place(order: BetOrder): Promise<PlacedOrder>;
}
