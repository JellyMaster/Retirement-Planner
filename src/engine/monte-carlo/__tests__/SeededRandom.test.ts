import { describe, expect, it } from "vitest";
import { SeededRandom } from "../SeededRandom";

describe("SeededRandom", () => {
  it("produces the same sequence for the same seed", () => {
    const first = new SeededRandom(12345);
    const second = new SeededRandom(12345);

    const firstValues = Array.from({ length: 10 }, () => first.next());
    const secondValues = Array.from({ length: 10 }, () => second.next());

    expect(firstValues).toEqual(secondValues);
  });

  it("returns values from zero inclusive to one exclusive", () => {
    const random = new SeededRandom(9876);

    for (let index = 0; index < 1_000; index += 1) {
      const value = random.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
