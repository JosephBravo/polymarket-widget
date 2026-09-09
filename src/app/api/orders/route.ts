import { NextResponse } from "next/server";
import { jsonError } from "@/modules/shared/adapters/inbound/http/json-error";
import { parseBetOrderBody } from "@/modules/shared/adapters/inbound/http/parse-bet-order-body";
import { getContainer } from "@/composition/container";

export async function POST(request: Request) {
  try {
    const body = await parseBetOrderBody(request);
    const { placeOrder } = getContainer();
    const order = await placeOrder.execute(body);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
