import { MarketWidget } from "@/modules/markets/adapters/inbound/ui/market-widget";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <MarketWidget />
    </div>
  );
}
