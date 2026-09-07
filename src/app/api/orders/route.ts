import { NextResponse } from "next/server";
import { ValidationError } from "@/modules/shared/domain/errors";
import { jsonError } from "@/modules/shared/adapters/inbound/http/json-error";
import { betOrderBodySchema } from "@/modules/shared/adapters/inbound/http/schemas";
import { createContainer } from "@/composition/container";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = betOrderBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid order payload");
    }

    const { placeOrder } = createContainer();
    const order = await placeOrder.execute(parsed.data);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
