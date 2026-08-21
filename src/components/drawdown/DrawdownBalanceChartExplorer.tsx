import type { DrawdownInputs } from "../../engine/drawdown/models/DrawdownInputs";
import type { DrawdownResult } from "../../engine/drawdown/models/DrawdownResult";
import type { MoneyDisplayMode } from "../../utils/drawdownDisplayValues";
import { DrawdownBalanceChart } from "./DrawdownBalanceChart";

interface DrawdownBalanceChartExplorerProps {
  inputs: DrawdownInputs;
  result: DrawdownResult;
  displayMode: MoneyDisplayMode;
  selectedAge?: number;
  onSelectAge?: (age: number) => void;
}

export function DrawdownBalanceChartExplorer({
  inputs,
  result,
  displayMode,
  selectedAge,
}: DrawdownBalanceChartExplorerProps) {
  return (
    <section className="drawdown-balance-chart-explorer">
      <DrawdownBalanceChart
        years={result.years}
        depletionAge={result.depletionAge}
        inflationRate={inputs.inflationRate}
        displayMode={displayMode}
        selectedAge={selectedAge}
      />
    </section>
  );
}
