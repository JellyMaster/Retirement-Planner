import { useTheme } from "./useTheme";

export interface ChartTheme {
  grid: string;
  text: string;
  primary: string;
  secondary: string;
  tertiary: string;
  fees: string;
  tooltipBackground: string;
  tooltipBorder: string;
  tooltipText: string;
  cursor: string;
}

const NOEL_CHART_THEME: ChartTheme = {
  grid: "#c7e2e6",
  text: "#5f7b84",
  primary: "#66b9d2",
  secondary: "#eeb9c1",
  tertiary: "#7dc8b8",
  fees: "#789099",
  tooltipBackground: "#ffffff",
  tooltipBorder: "#9dcfd7",
  tooltipText: "#244552",
  cursor: "rgb(102 185 210 / 10%)",
};

const OLIVIA_CHART_THEME: ChartTheme = {
  grid: "#4b4340",
  text: "#bcb4b0",
  primary: "#deaf9d",
  secondary: "#f2efed",
  tertiary: "#a39f9d",
  fees: "#746b68",
  tooltipBackground: "#2a2626",
  tooltipBorder: "#665955",
  tooltipText: "#f2efed",
  cursor: "rgb(222 175 157 / 10%)",
};

export function useChartTheme(): ChartTheme {
  const { theme } = useTheme();

  return theme === "dark"
    ? OLIVIA_CHART_THEME
    : NOEL_CHART_THEME;
}
