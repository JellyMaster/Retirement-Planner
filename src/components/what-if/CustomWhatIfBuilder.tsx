import { useEffect, useMemo, useState } from "react";

import type { PensionInputs } from "../../engine/models/PensionInputs";
import type { ProjectionResult } from "../../engine/models/ProjectionResult";
import type { RetirementGoals } from "../../engine/models/RetirementGoals";
import { RetirementProjectionEngine } from "../../engine/services/RetirementProjectionEngine";
import { formatCurrency } from "../../utils/formatters";
import { CustomWhatIfPreview } from "./CustomWhatIfPreview";
import { WhatIfAdjustmentField } from "./WhatIfAdjustmentField";
import { Button, ButtonGroup, Card, SectionTitle, Stack } from "../ui";

interface CustomWhatIfBuilderProps {
  inputs: PensionInputs;
  result: ProjectionResult;
  goals: RetirementGoals;
  onApplyToComparison: (inputs: PensionInputs) => void;
}

interface SavedScenario {
  id: string;
  name: string;
  inputs: PensionInputs;
}

const STORAGE_KEY = "retirement-planner-saved-scenarios-v1";

const presets: Array<{
  id: string;
  label: string;
  description: string;
  build: (inputs: PensionInputs) => PensionInputs;
}> = [
  {
    id: "early-retirement",
    label: "Early retirement",
    description: "Retire two years earlier.",
    build: (inputs) => ({
      ...inputs,
      retirementAge: Math.max(inputs.currentAge + 1, inputs.retirementAge - 2),
    }),
  },
  {
    id: "save-more",
    label: "Aggressive saving",
    description: "Add £250 to your own monthly contribution.",
    build: (inputs) => ({
      ...inputs,
      monthlyEmployeeContribution: inputs.monthlyEmployeeContribution + 250,
    }),
  },
  {
    id: "conservative",
    label: "Conservative returns",
    description: "Reduce the annual return assumption by 1.5%.",
    build: (inputs) => ({
      ...inputs,
      annualReturn: Math.max(-0.99, Number((inputs.annualReturn - 0.015).toFixed(10))),
    }),
  },
  {
    id: "high-inflation",
    label: "Higher inflation",
    description: "Increase inflation by 1.5%.",
    build: (inputs) => ({
      ...inputs,
      inflation: Number((inputs.inflation + 0.015).toFixed(10)),
    }),
  },
  {
    id: "lower-fees",
    label: "Lower fees",
    description: "Reduce the annual fee by 0.25%.",
    build: (inputs) => ({
      ...inputs,
      annualFee: Math.max(0, Number((inputs.annualFee - 0.0025).toFixed(10))),
    }),
  },
];

