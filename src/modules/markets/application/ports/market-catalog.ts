import type { MarketSlug } from "@/modules/shared/domain/market-slug";
import type { Market } from "@/modules/markets/domain/market";
import type { OrderBook } from "@/modules/markets/domain/order-book";

export interface MarketCatalog {
  search(query: string, limit?: number): Promise<readonly Market[]>;
  getBySlug(slug: MarketSlug): Promise<Market | null>;
  getBook(slug: MarketSlug): Promise<OrderBook>;
}
