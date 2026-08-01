import { useMemo, useState } from "react";

import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { RetirementGoals } from "../../engine/models/RetirementGoals";
import { calculateMonteCarloTarget, MonteCarloEngine } from "../../engine/monte-carlo";
import { Card, CardHeader, StatusBadge } from "../ui";
import { AppIcons } from "../../icons";
import { MonteCarloPercentileChart } from "./MonteCarloPercentileChart";
import {
  MonteCarloSettingsPanel,
  type MonteCarloExplorerSettings,
} from "./MonteCarloSettingsPanel";
import { MonteCarloSensitivityCards } from "./MonteCarloSensitivityCards";

interface MonteCarloConfidenceExplorerProps {
  inputs: PensionInputs;
  goals: RetirementGoals;
}

const DEFAULT_SETTINGS: MonteCarloExplorerSettings = {
  simulations: 2_000,
  annualVolatility: 0.12,
  seed: 12_345,
  minimumAnnualReturn: -0.95,
  maximumAnnualReturn: 1,
};

function buildInterpretation(probability: number, simulations: number): string {
  const rounded = Math.round(probability * 100);
  const reached = Math.round(probability * simulations);

  if (probability >= 0.9) {
    return `Your plan reached its target in approximately ${reached.toLocaleString("en-GB")} of ${simulations.toLocaleString("en-GB")} simulated market paths. That suggests a strong accumulation position, while still allowing for weaker outcomes.`;
  }

  if (probability >= 0.7) {
    return `Your plan reached its target in approximately ${reached.toLocaleString("en-GB")} of ${simulations.toLocaleString("en-GB")} simulated paths. A ${rounded}% result is encouraging, but the downside range remains meaningful.`;
  }

  return `Your plan reached its target in approximately ${reached.toLocaleString("en-GB")} of ${simulations.toLocaleString("en-GB")} simulated paths. The result indicates that weaker return sequences could materially affect your retirement outcome.`;
}

export function MonteCarloConfidenceExplorer({ inputs, goals }: MonteCarloConfidenceExplorerProps) {
  const [settings, setSettings] = useState<MonteCarloExplorerSettings>(DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const target = useMemo(() => calculateMonteCarloTarget(goals), [goals]);

  const result = useMemo(
    () =>
      MonteCarloEngine.calculate({
        pensionInputs: inputs,
        simulations: settings.simulations,
        seed: settings.seed,
        annualVolatility: settings.annualVolatility,
        minimumAnnualReturn: settings.minimumAnnualReturn,
        maximumAnnualReturn: settings.maximumAnnualReturn,
        targetRealBalance: target.targetRealBalance,
      }),
    [inputs, settings, target.targetRealBalance],
  );

  const probability = result.successProbability ?? 0;

  return (
    <section className="monte-carlo-confidence-explorer" aria-labelledby="monte-carlo-explorer-heading">
      <Card tone="accent" padding="medium">
        <CardHeader
          eyebrow="Confidence explorer"
          title="Understand the range behind your result"
          titleId="monte-carlo-explorer-heading"
          description={buildInterpretation(probability, settings.simulations)}
          icon={AppIcons.chartLine}
          badge={
            <StatusBadge tone={probability >= 0.9 ? "success" : probability >= 0.7 ? "warning" : "danger"}>
              {Math.round(probability * 100)}% confidence
            </StatusBadge>
          }
        />
      </Card>

      <MonteCarloSettingsPanel
        open={settingsOpen}
        settings={settings}
        onToggle={() => setSettingsOpen((current) => !current)}
        onChange={setSettings}
        onReset={() => setSettings(DEFAULT_SETTINGS)}
      />

      <MonteCarloPercentileChart
        yearlyPercentiles={result.yearlyPercentiles}
        targetRealBalance={target.targetRealBalance}
      />

      <MonteCarloSensitivityCards
        inputs={inputs}
        goals={goals}
        settings={settings}
        baselineProbability={probability}
      />

      <p className="monte-carlo-explorer-disclaimer">
        These results illustrate accumulation uncertainty only. They do not model retirement withdrawals, tax, changing asset allocation, sequence risk during drawdown, or guarantee that a target will be achieved.
      </p>
    </section>
  );
}
