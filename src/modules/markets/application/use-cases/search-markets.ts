import { ValidationError } from "@/modules/shared/domain/errors";
import type { Market } from "@/modules/markets/domain/market";
import type { MarketCatalog } from "@/modules/markets/application/ports/market-catalog";

export type SearchMarketsRequest = {
  query: string;
  limit?: number;
};

export class SearchMarkets {
  constructor(private readonly catalog: MarketCatalog) {}

  async execute(request: SearchMarketsRequest): Promise<readonly Market[]> {
    const query = request.query.trim();
    const limit = request.limit ?? 20;
    if (limit < 1 || limit > 50) {
      throw new ValidationError("Limit must be between 1 and 50");
    }
    return this.catalog.search(query, limit);
  }
}
