import { ValidationError } from "@/modules/shared/domain/errors";
import type { BetOrderRequest } from "@/modules/trading/domain/order";
import { parseJsonBody } from "./parse-json-body";
import { betOrderBodySchema } from "./schemas";

export async function parseBetOrderBody(request: Request): Promise<BetOrderRequest> {
  const body = await parseJsonBody(request);
  const parsed = betOrderBodySchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Invalid order payload");
  }
  return parsed.data;
}
