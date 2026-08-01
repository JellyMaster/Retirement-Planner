import { calculateRetirementHealth } from "../../components/goals/calculateRetirementHealth";
import { createSustainabilityDrawdownInputs } from "../../components/sustainability/createSustainabilityDrawdownInputs";
import { MonteCarloDrawdownEngine } from "../monte-carlo-drawdown/MonteCarloDrawdownEngine";
import { MonteCarloEngine } from "../monte-carlo/MonteCarloEngine";
import { calculateMonteCarloTarget } from "../monte-carlo/calculateMonteCarloTarget";
import { calculateWeightedRetirementScore } from "../retirement-health/calculateWeightedRetirementScore";
import { RetirementProjectionEngine } from "../services/RetirementProjectionEngine";
import { PensionInputsValidator } from "../validators/PensionInputsValidator";
import { calculateRecommendationImpact } from "./RecommendationImpactCalculator";
import { rankRecommendations } from "./RecommendationRanking";
import { generateRecommendationScenarios } from "./RecommendationScenarioGenerator";
import type {
  RecommendationBaseline,
  RecommendationEngineConfig,
  RecommendationEngineResult,
  RecommendationMetrics,
  RetirementRecommendation,
} from "./RecommendationTypes";

const DEFAULT_MONTE_CARLO_SIMULATIONS = 750;
const DEFAULT_SUSTAINABILITY_SIMULATIONS = 500;
const DEFAULT_SEED = 12_345;
const DEFAULT_VOLATILITY = 0.12;
const DEFAULT_MAXIMUM_RECOMMENDATIONS = 5;

interface ResolvedSettings {
  monteCarloSimulations: number;
  sustainabilitySimulations: number;
  seed: number;
  annualVolatility: number;
  sustainabilityEndAge: number;
  includeSustainability: boolean;
  maximumRecommendations: number;
}

function resolveSettings(config: RecommendationEngineConfig): ResolvedSettings {
  return {
    monteCarloSimulations:
      config.monteCarloSimulations ?? DEFAULT_MONTE_CARLO_SIMULATIONS,
    sustainabilitySimulations:
      config.sustainabilitySimulations ?? DEFAULT_SUSTAINABILITY_SIMULATIONS,
    seed: config.monteCarloSeed ?? DEFAULT_SEED,
    annualVolatility: config.annualVolatility ?? DEFAULT_VOLATILITY,
    sustainabilityEndAge: Math.max(
      config.inputs.retirementAge + 1,
      config.sustainabilityEndAge ?? 95,
    ),
    includeSustainability: config.includeSustainability ?? true,
    maximumRecommendations:
      config.maximumRecommendations ?? DEFAULT_MAXIMUM_RECOMMENDATIONS,
  };
}

function validateSettings(settings: ResolvedSettings): void {
  if (
    !Number.isInteger(settings.maximumRecommendations) ||
    settings.maximumRecommendations < 1 ||
    settings.maximumRecommendations > 20
  ) {
    throw new RangeError(
      "Maximum recommendations must be an integer between 1 and 20.",
    );
  }
}

export class RecommendationEngine {
  public static calculate(
    config: RecommendationEngineConfig,
  ): RecommendationEngineResult {
    PensionInputsValidator.validate(config.inputs);
    const settings = resolveSettings(config);
    validateSettings(settings);

    const target = calculateMonteCarloTarget(config.goals);
    const baselineProjection = RetirementProjectionEngine.calculate(config.inputs);
    const baselineHealth = calculateRetirementHealth(
      baselineProjection,
      config.goals,
    );
    const baselineWeighted = calculateWeightedRetirementScore({
      inputs: config.inputs,
      result: baselineProjection,
      goals: config.goals,
    });
    const baselineMetrics = this.calculateMetrics(
      config.inputs,
      config.goals,
      baselineProjection,
      baselineHealth.score,
      baselineWeighted.weightedScore,
      target.targetRealBalance,
      settings,
    );
    const baseline: RecommendationBaseline = {
      inputs: config.inputs,
      goals: config.goals,
      metrics: baselineMetrics,
      weightedBreakdown: baselineWeighted,
    };

    const recommendations: RetirementRecommendation[] = [];

    for (const scenario of generateRecommendationScenarios(config.inputs)) {
      try {
        PensionInputsValidator.validate(scenario.inputs);
        const projection = RetirementProjectionEngine.calculate(scenario.inputs);
        const health = calculateRetirementHealth(projection, config.goals);
        const weighted = calculateWeightedRetirementScore({
          inputs: scenario.inputs,
          result: projection,
          goals: config.goals,
        });
        const metrics = this.calculateMetrics(
          scenario.inputs,
          config.goals,
          projection,
          health.score,
          weighted.weightedScore,
          target.targetRealBalance,
          settings,
        );
        const impact = calculateRecommendationImpact({
          scenario,
          baseline: baselineMetrics,
          candidate: metrics,
          baselineHealth,
          candidateHealth: health,
        });

        if (
          impact.projectedPotChange > 0 ||
          impact.readinessScoreChange > 0 ||
          impact.weightedScoreChange > 0 ||
          impact.monteCarloConfidenceChange > 0 ||
          (impact.sustainabilityProbabilityChange ?? 0) > 0
        ) {
          recommendations.push({ ...scenario, metrics, impact });
        }
      } catch {
        // A generated candidate can become invalid near a model boundary
        // (for example retirement age 100). Invalid candidates are omitted.
      }
    }

    return {
      baseline,
      recommendations: rankRecommendations(recommendations).slice(
        0,
        settings.maximumRecommendations,
      ),
    };
  }

  private static calculateMetrics(
    inputs: RecommendationEngineConfig["inputs"],
    goals: RecommendationEngineConfig["goals"],
    projection: RecommendationMetrics["projection"],
    readinessScore: number,
    weightedScore: number,
    targetRealBalance: number,
    settings: ResolvedSettings,
  ): RecommendationMetrics {
    const monteCarlo = MonteCarloEngine.calculate({
      pensionInputs: inputs,
      simulations: settings.monteCarloSimulations,
      seed: settings.seed,
      annualVolatility: settings.annualVolatility,
      targetRealBalance,
    });

    let sustainabilityProbability: number | undefined;
    if (settings.includeSustainability) {
      const drawdownInputs = createSustainabilityDrawdownInputs(
        inputs,
        projection,
        goals,
        { endAge: settings.sustainabilityEndAge },
      );
      const sustainability = new MonteCarloDrawdownEngine().calculate({
        drawdownInputs,
        simulations: settings.sustainabilitySimulations,
        seed: settings.seed,
        annualVolatility: settings.annualVolatility,
      });
      sustainabilityProbability = sustainability.survivalProbability;
    }

    return {
      projection,
      readinessScore,
      weightedScore,
      monteCarloConfidence: monteCarlo.successProbability ?? 0,
      sustainabilityProbability,
    };
  }
}
