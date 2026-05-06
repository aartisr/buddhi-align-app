import type { CopilotAction, CopilotDocument, CopilotPageContext } from "./types";

export type CopilotPracticeDraftModuleKey =
  | "karma"
  | "bhakti"
  | "jnana"
  | "dhyana"
  | "vasana"
  | "dharma";

type PracticeDraftModuleConfig = {
  label: string;
  path: string;
  aliases: string[];
  fields: Record<string, string | number | ((query: string) => string | number)>;
};

const textMaxLength = 700;
const numberMaxValue = 1440;

const editReminder = "Review and edit this copilot draft before saving.";

export const COPILOT_PRACTICE_DRAFT_MODULES: Record<CopilotPracticeDraftModuleKey, PracticeDraftModuleConfig> = {
  karma: {
    label: "Karma Yoga",
    path: "/karma-yoga",
    aliases: ["karma", "service", "seva", "action", "impact"],
    fields: {
      action: (query) => cleanDraftText(query),
      impact: editReminder,
    },
  },
  bhakti: {
    label: "Bhakti Journal",
    path: "/bhakti-journal",
    aliases: ["bhakti", "gratitude", "devotion", "prayer", "thankful"],
    fields: {
      reflection: (query) => cleanDraftText(query),
      gratitude: editReminder,
    },
  },
  jnana: {
    label: "Jnana Reflection",
    path: "/jnana-reflection",
    aliases: ["jnana", "wisdom", "insight", "reflection", "self-inquiry", "inquiry", "contemplation"],
    fields: {
      insight: (query) => cleanDraftText(query),
      contemplation: editReminder,
    },
  },
  dhyana: {
    label: "Dhyana Meditation",
    path: "/dhyana-meditation",
    aliases: ["dhyana", "meditation", "meditate", "mindfulness", "breath", "breathing"],
    fields: {
      type: "Meditation",
      duration: 10,
      notes: (query) => cleanDraftText(query),
    },
  },
  vasana: {
    label: "Vasana Tracker",
    path: "/vasana-tracker",
    aliases: ["vasana", "habit", "pattern", "tendency", "trigger"],
    fields: {
      habit: (query) => cleanDraftText(query),
      tendency: editReminder,
      notes: (query) => cleanDraftText(query),
    },
  },
  dharma: {
    label: "Dharma Planner",
    path: "/dharma-planner",
    aliases: ["dharma", "goal", "intention", "purpose", "plan", "planning"],
    fields: {
      goal: (query) => cleanDraftText(query),
      action: editReminder,
      status: "Draft",
    },
  },
};

const draftIntentMarkers = [
  "add",
  "create",
  "draft",
  "entry",
  "log",
  "new",
  "record",
  "save",
  "start",
  "track",
  "write",
];

function cleanDraftText(value: string): string {
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, textMaxLength);
}

function isSupportedDraftModuleKey(value: string | undefined): value is CopilotPracticeDraftModuleKey {
  return Boolean(value && value in COPILOT_PRACTICE_DRAFT_MODULES);
}

function hasPracticeDraftIntent(query: string): boolean {
  const normalized = query.toLowerCase();
  return draftIntentMarkers.some((marker) => normalized.includes(marker));
}

function moduleFromQuery(query: string): CopilotPracticeDraftModuleKey | null {
  const normalized = query.toLowerCase();
  for (const [moduleKey, config] of Object.entries(COPILOT_PRACTICE_DRAFT_MODULES)) {
    if (config.aliases.some((alias) => normalized.includes(alias))) {
      return moduleKey as CopilotPracticeDraftModuleKey;
    }
  }
  return null;
}

function moduleFromContext(context?: CopilotPageContext): CopilotPracticeDraftModuleKey | null {
  if (isSupportedDraftModuleKey(context?.moduleKey)) {
    return context.moduleKey;
  }

  const path = context?.path?.split("?")[0]?.replace(/\/$/, "");
  if (!path) return null;

  for (const [moduleKey, config] of Object.entries(COPILOT_PRACTICE_DRAFT_MODULES)) {
    if (config.path === path) {
      return moduleKey as CopilotPracticeDraftModuleKey;
    }
  }

  return null;
}

function moduleFromDocuments(documents: CopilotDocument[]): CopilotPracticeDraftModuleKey | null {
  for (const document of documents) {
    if (isSupportedDraftModuleKey(document.moduleKey)) {
      return document.moduleKey;
    }
  }
  return null;
}

function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseDraftFieldValue(key: string, initialValue: unknown, rawValue: string): unknown {
  if (typeof initialValue === "number") {
    const parsed = Number(rawValue);
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= numberMaxValue ? parsed : undefined;
  }

  if (typeof initialValue !== "string") return undefined;

  const cleaned = cleanDraftText(rawValue);
  if (key === "date" && cleaned && !/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return undefined;
  }

  return cleaned;
}

export function buildCopilotPracticeDraftHref(input: {
  moduleKey: CopilotPracticeDraftModuleKey;
  query: string;
  date?: string;
}): string {
  const config = COPILOT_PRACTICE_DRAFT_MODULES[input.moduleKey];
  const params = new URLSearchParams({
    source: "copilot",
    draft: "practice",
    module: input.moduleKey,
    date: input.date ?? todayDate(),
  });

  for (const [field, value] of Object.entries(config.fields)) {
    const resolved = typeof value === "function" ? value(input.query) : value;
    params.set(field, String(resolved));
  }

  return `${config.path}?${params.toString()}`;
}

export function buildCopilotPracticeDraftAction(input: {
  query: string;
  context?: CopilotPageContext;
  documents: CopilotDocument[];
}): CopilotAction | null {
  if (!hasPracticeDraftIntent(input.query)) return null;

  const moduleKey = moduleFromQuery(input.query)
    ?? moduleFromContext(input.context)
    ?? moduleFromDocuments(input.documents);
  if (!moduleKey) return null;

  const config = COPILOT_PRACTICE_DRAFT_MODULES[moduleKey];
  return {
    type: "draft_practice_entry",
    label: `Draft ${config.label} Entry`,
    href: buildCopilotPracticeDraftHref({ moduleKey, query: input.query }),
    moduleKey,
  };
}

export function readCopilotPracticeDraft<T extends object>(input: {
  searchParams: Pick<URLSearchParams, "get"> | null | undefined;
  moduleKey: CopilotPracticeDraftModuleKey;
  initialState: T;
}): Partial<T> {
  const { searchParams, moduleKey, initialState } = input;
  if (!searchParams) return {};
  if (searchParams.get("source") !== "copilot") return {};
  if (searchParams.get("draft") !== "practice") return {};
  if (searchParams.get("module") !== moduleKey) return {};

  const draft: Partial<T> = {};

  for (const key of Object.keys(initialState) as Array<keyof T>) {
    const rawValue = searchParams.get(String(key));
    if (rawValue === null) continue;

    const parsed = parseDraftFieldValue(String(key), initialState[key], rawValue);
    if (parsed !== undefined) draft[key] = parsed as T[typeof key];
  }

  return draft;
}
