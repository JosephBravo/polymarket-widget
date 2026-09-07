import { PolymarketUS } from "polymarket-us";
import { loadSettings } from "@/modules/shared/application/settings";
import { SearchMarkets } from "@/modules/markets/application/use-cases/search-markets";
import { GetMarketDetails } from "@/modules/markets/application/use-cases/get-market-details";
import { PreviewOrder } from "@/modules/trading/application/use-cases/preview-order";
import { PlaceOrder } from "@/modules/trading/application/use-cases/place-order";
import { PredictMarket } from "@/modules/predictions/application/use-cases/predict-market";
import { PolymarketUsSdkMarketCatalog } from "@/modules/markets/adapters/outbound/polymarket-us/polymarket-us-sdk-market-catalog";
import { PolymarketUsSdkTradingGateway } from "@/modules/trading/adapters/outbound/polymarket-us/polymarket-us-sdk-trading-gateway";
import { OpenAiOrAnthropicPredictionAssistant } from "@/modules/predictions/adapters/outbound/llm/open-ai-or-anthropic-prediction-assistant";

export function createContainer() {
  const settings = loadSettings();
  const publicClient = new PolymarketUS();
  const catalog = new PolymarketUsSdkMarketCatalog(publicClient);
  const trading = new PolymarketUsSdkTradingGateway(settings);
  const assistant = new OpenAiOrAnthropicPredictionAssistant(settings);

  return {
    settings,
    searchMarkets: new SearchMarkets(catalog),
    getMarketDetails: new GetMarketDetails(catalog),
    previewOrder: new PreviewOrder(trading),
    placeOrder: new PlaceOrder(trading),
    predictMarket: new PredictMarket(catalog, assistant),
  };
}

export type AppContainer = ReturnType<typeof createContainer>;
