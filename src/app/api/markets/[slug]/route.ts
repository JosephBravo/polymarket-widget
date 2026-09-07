import { NextResponse } from "next/server";
import { jsonError } from "@/modules/shared/adapters/inbound/http/json-error";
import { getContainer } from "@/composition/container";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const { getMarketDetails } = getContainer();
    const details = await getMarketDetails.execute(slug);
    return NextResponse.json(details);
  } catch (error) {
    return jsonError(error);
  }
}
