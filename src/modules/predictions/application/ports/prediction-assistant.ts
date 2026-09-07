import type { Market } from "@/modules/markets/domain/market";
import type { Prediction } from "@/modules/predictions/domain/prediction";

export type PredictionContext = {
  prompt: string;
  candidates: readonly Market[];
};

export interface PredictionAssistant {
  predict(context: PredictionContext): Promise<Prediction>;
}
