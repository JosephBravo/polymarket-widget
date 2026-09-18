function compactAmount(value: number, divisor: number, suffix: string): string {
  const scaled = value / divisor;
  const formatted = scaled.toFixed(1).replace(/\.0$/, "");
  return `$${formatted}${suffix}`;
}

export function formatCompactUsd(value: number | undefined): string | null {
  if (value === undefined || !Number.isFinite(value) || value < 0) {
    return null;
  }

  if (value < 1000) {
    return `$${Math.round(value)}`;
  }

  if (value < 1_000_000) {
    return compactAmount(value, 1000, "K");
  }

  return compactAmount(value, 1_000_000, "M");
}
