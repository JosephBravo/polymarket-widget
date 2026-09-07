import type { Market } from "@/modules/markets/domain/market";
import type { Recommendation } from "@/modules/recommendations/domain/recommendation";

export type RecommendationContext = {
  prompt: string;
  candidates: readonly Market[];
};

export interface PredictionAssistant {
  recommend(context: RecommendationContext): Promise<Recommendation>;
}
