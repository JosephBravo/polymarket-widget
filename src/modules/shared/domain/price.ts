import { ValidationError } from "./errors";

export const PRICE_PATTERN = /^(0(\.\d{1,4})?|1(\.0{1,4})?)$/;

export class Price {
  private constructor(readonly value: string) {}

  static parse(raw: string): Price {
    const value = raw.trim();
    if (!PRICE_PATTERN.test(value)) {
      throw new ValidationError(
        "Limit price must be a number between 0 and 1 with up to 4 decimal places",
      );
    }
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0 || numeric > 1) {
      throw new ValidationError("Limit price must be between 0 and 1");
    }
    return new Price(value);
  }

  toDecimalString(): string {
    return this.value;
  }
}
