import type { ModuleFieldConfig } from "../components/ModuleFormFields";
import type { TranslationKey } from "../i18n/config";

type Translate = (key: TranslationKey) => string;

export interface KarmaFormState {
  date: string;
  action: string;
  impact: string;
}

export const KARMA_INITIAL_FORM_STATE: KarmaFormState = {
  date: "",
  action: "",
  impact: "",
};

export interface BhaktiFormState {
  date: string;
  reflection: string;
  gratitude: string;
}

export const BHAKTI_INITIAL_FORM_STATE: BhaktiFormState = {
  date: "",
  reflection: "",
  gratitude: "",
};

export interface JnanaFormState {
  date: string;
  insight: string;
  contemplation: string;
}

export const JNANA_INITIAL_FORM_STATE: JnanaFormState = {
  date: "",
  insight: "",
  contemplation: "",
};

export interface DhyanaFormState {
  date: string;
  type: string;
  duration: number;
  notes: string;
}

export const DHYANA_INITIAL_FORM_STATE: DhyanaFormState = {
  date: "",
  type: "",
  duration: 0,
  notes: "",
};

export interface VasanaFormState {
  date: string;
  habit: string;
  tendency: string;
  notes: string;
}

export const VASANA_INITIAL_FORM_STATE: VasanaFormState = {
  date: "",
  habit: "",
  tendency: "",
  notes: "",
};

export interface DharmaFormState {
  date: string;
  goal: string;
  action: string;
  status: string;
}

export const DHARMA_INITIAL_FORM_STATE: DharmaFormState = {
  date: "",
  goal: "",
  action: "",
  status: "",
};

export function getKarmaFields(form: KarmaFormState, t: Translate): ModuleFieldConfig[] {
  return [
    { key: "date", kind: "date", tone: "emerald", value: form.date, required: true, ariaLabel: t("form.date") },
    {
      key: "action",
      kind: "text",
      tone: "primary",
      value: form.action,
      required: true,
      ariaLabel: t("form.action"),
      placeholder: t("form.placeholder.action"),
    },
    {
      key: "impact",
      kind: "text",
      tone: "accent",
      value: form.impact,
      required: true,
      ariaLabel: t("form.impact"),
      placeholder: t("form.placeholder.impact"),
    },
  ];
}

export function getBhaktiFields(form: BhaktiFormState, t: Translate): ModuleFieldConfig[] {
  return [
    { key: "date", kind: "date", tone: "rose", value: form.date, required: true, ariaLabel: t("form.date") },
    {
      key: "reflection",
      kind: "text",
      tone: "primary",
      value: form.reflection,
      required: true,
      ariaLabel: t("form.reflection"),
      placeholder: t("form.placeholder.reflection"),
    },
    {
      key: "gratitude",
      kind: "text",
      tone: "accent",
      value: form.gratitude,
      required: true,
      ariaLabel: t("form.gratitude"),
      placeholder: t("form.placeholder.gratitude"),
    },
  ];
}

export function getJnanaFields(form: JnanaFormState, t: Translate): ModuleFieldConfig[] {
  return [
    { key: "date", kind: "date", tone: "primary", value: form.date, required: true, ariaLabel: t("form.date") },
    {
      key: "insight",
      kind: "text",
      tone: "emerald",
      value: form.insight,
      required: true,
      ariaLabel: t("form.insight"),
      placeholder: t("form.placeholder.insight"),
    },
    {
      key: "contemplation",
      kind: "text",
      tone: "accent",
      value: form.contemplation,
      required: true,
      ariaLabel: t("form.contemplation"),
      placeholder: t("form.placeholder.contemplation"),
    },
  ];
}

export function getDhyanaFields(form: DhyanaFormState, t: Translate): ModuleFieldConfig[] {
  return [
    { key: "date", kind: "date", tone: "emerald", value: form.date, required: true, ariaLabel: t("form.date") },
    {
      key: "type",
      kind: "text",
      tone: "primary",
      value: form.type,
      required: true,
      ariaLabel: t("form.type"),
      placeholder: t("form.placeholder.type"),
    },
    {
      key: "duration",
      kind: "number",
      tone: "gold",
      value: form.duration || "",
      required: true,
      min: 1,
      ariaLabel: t("form.duration"),
      placeholder: t("form.placeholder.duration"),
    },
    {
      key: "notes",
      kind: "text",
      tone: "accent",
      value: form.notes,
      ariaLabel: t("form.notes"),
      placeholder: t("form.placeholder.notes"),
    },
  ];
}

export function getVasanaFields(form: VasanaFormState, t: Translate): ModuleFieldConfig[] {
  return [
    { key: "date", kind: "date", tone: "rose", value: form.date, required: true, ariaLabel: t("form.date") },
    {
      key: "habit",
      kind: "text",
      tone: "primary",
      value: form.habit,
      required: true,
      ariaLabel: t("form.habit"),
      placeholder: t("form.placeholder.habit"),
    },
    {
      key: "tendency",
      kind: "text",
      tone: "gold",
      value: form.tendency,
      required: true,
      ariaLabel: t("form.tendency"),
      placeholder: t("form.placeholder.tendency"),
    },
    {
      key: "notes",
      kind: "text",
      tone: "accent",
      value: form.notes,
      ariaLabel: t("form.notes"),
      placeholder: t("form.placeholder.vasanaNotes"),
    },
  ];
}

export function getDharmaFields(form: DharmaFormState, t: Translate): ModuleFieldConfig[] {
  return [
    { key: "date", kind: "date", tone: "indigo", value: form.date, required: true, ariaLabel: t("form.date") },
    {
      key: "goal",
      kind: "text",
      tone: "primary",
      value: form.goal,
      required: true,
      ariaLabel: t("form.goal"),
      placeholder: t("form.placeholder.goal"),
    },
    {
      key: "action",
      kind: "text",
      tone: "gold",
      value: form.action,
      required: true,
      ariaLabel: t("form.actionPlan"),
      placeholder: t("form.placeholder.actionPlan"),
    },
    {
      key: "status",
      kind: "text",
      tone: "accent",
      value: form.status,
      ariaLabel: t("form.status"),
      placeholder: t("form.placeholder.status"),
    },
  ];
}
