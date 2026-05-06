import type { CopilotDocument, CopilotRetrievalProvider, CopilotRetrievalQuery, CopilotSourceType } from "./types";

const DEFAULT_OPENAI_RETRIEVAL_TIMEOUT_MS = 1800;
const OPENAI_VECTOR_STORE_SEARCH_URL = "https://api.openai.com/v1/vector_stores";

type OpenAIVectorStoreSearchResult = {
  file_id?: string;
  filename?: string;
  score?: number;
  attributes?: Record<string, unknown>;
  content?: Array<{
    type?: string;
    text?: string;
  }>;
};

type OpenAIVectorStoreSearchResponse = {
  data?: OpenAIVectorStoreSearchResult[];
};

function isSourceType(value: unknown): value is CopilotSourceType {
  return typeof value === "string" && [
    "public_page",
    "llms_reference",
    "homepage_faq",
    "homepage_highlight",
    "share_snippet",
    "community_category",
    "community_topic",
    "autograph_profile",
    "private_practice_summary",
  ].includes(value);
}

function stringAttribute(attributes: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = attributes?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberAttribute(attributes: Record<string, unknown> | undefined, key: string): number | undefined {
  const value = attributes?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function textFromResult(result: OpenAIVectorStoreSearchResult): string {
  return (result.content ?? [])
    .filter((content) => content.type === "text" && typeof content.text === "string")
    .map((content) => content.text)
    .join("\n")
    .replace(/\s+/g, " ")
    .trim();
}

function documentFromResult(result: OpenAIVectorStoreSearchResult): CopilotDocument | null {
  const attributes = result.attributes;
  const text = textFromResult(result);
  const url = stringAttribute(attributes, "url") ?? "/";
  const title = stringAttribute(attributes, "title") ?? result.filename ?? "Buddhi Align source";
  const sourceType = isSourceType(attributes?.sourceType) ? attributes.sourceType : "public_page";

  if (!text) return null;

  return {
    id: stringAttribute(attributes, "id") ?? result.file_id ?? `${title}:${url}`,
    title,
    url,
    sourceType,
    text,
    summary: stringAttribute(attributes, "summary"),
    moduleKey: stringAttribute(attributes, "moduleKey"),
    visibility: "public",
    lastModified: stringAttribute(attributes, "lastModified"),
    metadata: {
      ...(typeof result.filename === "string" ? { filename: result.filename } : {}),
      ...(typeof result.score === "number" ? { score: result.score } : {}),
      ...(numberAttribute(attributes, "priority") !== undefined ? { priority: numberAttribute(attributes, "priority") as number } : {}),
    },
  };
}

function buildSourceTypeFilter(query: CopilotRetrievalQuery): object | undefined {
  if (!query.sourceTypes?.length) return undefined;

  return {
    type: "in",
    key: "sourceType",
    value: query.sourceTypes,
  };
}

export class OpenAIVectorStoreRetrievalProvider implements CopilotRetrievalProvider {
  constructor(
    private readonly config: {
      apiKey: string;
      vectorStoreId: string;
      timeoutMs?: number;
    },
  ) {}

  async search(query: CopilotRetrievalQuery): Promise<CopilotDocument[]> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.timeoutMs ?? DEFAULT_OPENAI_RETRIEVAL_TIMEOUT_MS,
    );

    try {
      const response = await fetch(
        `${OPENAI_VECTOR_STORE_SEARCH_URL}/${encodeURIComponent(this.config.vectorStoreId)}/search`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            query: query.query,
            filters: buildSourceTypeFilter(query),
            max_num_results: Math.min(Math.max(query.limit, 1), 50),
            rewrite_query: false,
            ranking_options: {
              ranker: "auto",
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`OpenAI vector store search failed with ${response.status}`);
      }

      const payload = (await response.json()) as OpenAIVectorStoreSearchResponse;
      return (payload.data ?? [])
        .map(documentFromResult)
        .filter((document): document is CopilotDocument => Boolean(document))
        .slice(0, query.limit);
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function createConfiguredHostedRetrievalProvider(): CopilotRetrievalProvider | null {
  if (process.env.COPILOT_PROVIDER !== "openai-vector-store") return null;

  const apiKey = process.env.OPENAI_API_KEY;
  const vectorStoreId = process.env.OPENAI_COPILOT_VECTOR_STORE_ID;
  const timeoutMs = Number(process.env.COPILOT_MAX_RETRIEVAL_MS);

  if (!apiKey || !vectorStoreId) return null;

  return new OpenAIVectorStoreRetrievalProvider({
    apiKey,
    vectorStoreId,
    timeoutMs: Number.isFinite(timeoutMs) ? timeoutMs : undefined,
  });
}
