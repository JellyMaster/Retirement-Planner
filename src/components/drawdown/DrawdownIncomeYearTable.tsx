import { useEffect, useMemo, useRef, useState } from "react";

import type { DrawdownYear } from "../../engine/drawdown/models/DrawdownYear";
import { getDisplayYears, type MoneyDisplayMode } from "../../utils/drawdownDisplayValues";
import { formatCurrency } from "../../utils/formatters";
import { ExpandCollapseIndicator } from "../ui";

interface DrawdownIncomeYearTableProps {
  years: DrawdownYear[];
  inflationRate: number;
  displayMode: MoneyDisplayMode;
  selectedAge: number;
}

export function DrawdownIncomeYearTable({
  years,
  inflationRate,
  displayMode,
  selectedAge,
}: DrawdownIncomeYearTableProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedRowRef = useRef<HTMLTableRowElement | null>(null);
  const displayYears = useMemo(
    () => getDisplayYears(years, inflationRate, displayMode),
    [displayMode, inflationRate, years],
  );

  useEffect(() => {
    if (!isOpen) return;
    const frame = window.requestAnimationFrame(() => {
      selectedRowRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen, selectedAge]);

  return (
    <details
      className="panel ui-disclosure drawdown-income-year-table"
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary className="ui-disclosure-trigger drawdown-income-year-table-summary">
        <div>
          <p className="panel-eyebrow">Detailed yearly breakdown</p>
          <strong>See every year of your retirement income</strong>
          <small>Open this section when you want to see the figures behind the income story above.</small>
        </div>
        <ExpandCollapseIndicator />
      </summary>

      <div className="drawdown-income-year-table-content">
        <div className="drawdown-income-table-selected-note" aria-live="polite">
          <span>Currently viewing</span>
          <strong>Age {selectedAge}</strong>
          <button
            type="button"
            className="ui-button ui-button-secondary ui-button-small"
            onClick={() => selectedRowRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" })}
          >
            Jump to this year
          </button>
        </div>

        <div className="table-scroll" tabIndex={0} aria-label="Detailed retirement income by year">
          <table className="projection-table drawdown-income-detail-table">
            <thead>
              <tr>
                <th scope="col">Age</th>
                <th scope="col">From your pension</th>
                <th scope="col">State Pension</th>
                <th scope="col">Total income before tax</th>
                <th scope="col">Tax</th>
                <th scope="col">Money to spend</th>
                <th scope="col">Your target</th>
                <th scope="col">Income below target</th>
              </tr>
            </thead>
            <tbody>
              {displayYears.map((year) => {
                const incomeBelowTarget = year.incomeTargetMode === "net"
                  ? year.netIncomeShortfall
                  : year.incomeShortfall;
                const isSelected = year.age === selectedAge;
                const classes = [
                  incomeBelowTarget > 0 ? "projection-row-warning" : "",
                  isSelected ? "is-selected-year" : "",
                ].filter(Boolean).join(" ");

                return (
                  <tr
                    key={year.year}
                    ref={isSelected ? selectedRowRef : undefined}
                    className={classes || undefined}
                    aria-current={isSelected ? "true" : undefined}
                  >
                    <th scope="row" className="projection-sticky-age">
                      <span className="projection-age">{year.age}</span>
                      <small>{year.year}</small>
                      {isSelected && <span className="drawdown-income-current-badge">Viewing</span>}
                    </th>
                    <td data-label="From your pension">{formatCurrency(year.pensionWithdrawal)}</td>
                    <td data-label="State Pension">{formatCurrency(year.statePensionIncome)}</td>
                    <td data-label="Total income before tax">{formatCurrency(year.grossIncome)}</td>
                    <td data-label="Tax">{formatCurrency(year.incomeTax)}</td>
                    <td data-label="Money to spend"><strong>{formatCurrency(year.netIncome)}</strong></td>
                    <td data-label="Your target">{formatCurrency(year.desiredIncome)}</td>
                    <td data-label="Income below target">{formatCurrency(incomeBelowTarget)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="projection-table-footnote">
          Values are shown in {displayMode === "today" ? "today’s money" : "future money"}. Highlighted warning rows show years when the plan provides less income than your target.
        </p>
      </div>
    </details>
  );
}
