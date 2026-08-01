import type {
  ScenarioChartPoint,
  ScenarioChartSeries,
} from "./createScenarioChartSeries";

export interface ScenarioCrossover {
  age: number;
  alternativeValue: number;
  activeValue: number;
}

export function findScenarioCrossover(
  alternative: ScenarioChartSeries,
  active: ScenarioChartSeries,
): ScenarioCrossover | null {
  const activeByAge = new Map<number, ScenarioChartPoint>(
    active.points.map((point) => [point.age, point]),
  );

  let previousDifference: number | null = null;

  for (const point of alternative.points) {
    const activePoint = activeByAge.get(point.age);
    if (!activePoint) continue;

    const difference = point.real - activePoint.real;
    if (previousDifference !== null && previousDifference <= 0 && difference > 0) {
      return {
        age: point.age,
        alternativeValue: point.real,
        activeValue: activePoint.real,
      };
    }

    previousDifference = difference;
  }

  return null;
}
