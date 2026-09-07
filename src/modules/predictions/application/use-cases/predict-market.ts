import { ValidationError } from "@/modules/shared/domain/errors";
import type { Market } from "@/modules/markets/domain/market";
import type { Prediction } from "@/modules/predictions/domain/prediction";
import type { MarketCatalog } from "@/modules/markets/application/ports/market-catalog";
import type { PredictionAssistant } from "@/modules/predictions/application/ports/prediction-assistant";

export type PredictMarketRequest = {
  prompt: string;
  query?: string;
};

export type PredictMarketResponse = {
  prediction: Prediction;
  candidates: readonly Market[];
};

export class PredictMarket {
  constructor(
    private readonly catalog: MarketCatalog,
    private readonly assistant: PredictionAssistant,
  ) {}

  async execute(request: PredictMarketRequest): Promise<PredictMarketResponse> {
    const prompt = request.prompt.trim();
    if (prompt.length < 3) {
      throw new ValidationError("Prompt must be at least 3 characters");
    }

    const query = (request.query ?? prompt).trim();
    const candidates = await this.catalog.search(query, 8);
    if (candidates.length === 0) {
      throw new ValidationError("No markets found to predict from. Try a different query.");
    }

    const prediction = await this.assistant.predict({ prompt, candidates });
    return { prediction, candidates };
  }
}
