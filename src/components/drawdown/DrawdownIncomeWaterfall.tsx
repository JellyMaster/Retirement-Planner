import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import {
  getDisplayYears,
  type MoneyDisplayMode,
} from "../../utils/drawdownDisplayValues";
import { formatCurrency } from "../../utils/formatters";

interface DrawdownIncomeWaterfallProps {
  inputs: DrawdownInputs;
  result: DrawdownResult;
  displayMode: MoneyDisplayMode;
}

export function DrawdownIncomeWaterfall({
  inputs,
  result,
  displayMode,
}: DrawdownIncomeWaterfallProps) {
  const years = getDisplayYears(
    result.years,
    inputs.inflationRate,
    displayMode,
  );
  const selectedAges = new Set<number>([
    inputs.retirementAge,
    inputs.endAge,
    ...(inputs.annualStatePension > 0 ? [inputs.statePensionAge] : []),
    ...(inputs.spendingPhases?.slice(1).map((phase) => phase.startAge) ?? []),
  ]);
  const snapshots = years.filter((year) => selectedAges.has(year.age));

  return (
    <section
      className="drawdown-income-waterfall"
      aria-labelledby="drawdown-income-waterfall-title"
    >
      <header>
        <div>
          <p className="panel-eyebrow">Income at key ages</p>
          <h3 id="drawdown-income-waterfall-title">
            Where your retirement income comes from
          </h3>
          <p>
            Key points show how private-pension withdrawals and State Pension combine,
            with tax deducted to reach the income available to spend.
          </p>
        </div>
        <span>{displayMode === "today" ? "Today’s money" : "Future money"}</span>
      </header>

      <div className="drawdown-waterfall-grid">
        {snapshots.map((year) => {
          const grossSources = year.pensionWithdrawal + year.statePensionIncome;
          const privateShare = grossSources > 0
            ? (year.pensionWithdrawal / grossSources) * 100
            : 0;
          const stateShare = grossSources > 0
            ? (year.statePensionIncome / grossSources) * 100
            : 0;
          const shortfall = inputs.incomeTargetMode === "net"
            ? year.netIncomeShortfall
            : year.incomeShortfall;

          return (
            <article key={year.age}>
              <div className="drawdown-waterfall-card-heading">
                <div>
                  <span>Age {year.age}</span>
                  <strong>{formatCurrency(year.netIncome)}/year available</strong>
                </div>
                {shortfall > 0 && <small>Shortfall {formatCurrency(shortfall)}</small>}
              </div>

              <div
                className="drawdown-waterfall-bar"
                aria-label={`At age ${year.age}, ${formatCurrency(year.pensionWithdrawal)} comes from the private pension and ${formatCurrency(year.statePensionIncome)} from State Pension.`}
              >
                {privateShare > 0 && (
                  <span
                    className="is-private"
                    style={{ width: `${privateShare}%` }}
                    title="Private pension"
                  />
                )}
                {stateShare > 0 && (
                  <span
                    className="is-state"
                    style={{ width: `${stateShare}%` }}
                    title="State Pension"
                  />
                )}
              </div>

              <dl>
                <div>
                  <dt>Private pension</dt>
                  <dd>{formatCurrency(year.pensionWithdrawal)}</dd>
                </div>
                <div>
                  <dt>State Pension</dt>
                  <dd>{formatCurrency(year.statePensionIncome)}</dd>
                </div>
                <div>
                  <dt>Income tax</dt>
                  <dd>−{formatCurrency(year.incomeTax)}</dd>
                </div>
                <div>
                  <dt>Net income</dt>
                  <dd>{formatCurrency(year.netIncome)}</dd>
                </div>
              </dl>
            </article>
          );
        })}
      </div>
    </section>
  );
}
