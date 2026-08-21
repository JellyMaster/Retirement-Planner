import { useMemo, useState } from "react";
import type { DrawdownYear } from "../../engine/drawdown/models/DrawdownYear";
import { getDisplayYears, type MoneyDisplayMode } from "../../utils/drawdownDisplayValues";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

interface DrawdownProjectionTableProps {
  years: DrawdownYear[];
  inflationRate: number;
  displayMode: MoneyDisplayMode;
}

type TableView = "simplified" | "detailed";
type RowFrequency = "annual" | "five-year" | "key-years";

function getImportantAges(years: DrawdownYear[]) {
  const ages = new Set<number>();
  if (years.length === 0) return ages;

  ages.add(years[0].age);
  ages.add(years.at(-1)!.age);

  const statePensionStart = years.find((year, index) => year.statePensionIncome > 0 && (index === 0 || years[index - 1].statePensionIncome <= 0));
  const firstShortfall = years.find((year) => year.netIncomeShortfall > 0 || year.incomeShortfall > 0);
  const firstDepletion = years.find((year) => year.isDepleted || year.closingBalance <= 0);

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

  if (year.netIncomeShortfall > 0 || year.incomeShortfall > 0) classes.push("projection-row-warning");
  if (year.statePensionIncome > 0 && (!previous || previous.statePensionIncome <= 0)) classes.push("projection-row-state-pension");
  if ((year.isDepleted || year.closingBalance <= 0) && (!previous || (!previous.isDepleted && previous.closingBalance > 0))) classes.push("projection-row-depleted");
  if (index === years.length - 1) classes.push("projection-row-final");

  return classes.join(" ") || undefined;
}

export function DrawdownProjectionTable({ years, inflationRate, displayMode }: DrawdownProjectionTableProps) {
  const [tableView, setTableView] = useState<TableView>("simplified");
  const [rowFrequency, setRowFrequency] = useState<RowFrequency>("annual");
  const displayYears = useMemo(() => getDisplayYears(years, inflationRate, displayMode), [years, inflationRate, displayMode]);
  const visibleYears = useMemo(() => filterRows(displayYears, rowFrequency), [displayYears, rowFrequency]);

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
    <section className="panel projection-table-panel drawdown-projection-table-panel">
      <div className="projection-table-header">
        <div className="panel-heading projection-table-heading">
          <span className="projection-table-eyebrow">Complete journey</span>
          <h2>Explore every year of retirement</h2>
          <p>
            Follow the figures behind your retirement journey. Start with the plain-English view, or switch to Detailed when you want to inspect the full calculation. Values are shown in {displayMode === "today" ? "today's money" : "future money"}.
          </p>
        </div>

        <div className="projection-table-controls" aria-label="Retirement journey table options">
          <div className="projection-control-group">
            <span className="projection-control-label">Table detail</span>
            <div className="projection-segmented-control" role="group" aria-label="Table detail">
              <button type="button" className={tableView === "simplified" ? "is-active" : undefined} aria-pressed={tableView === "simplified"} onClick={() => setTableView("simplified")}>Simplified</button>
              <button type="button" className={tableView === "detailed" ? "is-active" : undefined} aria-pressed={tableView === "detailed"} onClick={() => setTableView("detailed")}>Detailed</button>
            </div>
          </div>

          <label className="projection-control-group projection-row-filter">
            <span className="projection-control-label">Years shown</span>
            <select value={rowFrequency} onChange={(event) => setRowFrequency(event.target.value as RowFrequency)}>
              <option value="annual">Every year</option>
              <option value="five-year">Every 5 years</option>
              <option value="key-years">Key years</option>
            </select>
          </label>
        </div>
      </div>

      <div className="projection-table-legend" aria-label="Important retirement journey years">
        <span><i className="legend-dot legend-dot-state" /> State Pension begins</span>
        <span><i className="legend-dot legend-dot-warning" /> Planned income no longer fully met</span>
        <span><i className="legend-dot legend-dot-depleted" /> Private pension fully used</span>
      </div>

      <div className="table-scroll drawdown-table-scroll" tabIndex={0} aria-label={`${tableView} retirement journey table`}>
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
                  <th scope="row" className="projection-sticky-age"><span className="projection-age">{year.age}</span><small>{year.year}</small></th>
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

      <p className="projection-table-footnote">
        Showing {visibleYears.length} of {displayYears.length} retirement years. Highlighted rows mark the first year an important change begins, so you can see where the retirement story shifts rather than treating every year as identical.
      </p>
    </section>
  );
}
