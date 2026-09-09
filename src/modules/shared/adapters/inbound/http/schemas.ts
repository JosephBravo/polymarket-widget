import { z } from "zod";
import { PRICE_PATTERN } from "@/modules/shared/domain/price";

const limitPriceSchema = z
  .string()
  .trim()
  .regex(
    PRICE_PATTERN,
    "Limit price must be a number between 0 and 1 with up to 4 decimal places",
  );

export const searchQuerySchema = z.object({
  q: z.string().max(200).optional().default(""),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const betOrderBodySchema = z.object({
  marketSlug: z.string().min(1).max(128),
  outcome: z.enum(["YES", "NO"]),
  quantity: z.number({ error: "Quantity must be a number" }).int().min(1).max(10_000),
  limitPrice: limitPriceSchema,
});

export const predictionBodySchema = z.object({
  prompt: z.string().trim().min(3).max(2000),
  query: z.string().trim().max(200).optional(),
});
