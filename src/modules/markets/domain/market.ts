import type { MarketSlug } from "@/modules/shared/domain/market-slug";

export type Market = {
  slug: MarketSlug;
  title: string;
  outcome: string;
  eventTitle?: string;
  active: boolean;
  closed: boolean;
  volume?: number;
  liquidity?: number;
};
