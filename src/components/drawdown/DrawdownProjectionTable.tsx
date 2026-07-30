import type { DrawdownYear } from "../../engine/drawdown/models/DrawdownYear";
import { getDisplayYears, type MoneyDisplayMode } from "../../utils/drawdownDisplayValues";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

interface DrawdownProjectionTableProps {
  years: DrawdownYear[];
  inflationRate: number;
  displayMode: MoneyDisplayMode;
}

export function DrawdownProjectionTable({ years, inflationRate, displayMode }: DrawdownProjectionTableProps) {
  const displayYears = getDisplayYears(years, inflationRate, displayMode);
  if (years.length === 0) {
    return (
      <section className="panel projection-table-panel">
        <div className="panel-heading">
          <h2>Year-by-year drawdown</h2>
          <p>No drawdown years are available for the current ages.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel projection-table-panel">
      <div className="panel-heading">
        <h2>Year-by-year drawdown</h2>
        <p>See how income, tax, withdrawals, investment growth and fees affect the pension balance. Values are shown in {displayMode === "today" ? "today&apos;s money" : "future money"}.</p>
      </div>

      <div className="table-scroll">
        <table className="projection-table">
          <thead>
            <tr>
              <th scope="col">Age</th>
              <th scope="col">Opening balance</th>
              <th scope="col">Income target</th>
              <th scope="col">State Pension</th>
              <th scope="col">Pension withdrawal</th>
              <th scope="col">Gross income</th>
              <th scope="col">Taxable income</th>
              <th scope="col">Income tax</th>
              <th scope="col">Net income</th>
              <th scope="col">Effective tax</th>
              <th scope="col">Net shortfall</th>
              <th scope="col">Growth</th>
              <th scope="col">Fees</th>
              <th scope="col">Closing balance</th>
            </tr>
          </thead>
          <tbody>
            {displayYears.map((year) => (
              <tr key={year.year} className={year.netIncomeShortfall > 0 || year.incomeShortfall > 0 ? "projection-row-warning" : undefined}>
                <td>{year.age}</td>
                <td>{formatCurrency(year.openingBalance)}</td>
                <td>{formatCurrency(year.desiredIncome)} <span className="table-target-basis">{year.incomeTargetMode}</span></td>
                <td>{formatCurrency(year.statePensionIncome)}</td>
                <td>{formatCurrency(year.pensionWithdrawal)}</td>
                <td>{formatCurrency(year.grossIncome)}</td>
                <td>{formatCurrency(year.taxableIncome)}</td>
                <td>{formatCurrency(year.incomeTax)}</td>
                <td><strong>{formatCurrency(year.netIncome)}</strong></td>
                <td>{formatPercentage(year.effectiveTaxRate)}</td>
                <td>{formatCurrency(year.netIncomeShortfall)}</td>
                <td>{formatCurrency(year.investmentGrowth)}</td>
                <td>{formatCurrency(year.fees)}</td>
                <td><strong>{formatCurrency(year.closingBalance)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
