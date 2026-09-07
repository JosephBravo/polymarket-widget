import { NextResponse } from "next/server";
import { jsonError } from "@/modules/shared/adapters/inbound/http/json-error";
import { createContainer } from "@/composition/container";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;
    const { getMarketDetails } = createContainer();
    const details = await getMarketDetails.execute(slug);
    return NextResponse.json(details);
  } catch (error) {
    return jsonError(error);
  }
}
