import { describe, expect, it } from "vitest";

import { MoneyValueFactory } from "./MoneyValueFactory";

describe("MoneyValueFactory", () => {
  describe("create", () => {
    it("creates nominal and inflation-adjusted real values", () => {
      const value = MoneyValueFactory.create(
        102000,
        1.02
      );

      expect(value.nominal)
        .toBe(102000);

      expect(value.real)
        .toBeCloseTo(100000, 2);
    });

    it("returns equal nominal and real values when the inflation factor is one", () => {
      const value = MoneyValueFactory.create(
        100000,
        1
      );

      expect(value)
        .toEqual({
          nominal: 100000,
          real: 100000,
        });
    });

    it("supports negative monetary values", () => {
      const value = MoneyValueFactory.create(
        -10200,
        1.02
      );

      expect(value.nominal)
        .toBe(-10200);

      expect(value.real)
        .toBeCloseTo(-10000, 2);
    });

    it("throws when the inflation factor is zero", () => {
      expect(() =>
        MoneyValueFactory.create(100000, 0)
      ).toThrow(RangeError);
    });

    it("throws when the inflation factor is negative", () => {
      expect(() =>
        MoneyValueFactory.create(100000, -1)
      ).toThrow(
        "Inflation factor must be greater than zero."
      );
    });
  });

  describe("empty", () => {
    it("creates an empty money value", () => {
      expect(MoneyValueFactory.empty())
        .toEqual({
          nominal: 0,
          real: 0,
        });
    });

    it("returns a new object each time", () => {
      const first = MoneyValueFactory.empty();
      const second = MoneyValueFactory.empty();

      expect(first)
        .not.toBe(second);
    });
  });
});