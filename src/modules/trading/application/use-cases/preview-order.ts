import {
  betOrderFromRequest,
  type BetOrderRequest,
} from "@/modules/trading/domain/order";
import type {
  OrderPreview,
  TradingGateway,
} from "@/modules/trading/application/ports/trading-gateway";

export type PreviewOrderRequest = BetOrderRequest;

export class PreviewOrder {
  constructor(private readonly trading: TradingGateway) {}

  async execute(request: PreviewOrderRequest): Promise<OrderPreview> {
    return this.trading.preview(betOrderFromRequest(request));
  }
}
