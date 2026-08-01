import { useCallback, useMemo, useState } from "react";

import type { PensionInputs } from "../../engine/models/PensionInputs";
import { savePensionInputs } from "../../state/planStorage";

export interface PlanPreviewState {
  label: string;
  baselineInputs: PensionInputs;
  previewInputs: PensionInputs;
}

interface UsePlanPreviewOptions {
  committedInputs: PensionInputs;
  onCommit: (inputs: PensionInputs) => void;
}

function commitPlan(
  inputs: PensionInputs,
  onCommit: (inputs: PensionInputs) => void,
): void {
  const committed = { ...inputs };
  savePensionInputs(committed);
  onCommit(committed);
}

export function usePlanPreview({
  committedInputs,
  onCommit,
}: UsePlanPreviewOptions) {
  const [preview, setPreview] = useState<PlanPreviewState | null>(null);

  const effectiveInputs = preview?.previewInputs ?? committedInputs;

  const startPreview = useCallback(
    (label: string, previewInputs: PensionInputs) => {
      setPreview((current) => ({
        label,
        baselineInputs: current?.baselineInputs ?? { ...committedInputs },
        previewInputs: { ...previewInputs },
      }));
    },
    [committedInputs],
  );

  const updateEffectiveInputs = useCallback(
    (nextInputs: PensionInputs) => {
      if (preview) {
        setPreview({
          ...preview,
          previewInputs: { ...nextInputs },
        });
        return;
      }

      commitPlan(nextInputs, onCommit);
    },
    [onCommit, preview],
  );

  const keepPreview = useCallback(() => {
    if (!preview) return;
    commitPlan(preview.previewInputs, onCommit);
    setPreview(null);
  }, [onCommit, preview]);

  const discardPreview = useCallback(() => {
    setPreview(null);
  }, []);

  return useMemo(
    () => ({
      preview,
      isPreviewing: preview !== null,
      effectiveInputs,
      startPreview,
      updateEffectiveInputs,
      keepPreview,
      discardPreview,
    }),
    [
      discardPreview,
      effectiveInputs,
      keepPreview,
      preview,
      startPreview,
      updateEffectiveInputs,
    ],
  );
}
