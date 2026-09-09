import { NextResponse } from "next/server";
import { AppError } from "@/modules/shared/domain/errors";

export function jsonError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.statusCode },
    );
  }

  console.error(error);
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Unexpected error" } },
    { status: 500 },
  );
}
