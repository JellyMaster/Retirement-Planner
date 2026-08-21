import { useMemo, useState } from "react";

import type { DrawdownYear } from "../../engine/drawdown/models/DrawdownYear";
import { getDisplayYears, type MoneyDisplayMode } from "../../utils/drawdownDisplayValues";
import { formatCurrency, formatPercentage } from "../../utils/formatters";
import { ExpandCollapseIndicator } from "../ui";

interface DrawdownProjectionTableProps {
  years: DrawdownYear[];
  inflationRate: number;
  displayMode: MoneyDisplayMode;
}

type TableView = "simplified" | "detailed";
type RowFrequency = "annual" | "five-year" | "key-years";
type PageSize = 10 | 15 | 25 | 50 | "all";

const PAGE_SIZE_OPTIONS: PageSize[] = [10, 15, 25, 50, "all"];

function getImportantAges(years: DrawdownYear[]) {
  const ages = new Set<number>();
  if (years.length === 0) return ages;

  ages.add(years[0].age);
  ages.add(years.at(-1)!.age);

  const statePensionStart = years.find(
    (year, index) =>
      year.statePensionIncome > 0 &&
      (index === 0 || years[index - 1].statePensionIncome <= 0),
  );
  const firstShortfall = years.find(
    (year) => year.netIncomeShortfall > 0 || year.incomeShortfall > 0,
  );
  const firstDepletion = years.find(
    (year) => year.isDepleted || year.closingBalance <= 0,
  );

  if (statePensionStart) ages.add(statePensionStart.age);
  if (firstShortfall) ages.add(firstShortfall.age);
  if (firstDepletion) ages.add(firstDepletion.age);

  return ages;
}

function filterRows(years: DrawdownYear[], frequency: RowFrequency) {
  if (frequency === "annual") return years;

  const importantAges = getImportantAges(years);
  return years.filter((year, index) => {
    if (importantAges.has(year.age)) return true;
    if (frequency === "five-year") return index % 5 === 0;
    return year.age % 5 === 0;
  });
}

function getRowClass(year: DrawdownYear, years: DrawdownYear[]) {
  const classes: string[] = [];
  const index = years.findIndex((entry) => entry.year === year.year);
  const previous = index > 0 ? years[index - 1] : undefined;

  if (year.netIncomeShortfall > 0 || year.incomeShortfall > 0) {
    classes.push("projection-row-warning");
  }
  if (
    year.statePensionIncome > 0 &&
    (!previous || previous.statePensionIncome <= 0)
  ) {
    classes.push("projection-row-state-pension");
  }
  if (
    (year.isDepleted || year.closingBalance <= 0) &&
    (!previous || (!previous.isDepleted && previous.closingBalance > 0))
  ) {
    classes.push("projection-row-depleted");
  }
  if (index === years.length - 1) classes.push("projection-row-final");

  return classes.join(" ") || undefined;
}

