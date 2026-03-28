export const SHISHUBHARATI_LANGUAGE_RESEARCH = {
  lastVerified: "2026-03-27",
  primarySource: "https://www.shishubharati.net/classes/",
  corroboratingSources: [
    "https://www.shishubharati.net/aboutus/",
    "https://www.shishubharati.net/kannada/",
    "https://www.shishubharati.net/marathi/",
    "https://www.shishubharati.net/telugu/",
    "https://www.shishubharati.net/hindi/",
  ],
  classesPageLanguages: ["kannada", "sanskrit", "marathi", "telugu", "tamil", "gujarati", "hindi"],
  aboutUsPrograms: ["gujarati", "hindi", "marathi", "tamil", "telugu", "kannada"],
} as const;

export const LOCALE_DEFINITIONS = [
  { code: "en", label: "English", nativeLabel: "English", htmlLang: "en-US", shishubharatiLanguage: false },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", htmlLang: "hi-IN", shishubharatiLanguage: true },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ", htmlLang: "kn-IN", shishubharatiLanguage: true },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", htmlLang: "ta-IN", shishubharatiLanguage: true },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు", htmlLang: "te-IN", shishubharatiLanguage: true },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी", htmlLang: "mr-IN", shishubharatiLanguage: true },
  { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી", htmlLang: "gu-IN", shishubharatiLanguage: true },
  { code: "sa", label: "Sanskrit", nativeLabel: "संस्कृतम्", htmlLang: "sa-IN", shishubharatiLanguage: true },
] as const;

export type Locale = (typeof LOCALE_DEFINITIONS)[number]["code"];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_OPTIONS = LOCALE_DEFINITIONS.map((item) => ({
  code: item.code,
  label: `${item.nativeLabel} (${item.label})`,
}));

export type TranslationDict = Record<string, string>;

