import { describe, expect, it } from "vitest";
import { formatCompactUsd } from "@/modules/markets/domain/format-compact-usd";

describe("formatCompactUsd", () => {
  it("returns null for missing or invalid values", () => {
    expect(formatCompactUsd(undefined)).toBeNull();
    expect(formatCompactUsd(Number.NaN)).toBeNull();
    expect(formatCompactUsd(-1)).toBeNull();
  });

  it("formats whole dollars below one thousand", () => {
    expect(formatCompactUsd(0)).toBe("$0");
    expect(formatCompactUsd(800)).toBe("$800");
  });

  it("formats thousands with a trimmed K suffix", () => {
    expect(formatCompactUsd(1200)).toBe("$1.2K");
    expect(formatCompactUsd(1000)).toBe("$1K");
  });

  it("formats millions with a trimmed M suffix", () => {
    expect(formatCompactUsd(1_200_000)).toBe("$1.2M");
  });
});
