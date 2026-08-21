interface ExpandCollapseIndicatorProps {
  expanded?: boolean;
}

export function ExpandCollapseIndicator({
  expanded,
}: ExpandCollapseIndicatorProps) {
  if (typeof expanded === "boolean") {
    return (
      <span className="ui-expand-collapse-indicator" aria-hidden="true">
        {expanded ? "−" : "+"}
      </span>
    );
  }

  return (
    <span className="ui-expand-collapse-indicator" aria-hidden="true">
      <span className="ui-disclosure-when-closed">+</span>
      <span className="ui-disclosure-when-open">−</span>
    </span>
  );
}
