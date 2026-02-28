import { describe, it, expect } from "vitest";
import {
  formatAction,
  formatSide,
  formatPrice,
  formatQuantity,
} from "@/lib/transaction-formatters";

describe("formatAction", () => {
  it('maps 1 to "Add"', () => {
    expect(formatAction(1)).toBe("Add");
  });

  it('maps 2 to "Update"', () => {
    expect(formatAction(2)).toBe("Update");
  });

  it('maps 4 to "Remove"', () => {
    expect(formatAction(4)).toBe("Remove");
  });

  it("returns the number as string for unknown action", () => {
    expect(formatAction(99)).toBe("99");
  });

  it("returns the number as string for 0", () => {
    expect(formatAction(0)).toBe("0");
  });
});

describe("formatSide", () => {
  it('maps 1 to "Buy"', () => {
    expect(formatSide(1)).toBe("Buy");
  });

  it('maps 2 to "Sell"', () => {
    expect(formatSide(2)).toBe("Sell");
  });

  it('returns "Unknown" for unmapped side', () => {
    expect(formatSide(99)).toBe("Unknown");
  });

  it('returns "Unknown" for 0', () => {
    expect(formatSide(0)).toBe("Unknown");
  });
});

describe("formatPrice", () => {
  it("formats an integer price as USD with 2 decimal places", () => {
    expect(formatPrice(95000)).toBe("$95,000.00");
  });

  it("formats a decimal price with 2 decimal places", () => {
    expect(formatPrice(1.5)).toBe("$1.50");
  });

  it("rounds to 2 decimal places", () => {
    expect(formatPrice(1.999)).toBe("$2.00");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });

  it("formats a large number with thousands separator", () => {
    expect(formatPrice(1000000)).toBe("$1,000,000.00");
  });
});

describe("formatQuantity", () => {
  it("formats with exactly 6 decimal places", () => {
    expect(formatQuantity(1)).toBe("1.000000");
  });

  it("rounds to 6 decimal places", () => {
    expect(formatQuantity(1.23456789)).toBe("1.234568");
  });

  it("formats zero with 6 decimal places", () => {
    expect(formatQuantity(0)).toBe("0.000000");
  });

  it("pads short decimals with zeros", () => {
    expect(formatQuantity(0.5)).toBe("0.500000");
  });

  it("handles very small values", () => {
    expect(formatQuantity(0.000001)).toBe("0.000001");
  });
});
