import { SeededRandom } from "./SeededRandom";

export class NormalDistribution {
  private readonly random: SeededRandom;
  private spare: number | undefined;

  public constructor(random: SeededRandom) {
    this.random = random;
  }

  public sample(mean = 0, standardDeviation = 1): number {
    if (!Number.isFinite(mean)) {
      throw new TypeError("Mean must be a finite number.");
    }

    if (!Number.isFinite(standardDeviation) || standardDeviation < 0) {
      throw new RangeError(
        "Standard deviation must be a finite non-negative number."
      );
    }

    if (standardDeviation === 0) {
      return mean;
    }

    if (this.spare !== undefined) {
      const value = this.spare;
      this.spare = undefined;
      return mean + value * standardDeviation;
    }

    let u: number;
    let v: number;
    let radiusSquared: number;

    do {
      u = this.random.next() * 2 - 1;
      v = this.random.next() * 2 - 1;
      radiusSquared = u * u + v * v;
    } while (radiusSquared === 0 || radiusSquared >= 1);

    const multiplier = Math.sqrt(
      (-2 * Math.log(radiusSquared)) / radiusSquared
    );

    this.spare = v * multiplier;
    return mean + u * multiplier * standardDeviation;
  }
}
