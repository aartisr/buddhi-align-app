"use client";

import { useEffect, type Dispatch, type SetStateAction } from "react";
import { useSearchParams } from "next/navigation";

import {
  readCopilotPracticeDraft,
  type CopilotPracticeDraftModuleKey,
} from "@/app/lib/copilot/module-drafts";

export function useCopilotPracticeDraft<T extends object>(
  moduleKey: CopilotPracticeDraftModuleKey,
  initialState: T,
  setForm: Dispatch<SetStateAction<T>>,
): void {
  const searchParams = useSearchParams();
  const serializedParams = searchParams?.toString() ?? "";

  useEffect(() => {
    const draft = readCopilotPracticeDraft({
      searchParams: new URLSearchParams(serializedParams),
      moduleKey,
      initialState,
    });

    if (Object.keys(draft).length === 0) return;
    setForm((current) => ({ ...current, ...draft }));
  }, [initialState, moduleKey, serializedParams, setForm]);
}
