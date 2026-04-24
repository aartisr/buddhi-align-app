import {
  AUTOGRAPH_FEATURE_ENABLED,
  AUTOGRAPH_ROUTE,
} from "@/app/lib/autographs/feature";

export type PublicPageProfile = {
  path: string;
  title: string;
  description: string;
  summary: string;
  lastModified: string;
  inviteModuleKey?: string;
  keywords: string[];
  audience: string[];
  outcomes: string[];
  changeFrequency: "daily" | "weekly" | "monthly";
  priority: number;
};

type PublicPageProfileDefinition = Omit<PublicPageProfile, "lastModified">;

export const PUBLIC_CONTENT_LAST_MODIFIED = "2026-04-23";

const moduleAudience = [
  "mindfulness practitioners",
  "spiritual reflection communities",
  "students building steady routines",
];

const corePublicPageProfiles = ([
  {
    path: "/",
    title: "Buddhi Align App",
    description:
      "A daily contemplative practice app that joins dharma planning, meditation, service, reflection, and personal analytics in one calm workspace.",
    summary:
      "Buddhi Align helps people turn ancient wisdom into one practical daily loop: plan an intention, record meaningful practice, reflect on insight, and review growth over time.",
    keywords: [
      "spiritual journaling app",
      "daily reflection app",
      "mindfulness dashboard",
      "contemplative practice app",
      "spiritual habit tracker",
    ],
    audience: moduleAudience,
    outcomes: [
      "Build a consistent daily practice",
      "Connect intention with action",
      "Review spiritual growth through gentle analytics",
    ],
    changeFrequency: "daily",
    priority: 1,
  },
  {
    path: "/karma-yoga",
    title: "Karma Yoga Tracker",
    inviteModuleKey: "karma",
    description:
      "Log selfless action, seva, service impact, and reflection with a focused Karma Yoga tracker.",
    summary:
      "The Karma Yoga Tracker gives service-oriented users a simple way to record meaningful actions, impact, and the inner learning that follows.",
    keywords: ["karma yoga tracker", "seva journal", "service reflection app"],
    audience: ["Karma Yoga practitioners", "volunteers", "service learning groups"],
    outcomes: ["Record acts of service", "Reflect on impact", "Keep service practice consistent"],
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/bhakti-journal",
    title: "Bhakti Journal",
    inviteModuleKey: "bhakti",
    description:
      "Capture devotion, gratitude, prayerful reflection, and heartfelt practice in a dedicated Bhakti journal.",
    summary:
      "The Bhakti Journal supports devotional consistency by giving gratitude, reverence, and heartfelt reflection a dedicated home.",
    keywords: ["bhakti journal", "devotional journal", "gratitude reflection app"],
    audience: ["Bhakti practitioners", "gratitude journal users", "devotional communities"],
    outcomes: ["Capture gratitude", "Deepen devotional reflection", "Revisit heartfelt moments"],
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/dhyana-meditation",
    title: "Dhyana Meditation",
    inviteModuleKey: "dhyana",
    description:
      "Track guided and self-led meditation sessions, duration, notes, and attention-building practice.",
    summary:
      "Dhyana Meditation helps users log meditation sessions and see the quiet pattern of attention-building over time.",
    keywords: ["dhyana meditation tracker", "meditation log", "mindfulness practice tracker"],
    audience: ["meditators", "mindfulness practitioners", "students of dhyana"],
    outcomes: ["Track meditation duration", "Record session notes", "Build a stable practice rhythm"],
    changeFrequency: "weekly",
    priority: 0.9,
  },
  {
    path: "/jnana-reflection",
    title: "Jnana Reflection",
    inviteModuleKey: "jnana",
    description:
      "Record insight, contemplation, self-inquiry, and wisdom notes in a structured Jnana reflection journal.",
    summary:
      "Jnana Reflection helps users preserve insights from study, self-inquiry, and contemplative review.",
    keywords: ["jnana reflection", "wisdom journal", "self inquiry journal"],
    audience: ["students of philosophy", "self-inquiry practitioners", "reflective learners"],
    outcomes: ["Capture insights", "Preserve contemplation notes", "Support thoughtful review"],
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/vasana-tracker",
    title: "Vasana Tracker",
    inviteModuleKey: "vasana",
    description:
      "Notice recurring habits, tendencies, triggers, and patterns with a reflective Vasana tracker.",
    summary:
      "The Vasana Tracker supports pattern awareness by helping users observe tendencies without judgment and document what changes over time.",
    keywords: ["vasana tracker", "habit reflection app", "pattern awareness journal"],
    audience: ["habit reflection users", "spiritual growth practitioners", "self-awareness learners"],
    outcomes: ["Notice recurring patterns", "Document triggers", "Support steady inner change"],
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/dharma-planner",
    title: "Dharma Planner",
    inviteModuleKey: "dharma",
    description:
      "Plan purpose-aligned goals, intentions, action plans, and daily direction with a Dharma planning workspace.",
    summary:
      "The Dharma Planner turns intention into action by helping users define a purpose-aligned goal and the next step attached to it.",
    keywords: ["dharma planner", "purpose planner", "intentional living app"],
    audience: ["purpose-driven planners", "students", "reflective professionals"],
    outcomes: ["Set purpose-aligned goals", "Plan next actions", "Review status clearly"],
    changeFrequency: "weekly",
    priority: 0.85,
  },
  {
    path: "/motivation-analytics",
    title: "Motivation and Analytics",
    inviteModuleKey: "motivation",
    description:
      "Review streaks, module activity, practice balance, and adaptive next steps inside Buddhi Align.",
    summary:
      "Motivation and Analytics turns practice data into calm feedback: streaks, trends, module balance, and next-step recommendations.",
    keywords: ["practice analytics", "spiritual growth dashboard", "mindfulness analytics"],
    audience: ["self-development users", "habit builders", "reflection communities"],
    outcomes: ["See practice streaks", "Review module balance", "Find the next best practice step"],
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    path: "/share",
    title: "Share Buddhi Align",
    description:
      "A share kit with concise Buddhi Align descriptions, social captions, and invite links for friends, families, schools, and spiritual communities.",
    summary:
      "The Buddhi Align share kit packages the app into easy one-sentence descriptions, community-friendly captions, and direct invite links.",
    keywords: ["Buddhi Align share kit", "spiritual app invite", "mindfulness app for friends"],
    audience: ["community organizers", "teachers", "families", "friends"],
    outcomes: ["Share the app clearly", "Invite others quickly", "Explain the daily practice loop"],
    changeFrequency: "monthly",
    priority: 0.7,
  },
] satisfies PublicPageProfileDefinition[]).map((profile): PublicPageProfile => ({
  ...profile,
  lastModified: PUBLIC_CONTENT_LAST_MODIFIED,
}));

