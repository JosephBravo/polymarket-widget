import { NextResponse } from "next/server";
import { jsonError } from "@/modules/shared/adapters/inbound/http/json-error";
import { getContainer } from "@/composition/container";

export async function GET() {
  try {
    const { settings } = getContainer();
    return NextResponse.json({
      tradingConfigured: settings.hasTradingCredentials,
      aiConfigured: settings.hasOpenAi || settings.hasAnthropic,
    });
  } catch (error) {
    return jsonError(error);
  }
}
