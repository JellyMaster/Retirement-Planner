import type { ProjectionYear } from "../../engine/models/ProjectionYear";

interface ProjectionTableProps {
  years: ProjectionYear[];
}

import { formatCurrency } from "../../utils/formatters";

export function ProjectionTable({
  years,
}: ProjectionTableProps) {
  if (years.length === 0) {
    return (
      <section className="panel projection-table-panel">
        <div className="panel-heading">
          <h2>Year-by-year projection</h2>

          <p>
            No projection years are available because the
            current age matches the retirement age.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="panel projection-table-panel">
      <div className="panel-heading">
        <h2>Year-by-year projection</h2>

        <p>
          See how contributions, investment growth and fees
          affect your pension over time.
        </p>
      </div>

      <div className="table-scroll">
        <table className="projection-table">
          <thead>
            <tr>
              <th scope="col">Age</th>
              <th scope="col">Opening balance</th>
              <th scope="col">Contributions</th>
              <th scope="col">Growth</th>
              <th scope="col">Fees</th>
              <th scope="col">Closing balance</th>
            </tr>
          </thead>

          <tbody>
            {years.map((year) => (
              <tr key={year.yearIndex}>
                <td>{year.age}</td>

                <td>
                  {formatCurrency(
                    year.openingBalance.nominal
                  )}
                </td>

                <td>
                  {formatCurrency(
                    year.contributions.nominal
                  )}
                </td>

                <td>
                  {formatCurrency(
                    year.investmentGrowth.nominal
                  )}
                </td>

                <td>
                  {formatCurrency(
                    year.fees.nominal
                  )}
                </td>

                <td>
                  <strong>
                    {formatCurrency(
                      year.closingBalance.nominal
                    )}
                  </strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

