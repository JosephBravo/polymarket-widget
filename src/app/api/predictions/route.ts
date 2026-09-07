import { NextResponse } from "next/server";
import { ValidationError } from "@/modules/shared/domain/errors";
import { jsonError } from "@/modules/shared/adapters/inbound/http/json-error";
import { predictionBodySchema } from "@/modules/shared/adapters/inbound/http/schemas";
import { createContainer } from "@/composition/container";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = predictionBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid prediction payload");
    }

    const { predictMarket } = createContainer();
    const result = await predictMarket.execute(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
