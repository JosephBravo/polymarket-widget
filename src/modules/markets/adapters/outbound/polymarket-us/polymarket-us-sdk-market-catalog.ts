import {
  NotFoundError as PolymarketNotFound,
  PolymarketUS,
  type Event,
  type Market as SdkMarket,
  type MarketBook,
  type MarketDetail,
} from "polymarket-us";
import { ExternalServiceError, NotFoundError } from "@/modules/shared/domain/errors";
import { parseMarketSlug, type MarketSlug } from "@/modules/shared/domain/market-slug";
import type { Market } from "@/modules/markets/domain/market";
import type { OrderBook } from "@/modules/markets/domain/order-book";
import type { MarketCatalog } from "@/modules/markets/application/ports/market-catalog";

export class PolymarketUsSdkMarketCatalog implements MarketCatalog {
  constructor(private readonly client: PolymarketUS) {}

  async search(query: string, limit = 20): Promise<readonly Market[]> {
    try {
      if (!query) {
        const listed = await this.client.markets.list({
          active: true,
          closed: false,
          limit,
        });
        return (listed.markets ?? []).map((market) => toMarket(market));
      }

      const results = await this.client.search.query({ query, limit });
      const matches = flattenSearch(results.events ?? []);
      if (matches.length > 0) {
        return matches.slice(0, limit);
      }

      const listed = await this.client.markets.list({
        active: true,
        closed: false,
        limit,
      });
      const needle = query.toLowerCase();
      return (listed.markets ?? [])
        .filter(
          (market) =>
            market.title.toLowerCase().includes(needle) ||
            market.slug.toLowerCase().includes(needle),
        )
        .map((market) => toMarket(market));
    } catch (error) {
      throw mapCatalogError(error, "Failed to search markets");
    }
  }

  async getBySlug(slug: MarketSlug): Promise<Market | null> {
    try {
      const response = await this.client.markets.retrieveBySlug(slug);
      if (!response.market) {
        return null;
      }
      return toMarket(response.market);
    } catch (error) {
      if (error instanceof PolymarketNotFound) {
        return null;
      }
      throw mapCatalogError(error, "Failed to load market");
    }
  }

  async getBook(slug: MarketSlug): Promise<OrderBook> {
    try {
      const [book, bbo] = await Promise.all([
        this.client.markets.book(slug),
        this.client.markets.bbo(slug).catch(() => undefined),
      ]);
      return toOrderBook(book, bbo?.bestBid?.value, bbo?.bestAsk?.value);
    } catch (error) {
      throw mapCatalogError(error, "Failed to load order book");
    }
  }
}

function flattenSearch(events: Event[]): Market[] {
  const markets: Market[] = [];
  for (const event of events) {
    for (const market of event.markets ?? []) {
      markets.push(toMarket(market, event.title));
    }
  }
  return markets;
}

function toMarket(raw: SdkMarket | MarketDetail, eventTitle?: string): Market {
  return {
    slug: parseMarketSlug(raw.slug),
    title: raw.title,
    outcome: raw.outcome,
    eventTitle,
    active: raw.active,
    closed: raw.closed,
    volume: raw.volume,
    liquidity: raw.liquidity,
  };
}

function toOrderBook(
  book: MarketBook,
  bestBid?: string,
  bestAsk?: string,
): OrderBook {
  return {
    marketSlug: book.marketSlug,
    bids: (book.bids ?? []).map((level) => ({
      price: level.px.value,
      size: level.qty,
    })),
    asks: (book.offers ?? []).map((level) => ({
      price: level.px.value,
      size: level.qty,
    })),
    bestBid,
    bestAsk,
  };
}

function mapCatalogError(error: unknown, fallback: string): Error {
  if (
    error instanceof NotFoundError ||
    error instanceof ExternalServiceError
  ) {
    return error;
  }
  const message = error instanceof Error ? error.message : fallback;
  return new ExternalServiceError(message);
}
