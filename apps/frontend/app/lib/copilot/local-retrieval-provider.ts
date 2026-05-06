import { buildPublicCopilotCorpus } from "./public-corpus";
import type { CopilotDocument, CopilotRetrievalProvider, CopilotRetrievalQuery } from "./types";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "or",
  "please",
  "show",
  "take",
  "tell",
  "the",
  "to",
  "use",
  "what",
  "where",
  "with",
]);

const TOKEN_ALIASES: Record<string, string[]> = {
  autograph: ["autographs", "signature", "signatures", "keepsake", "keepsakes"],
  bhakti: ["devotion", "devotional", "gratitude", "prayer"],
  community: ["discussion", "discourse", "forum", "topic", "topics"],
  dharma: ["purpose", "intention", "goal", "planner"],
  dhyana: ["meditation", "mindfulness", "attention"],
  jnana: ["insight", "wisdom", "inquiry", "reflection"],
  karma: ["service", "seva", "volunteer", "action"],
  support: ["bug", "issue", "accessibility", "privacy", "problem"],
  vasana: ["habit", "pattern", "trigger", "tendency"],
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9/ -]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeForCopilot(value: string): string[] {
  const rawTokens = normalize(value)
    .split(/[\s/-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));

  const expanded = new Set<string>();

  for (const token of rawTokens) {
    expanded.add(token);
    if (token.endsWith("s") && token.length > 3) {
      expanded.add(token.slice(0, -1));
    }

    for (const [canonical, aliases] of Object.entries(TOKEN_ALIASES)) {
      if (token === canonical || aliases.includes(token)) {
        expanded.add(canonical);
        aliases.forEach((alias) => expanded.add(alias));
      }
    }
  }

  return Array.from(expanded);
}

function pathTokens(value: string | undefined): string[] {
  if (!value) return [];
  return tokenizeForCopilot(value.replace(/^\/+/, ""));
}

function scoreTokenMatches(input: {
  queryTokens: string[];
  documentTokens: Set<string>;
  title: string;
  url: string;
}): number {
  return input.queryTokens.reduce((score, token) => {
    let tokenScore = 0;
    if (input.documentTokens.has(token)) tokenScore += 8;
    if (input.title.includes(token)) tokenScore += 6;
    if (input.url.includes(token)) tokenScore += 5;
    return score + tokenScore;
  }, 0);
}

function scorePhraseMatch(normalizedQuery: string, title: string, haystack: string): number {
  if (!normalizedQuery) return 0;
  if (title.includes(normalizedQuery)) return 40;
  if (haystack.includes(normalizedQuery)) return 18;
  return 0;
}

function scoreContextBoosts(
  document: CopilotDocument,
  query: CopilotRetrievalQuery,
  documentTokens: Set<string>,
): number {
  const moduleBoost = query.moduleKey && document.moduleKey === query.moduleKey ? 16 : 0;
  const currentPathBoost = query.currentPath && document.url === query.currentPath ? 20 : 0;
  const pathBoost = pathTokens(query.currentPath).reduce(
    (score, token) => score + (documentTokens.has(token) ? 3 : 0),
    0,
  );
  const sourceBoost = document.sourceType === "public_page"
    ? 2
    : document.sourceType === "llms_reference"
      ? 1
      : 0;

  return moduleBoost + currentPathBoost + pathBoost + sourceBoost;
}

function scoreDocument(
  document: CopilotDocument,
  query: CopilotRetrievalQuery,
  queryTokens: string[],
  normalizedQuery: string,
): number {
  const haystack = normalize([
    document.title,
    document.summary,
    document.text,
    document.url,
    document.moduleKey,
  ].filter(Boolean).join(" "));
  const title = normalize(document.title);
  const url = normalize(document.url);
  const documentTokens = new Set(tokenizeForCopilot(haystack));

  return scoreTokenMatches({ queryTokens, documentTokens, title, url })
    + scorePhraseMatch(normalizedQuery, title, haystack)
    + scoreContextBoosts(document, query, documentTokens);
}

function dedupeByUrlAndTitle(documents: CopilotDocument[]): CopilotDocument[] {
  const seen = new Set<string>();
  return documents.filter((document) => {
    const key = `${document.url}:${document.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export class LocalCopilotRetrievalProvider implements CopilotRetrievalProvider {
  async search(query: CopilotRetrievalQuery): Promise<CopilotDocument[]> {
    const corpus = await buildPublicCopilotCorpus();
    return searchCopilotDocuments(corpus, query);
  }
}

export function searchCopilotDocuments(
  documents: CopilotDocument[],
  query: CopilotRetrievalQuery,
): CopilotDocument[] {
    const sourceFilter = query.sourceTypes ? new Set(query.sourceTypes) : null;
    const normalizedQuery = normalize(query.query);
    const queryTokens = tokenizeForCopilot(query.query);

    const scored = documents
      .filter((document) => document.visibility === "public")
      .filter((document) => !sourceFilter || sourceFilter.has(document.sourceType))
      .map((document) => ({
        document,
        score: scoreDocument(document, query, queryTokens, normalizedQuery),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.document);

    return dedupeByUrlAndTitle(scored).slice(0, Math.max(1, query.limit));
}