export function DrawdownProjectionTable({
  years,
  inflationRate,
  displayMode,
}: DrawdownProjectionTableProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tableView, setTableView] = useState<TableView>("simplified");
  const [rowFrequency, setRowFrequency] = useState<RowFrequency>("annual");
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [currentPage, setCurrentPage] = useState(0);
  const displayYears = useMemo(
    () => getDisplayYears(years, inflationRate, displayMode),
    [years, inflationRate, displayMode],
  );
  const filteredYears = useMemo(
    () => filterRows(displayYears, rowFrequency),
    [displayYears, rowFrequency],
  );
  const effectivePageSize =
    pageSize === "all" ? Math.max(filteredYears.length, 1) : pageSize;
  const pageCount = Math.max(1, Math.ceil(filteredYears.length / effectivePageSize));
  const safeCurrentPage = Math.min(currentPage, pageCount - 1);
  const startIndex = safeCurrentPage * effectivePageSize;
  const visibleYears = filteredYears.slice(
    startIndex,
    startIndex + effectivePageSize,
  );
  const firstVisibleAge = visibleYears[0]?.age;
  const lastVisibleAge = visibleYears.at(-1)?.age;

  if (years.length === 0) {
    return (
      <section className="panel projection-table-panel">
        <div className="panel-heading">
          <h2>Your retirement journey</h2>
          <p>There are no retirement years to show for the current plan.</p>
        </div>
      </section>
    );
  }

  return (
    <details
      className="panel ui-disclosure drawdown-projection-table-panel drawdown-journey-year-table"
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary className="ui-disclosure-trigger drawdown-journey-year-table-summary">
        <div>
          <p className="panel-eyebrow">Retirement by year</p>
          <strong>See how your retirement changes each year</strong>
          <small>
            Open this section when you want to inspect the figures behind the journey above.
          </small>
        </div>
        <ExpandCollapseIndicator />
      </summary>

      <div className="drawdown-journey-year-table-content">
        <div className="drawdown-journey-table-intro">
          <strong>Choose the level of detail you need</strong>
          <p>
            Start with the plain-English view, or switch to Detailed when you want the full calculation. Values are shown in {displayMode === "today" ? "today's money" : "future money"}.
          </p>
        </div>

        <div className="projection-table-controls drawdown-journey-table-controls" aria-label="Retirement journey table options">
          <div className="projection-control-group">
            <span className="projection-control-label">Table detail</span>
            <div className="projection-segmented-control" role="group" aria-label="Table detail">
              <button
                type="button"
                className={tableView === "simplified" ? "is-active" : undefined}
                aria-pressed={tableView === "simplified"}
                onClick={() => setTableView("simplified")}
              >
                Plain English
              </button>
              <button
                type="button"
                className={tableView === "detailed" ? "is-active" : undefined}
                aria-pressed={tableView === "detailed"}
                onClick={() => setTableView("detailed")}
              >
                Detailed
              </button>
            </div>
          </div>

          <label className="projection-control-group projection-row-filter">
            <span className="projection-control-label">Years shown</span>
            <select
              value={rowFrequency}
              onChange={(event) => {
                setRowFrequency(event.target.value as RowFrequency);
                setCurrentPage(0);
              }}
            >
              <option value="annual">Every year</option>
              <option value="five-year">Every 5 years</option>
              <option value="key-years">Key years</option>
            </select>
          </label>

          <label className="projection-control-group projection-row-filter">
            <span className="projection-control-label">Rows per page</span>
            <select
              value={pageSize}
              onChange={(event) => {
                const value = event.target.value;
                setPageSize(
                  value === "all"
                    ? "all"
                    : (Number(value) as Exclude<PageSize, "all">),
                );
                setCurrentPage(0);
              }}
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All" : option}
                </option>
              ))}
            </select>
          </label>

          <div className="drawdown-journey-page-status" aria-live="polite">
            {firstVisibleAge !== undefined && lastVisibleAge !== undefined
              ? `Ages ${firstVisibleAge}–${lastVisibleAge}`
              : "No years to show"}
          </div>
        </div>

        <div className="projection-table-legend" aria-label="Important retirement journey years">
          <span><i className="legend-dot legend-dot-state" /> State Pension begins</span>
          <span><i className="legend-dot legend-dot-warning" /> Planned income no longer fully met</span>
          <span><i className="legend-dot legend-dot-depleted" /> Private pension fully used</span>
        </div>

        <div
          className="table-scroll drawdown-table-scroll"
          tabIndex={0}
          aria-label={`${tableView} retirement journey table`}
        >
          {tableView === "simplified" ? (
            <table className="projection-table drawdown-projection-table projection-table-simplified">
              <thead>
                <tr>
                  <th scope="col">Age</th>
                  <th scope="col">Started with</th>
                  <th scope="col">Money from your pension</th>
                  <th scope="col">State Pension</th>
                  <th scope="col">Estimated tax</th>
                  <th scope="col">Money available to spend</th>
                  <th scope="col">Money left in your pension</th>
                </tr>
              </thead>
              <tbody>
                {visibleYears.map((year) => (
                  <tr key={year.year} className={getRowClass(year, displayYears)}>
                    <th scope="row" className="projection-sticky-age">
                      <span className="projection-age">{year.age}</span>
                      <small>{year.year}</small>
                    </th>
                    <td data-label="Started with">{formatCurrency(year.openingBalance)}</td>
                    <td data-label="Money from your pension">{formatCurrency(year.pensionWithdrawal)}</td>
                    <td data-label="State Pension">{formatCurrency(year.statePensionIncome)}</td>
                    <td data-label="Estimated tax">{formatCurrency(year.incomeTax)}</td>
                    <td data-label="Money available to spend"><strong>{formatCurrency(year.netIncome)}</strong></td>
                    <td data-label="Money left in your pension"><strong>{formatCurrency(year.closingBalance)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="projection-table drawdown-projection-table projection-table-detailed">
              <thead>
                <tr className="projection-column-groups">
                  <th scope="colgroup" colSpan={2}>Period</th>
                  <th scope="colgroup" colSpan={4}>Pension</th>
                  <th scope="colgroup" colSpan={7}>Income &amp; tax</th>
                  <th scope="colgroup" colSpan={2}>Outcome</th>
                </tr>
                <tr>
                  <th scope="col">Age</th>
                  <th scope="col">Year</th>
                  <th scope="col">Opening</th>
                  <th scope="col">Growth</th>
                  <th scope="col">Fees</th>
                  <th scope="col">Closing</th>
                  <th scope="col">Planned income</th>
                  <th scope="col">State Pension</th>
                  <th scope="col">Money from pension</th>
                  <th scope="col">Income before tax</th>
                  <th scope="col">Taxable income</th>
                  <th scope="col">Estimated tax</th>
                  <th scope="col">Money available to spend</th>
                  <th scope="col">Average tax rate</th>
                  <th scope="col">Below plan by</th>
                </tr>
              </thead>
              <tbody>
                {visibleYears.map((year) => (
                  <tr key={year.year} className={getRowClass(year, displayYears)}>
                    <th scope="row" className="projection-sticky-age">{year.age}</th>
                    <td className="projection-sticky-year" data-label="Year">{year.year}</td>
                    <td data-label="Opening balance">{formatCurrency(year.openingBalance)}</td>
                    <td data-label="Growth">{formatCurrency(year.investmentGrowth)}</td>
                    <td data-label="Fees">{formatCurrency(year.fees)}</td>
                    <td data-label="Closing balance"><strong>{formatCurrency(year.closingBalance)}</strong></td>
                    <td data-label="Planned income">{formatCurrency(year.desiredIncome)} <span className="table-target-basis">{year.incomeTargetMode}</span></td>
                    <td data-label="State Pension">{formatCurrency(year.statePensionIncome)}</td>
                    <td data-label="Money from pension">{formatCurrency(year.pensionWithdrawal)}</td>
                    <td data-label="Income before tax">{formatCurrency(year.grossIncome)}</td>
                    <td data-label="Taxable income">{formatCurrency(year.taxableIncome)}</td>
                    <td data-label="Estimated tax">{formatCurrency(year.incomeTax)}</td>
                    <td data-label="Money available to spend"><strong>{formatCurrency(year.netIncome)}</strong></td>
                    <td data-label="Average tax rate">{formatPercentage(year.effectiveTaxRate)}</td>
                    <td data-label="Below plan by">{formatCurrency(year.netIncomeShortfall)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="projection-mobile-list" aria-label={`${tableView} retirement journey cards`}>
          {visibleYears.map((year) => (
            <details key={year.year} className={`projection-mobile-year ${getRowClass(year, displayYears) ?? ""}`}>
              <summary>
                <span><strong>Age {year.age}</strong><small>{year.year}</small></span>
                <span><small>Money left in your pension</small><strong>{formatCurrency(year.closingBalance)}</strong></span>
              </summary>
              <div className="projection-mobile-metrics">
                <div><span>Started with</span><strong>{formatCurrency(year.openingBalance)}</strong></div>
                <div><span>Money from your pension</span><strong>{formatCurrency(year.pensionWithdrawal)}</strong></div>
                <div><span>State Pension</span><strong>{formatCurrency(year.statePensionIncome)}</strong></div>
                <div><span>Estimated tax</span><strong>{formatCurrency(year.incomeTax)}</strong></div>
                <div><span>Money available to spend</span><strong>{formatCurrency(year.netIncome)}</strong></div>
                {tableView === "detailed" && (
                  <>
                    <div><span>Investment growth</span><strong>{formatCurrency(year.investmentGrowth)}</strong></div>
                    <div><span>Fees</span><strong>{formatCurrency(year.fees)}</strong></div>
                    <div><span>Taxable income</span><strong>{formatCurrency(year.taxableIncome)}</strong></div>
                    <div><span>Average tax rate</span><strong>{formatPercentage(year.effectiveTaxRate)}</strong></div>
                    <div><span>Below plan by</span><strong>{formatCurrency(year.netIncomeShortfall)}</strong></div>
                  </>
                )}
              </div>
            </details>
          ))}
        </div>

        {pageSize !== "all" && pageCount > 1 && (
          <nav className="drawdown-journey-pagination" aria-label="Retirement journey table pages">
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
          Showing {visibleYears.length} of {filteredYears.length} years in the current view. Highlighted rows mark the first year an important change begins.
        </p>
      </div>
    </details>
  );
}
