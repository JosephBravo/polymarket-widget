import type { Market } from "@/modules/markets/domain/market";
import type { OrderBook } from "@/modules/markets/domain/order-book";
import type { Prediction } from "@/modules/predictions/domain/prediction";
import type { OrderPreview, PlacedOrder } from "@/modules/trading/application/ports/trading-gateway";
export type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

export type StatusResponse = {
  tradingConfigured: boolean;
  aiConfigured: boolean;
};

export type SearchResponse = { markets: Market[] };
export type MarketDetailsResponse = { market: Market; book: OrderBook };
export type PreviewResponse = { preview: OrderPreview };
export type PlaceResponse = { order: PlacedOrder };
export type PredictionResponse = {
  prediction: Prediction;
  candidates: Market[];
};

export async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await response.json()) as T & ApiErrorBody;
  if (!response.ok) {
    throw new Error(body.error?.message ?? "Request failed");
  }
  return body;
}