const EN_MESSAGES: TranslationDict = {
  "app.title": "Buddhi Align App",
  "app.description": "A subtle, spiritual, and professional journaling and analytics app.",
  "app.brand": "Buddhi Align App",
  "app.dashboard": "Buddhi Dashboard",
  "app.language": "Language",
  "app.loading": "Loading...",
  "app.add": "Add",
  "app.delete": "Delete",
  "app.retry": "Retry",
  "app.error": "Error",
  "app.backgroundMusic": "Background music",
  "app.play": "Play",
  "app.pause": "Pause",
  "app.musicPrompt": "Click Play to enjoy soothing music",
  "footer.dedicatedTo": "Dedicated to",
  "footer.logoAlt": "Shishu Bharati School Logo",
  "footer.gratitude": "Grateful to its teachers and volunteers.",
  "footer.rights": "All rights reserved.",
  "layout.home": "Home",
  "layout.module.karma": "Karma Yoga",
  "layout.module.bhakti": "Bhakti Journal",
  "layout.module.jnana": "Jnana Reflection",
  "layout.module.dhyana": "Dhyana Meditation",
  "layout.module.vasana": "Vasana Tracker",
  "layout.module.dharma": "Dharma Planner",
  "dashboard.welcome": "Welcome, {{name}}",
  "dashboard.defaultUser": "Seeker",
  "dashboard.subtitle": "Your unified overview for self-development and spiritual growth.",
  "module.karma.title": "Karma Yoga Tracker",
  "module.karma.description": "Track your selfless actions and service.",
  "module.bhakti.title": "Bhakti Journal",
  "module.bhakti.description": "Reflect on devotion and gratitude.",
  "module.jnana.title": "Jnana Reflection",
  "module.jnana.description": "Capture insights and contemplations.",
  "module.dhyana.title": "Dhyana Meditation",
  "module.dhyana.description": "Guided and self-led meditation tools.",
  "module.vasana.title": "Vasana Tracker",
  "module.vasana.description": "Monitor habits and tendencies.",
  "module.dharma.title": "Dharma Planner",
  "module.dharma.description": "Align goals and actions with your purpose.",
  "module.motivation.title": "Motivation & Analytics",
  "module.motivation.description": "Deep insights and inspiration.",
  "form.date": "Date",
  "form.action": "Action",
  "form.impact": "Impact",
  "form.reflection": "Reflection",
  "form.gratitude": "Gratitude",
  "form.insight": "Insight",
  "form.contemplation": "Contemplation",
  "form.type": "Type",
  "form.duration": "Duration",
  "form.notes": "Notes",
  "form.habit": "Habit",
  "form.tendency": "Tendency",
  "form.goal": "Goal",
  "form.status": "Status",
  "form.actionPlan": "Action Plan",
  "form.placeholder.action": "Action (e.g. Serve, Donate)",
  "form.placeholder.impact": "Impact (e.g. Helped 20 people)",
  "form.placeholder.reflection": "Reflection (e.g. Felt gratitude)",
  "form.placeholder.gratitude": "Gratitude (e.g. Family, health)",
  "form.placeholder.insight": "Insight (e.g. True knowledge...)",
  "form.placeholder.contemplation": "Contemplation (e.g. What is my true nature?)",
  "form.placeholder.type": "Type (e.g. Guided, Self-led)",
  "form.placeholder.duration": "Duration (min)",
  "form.placeholder.notes": "Notes (e.g. Deep relaxation)",
  "form.placeholder.habit": "Habit (vasana)",
  "form.placeholder.tendency": "Tendency",
  "form.placeholder.vasanaNotes": "Notes (e.g. Trigger, insight)",
  "form.placeholder.goal": "Goal (dharma)",
  "form.placeholder.actionPlan": "Action Plan",
  "form.placeholder.status": "Status (e.g. Planned, In Progress, Done)",
  "list.empty.karma": "No entries yet. Start by adding your first act of service.",
  "list.empty.bhakti": "No journal entries yet. Start by adding your first reflection.",
  "list.empty.jnana": "No reflections yet. Start by adding your first insight.",
  "list.empty.dhyana": "No meditation sessions yet. Start by adding your first session.",
  "list.empty.vasana": "No vasana entries yet. Start by adding your first observation.",
  "list.empty.dharma": "No plans yet. Start by adding your first dharma goal.",
  "label.gratitude": "Gratitude",
  "label.contemplation": "Contemplation",
  "label.durationUnit": "min",
  "motivation.title": "Motivation for Inner Excellence",
  "motivation.inspireAgain": "Inspire Me Again",
  "motivation.chartTitle": "Module Activity Chart",
  "motivation.entries": "Entries",
  "motivation.moduleActivityOverview": "Module Activity Overview",
  "motivation.streak": "Streak",
  "motivation.totalEntries": "Total Entries",
  "motivation.days": "days",
  "motivation.howTo": "How to Achieve Spiritual Excellence?",
  "motivation.tipTitle": "Deep Motivation Tip",
  "motivation.tipBody": "True transformation is a journey of small, consistent steps. Visualize your highest self, and let every action, thought, and intention move you closer to that vision. Use your analytics not just to measure, but to inspire and realign your purpose.",
  "motivation.howto.1": "Reflect daily on your actions, thoughts, and intentions.",
  "motivation.howto.2": "Track your progress in all six modules for holistic growth.",
  "motivation.howto.3": "Celebrate your streaks and milestones-consistency is key.",
  "motivation.howto.4": "Let ancient wisdom and modern analytics guide your journey.",
  "motivation.howto.5": "Remember: The journey itself is the reward.",
};

const HI_MESSAGES: TranslationDict = {
  "app.title": "बुद्धि एलाइन ऐप",
  "app.brand": "बुद्धि एलाइन ऐप",
  "app.dashboard": "बुद्धि डैशबोर्ड",
  "app.language": "भाषा",
  "app.loading": "लोड हो रहा है...",
  "app.add": "जोड़ें",
  "app.delete": "हटाएं",
  "app.retry": "पुनः प्रयास करें",
  "app.error": "त्रुटि",
  "app.backgroundMusic": "पृष्ठभूमि संगीत",
  "app.play": "चलाएं",
  "app.pause": "रोकें",
  "footer.dedicatedTo": "समर्पित",
  "footer.logoAlt": "शिशु भारती स्कूल लोगो",
  "footer.gratitude": "शिक्षकों और स्वयंसेवकों के प्रति कृतज्ञ।",
  "layout.home": "होम",
  "layout.module.karma": "कर्म योग",
  "layout.module.bhakti": "भक्ति जर्नल",
  "layout.module.jnana": "ज्ञान चिंतन",
  "layout.module.dhyana": "ध्यान मेडिटेशन",
  "layout.module.vasana": "वासना ट्रैकर",
  "layout.module.dharma": "धर्म प्लानर",
  "dashboard.welcome": "स्वागत है, {{name}}",
  "dashboard.defaultUser": "साधक",
  "dashboard.subtitle": "आत्म-विकास और आध्यात्मिक प्रगति के लिए आपका एकीकृत दृश्य।",
  "module.karma.title": "कर्म योग ट्रैकर",
  "module.bhakti.title": "भक्ति जर्नल",
  "module.jnana.title": "ज्ञान चिंतन",
  "module.dhyana.title": "ध्यान मेडिटेशन",
  "module.vasana.title": "वासना ट्रैकर",
  "module.dharma.title": "धर्म प्लानर",
  "module.motivation.title": "प्रेरणा और विश्लेषण",
};

