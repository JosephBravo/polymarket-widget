import { describe, expect, it } from "vitest";
import { jsonError } from "@/modules/shared/adapters/inbound/http/json-error";

describe("jsonError", () => {
  it("returns a generic message for unexpected errors", async () => {
    const response = jsonError(new Error("database connection string leaked"));
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error.code).toBe("INTERNAL_ERROR");
    expect(body.error.message).toBe("Unexpected error");
  });
});
