import { ValidationError } from "@/modules/shared/domain/errors";
import type { Market } from "@/modules/markets/domain/market";
import type { Recommendation } from "@/modules/recommendations/domain/recommendation";
import type { MarketCatalog } from "@/modules/markets/application/ports/market-catalog";
import type { PredictionAssistant } from "@/modules/recommendations/application/ports/prediction-assistant";

export type RecommendMarketRequest = {
  prompt: string;
  query?: string;
};

export type RecommendMarketResponse = {
  recommendation: Recommendation;
  candidates: readonly Market[];
};

export class RecommendMarket {
  constructor(
    private readonly catalog: MarketCatalog,
    private readonly assistant: PredictionAssistant,
  ) {}

  async execute(request: RecommendMarketRequest): Promise<RecommendMarketResponse> {
    const prompt = request.prompt.trim();
    if (prompt.length < 3) {
      throw new ValidationError("Prompt must be at least 3 characters");
    }

    const query = (request.query ?? prompt).trim();
    const candidates = await this.catalog.search(query, 8);
    if (candidates.length === 0) {
      throw new ValidationError("No markets found to recommend from. Try a different query.");
    }

    const recommendation = await this.assistant.recommend({ prompt, candidates });
    return { recommendation, candidates };
  }
}
