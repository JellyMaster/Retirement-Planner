import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo, useState } from "react";

import type { DrawdownYear } from "../../engine/drawdown/models/DrawdownYear";
import { AppIcons } from "../../icons";
import {
  getDisplayYears,
  type MoneyDisplayMode,
} from "../../utils/drawdownDisplayValues";
import { formatCurrency, formatPercentage } from "../../utils/formatters";
import { ExpandCollapseIndicator } from "../ui";

type PageSize = 10 | 15 | 25 | 50 | "all";
const PAGE_SIZE_OPTIONS: PageSize[] = [10, 15, 25, 50, "all"];

interface DrawdownBalanceYearTableProps {
  years: DrawdownYear[];
  inflationRate: number;
  displayMode: MoneyDisplayMode;
  selectedAge: number;
}

export function DrawdownBalanceYearTable({
  years,
  inflationRate,
  displayMode,
  selectedAge,
}: DrawdownBalanceYearTableProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [currentPage, setCurrentPage] = useState(0);
  const displayYears = useMemo(
    () => getDisplayYears(years, inflationRate, displayMode),
    [displayMode, inflationRate, years],
  );

  const effectivePageSize = pageSize === "all" ? Math.max(displayYears.length, 1) : pageSize;
  const pageCount = Math.max(1, Math.ceil(displayYears.length / effectivePageSize));
  const safeCurrentPage = Math.min(currentPage, pageCount - 1);
  const startIndex = safeCurrentPage * effectivePageSize;
  const visibleYears = displayYears.slice(startIndex, startIndex + effectivePageSize);
  const selectedIndex = displayYears.findIndex((year) => year.age === selectedAge);
  const selectedPage = selectedIndex < 0 ? 0 : Math.floor(selectedIndex / effectivePageSize);
  const selectedAgeIsVisible = pageSize === "all" || selectedPage === safeCurrentPage;

  return (
    <details
      className="panel ui-disclosure drawdown-balance-year-table"
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary className="ui-disclosure-trigger drawdown-balance-year-table-summary">
        <div>
          <p className="panel-eyebrow">Balance by year</p>
          <strong>See how the pension changes each year</strong>
          <small>Open this section when you want to check the figures behind the balance story above.</small>
        </div>
        <ExpandCollapseIndicator />
      </summary>

      <div className="drawdown-balance-year-table-content">
        <div className="drawdown-balance-table-toolbar">
          <label className="drawdown-balance-page-size">
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={(event) => {
                const value = event.target.value;
                setPageSize(value === "all" ? "all" : Number(value) as Exclude<PageSize, "all">);
                setCurrentPage(0);
              }}
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option === "all" ? "All" : option}</option>
              ))}
            </select>
          </label>

          <div className="drawdown-balance-page-status" aria-live="polite">
            <span>
              {visibleYears.length
                ? `Ages ${visibleYears[0].age}–${visibleYears.at(-1)?.age}`
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

        <div className="table-scroll" tabIndex={0} aria-label="Pension balance by year">
          <table className="projection-table drawdown-balance-detail-table">
            <thead>
              <tr>
                <th scope="col">Age</th>
                <th scope="col">Started with</th>
                <th scope="col">Investment growth</th>
                <th scope="col">Taken from pension</th>
                <th scope="col">Fees</th>
                <th scope="col">Finished with</th>
                <th scope="col">Change</th>
              </tr>
            </thead>
            <tbody>
              {visibleYears.map((year) => {
                const isSelected = year.age === selectedAge;
                const change = year.closingBalance - year.openingBalance;
                const changeRate = year.openingBalance > 0
                  ? Math.abs(change) / year.openingBalance
                  : 0;

                return (
                  <tr key={year.year} className={isSelected ? "is-selected-year" : undefined} aria-current={isSelected ? "true" : undefined}>
                    <th scope="row" className="projection-sticky-age">
                      <span className="drawdown-balance-age-cell">
                        <span className="projection-age">{year.age}</span>
                        {isSelected && (
                          <span
                            className="drawdown-balance-current-indicator"
                            title="Currently selected year"
                            aria-label="Currently selected year"
                          >
                            <FontAwesomeIcon icon={AppIcons.eye} fixedWidth />
                          </span>
                        )}
                      </span>
                      <small>{year.year}</small>
                    </th>
                    <td data-label="Started with">{formatCurrency(year.openingBalance)}</td>
                    <td data-label="Investment growth">{formatCurrency(year.investmentGrowth)}</td>
                    <td data-label="Taken from pension">{formatCurrency(year.pensionWithdrawal)}</td>
                    <td data-label="Fees">{formatCurrency(year.fees)}</td>
                    <td data-label="Finished with"><strong>{formatCurrency(year.closingBalance)}</strong></td>
                    <td data-label="Change">
                      <span className={`drawdown-balance-change ${change >= 0 ? "is-positive" : "is-reducing"}`}>
                        <strong>{change >= 0 ? "+" : "−"}{formatCurrency(Math.abs(change))}</strong>
                        <small>{change >= 0 ? "↑" : "↓"} {formatPercentage(changeRate)}</small>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pageSize !== "all" && pageCount > 1 && (
          <nav className="drawdown-balance-pagination" aria-label="Balance table pages">
            <button type="button" className="ui-button ui-button-secondary ui-button-small" disabled={safeCurrentPage === 0} onClick={() => setCurrentPage(Math.max(0, safeCurrentPage - 1))}>Previous</button>
            <span>Page <strong>{safeCurrentPage + 1}</strong> of <strong>{pageCount}</strong></span>
            <button type="button" className="ui-button ui-button-secondary ui-button-small" disabled={safeCurrentPage >= pageCount - 1} onClick={() => setCurrentPage(Math.min(pageCount - 1, safeCurrentPage + 1))}>Next</button>
          </nav>
        )}

        <p className="projection-table-footnote">
          Values are shown in {displayMode === "today" ? "today’s money" : "future money"}. The eye marks the year currently selected in the balance explorer above. A lower ending balance is not automatically a warning; it can be part of using the pension as planned.
        </p>
      </div>
    </details>
  );
}
