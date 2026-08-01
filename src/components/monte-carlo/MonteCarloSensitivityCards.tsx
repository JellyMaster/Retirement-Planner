import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { RetirementGoals } from "../../engine/models/RetirementGoals";
import { calculateMonteCarloTarget, MonteCarloEngine } from "../../engine/monte-carlo";
import { AppIcons } from "../../icons";
import { Card, CardHeader, DashboardGrid, StatusBadge } from "../ui";
import type { MonteCarloExplorerSettings } from "./MonteCarloSettingsPanel";

interface MonteCarloSensitivityCardsProps {
  inputs: PensionInputs;
  goals: RetirementGoals;
  settings: MonteCarloExplorerSettings;
  baselineProbability: number;
}

interface SensitivityScenario {
  id: string;
  title: string;
  description: string;
  inputs: PensionInputs;
  annualVolatility: number;
}

export function MonteCarloSensitivityCards({
  inputs,
  goals,
  settings,
  baselineProbability,
}: MonteCarloSensitivityCardsProps) {
  const target = calculateMonteCarloTarget(goals);
  const scenarios: SensitivityScenario[] = [
    {
      id: "save-more",
      title: "Save £100 more each month",
      description: "Tests the impact of a higher employee contribution.",
      inputs: { ...inputs, monthlyEmployeeContribution: inputs.monthlyEmployeeContribution + 100 },
      annualVolatility: settings.annualVolatility,
    },
    {
      id: "retire-later",
      title: "Retire one year later",
      description: "Adds one year of contributions and potential market growth.",
      inputs: { ...inputs, retirementAge: Math.min(100, inputs.retirementAge + 1) },
      annualVolatility: settings.annualVolatility,
    },
    {
      id: "lower-return",
      title: "Returns are 1% lower",
      description: "Tests a more conservative expected return.",
      inputs: { ...inputs, annualReturn: Math.max(0, inputs.annualReturn - 0.01) },
      annualVolatility: settings.annualVolatility,
    },
    {
      id: "higher-volatility",
      title: "Volatility is 3% higher",
      description: "Shows how a wider range of market outcomes affects confidence.",
      inputs,
      annualVolatility: Math.min(1, settings.annualVolatility + 0.03),
    },
  ];

  const results = scenarios.map((scenario) => {
    const result = MonteCarloEngine.calculate({
      pensionInputs: scenario.inputs,
      simulations: settings.simulations,
      seed: settings.seed,
      annualVolatility: scenario.annualVolatility,
      minimumAnnualReturn: settings.minimumAnnualReturn,
      maximumAnnualReturn: settings.maximumAnnualReturn,
      targetRealBalance: target.targetRealBalance,
    });

    const probability = result.successProbability ?? 0;
    return { ...scenario, probability, change: probability - baselineProbability };
  });

  return (
    <Card className="monte-carlo-sensitivity" padding="medium" aria-labelledby="monte-carlo-sensitivity-heading">
      <CardHeader
        eyebrow="Sensitivity analysis"
        title="What changes your confidence?"
        titleId="monte-carlo-sensitivity-heading"
        description="These previews rerun the same simulation assumptions without changing your current plan."
        icon={AppIcons.comparison}
      />

      <DashboardGrid columns={4} className="monte-carlo-sensitivity-grid">
        {results.map((scenario) => {
          const percentage = Math.round(scenario.probability * 100);
          const changePoints = Math.round(scenario.change * 100);
          const positive = changePoints > 0;
          const negative = changePoints < 0;

          return (
            <Card key={scenario.id} as="article" tone={positive ? "success" : negative ? "warning" : "subtle"} padding="small">
              <div className="monte-carlo-sensitivity-card-heading">
                <h3>{scenario.title}</h3>
                <StatusBadge tone={positive ? "success" : negative ? "warning" : "neutral"}>
                  {changePoints > 0 ? "+" : ""}{changePoints} pts
                </StatusBadge>
              </div>
              <p>{scenario.description}</p>
              <div className="monte-carlo-sensitivity-score">
                <span>{Math.round(baselineProbability * 100)}%</span>
                <strong aria-label={`Changes to ${percentage} percent`}>→ {percentage}%</strong>
              </div>
            </Card>
          );
        })}
      </DashboardGrid>
    </Card>
  );
}
