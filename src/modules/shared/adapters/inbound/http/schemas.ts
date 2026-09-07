import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().optional().default(""),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const betOrderBodySchema = z.object({
  marketSlug: z.string().min(1),
  outcome: z.enum(["YES", "NO"]),
  quantity: z.number().int().min(1),
  limitPrice: z.string().min(1),
});

export const predictionBodySchema = z.object({
  prompt: z.string().min(3),
  query: z.string().optional(),
});
