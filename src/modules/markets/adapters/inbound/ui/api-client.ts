import type { Market } from "@/modules/markets/domain/market";
import type { OrderBook } from "@/modules/markets/domain/order-book";
import type { Prediction } from "@/modules/predictions/domain/prediction";
import type { OrderPreview, PlacedOrder } from "@/modules/trading/application/ports/trading-gateway";

export type ApiErrorBody = {
  error?: { code?: string; message?: string };
};

export class ApiError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

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

  let body: T & ApiErrorBody;
  try {
    body = (await response.json()) as T & ApiErrorBody;
  } catch {
    throw new ApiError(
      response.ok ? "Invalid response from server" : `Request failed (${response.status})`,
    );
  }

  if (!response.ok) {
    throw new ApiError(body.error?.message ?? "Request failed", body.error?.code);
  }
  return body;
}

export function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.code === "TRADING_CREDENTIALS_MISSING") {
      return "Trading credentials missing. Set POLYMARKET_KEY_ID and POLYMARKET_SECRET_KEY in .env.";
    }
    if (err.code === "AI_CREDENTIALS_MISSING") {
      return "AI credentials missing. Set OPENAI_API_KEY or ANTHROPIC_API_KEY in .env.";
    }
    return err.message;
  }
  if (err instanceof TypeError && err.message === "Failed to fetch") {
    return "Network request failed. Connect to a VPN if Polymarket US is blocked in your region.";
  }
  return err instanceof Error ? err.message : "Request failed";
}
