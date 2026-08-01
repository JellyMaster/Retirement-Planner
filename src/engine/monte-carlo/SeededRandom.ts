export class SeededRandom {
  private state: number;

  public constructor(seed: number) {
    if (!Number.isFinite(seed)) {
      throw new TypeError("Seed must be a finite number.");
    }

    this.state = Math.trunc(seed) >>> 0;

    if (this.state === 0) {
      this.state = 0x6d2b79f5;
    }
  }

  public next(): number {
    let value = (this.state += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    this.state = value >>> 0;

    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  }
}
