import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { ProjectionResult } from "../../engine/models/ProjectionResult";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

interface RetirementInsightsProps {
  inputs: PensionInputs;
  result: ProjectionResult;
}

export function RetirementInsights({ inputs, result }: RetirementInsightsProps) {
  const yearsToRetirement = Math.max(0, inputs.retirementAge - inputs.currentAge);
  const totalMonthlyContribution =
    inputs.monthlyEmployeeContribution + inputs.monthlyEmployerContribution;
  const growthShare =
    result.finalBalance.nominal > 0
      ? result.totalInvestmentGrowth.nominal / result.finalBalance.nominal
      : 0;
  const contributionShare =
    result.finalBalance.nominal > 0
      ? result.totalContributions.nominal / result.finalBalance.nominal
      : 0;
  const feeShare =
    result.totalInvestmentGrowth.nominal > 0
      ? result.totalFees.nominal / result.totalInvestmentGrowth.nominal
      : 0;

  return (
    <section className="panel retirement-insights-panel">
      <div className="panel-heading retirement-compact-heading">
        <div>
          <h2>Key insights</h2>
          <p>The main takeaways from the current projection.</p>
        </div>
      </div>

      <ul className="retirement-insights-list">
        <li>
          <span className="retirement-insight-marker" aria-hidden="true">✓</span>
          <span>
            <strong>{yearsToRetirement} years</strong> remain until the selected
            retirement age of {inputs.retirementAge}.
          </span>
        </li>
        <li>
          <span className="retirement-insight-marker" aria-hidden="true">✓</span>
          <span>
            Total monthly pension saving is <strong>{formatCurrency(totalMonthlyContribution)}</strong>.
          </span>
        </li>
        <li>
          <span className="retirement-insight-marker" aria-hidden="true">✓</span>
          <span>
            Investment growth contributes about <strong>{formatPercentage(growthShare)}</strong> of the projected pot.
          </span>
        </li>
        <li>
          <span className="retirement-insight-marker" aria-hidden="true">✓</span>
          <span>
            Contributions account for about <strong>{formatPercentage(contributionShare)}</strong> of the projected pot.
          </span>
        </li>
        <li>
          <span className="retirement-insight-marker" aria-hidden="true">✓</span>
          <span>
            Projected fees equal roughly <strong>{formatPercentage(feeShare)}</strong> of gross investment growth.
          </span>
        </li>
      </ul>
    </section>
  );
}
