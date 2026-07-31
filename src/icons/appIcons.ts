import {
  faArrowTrendUp,
  faBriefcase,
  faBullseye,
  faCalendarDays,
  faChartArea,
  faChartLine,
  faCheck,
  faChevronDown,
  faCircleCheck,
  faCircleInfo,
  faClipboardList,
  faClock,
  faCoins,
  faExclamation,
  faFlagCheckered,
  faGear,
  faHeartPulse,
  faHouse,
  faLandmark,
  faLightbulb,
  faMinus,
  faMoon,
  faPercent,
  faPiggyBank,
  faPlus,
  faScaleBalanced,
  faSliders,
  faSterlingSign,
  faSunBright,
  faTable,
  faUser,
  faWallet,
} from "@fortawesome/pro-solid-svg-icons";

export const AppIcons = {
  // Navigation
  home: faHouse,

  // Planner
  user: faUser,
  employment: faBriefcase,
  pension: faLandmark,
  retirement: faPiggyBank,
  goals: faBullseye,

  // Finance
  money: faSterlingSign,
  wallet: faWallet,
  coins: faCoins,

  // Charts and growth
  chart: faChartArea,
  chartLine: faChartLine,
  growth: faArrowTrendUp,

  // Comparison and fees
  comparison: faScaleBalanced,
  fees: faPercent,

  // Dashboard
  health: faHeartPulse,
  recommendations: faLightbulb,
  milestones: faFlagCheckered,
  assumptions: faClipboardList,
  projection: faTable,

  // Status and controls
  check: faCheck,
  success: faCircleCheck,
  warning: faExclamation,
  minus: faMinus,
  plus: faPlus,
  chevronDown: faChevronDown,
  information: faCircleInfo,
  calendar: faCalendarDays,
  clock: faClock,
  sun: faSunBright,
  moon: faMoon,
  settings: faSliders,
  gear: faGear,
} as const;
