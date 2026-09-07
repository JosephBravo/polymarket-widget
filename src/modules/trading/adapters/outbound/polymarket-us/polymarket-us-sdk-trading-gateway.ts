import { PolymarketUS } from "polymarket-us";
import { TradingCredentialsMissingError } from "@/modules/shared/domain/errors";
import { ExternalServiceError } from "@/modules/shared/domain/errors";
import type { Settings } from "@/modules/shared/application/settings";
import type { BetOrder } from "@/modules/trading/domain/order";
import type {
  OrderPreview,
  PlacedOrder,
  TradingGateway,
} from "@/modules/trading/application/ports/trading-gateway";

const SDK_INTENT = {
  BUY_LONG: "ORDER_INTENT_BUY_LONG",
  BUY_SHORT: "ORDER_INTENT_BUY_SHORT",
} as const;

export class PolymarketUsSdkTradingGateway implements TradingGateway {
  constructor(private readonly settings: Settings) {}

  async preview(order: BetOrder): Promise<OrderPreview> {
    const client = this.requireClient();
    try {
      const preview = await client.orders.preview({
        request: toCreateParams(order),
      });
      return {
        marketSlug: order.marketSlug,
        intent: order.intent,
        quantity: order.quantity,
        limitPrice: order.limitPrice.toDecimalString(),
        estimatedCost: preview.order.cashOrderQty?.value,
        state: preview.order.state,
      };
    } catch (error) {
      throw mapTradingError(error, "Failed to preview order");
    }
  }

  async place(order: BetOrder): Promise<PlacedOrder> {
    const client = this.requireClient();
    try {
      const created = await client.orders.create(toCreateParams(order));
      return {
        id: created.id,
        marketSlug: order.marketSlug,
        intent: order.intent,
        quantity: order.quantity,
        limitPrice: order.limitPrice.toDecimalString(),
        state: created.executions?.[0]?.order.state,
      };
    } catch (error) {
      throw mapTradingError(error, "Failed to place order");
    }
  }

  private requireClient(): PolymarketUS {
    if (!this.settings.hasTradingCredentials) {
      throw new TradingCredentialsMissingError();
    }
    return new PolymarketUS({
      keyId: this.settings.polymarketKeyId,
      secretKey: this.settings.polymarketSecretKey,
    });
  }
}

function toCreateParams(order: BetOrder) {
  return {
    marketSlug: order.marketSlug,
    intent: SDK_INTENT[order.intent],
    type: "ORDER_TYPE_LIMIT" as const,
    price: { value: order.limitPrice.toDecimalString(), currency: "USD" as const },
    quantity: order.quantity,
    tif: "TIME_IN_FORCE_GOOD_TILL_CANCEL" as const,
  };
}

function mapTradingError(error: unknown, fallback: string): Error {
  if (error instanceof TradingCredentialsMissingError) {
    return error;
  }
  const message = error instanceof Error ? error.message : fallback;
  return new ExternalServiceError(message);
}
