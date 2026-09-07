import { NotFoundError } from "@/modules/shared/domain/errors";
import { parseMarketSlug } from "@/modules/shared/domain/market-slug";
import type { MarketDetails } from "@/modules/markets/domain/market-details";
import type { MarketCatalog } from "@/modules/markets/application/ports/market-catalog";

export class GetMarketDetails {
  constructor(private readonly catalog: MarketCatalog) {}

  async execute(rawSlug: string): Promise<MarketDetails> {
    const slug = parseMarketSlug(rawSlug);
    const market = await this.catalog.getBySlug(slug);
    if (!market) {
      throw new NotFoundError(`Market not found: ${slug}`);
    }
    const book = await this.catalog.getBook(slug);
    return { market, book };
  }
}
