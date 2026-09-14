import { describe, expect, it } from "vitest";
import {
  computeSpread,
  estimateMaxOrderCost,
} from "@/modules/trading/domain/order-estimate";

describe("estimateMaxOrderCost", () => {
  it("returns cost for valid quantity and price", () => {
    expect(estimateMaxOrderCost(10, "0.50")).toBe("5.00");
    expect(estimateMaxOrderCost(3, "0.3333")).toBe("1.00");
  });

  it("returns null for invalid quantity", () => {
    expect(estimateMaxOrderCost(0, "0.50")).toBeNull();
    expect(estimateMaxOrderCost(-1, "0.50")).toBeNull();
    expect(estimateMaxOrderCost(1.5, "0.50")).toBeNull();
  });

  it("returns null for invalid limit price", () => {
    expect(estimateMaxOrderCost(1, "1.5")).toBeNull();
    expect(estimateMaxOrderCost(1, "-0.1")).toBeNull();
    expect(estimateMaxOrderCost(1, "abc")).toBeNull();
  });
});

describe("computeSpread", () => {
  it("returns spread when bid and ask are valid", () => {
    expect(computeSpread("0.48", "0.52")).toBe("0.0400");
    expect(computeSpread("0.5", "0.5001")).toBe("0.0001");
  });

  it("returns null when bid or ask is missing", () => {
    expect(computeSpread(undefined, "0.52")).toBeNull();
    expect(computeSpread("0.48", undefined)).toBeNull();
  });

  it("returns null for negative spread", () => {
    expect(computeSpread("0.55", "0.50")).toBeNull();
  });
});
