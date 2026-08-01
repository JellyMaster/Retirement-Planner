import {
  BarChart3,
  ClipboardList,
  Landmark,
  LayoutDashboard,
  ReceiptText,
} from "lucide-react";

export type DrawdownWorkspaceSection =
  | "overview"
  | "income"
  | "balance"
  | "details"
  | "assumptions";

interface DrawdownWorkspaceNavigationProps {
  value: DrawdownWorkspaceSection;
  onChange: (section: DrawdownWorkspaceSection) => void;
}

const sections: Array<{
  id: DrawdownWorkspaceSection;
  label: string;
  description: string;
  icon: typeof LayoutDashboard;
}> = [
  {
    id: "overview",
    label: "Overview",
    description: "Sustainability and key outcomes",
    icon: LayoutDashboard,
  },
  {
    id: "income",
    label: "Income",
    description: "Income, tax and shortfalls",
    icon: ReceiptText,
  },
  {
    id: "balance",
    label: "Pension balance",
    description: "Portfolio value over time",
    icon: BarChart3,
  },
  {
    id: "details",
    label: "Details",
    description: "Year-by-year projection",
    icon: ClipboardList,
  },
  {
    id: "assumptions",
    label: "Assumptions",
    description: "Methodology and inputs",
    icon: Landmark,
  },
];

export function DrawdownWorkspaceNavigation({
  value,
  onChange,
}: DrawdownWorkspaceNavigationProps) {
  return (
    <nav className="drawdown-workspace-navigation" aria-label="Drawdown analysis">
      {sections.map((section) => {
        const Icon = section.icon;
        const active = value === section.id;

        return (
          <button
            key={section.id}
            type="button"
            className={active ? "drawdown-workspace-nav-item active" : "drawdown-workspace-nav-item"}
            aria-current={active ? "page" : undefined}
            onClick={() => onChange(section.id)}
          >
            <span className="drawdown-workspace-nav-icon" aria-hidden="true">
              <Icon size={18} />
            </span>
            <span className="drawdown-workspace-nav-copy">
              <strong>{section.label}</strong>
              <small>{section.description}</small>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
