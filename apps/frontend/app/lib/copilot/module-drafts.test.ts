import { describe, expect, it } from "vitest";

import {
  buildCopilotPracticeDraftAction,
  readCopilotPracticeDraft,
} from "./module-drafts";

describe("buildCopilotPracticeDraftAction", () => {
  it("builds a confirmed Bhakti draft-entry navigation action", () => {
    const action = buildCopilotPracticeDraftAction({
      query: "Draft a gratitude entry about patience",
      documents: [],
    });

    expect(action).toEqual(expect.objectContaining({
      type: "draft_practice_entry",
      label: "Draft Bhakti Journal Entry",
      moduleKey: "bhakti",
    }));
    expect(action?.href).toContain("/bhakti-journal?");
    expect(action?.href).toContain("source=copilot");
    expect(action?.href).toContain("draft=practice");
    expect(action?.href).toContain("module=bhakti");
  });

  it("does not build a draft action unless the user asks to start or write one", () => {
    const action = buildCopilotPracticeDraftAction({
      query: "What is Bhakti Journal for?",
      documents: [],
    });

    expect(action).toBeNull();
  });
});

describe("readCopilotPracticeDraft", () => {
  it("accepts bounded matching query parameters for a module form", () => {
    const draft = readCopilotPracticeDraft({
      moduleKey: "dhyana",
      initialState: { date: "", type: "", duration: 0, notes: "" },
      searchParams: new URLSearchParams({
        source: "copilot",
        draft: "practice",
        module: "dhyana",
        date: "2026-05-06",
        type: "Breath meditation",
        duration: "15",
        notes: "Settle attention before work",
      }),
    });

    expect(draft).toEqual({
      date: "2026-05-06",
      type: "Breath meditation",
      duration: 15,
      notes: "Settle attention before work",
    });
  });

  it("ignores mismatched modules and invalid numeric values", () => {
    const mismatched = readCopilotPracticeDraft({
      moduleKey: "karma",
      initialState: { date: "", action: "", impact: "" },
      searchParams: new URLSearchParams("source=copilot&draft=practice&module=bhakti&action=Serve"),
    });
    const invalidNumber = readCopilotPracticeDraft({
      moduleKey: "dhyana",
      initialState: { date: "", type: "", duration: 0, notes: "" },
      searchParams: new URLSearchParams("source=copilot&draft=practice&module=dhyana&duration=99999&type=Sit"),
    });

    expect(mismatched).toEqual({});
    expect(invalidNumber).toEqual({ type: "Sit" });
  });
});
