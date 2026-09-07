import type { Market } from "./market";
import type { OrderBook } from "./order-book";

export type MarketDetails = {
  market: Market;
  book: OrderBook;
};
