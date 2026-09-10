import { Suspense } from "react";
import { MarketWidget } from "@/modules/markets/adapters/inbound/ui/market-widget";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Suspense
        fallback={
          <div className="p-8 text-sm text-zinc-500 dark:text-zinc-400">Loading…</div>
        }
      >
        <MarketWidget />
      </Suspense>
    </div>
  );
}
