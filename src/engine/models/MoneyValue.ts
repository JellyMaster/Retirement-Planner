export interface MoneyValue {
  /**
   * Actual monetary value in future pounds.
   */
  nominal: number;

  /**
   * Purchasing power expressed in today's pounds.
   */
  real: number;
}