const EMPTY_MESSAGES: TranslationDict = {};

export const MESSAGES: Record<Locale, TranslationDict> = {
  en: EN_MESSAGES,
  hi: HI_MESSAGES,
  kn: EMPTY_MESSAGES,
  ta: EMPTY_MESSAGES,
  te: EMPTY_MESSAGES,
  mr: EMPTY_MESSAGES,
  gu: EMPTY_MESSAGES,
  sa: EMPTY_MESSAGES,
};

export interface ModuleCatalogItem {
  key: "karma" | "bhakti" | "jnana" | "dhyana" | "vasana" | "dharma" | "motivation";
  icon: string;
  href: string;
  titleKey: string;
  descriptionKey: string;
  navKey?: string;
}

export const MODULE_CATALOG: ModuleCatalogItem[] = [
  { key: "karma", icon: "🙏", href: "/karma-yoga", titleKey: "module.karma.title", descriptionKey: "module.karma.description", navKey: "layout.module.karma" },
  { key: "bhakti", icon: "🌸", href: "/bhakti-journal", titleKey: "module.bhakti.title", descriptionKey: "module.bhakti.description", navKey: "layout.module.bhakti" },
  { key: "jnana", icon: "🧘‍♂️", href: "/jnana-reflection", titleKey: "module.jnana.title", descriptionKey: "module.jnana.description", navKey: "layout.module.jnana" },
  { key: "dhyana", icon: "🧘‍♀️", href: "/dhyana-meditation", titleKey: "module.dhyana.title", descriptionKey: "module.dhyana.description", navKey: "layout.module.dhyana" },
  { key: "vasana", icon: "🌱", href: "/vasana-tracker", titleKey: "module.vasana.title", descriptionKey: "module.vasana.description", navKey: "layout.module.vasana" },
  { key: "dharma", icon: "📜", href: "/dharma-planner", titleKey: "module.dharma.title", descriptionKey: "module.dharma.description", navKey: "layout.module.dharma" },
  { key: "motivation", icon: "🏆", href: "/motivation-analytics", titleKey: "module.motivation.title", descriptionKey: "module.motivation.description" },
];

export const MODULE_ICON_MAP: Record<string, string> = MODULE_CATALOG.reduce((acc, item) => {
  acc[item.titleKey] = item.icon;
  return acc;
}, {} as Record<string, string>);

export function getIntlLocale(locale: Locale): string {
  return LOCALE_DEFINITIONS.find((item) => item.code === locale)?.htmlLang ?? "en-US";
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return Object.entries(vars).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    template,
  );
}

export function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const localized = MESSAGES[locale][key] ?? MESSAGES[DEFAULT_LOCALE][key] ?? key;
  return interpolate(localized, vars);
}

export interface MotivationQuote {
  quote: string;
  author: string;
}

const EN_QUOTES: MotivationQuote[] = [
  {
    quote: "You are what your deep, driving desire is. As your desire is, so is your will. As your will is, so is your deed. As your deed is, so is your destiny.",
    author: "Brihadaranyaka Upanishad",
  },
  {
    quote: "Set thy heart upon thy work, but never on its reward.",
    author: "Bhagavad Gita 2.47",
  },
  {
    quote: "The mind acts like an enemy for those who do not control it.",
    author: "Bhagavad Gita 6.6",
  },
  {
    quote: "When meditation is mastered, the mind is unwavering like the flame of a lamp in a windless place.",
    author: "Bhagavad Gita 6.19",
  },
  {
    quote: "Let noble thoughts come to us from every side.",
    author: "Rig Veda",
  },
  {
    quote: "Arise, awake, and stop not till the goal is reached.",
    author: "Swami Vivekananda",
  },
];

export const MOTIVATIONAL_QUOTES: Record<Locale, MotivationQuote[]> = {
  en: EN_QUOTES,
  hi: EN_QUOTES,
  kn: EN_QUOTES,
  ta: EN_QUOTES,
  te: EN_QUOTES,
  mr: EN_QUOTES,
  gu: EN_QUOTES,
  sa: EN_QUOTES,
};
