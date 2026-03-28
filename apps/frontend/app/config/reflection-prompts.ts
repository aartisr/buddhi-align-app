/**
 * Curated Vedantic / Gita-inspired reflection prompts.
 * Rotated daily via day-of-year modulus — no AI API required.
 * 8 prompts per module = a fresh prompt every day of the week with weekly variation.
 */

export const REFLECTION_PROMPTS: Record<string, readonly string[]> = {
  jnana: [
    "What assumption about yourself do you hold most tightly — and what would be revealed if you released it?",
    "In what area of life is your Buddhi (discriminative intellect) most clouded by desire or habit right now?",
    "Who are you beyond your roles, your history, and your name?",
    "What recurring thought pattern have you noticed this week — and what does it reveal about your conditioning?",
    "Where in your relationships are you reacting from past impressions rather than present reality?",
    "What would you pursue if you were completely free of others' expectations?",
    "What insight, once recognized as true, cannot be unseen?",
    "Notice the witness: who is observing your thoughts right now, and does that observer ever change?",
  ],
  bhakti: [
    "What three moments today — however small — carried a current of grace?",
    "Where did you receive unexpected kindness today, and did you pause to fully acknowledge it?",
    "What person in your life embodies a quality of the Divine — and how might you express gratitude to them?",
    "What would shift if you offered your actions today as a gift, rather than a task to complete?",
    "What beauty appeared in ordinary circumstances today that you almost walked past without noticing?",
    "In what areas of your life are you effortfully resisting what is — and what would gentle acceptance feel like?",
    "Write a short prayer or intention for someone in your life who is quietly struggling.",
    "What small act of service today was an expression of love offered without expectation of return?",
  ],
  vasana: [
    "What pattern of behavior appeared this week that you have witnessed in yourself before?",
    "When did you react rather than respond today — and what was the underlying trigger?",
    "What habit is actively serving your growth right now, and what habit is quietly limiting it?",
    "In what habitual thought do you take refuge when you feel uncomfortable or uncertain?",
    "What would you choose differently today if you were acting from your highest self rather than from conditioning?",
    "Observe one vasana (latent tendency) without judgment: where did it arise today, and what circumstance fed it?",
    "What does your relationship with discomfort reveal about where you currently are in your practice?",
    "Name one habit you are genuinely ready to release, and one quality you are ready to consciously cultivate.",
  ],
};

/** Deterministic day-seeded index — returns the same prompt all day, rotates daily. */
export function getDailyPrompt(module: string): string {
  const prompts = REFLECTION_PROMPTS[module];
  if (!prompts || prompts.length === 0) return "";
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
  return prompts[dayOfYear % prompts.length];
}
