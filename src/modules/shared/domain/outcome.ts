export const OutcomeSide = {
  YES: "YES",
  NO: "NO",
} as const;

export type OutcomeSide = (typeof OutcomeSide)[keyof typeof OutcomeSide];
