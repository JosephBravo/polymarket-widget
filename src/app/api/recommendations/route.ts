import { NextResponse } from "next/server";
import { ValidationError } from "@/modules/shared/domain/errors";
import { jsonError } from "@/modules/shared/adapters/inbound/http/json-error";
import { recommendationBodySchema } from "@/modules/shared/adapters/inbound/http/schemas";
import { createContainer } from "@/composition/container";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = recommendationBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid recommendation payload");
    }

    const { recommendMarket } = createContainer();
    const result = await recommendMarket.execute(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
