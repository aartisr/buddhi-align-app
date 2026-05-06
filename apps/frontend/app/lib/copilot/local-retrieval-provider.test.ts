import { describe, expect, it } from "vitest";

import { answerCopilotQuestion } from "./retrieval-service";
import { LocalCopilotRetrievalProvider, tokenizeForCopilot } from "./local-retrieval-provider";
import { buildPublicCopilotCorpus } from "./public-corpus";

describe("buildPublicCopilotCorpus", () => {
  it("builds a broad source-of-truth corpus", async () => {
    const corpus = await buildPublicCopilotCorpus();
    const sourceTypes = new Set(corpus.map((document) => document.sourceType));

    expect(corpus.length).toBeGreaterThanOrEqual(40);
    expect(corpus.some((document) => document.url === "/dharma-planner")).toBe(true);
    expect(corpus.some((document) => document.url === "/autograph-exchange")).toBe(true);
    expect(sourceTypes).toContain("llms_reference");
    expect(sourceTypes).toContain("community_category");
  });
});

describe("tokenizeForCopilot", () => {
  it("expands important Buddhi Align aliases", () => {
    const tokens = tokenizeForCopilot("gratitude and meditation practice");

    expect(tokens).toContain("bhakti");
    expect(tokens).toContain("dhyana");
  });
});

describe("LocalCopilotRetrievalProvider", () => {
  it("finds a canonical module route from natural language", async () => {
    const provider = new LocalCopilotRetrievalProvider();
    const results = await provider.search({
      query: "Where can I plan my purpose and intention?",
      limit: 4,
    });

    expect(results.some((result) => result.url === "/dharma-planner")).toBe(true);
  });

  it("finds community module routes", async () => {
    const provider = new LocalCopilotRetrievalProvider();
    const results = await provider.search({
      query: "Show me Bhakti community discussions",
      sourceTypes: ["community_category"],
      limit: 4,
    });

    expect(results[0]?.url).toContain("/community/c/bhakti-journal");
  });
});

describe("answerCopilotQuestion", () => {
  it("returns citations and safe actions for public answers", async () => {
    const response = await answerCopilotQuestion({
      query: "How do I request an autograph?",
      context: { path: "/autograph-exchange" },
    });

    expect(response.answer).toMatch(/Autograph/i);
    expect(response.citations.length).toBeGreaterThan(0);
    expect(response.actions.some((action) => action.href === "/profiles" || action.href === "/autograph-exchange")).toBe(true);
  });

  it("keeps personal practice summaries behind sign-in", async () => {
    const response = await answerCopilotQuestion({
      query: "What did I practice this week?",
      context: { path: "/" },
    });

    expect(response.answer).toMatch(/Sign in/i);
    expect(response.actions.some((action) => action.href.startsWith("/sign-in"))).toBe(true);
    expect(response.confidence).toBe("medium");
  });

  it("creates a confirmed support-report draft action for issue questions", async () => {
    const response = await answerCopilotQuestion({
      query: "The community page is not loading",
      context: { path: "/community" },
    });

    const draftAction = response.actions.find((action) => action.type === "draft_support_report");
    expect(draftAction?.href).toContain("/support?");
    expect(draftAction?.href).toContain("source=copilot");
    expect(draftAction?.href).toContain("page=%2Fcommunity");
  });

  it("creates a confirmed practice-entry draft action without writing data", async () => {
    const response = await answerCopilotQuestion({
      query: "Draft a gratitude entry about patience",
      context: { path: "/bhakti-journal", moduleKey: "bhakti" },
    });

    const draftAction = response.actions.find((action) => action.type === "draft_practice_entry");
    expect(draftAction?.href).toContain("/bhakti-journal?");
    expect(draftAction?.href).toContain("source=copilot");
    expect(draftAction?.href).toContain("draft=practice");
    expect(draftAction?.href).toContain("module=bhakti");
  });
});
