import { afterEach, describe, expect, it, vi } from "vitest";

import { OpenAIVectorStoreRetrievalProvider } from "./openai-vector-store-provider";

describe("OpenAIVectorStoreRetrievalProvider", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends a bounded vector store search request with source filters", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), { status: 200 }),
    );
    const provider = new OpenAIVectorStoreRetrievalProvider({
      apiKey: "test-key",
      vectorStoreId: "vs_test",
      timeoutMs: 1000,
    });

    await provider.search({
      query: "community",
      sourceTypes: ["community_category", "public_page"],
      limit: 99,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.openai.com/v1/vector_stores/vs_test/search");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-key");

    const body = JSON.parse(init.body as string);
    expect(body.max_num_results).toBe(50);
    expect(body.rewrite_query).toBe(false);
    expect(body.filters).toEqual({
      type: "in",
      key: "sourceType",
      value: ["community_category", "public_page"],
    });
  });

  it("maps hosted search results back to copilot documents", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              file_id: "file_123",
              filename: "dharma.txt",
              score: 0.91,
              attributes: {
                id: "public-page:/dharma-planner",
                title: "Dharma Planner",
                url: "/dharma-planner",
                sourceType: "public_page",
                summary: "Plan intention.",
                moduleKey: "dharma",
                lastModified: "2026-04-28",
              },
              content: [{ type: "text", text: "Dharma Planner helps users plan purpose-aligned goals." }],
            },
          ],
        }),
        { status: 200 },
      ),
    );
    const provider = new OpenAIVectorStoreRetrievalProvider({
      apiKey: "test-key",
      vectorStoreId: "vs_test",
    });

    const results = await provider.search({ query: "purpose planning", limit: 3 });

    expect(results).toEqual([
      expect.objectContaining({
        id: "public-page:/dharma-planner",
        title: "Dharma Planner",
        url: "/dharma-planner",
        sourceType: "public_page",
        moduleKey: "dharma",
        visibility: "public",
      }),
    ]);
  });
});
