import type { MarketSlug } from "@/modules/shared/domain/market-slug";
import type { OutcomeSide } from "@/modules/shared/domain/outcome";

export type Prediction = {
  marketSlug: MarketSlug;
  outcome: OutcomeSide;
  confidence: number;
  rationale: string;
  suggestedLimitPrice: string;
};
