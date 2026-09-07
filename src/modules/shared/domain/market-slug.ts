import { ValidationError } from "./errors";

export type MarketSlug = string & { readonly brand: unique symbol };

const SLUG_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;

export function parseMarketSlug(value: string): MarketSlug {
  const slug = value.trim().toLowerCase();
  if (!slug || !SLUG_PATTERN.test(slug)) {
    throw new ValidationError("Market slug is invalid");
  }
  return slug as MarketSlug;
}
