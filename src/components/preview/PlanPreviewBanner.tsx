import type { PensionInputs } from "../../engine/models/PensionInputs";
import { AppIcons } from "../../icons";
import { Button, Card, StatusBadge } from "../ui";
import { PreviewChangedFields } from "./PreviewChangedFields";

interface PlanPreviewBannerProps {
  label: string;
  baselineInputs: PensionInputs;
  previewInputs: PensionInputs;
  onKeep: () => void;
  onDiscard: () => void;
}

export function PlanPreviewBanner({
  label,
  baselineInputs,
  previewInputs,
  onKeep,
  onDiscard,
}: PlanPreviewBannerProps) {
  return (
    <Card
      className="plan-preview-banner"
      tone="accent"
      padding="medium"
      role="status"
      aria-label={`Preview mode: ${label}`}
    >
      <div className="plan-preview-banner-copy">
        <div className="plan-preview-banner-title-row">
          <StatusBadge tone="accent" icon={AppIcons.information}>
            Preview mode
          </StatusBadge>
          <strong>{label}</strong>
        </div>
        <p>
          All workspace results are temporarily using this scenario. Your
          original plan remains unchanged until you keep it.
        </p>
        <PreviewChangedFields
          baseline={baselineInputs}
          preview={previewInputs}
        />
      </div>

      <div className="plan-preview-banner-actions">
        <Button
          variant="primary"
          icon={AppIcons.check}
          onClick={onKeep}
        >
          Keep changes
        </Button>
        <Button
          variant="secondary"
          icon={AppIcons.minus}
          onClick={onDiscard}
        >
          Discard preview
        </Button>
      </div>
    </Card>
  );
}
