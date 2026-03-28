import { describe, expect, it } from "vitest";

import type { TranslationKey } from "../i18n/config";
import {
  BHAKTI_INITIAL_FORM_STATE,
  DHARMA_INITIAL_FORM_STATE,
  DHYANA_INITIAL_FORM_STATE,
  getBhaktiFields,
  getDharmaFields,
  getDhyanaFields,
  getKarmaFields,
  getVasanaFields,
  JNANA_INITIAL_FORM_STATE,
  KARMA_INITIAL_FORM_STATE,
  VASANA_INITIAL_FORM_STATE,
} from "./module-fields";

const translate = (key: TranslationKey) => key;

describe("module field config", () => {
  it("exposes reusable initial form state constants", () => {
    expect(KARMA_INITIAL_FORM_STATE).toEqual({ date: "", action: "", impact: "" });
    expect(BHAKTI_INITIAL_FORM_STATE).toEqual({ date: "", reflection: "", gratitude: "" });
    expect(JNANA_INITIAL_FORM_STATE).toEqual({ date: "", insight: "", contemplation: "" });
    expect(DHYANA_INITIAL_FORM_STATE).toEqual({ date: "", type: "", duration: 0, notes: "" });
    expect(VASANA_INITIAL_FORM_STATE).toEqual({ date: "", habit: "", tendency: "", notes: "" });
    expect(DHARMA_INITIAL_FORM_STATE).toEqual({ date: "", goal: "", action: "", status: "" });
  });

  it("builds karma fields with translated labels and placeholders", () => {
    const fields = getKarmaFields(
      { date: "2026-03-28", action: "Serve", impact: "Helped 20 people" },
      translate,
    );

    expect(fields).toEqual([
      {
        key: "date",
        kind: "date",
        tone: "emerald",
        value: "2026-03-28",
        required: true,
        ariaLabel: "form.date",
      },
      {
        key: "action",
        kind: "text",
        tone: "primary",
        value: "Serve",
        required: true,
        ariaLabel: "form.action",
        placeholder: "form.placeholder.action",
      },
      {
        key: "impact",
        kind: "text",
        tone: "accent",
        value: "Helped 20 people",
        required: true,
        ariaLabel: "form.impact",
        placeholder: "form.placeholder.impact",
      },
    ]);
  });

  it("maps zero dhyana duration to an empty numeric field value", () => {
    const fields = getDhyanaFields(DHYANA_INITIAL_FORM_STATE, translate);

    expect(fields[2]).toEqual({
      key: "duration",
      kind: "number",
      tone: "gold",
      value: "",
      required: true,
      min: 1,
      ariaLabel: "form.duration",
      placeholder: "form.placeholder.duration",
    });
  });

  it("keeps optional notes and status fields non-required", () => {
    const vasanaFields = getVasanaFields(
      { date: "2026-03-28", habit: "Scrolling", tendency: "Avoidance", notes: "Triggered by stress" },
      translate,
    );
    const dharmaFields = getDharmaFields(
      { date: "2026-03-28", goal: "Teach", action: "Prepare", status: "Planned" },
      translate,
    );
    const bhaktiFields = getBhaktiFields(
      { date: "2026-03-28", reflection: "Stillness", gratitude: "Family" },
      translate,
    );

    expect(vasanaFields[3]).not.toHaveProperty("required", true);
    expect(dharmaFields[3]).not.toHaveProperty("required", true);
    expect(bhaktiFields[2]).toHaveProperty("required", true);
  });
});