import { ValidationError } from "./errors";

export type MarketSlug = string & { readonly brand: unique symbol };

const SLUG_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
const MAX_SLUG_LENGTH = 128;

export function parseMarketSlug(value: string): MarketSlug {
  const slug = value.trim().toLowerCase();
  if (!slug || slug.length > MAX_SLUG_LENGTH || !SLUG_PATTERN.test(slug)) {
    throw new ValidationError("Market slug is invalid");
  }
  return slug as MarketSlug;
}