function readSavedScenarios(): SavedScenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedScenario[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function percentageValue(value: number): number {
  return Number((value * 100).toFixed(4));
}

function decimalValue(value: number): number {
  return Number((value / 100).toFixed(10));
}

export function CustomWhatIfBuilder({
  inputs,
  result,
  goals,
  onApplyToComparison,
}: CustomWhatIfBuilderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scenarioName, setScenarioName] = useState("My retirement scenario");
  const [scenarioInputs, setScenarioInputs] = useState<PensionInputs>(() => ({ ...inputs }));
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>(readSavedScenarios);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedScenarios));
  }, [savedScenarios]);

  const projectedPotChange = useMemo(() => {
    const scenario = RetirementProjectionEngine.calculate(scenarioInputs);
    return scenario.finalBalance.real - result.finalBalance.real;
  }, [result.finalBalance.real, scenarioInputs]);

  function handleToggleBuilder() {
    setScenarioInputs({ ...inputs });
    setIsOpen((current) => !current);
  }

  function update<K extends keyof PensionInputs>(field: K, value: PensionInputs[K]) {
    setScenarioInputs((current) => ({ ...current, [field]: value }));
  }

  function saveScenario() {
    const trimmedName = scenarioName.trim();
    if (!trimmedName) return;
    setSavedScenarios((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: trimmedName,
        inputs: { ...scenarioInputs },
      },
    ]);
  }

  return (
    <Card className="custom-what-if-builder" tone="subtle" padding="none" aria-labelledby="custom-what-if-heading">
      <Button
        variant="subtle"
        className="custom-what-if-toggle"
        aria-expanded={isOpen}
        onClick={handleToggleBuilder}
      >
        <span>
          <strong id="custom-what-if-heading">Create your own scenario</strong>
          <small>Adjust several assumptions and see the combined effect instantly.</small>
        </span>
        <span aria-hidden="true">{isOpen ? "Close" : "Build scenario"}</span>
      </Button>

      {isOpen ? (
        <div className="custom-what-if-content">
          <div className="custom-what-if-presets">
            <SectionTitle
              headingLevel={3}
              title="Quick scenarios"
              description="Start with a common planning question, then fine-tune the values."
            />
            <ButtonGroup className="custom-what-if-preset-list">
              {presets.map((preset) => (
                <Button
                  variant="subtle"
                  size="small"
                  key={preset.id}
                  title={preset.description}
                  onClick={() => setScenarioInputs(preset.build(inputs))}
                >
                  {preset.label}
                </Button>
              ))}
              <Button variant="secondary" size="small" onClick={() => setScenarioInputs({ ...inputs })}>
                Reset to current plan
              </Button>
            </ButtonGroup>
          </div>

          <div className="custom-what-if-layout">
            <Stack gap="large" className="custom-what-if-editor">
              <div className="custom-what-if-name">
                <label htmlFor="custom-what-if-name">Scenario name</label>
                <input
                  id="custom-what-if-name"
                  value={scenarioName}
                  onChange={(event) => setScenarioName(event.target.value)}
                />
              </div>

              <div className="custom-what-if-fields">
                <WhatIfAdjustmentField label="Retirement age" description={`Current plan: age ${inputs.retirementAge}`}>
                  <input
                    type="number"
                    min={inputs.currentAge + 1}
                    max={100}
                    value={scenarioInputs.retirementAge}
                    onChange={(event) => update("retirementAge", event.target.valueAsNumber)}
                  />
                </WhatIfAdjustmentField>

                <WhatIfAdjustmentField label="Your monthly contribution" description={`Current plan: ${formatCurrency(inputs.monthlyEmployeeContribution)}`}>
                  <div className="custom-what-if-money-input"><span>£</span><input type="number" min={0} step={10} value={scenarioInputs.monthlyEmployeeContribution} onChange={(event) => update("monthlyEmployeeContribution", event.target.valueAsNumber)} /></div>
                </WhatIfAdjustmentField>

                <WhatIfAdjustmentField label="Employer monthly contribution" description={`Current plan: ${formatCurrency(inputs.monthlyEmployerContribution)}`}>
                  <div className="custom-what-if-money-input"><span>£</span><input type="number" min={0} step={10} value={scenarioInputs.monthlyEmployerContribution} onChange={(event) => update("monthlyEmployerContribution", event.target.valueAsNumber)} /></div>
                </WhatIfAdjustmentField>

                <WhatIfAdjustmentField label="Expected annual return" description={`Current plan: ${percentageValue(inputs.annualReturn).toFixed(2)}%`}>
                  <div className="custom-what-if-percent-input"><input type="number" min={-99} max={30} step={0.1} value={percentageValue(scenarioInputs.annualReturn)} onChange={(event) => update("annualReturn", decimalValue(event.target.valueAsNumber))} /><span>%</span></div>
                </WhatIfAdjustmentField>

                <WhatIfAdjustmentField label="Annual pension fee" description={`Current plan: ${percentageValue(inputs.annualFee).toFixed(2)}%`}>
                  <div className="custom-what-if-percent-input"><input type="number" min={0} max={10} step={0.01} value={percentageValue(scenarioInputs.annualFee)} onChange={(event) => update("annualFee", decimalValue(event.target.valueAsNumber))} /><span>%</span></div>
                </WhatIfAdjustmentField>

                <WhatIfAdjustmentField label="Inflation" description={`Current plan: ${percentageValue(inputs.inflation).toFixed(2)}%`}>
                  <div className="custom-what-if-percent-input"><input type="number" min={0} max={20} step={0.1} value={percentageValue(scenarioInputs.inflation)} onChange={(event) => update("inflation", decimalValue(event.target.valueAsNumber))} /><span>%</span></div>
                </WhatIfAdjustmentField>

                <WhatIfAdjustmentField label="Annual contribution increase" description={`Current plan: ${percentageValue(inputs.annualContributionIncrease).toFixed(2)}%`}>
                  <div className="custom-what-if-percent-input"><input type="number" min={0} max={30} step={0.1} value={percentageValue(scenarioInputs.annualContributionIncrease)} onChange={(event) => update("annualContributionIncrease", decimalValue(event.target.valueAsNumber))} /><span>%</span></div>
                </WhatIfAdjustmentField>

                <WhatIfAdjustmentField label="Future extra monthly contribution" description="Use zero to remove the planned increase.">
                  <div className="custom-what-if-money-input"><span>£</span><input type="number" min={0} step={10} value={scenarioInputs.extraMonthlyContribution ?? 0} onChange={(event) => update("extraMonthlyContribution", event.target.valueAsNumber || undefined)} /></div>
                </WhatIfAdjustmentField>

                <WhatIfAdjustmentField label="Extra contribution starts at age" description="Only used when a future extra contribution is set.">
                  <input type="number" min={inputs.currentAge} max={scenarioInputs.retirementAge} value={scenarioInputs.extraContributionAge ?? ""} onChange={(event) => update("extraContributionAge", event.target.value === "" ? undefined : event.target.valueAsNumber)} />
                </WhatIfAdjustmentField>
              </div>

              <div className={`custom-what-if-smart-hint ${projectedPotChange >= 0 ? "positive" : "negative"}`}>
                <strong>Live impact</strong>
                <span>
                  This combination changes the projected pot by {projectedPotChange >= 0 ? "+" : "−"}{formatCurrency(Math.abs(projectedPotChange))} in today&apos;s money.
                </span>
              </div>

              <ButtonGroup align="end" className="custom-what-if-save-row">
                <Button onClick={saveScenario}>Save scenario</Button>
              </ButtonGroup>

              {savedScenarios.length > 0 ? (
                <div className="custom-what-if-library">
                  <h3>Saved scenarios</h3>
                  <div>
                    {savedScenarios.map((scenario) => (
                      <article key={scenario.id}>
                        <Button variant="subtle" onClick={() => { setScenarioName(scenario.name); setScenarioInputs({ ...scenario.inputs }); }}>
                          <strong>{scenario.name}</strong>
                          <small>Retire at {scenario.inputs.retirementAge} · {formatCurrency(scenario.inputs.monthlyEmployeeContribution + scenario.inputs.monthlyEmployerContribution)}/month</small>
                        </Button>
                        <Button variant="danger" size="small" aria-label={`Delete ${scenario.name}`} onClick={() => setSavedScenarios((current) => current.filter((item) => item.id !== scenario.id))}>×</Button>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </Stack>

            <CustomWhatIfPreview
              baselineInputs={inputs}
              scenarioInputs={scenarioInputs}
              baselineResult={result}
              goals={goals}
              onApplyToComparison={onApplyToComparison}
            />
          </div>
        </div>
      ) : null}
    </Card>
  );
}
