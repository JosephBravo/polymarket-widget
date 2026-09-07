import { z } from "zod";

const limitPriceSchema = z
  .string()
  .trim()
  .regex(
    /^(0(\.\d{1,4})?|1(\.0{1,4})?)$/,
    "Limit price must be a number between 0 and 1 with up to 4 decimal places",
  );

export const searchQuerySchema = z.object({
  q: z.string().optional().default(""),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const betOrderBodySchema = z.object({
  marketSlug: z.string().min(1),
  outcome: z.enum(["YES", "NO"]),
  quantity: z.coerce.number().int().min(1),
  limitPrice: limitPriceSchema,
});

export const predictionBodySchema = z.object({
  prompt: z.string().min(3),
  query: z.string().optional(),
});
