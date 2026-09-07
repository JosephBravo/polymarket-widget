import type { MarketSlug } from "@/modules/shared/domain/market-slug";
import type { OutcomeSide } from "@/modules/trading/domain/order";

export type Recommendation = {
  marketSlug: MarketSlug;
  outcome: OutcomeSide;
  confidence: number;
  rationale: string;
  suggestedLimitPrice: string;
};
