import { NextResponse } from "next/server";
import { createContainer } from "@/composition/container";

export async function GET() {
  const { settings } = createContainer();
  return NextResponse.json({
    tradingConfigured: settings.hasTradingCredentials,
    aiConfigured: settings.hasOpenAi || settings.hasAnthropic,
  });
}
