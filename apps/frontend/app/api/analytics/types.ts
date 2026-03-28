export const ANALYTICS_MODULES = [
  'karma',
  'bhakti',
  'jnana',
  'dhyana',
  'vasana',
  'dharma',
] as const;

export type AnalyticsModuleName = (typeof ANALYTICS_MODULES)[number];

export interface AnalyticsPayload {
  counts: Record<AnalyticsModuleName, number>;
  totalEntries: number;
  streak: number;
  mostActive: AnalyticsModuleName | null;
  /** Whether the user has logged at least one entry for the module today. */
  todayActivity: Record<AnalyticsModuleName, boolean>;
}
