import type { PlacedOrder, TradingGateway } from "@/modules/trading/application/ports/trading-gateway";
import {
  toBetOrder,
  type PreviewOrderRequest,
} from "@/modules/trading/application/use-cases/preview-order";

export type PlaceOrderRequest = PreviewOrderRequest;

export class PlaceOrder {
  constructor(private readonly trading: TradingGateway) {}

  async execute(request: PlaceOrderRequest): Promise<PlacedOrder> {
    return this.trading.place(toBetOrder(request));
  }
}
