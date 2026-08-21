import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo, useState } from "react";

import type { DrawdownYear } from "../../engine/drawdown/models/DrawdownYear";
import { AppIcons } from "../../icons";
import { getDisplayYears, type MoneyDisplayMode } from "../../utils/drawdownDisplayValues";
import { formatCurrency } from "../../utils/formatters";
import { ExpandCollapseIndicator } from "../ui";

interface DrawdownIncomeYearTableProps {
  years: DrawdownYear[];
  inflationRate: number;
  displayMode: MoneyDisplayMode;
  selectedAge: number;
}

type PageSize = 10 | 15 | 25 | 50 | "all";

const PAGE_SIZE_OPTIONS: PageSize[] = [10, 15, 25, 50, "all"];

export function DrawdownIncomeYearTable({
  years,
  inflationRate,
  displayMode,
  selectedAge,
}: DrawdownIncomeYearTableProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [currentPage, setCurrentPage] = useState(0);
  const displayYears = useMemo(
    () => getDisplayYears(years, inflationRate, displayMode),
    [displayMode, inflationRate, years],
  );

  const effectivePageSize = pageSize === "all"
    ? Math.max(displayYears.length, 1)
    : pageSize;
  const pageCount = Math.max(1, Math.ceil(displayYears.length / effectivePageSize));
  const safeCurrentPage = Math.min(currentPage, pageCount - 1);
  const startIndex = safeCurrentPage * effectivePageSize;
  const visibleYears = displayYears.slice(startIndex, startIndex + effectivePageSize);
  const selectedIndex = displayYears.findIndex((year) => year.age === selectedAge);
  const selectedPage = selectedIndex < 0
    ? 0
    : Math.floor(selectedIndex / effectivePageSize);
  const selectedAgeIsVisible = pageSize === "all" || selectedPage === safeCurrentPage;
  const firstVisibleAge = visibleYears[0]?.age;
  const lastVisibleAge = visibleYears.at(-1)?.age;

  const handlePageSizeChange = (nextPageSize: PageSize) => {
    setPageSize(nextPageSize);
    setCurrentPage(0);
  };

  return (
    <details
      className="panel ui-disclosure drawdown-income-year-table"
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary className="ui-disclosure-trigger drawdown-income-year-table-summary">
        <div>
          <p className="panel-eyebrow">Income by year</p>
          <strong>See how your retirement income changes each year</strong>
          <small>Open this section when you want to check the figures behind the income story above.</small>
        </div>
        <ExpandCollapseIndicator />
      </summary>

      <div className="drawdown-income-year-table-content">
        <div className="drawdown-income-table-toolbar">
          <label className="drawdown-income-page-size">
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={(event) => {
                const value = event.target.value;
                handlePageSizeChange(value === "all" ? "all" : Number(value) as Exclude<PageSize, "all">);
              }}
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All" : option}
                </option>
              ))}
            </select>
          </label>

          <div className="drawdown-income-page-status" aria-live="polite">
            <span className="drawdown-income-page-range">
              {firstVisibleAge !== undefined && lastVisibleAge !== undefined
                ? `Ages ${firstVisibleAge}–${lastVisibleAge}`
                : "No years to show"}
            </span>
            {!selectedAgeIsVisible && selectedIndex >= 0 && (
              <button
                type="button"
                className="ui-button ui-button-secondary ui-button-small"
                onClick={() => setCurrentPage(selectedPage)}
              >
                Show selected year
              </button>
            )}
          </div>
        </div>

        <div className="table-scroll" tabIndex={0} aria-label="Retirement income by year">
          <table className="projection-table drawdown-income-detail-table">
            <thead>
              <tr>
                <th scope="col">Age</th>
                <th scope="col">Money from your pension</th>
                <th scope="col">State Pension</th>
                <th scope="col">Income before tax</th>
                <th scope="col">Estimated tax</th>
                <th scope="col">Money available to spend</th>
                <th scope="col">Your planned income</th>
                <th scope="col">Below your plan by</th>
              </tr>
            </thead>
            <tbody>
              {visibleYears.map((year) => {
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
                    className={classes || undefined}
                    aria-current={isSelected ? "true" : undefined}
                  >
                    <th scope="row" className="projection-sticky-age">
                      <span className="drawdown-income-age-cell">
                        <span className="projection-age">{year.age}</span>
                        {isSelected && (
                          <span
                            className="drawdown-income-current-indicator"
                            title="Currently selected year"
                            aria-label="Currently selected year"
                          >
                            <FontAwesomeIcon icon={AppIcons.eye} fixedWidth />
                          </span>
                        )}
                      </span>
                      <small>{year.year}</small>
                    </th>
                    <td data-label="Money from your pension">{formatCurrency(year.pensionWithdrawal)}</td>
                    <td data-label="State Pension">{formatCurrency(year.statePensionIncome)}</td>
                    <td data-label="Income before tax">{formatCurrency(year.grossIncome)}</td>
                    <td data-label="Estimated tax">{formatCurrency(year.incomeTax)}</td>
                    <td data-label="Money available to spend"><strong>{formatCurrency(year.netIncome)}</strong></td>
                    <td data-label="Your planned income">{formatCurrency(year.desiredIncome)}</td>
                    <td data-label="Below your plan by">{formatCurrency(incomeBelowTarget)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pageSize !== "all" && pageCount > 1 && (
          <nav className="drawdown-income-pagination" aria-label="Income table pages">
            <button
              type="button"
              className="ui-button ui-button-secondary ui-button-small"
              disabled={safeCurrentPage === 0}
              onClick={() => setCurrentPage(Math.max(0, safeCurrentPage - 1))}
            >
              Previous
            </button>
            <span>
              Page <strong>{safeCurrentPage + 1}</strong> of <strong>{pageCount}</strong>
            </span>
            <button
              type="button"
              className="ui-button ui-button-secondary ui-button-small"
              disabled={safeCurrentPage >= pageCount - 1}
              onClick={() => setCurrentPage(Math.min(pageCount - 1, safeCurrentPage + 1))}
            >
              Next
            </button>
          </nav>
        )}

        <p className="projection-table-footnote">
          Values are shown in {displayMode === "today" ? "today’s money" : "future money"}. The eye marks the year selected in the income explorer above. Highlighted rows show years when the illustration provides less than your planned income.
        </p>
      </div>
    </details>
  );
}
