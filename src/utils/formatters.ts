const wholePoundsFormatter =
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  });

const percentageFormatter =
  new Intl.NumberFormat("en-GB", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });

export function formatCurrency(
  value: number
): string {
  return wholePoundsFormatter.format(value);
}

export function formatPercentage(
  value: number
): string {
  return percentageFormatter.format(value);
}

export function formatCompactCurrency(
  value: number
): string {
  const absoluteValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absoluteValue >= 1_000_000) {
    return `${sign}£${(
      absoluteValue / 1_000_000
    ).toFixed(1)}m`;
  }

  if (absoluteValue >= 1_000) {
    return `${sign}£${Math.round(
      absoluteValue / 1_000
    )}k`;
  }

  return formatCurrency(value);
}