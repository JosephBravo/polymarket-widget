import type { PlacedOrder, TradingGateway } from "@/modules/trading/application/ports/trading-gateway";
import {
  betOrderFromRequest,
  type BetOrderRequest,
} from "@/modules/trading/domain/order";

export type PlaceOrderRequest = BetOrderRequest;

export class PlaceOrder {
  constructor(private readonly trading: TradingGateway) {}

  async execute(request: PlaceOrderRequest): Promise<PlacedOrder> {
    return this.trading.place(betOrderFromRequest(request));
  }
}
