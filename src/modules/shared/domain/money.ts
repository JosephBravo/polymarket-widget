import { AppError } from "./errors";

const CENTS_PER_DOLLAR = BigInt(100);

export class Money {
  private constructor(readonly cents: bigint) {}

  static fromCents(cents: number | bigint): Money {
    if (typeof cents === "number") {
      if (!Number.isInteger(cents)) {
        throw new AppError("INVALID_MONEY", "Money cents must be an integer", 400);
      }
    }
    const value = typeof cents === "bigint" ? cents : BigInt(cents);
    if (value < BigInt(0)) {
      throw new AppError("INVALID_MONEY", "Money cannot be negative", 400);
    }
    return new Money(value);
  }

  static fromDecimalString(value: string): Money {
    const trimmed = value.trim();
    if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) {
      throw new AppError(
        "INVALID_MONEY",
        "Money must be a non-negative USD decimal string",
        400,
      );
    }
    const [dollars, fraction = ""] = trimmed.split(".");
    const cents = BigInt(dollars) * CENTS_PER_DOLLAR + BigInt(fraction.padEnd(2, "0"));
    return new Money(cents);
  }

  toDecimalString(): string {
    const dollars = this.cents / CENTS_PER_DOLLAR;
    const fraction = this.cents % CENTS_PER_DOLLAR;
    return `${dollars}.${fraction.toString().padStart(2, "0")}`;
  }
}