const autographPageProfile: PublicPageProfile = {
  path: AUTOGRAPH_ROUTE,
  title: "Autograph Exchange",
  lastModified: PUBLIC_CONTENT_LAST_MODIFIED,
  inviteModuleKey: "autograph",
  description:
    "Collect thoughtful autograph messages and keepsakes inside the calm Buddhi Align experience.",
  summary:
    "Autograph Exchange lets schools and communities collect meaningful messages without turning the experience into a noisy social feed.",
  keywords: ["digital autograph book", "school keepsakes", "student autograph exchange"],
  audience: ["students", "teachers", "school communities"],
  outcomes: ["Request thoughtful autographs", "Sign messages clearly", "Preserve keepsakes"],
  changeFrequency: "weekly",
  priority: 0.75,
};

export const publicPageProfiles: PublicPageProfile[] = AUTOGRAPH_FEATURE_ENABLED
  ? [...corePublicPageProfiles, autographPageProfile]
  : corePublicPageProfiles;

export const publicPageProfileByPath = new Map(
  publicPageProfiles.map((profile) => [profile.path, profile] as const),
);

export const publicShareDestinations = publicPageProfiles
  .filter((profile) => Boolean(profile.inviteModuleKey))
  .map((profile) => ({
    key: profile.inviteModuleKey as string,
    href: profile.path,
    label: profile.title,
  }));

export const homepageHighlights = [
  {
    title: "One loop people remember",
    body: "Plan one intention, do one meaningful practice, reflect once, and let the dashboard show the pattern building over time.",
  },
  {
    title: "Rooted without feeling old-fashioned",
    body: "Karma, Bhakti, Jnana, Dhyana, Vasana, and Dharma are translated into practical daily tools that feel natural on a phone or laptop.",
  },
  {
    title: "Built for sharing, not noise",
    body: "Invite links, a guided tour, and calm module pages make it easy to bring a friend, class, or community into the same practice rhythm.",
  },
  {
    title: "AI-readable by design",
    body: "Canonical routes, structured data, sitemap coverage, and llms references help answer engines summarize the app accurately.",
  },
] as const;

export const homepageFaq = [
  {
    question: "What is Buddhi Align?",
    answer:
      "Buddhi Align is a contemplative-practice web app for daily reflection, meditation tracking, service journaling, dharma planning, and gentle personal analytics.",
  },
  {
    question: "Who is Buddhi Align for?",
    answer:
      "It is for individuals, students, families, and spiritual communities who want a simple daily rhythm for self-development and reflective practice.",
  },
  {
    question: "How do I start using it?",
    answer:
      "Start with one intention in the Dharma Planner, record one practice entry, then review your progress in Motivation and Analytics.",
  },
  {
    question: "Is Buddhi Align free to try?",
    answer:
      "Yes. The public app is designed to be accessible and easy to try from the dashboard or any module page.",
  },
  {
    question: "Does Buddhi Align replace a teacher or spiritual guide?",
    answer:
      "No. Buddhi Align is a practice-support tool. It helps users record and review their own routines while honoring the role of teachers, communities, and lived guidance.",
  },
] as const;

export const shareSnippets = [
  {
    label: "One sentence",
    text: "Buddhi Align turns spiritual practice into a simple daily loop: plan, practice, reflect, and watch your consistency grow.",
  },
  {
    label: "Community invite",
    text: "Try Buddhi Align with me: a calm app for dharma planning, meditation, service, gratitude, self-inquiry, and practice analytics.",
  },
  {
    label: "Student friendly",
    text: "Buddhi Align helps students build a steady reflective routine in under a minute a day.",
  },
  {
    label: "AI/search summary",
    text: "Buddhi Align is a contemplative-practice web app by ForeverLotus for journaling, meditation tracking, dharma planning, and spiritual growth analytics.",
  },
] as const;
