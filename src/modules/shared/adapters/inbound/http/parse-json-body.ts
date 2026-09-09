import { ValidationError } from "@/modules/shared/domain/errors";

const MAX_BODY_BYTES = 16_384;

export async function parseJsonBody(request: Request): Promise<unknown> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) {
    throw new ValidationError("Request body too large");
  }

  try {
    return await request.json();
  } catch {
    throw new ValidationError("Request body must be valid JSON");
  }
}
