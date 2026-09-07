import { NextResponse } from "next/server";
import { ValidationError } from "@/modules/shared/domain/errors";
import { jsonError } from "@/modules/shared/adapters/inbound/http/json-error";
import { searchQuerySchema } from "@/modules/shared/adapters/inbound/http/schemas";
import { getContainer } from "@/composition/container";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const parsed = searchQuerySchema.safeParse({
      q: url.searchParams.get("q") ?? "",
      ...(limitParam ? { limit: limitParam } : {}),
    });
    if (!parsed.success) {
      throw new ValidationError("Invalid search parameters");
    }

    const { searchMarkets } = getContainer();
    const markets = await searchMarkets.execute({
      query: parsed.data.q,
      limit: parsed.data.limit,
    });
    return NextResponse.json({ markets });
  } catch (error) {
    return jsonError(error);
  }
}
