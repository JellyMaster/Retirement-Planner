import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faChartLine,
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faClipboardList,
  faCodeCompare,
  faCompass,
  faDice,
  faHouse,
  faLightbulb,
  faPiggyBank,
  faReceipt,
  faSliders,
  faSterlingSign,
  faTriangleExclamation,
  faUmbrellaBeach,
  faWallet,
} from "@fortawesome/pro-solid-svg-icons";

/**
 * Project Polaris icon registry.
 *
 * Components should consume semantic icon names from this registry instead of
 * importing individual Font Awesome glyphs directly. This keeps the visual
 * language consistent and makes future glyph changes a single-file update.
 */
export const AppIcons = {
  navigation: {
    overview: faHouse,
    plan: faClipboardList,
    drawdown: faWallet,
    compare: faCodeCompare,
    explore: faCompass,
    guidance: faLightbulb,
  },
  concepts: {
    pension: faPiggyBank,
    income: faSterlingSign,
    projection: faChartLine,
    monteCarlo: faDice,
    tax: faReceipt,
    retirement: faUmbrellaBeach,
    settings: faSliders,
  },
  status: {
    success: faCircleCheck,
    warning: faCircleExclamation,
    danger: faTriangleExclamation,
    information: faCircleInfo,
  },
} as const satisfies Record<string, Record<string, IconDefinition>>;

export type AppIcon = IconDefinition;
