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
  const statePensionStartYear = inputs.annualStatePension > 0
    ? years.find(
        (year) => year.age >= inputs.statePensionAge && year.statePensionIncome > 0,
      )
    : undefined;
  const preStatePensionYear = statePensionStartYear
    ? years.filter((year) => year.age < statePensionStartYear.age).at(-1)
    : undefined;

  return (
    <section
      className="drawdown-income-waterfall"
      aria-labelledby="drawdown-income-waterfall-title"
    >
      <header>
        <div>
          <p className="panel-eyebrow">Income at key ages</p>
          <h3 id="drawdown-income-waterfall-title">
            How your retirement is funded
          </h3>
          <p>
            At different points in retirement, your income may come from different places. These examples show how much comes from your private pension, how much comes from State Pension and how much is paid in tax.
          </p>
        </div>
        <span>{displayMode === "today" ? "Today’s money" : "Future money"}</span>
      </header>

      {statePensionStartYear && (
        <aside
          className="drawdown-income-transition"
          aria-label="How State Pension changes your retirement income mix"
        >
          <div>
            <small>State Pension milestone</small>
            <strong>
              {statePensionStartYear.age <= inputs.retirementAge
                ? "Your State Pension supports your income from retirement"
                : `Your State Pension starts at age ${statePensionStartYear.age}`}
            </strong>
          </div>
          <p>
            {preStatePensionYear
              ? `Once your State Pension begins, ${formatCurrency(statePensionStartYear.statePensionIncome)}/year comes from the Government. In this illustration, the amount needed from your private pension changes from ${formatCurrency(preStatePensionYear.pensionWithdrawal)} to ${formatCurrency(statePensionStartYear.pensionWithdrawal)}/year.`
              : `It provides ${formatCurrency(statePensionStartYear.statePensionIncome)}/year alongside ${formatCurrency(statePensionStartYear.pensionWithdrawal)}/year from your private pension.`}
          </p>
        </aside>
      )}

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
                  <strong>{formatCurrency(year.netIncome)}/year available to spend</strong>
                </div>
                {shortfall > 0 && <small>Below your plan by {formatCurrency(shortfall)}</small>}
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
                  <dt>From your pension</dt>
                  <dd>{formatCurrency(year.pensionWithdrawal)}</dd>
                </div>
                <div>
                  <dt>From State Pension</dt>
                  <dd>{formatCurrency(year.statePensionIncome)}</dd>
                </div>
                <div>
                  <dt>Estimated tax</dt>
                  <dd>−{formatCurrency(year.incomeTax)}</dd>
                </div>
                <div>
                  <dt>Available to spend</dt>
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
