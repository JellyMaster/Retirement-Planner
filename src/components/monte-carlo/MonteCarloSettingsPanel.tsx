import { useId } from "react";

import { AppIcons } from "../../icons";
import { Button, Card, CardHeader, DashboardGrid, Stack } from "../ui";

export interface MonteCarloExplorerSettings {
  simulations: number;
  annualVolatility: number;
  seed: number;
  minimumAnnualReturn: number;
  maximumAnnualReturn: number;
}

interface MonteCarloSettingsPanelProps {
  open: boolean;
  settings: MonteCarloExplorerSettings;
  onToggle: () => void;
  onChange: (settings: MonteCarloExplorerSettings) => void;
  onReset: () => void;
}

export function MonteCarloSettingsPanel({
  open,
  settings,
  onToggle,
  onChange,
  onReset,
}: MonteCarloSettingsPanelProps) {
  const panelId = useId();

  return (
    <Card className="monte-carlo-settings" tone="subtle" padding="medium">
      <div className="monte-carlo-settings-summary">
        <CardHeader
          eyebrow="Advanced controls"
          title="Simulation settings"
          description={`${settings.simulations.toLocaleString("en-GB")} simulations · ${Math.round(settings.annualVolatility * 100)}% volatility`}
          icon={AppIcons.settings}
        />
        <Button
          variant="subtle"
          icon={AppIcons.settings}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          {open ? "Hide settings" : "Adjust settings"}
        </Button>
      </div>

      {open && (
        <Stack id={panelId} className="monte-carlo-settings-fields" gap="medium">
          <DashboardGrid columns={2}>
            <label className="monte-carlo-setting-field">
              <span>Simulations</span>
              <select
                value={settings.simulations}
                onChange={(event) => onChange({ ...settings, simulations: Number(event.target.value) })}
              >
                <option value={500}>500</option>
                <option value={1_000}>1,000</option>
                <option value={2_000}>2,000</option>
                <option value={5_000}>5,000</option>
                <option value={10_000}>10,000</option>
              </select>
              <small>More simulations provide a smoother estimate but take longer to calculate.</small>
            </label>

            <label className="monte-carlo-setting-field">
              <span>Annual volatility</span>
              <div className="monte-carlo-range-row">
                <input
                  type="range"
                  min="0"
                  max="0.35"
                  step="0.01"
                  value={settings.annualVolatility}
                  onChange={(event) => onChange({ ...settings, annualVolatility: Number(event.target.value) })}
                />
                <output>{Math.round(settings.annualVolatility * 100)}%</output>
              </div>
              <small>Higher volatility widens the range of possible outcomes.</small>
            </label>

            <label className="monte-carlo-setting-field">
              <span>Random seed</span>
              <input
                type="number"
                min="1"
                step="1"
                value={settings.seed}
                onChange={(event) => onChange({ ...settings, seed: Math.max(1, Number(event.target.value) || 1) })}
              />
              <small>Use the same seed to reproduce the same simulation paths.</small>
            </label>

            <label className="monte-carlo-setting-field">
              <span>Minimum annual return</span>
              <div className="monte-carlo-percent-input">
                <input
                  type="number"
                  min="-99"
                  max="100"
                  step="1"
                  value={Math.round(settings.minimumAnnualReturn * 100)}
                  onChange={(event) => onChange({ ...settings, minimumAnnualReturn: Number(event.target.value) / 100 })}
                />
                <span aria-hidden="true">%</span>
              </div>
            </label>

            <label className="monte-carlo-setting-field">
              <span>Maximum annual return</span>
              <div className="monte-carlo-percent-input">
                <input
                  type="number"
                  min="-99"
                  max="200"
                  step="1"
                  value={Math.round(settings.maximumAnnualReturn * 100)}
                  onChange={(event) => onChange({ ...settings, maximumAnnualReturn: Number(event.target.value) / 100 })}
                />
                <span aria-hidden="true">%</span>
              </div>
            </label>
          </DashboardGrid>

          <div className="monte-carlo-settings-actions">
            <Button variant="secondary" size="small" onClick={onReset}>
              Reset defaults
            </Button>
          </div>
        </Stack>
      )}
    </Card>
  );
}
