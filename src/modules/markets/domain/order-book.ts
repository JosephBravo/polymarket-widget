export type OrderBookLevel = {
  price: string;
  size: string;
};

export type OrderBook = {
  marketSlug: string;
  bids: readonly OrderBookLevel[];
  asks: readonly OrderBookLevel[];
  bestBid?: string;
  bestAsk?: string;
};
