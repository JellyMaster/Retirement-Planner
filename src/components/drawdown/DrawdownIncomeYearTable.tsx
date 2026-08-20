import { useMemo } from "react";

import type { DrawdownYear } from "../../engine/drawdown/models/DrawdownYear";
import { ExpandCollapseIndicator } from "../ui";
import { getDisplayYears, type MoneyDisplayMode } from "../../utils/drawdownDisplayValues";
import { formatCurrency } from "../../utils/formatters";

interface DrawdownIncomeYearTableProps {
  years: DrawdownYear[];
  inflationRate: number;
  displayMode: MoneyDisplayMode;
}

export function DrawdownIncomeYearTable({
  years,
  inflationRate,
  displayMode,
}: DrawdownIncomeYearTableProps) {
  const displayYears = useMemo(
    () => getDisplayYears(years, inflationRate, displayMode),
    [displayMode, inflationRate, years],
  );

  return (
    <details className="panel ui-disclosure drawdown-income-year-table">
      <summary className="ui-disclosure-trigger drawdown-income-year-table-summary">
        <div>
          <p className="panel-eyebrow">Detailed yearly breakdown</p>
          <strong>Inspect every year of retirement income</strong>
          <small>Open the full income and tax figures when you need the underlying detail.</small>
        </div>
        <ExpandCollapseIndicator />
      </summary>

      <div className="drawdown-income-year-table-content">
        <div className="table-scroll" tabIndex={0} aria-label="Detailed retirement income by year">
          <table className="projection-table drawdown-income-detail-table">
            <thead>
              <tr>
                <th scope="col">Age</th>
                <th scope="col">Private pension</th>
                <th scope="col">State Pension</th>
                <th scope="col">Gross income</th>
                <th scope="col">Tax</th>
                <th scope="col">Money to spend</th>
                <th scope="col">Target</th>
                <th scope="col">Shortfall</th>
              </tr>
            </thead>
            <tbody>
              {displayYears.map((year) => {
                const shortfall = year.incomeTargetMode === "net"
                  ? year.netIncomeShortfall
                  : year.incomeShortfall;
                return (
                  <tr key={year.year} className={shortfall > 0 ? "projection-row-warning" : undefined}>
                    <th scope="row" className="projection-sticky-age">
                      <span className="projection-age">{year.age}</span>
                      <small>{year.year}</small>
                    </th>
                    <td data-label="Private pension">{formatCurrency(year.pensionWithdrawal)}</td>
                    <td data-label="State Pension">{formatCurrency(year.statePensionIncome)}</td>
                    <td data-label="Gross income">{formatCurrency(year.grossIncome)}</td>
                    <td data-label="Tax">{formatCurrency(year.incomeTax)}</td>
                    <td data-label="Money to spend"><strong>{formatCurrency(year.netIncome)}</strong></td>
                    <td data-label="Target">{formatCurrency(year.desiredIncome)}</td>
                    <td data-label="Shortfall">{formatCurrency(shortfall)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="projection-table-footnote">
          Values are shown in {displayMode === "today" ? "today’s money" : "future money"}. Warning rows identify years where the selected income target is not fully met.
        </p>
      </div>
    </details>
  );
}
