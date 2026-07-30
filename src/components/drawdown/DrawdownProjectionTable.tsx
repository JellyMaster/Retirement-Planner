import type { DrawdownYear } from "../../engine/drawdown/models/DrawdownYear";
import { formatCurrency } from "../../utils/formatters";

interface DrawdownProjectionTableProps {
  years: DrawdownYear[];
}

export function DrawdownProjectionTable({ years }: DrawdownProjectionTableProps) {
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
        <p>See how income, withdrawals, investment growth and fees affect the pension balance.</p>
      </div>

      <div className="table-scroll">
        <table className="projection-table">
          <thead>
            <tr>
              <th scope="col">Age</th>
              <th scope="col">Opening balance</th>
              <th scope="col">Desired income</th>
              <th scope="col">State Pension</th>
              <th scope="col">Pension withdrawal</th>
              <th scope="col">Growth</th>
              <th scope="col">Fees</th>
              <th scope="col">Shortfall</th>
              <th scope="col">Closing balance</th>
            </tr>
          </thead>
          <tbody>
            {years.map((year) => (
              <tr key={year.year} className={year.incomeShortfall > 0 ? "projection-row-warning" : undefined}>
                <td>{year.age}</td>
                <td>{formatCurrency(year.openingBalance)}</td>
                <td>{formatCurrency(year.desiredIncome)}</td>
                <td>{formatCurrency(year.statePensionIncome)}</td>
                <td>{formatCurrency(year.pensionWithdrawal)}</td>
                <td>{formatCurrency(year.investmentGrowth)}</td>
                <td>{formatCurrency(year.fees)}</td>
                <td>{formatCurrency(year.incomeShortfall)}</td>
                <td><strong>{formatCurrency(year.closingBalance)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
