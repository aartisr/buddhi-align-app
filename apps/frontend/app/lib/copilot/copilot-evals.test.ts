import { describe, expect, it } from "vitest";

import { answerCopilotQuestion } from "./retrieval-service";

type GoldenQuestion = {
  name: string;
  query: string;
  context?: { path?: string; moduleKey?: string };
  expectedAnswer: RegExp;
  expectedCitation: RegExp;
  expectedAction?: RegExp;
};

const goldenQuestions: GoldenQuestion[] = [
  {
    name: "brand overview",
    query: "What is Buddhi Align?",
    context: { path: "/" },
    expectedAnswer: /Buddhi Align|contemplative|practice/i,
    expectedCitation: /Buddhi Align|Home/i,
  },
  {
    name: "dharma navigation",
    query: "Where can I plan my intention and next action?",
    context: { path: "/" },
    expectedAnswer: /Dharma/i,
    expectedCitation: /Dharma Planner/i,
    expectedAction: /\/dharma-planner/,
  },
  {
    name: "community category",
    query: "Where are Bhakti community discussions?",
    context: { path: "/community" },
    expectedAnswer: /community|Bhakti/i,
    expectedCitation: /Bhakti|Community/i,
    expectedAction: /\/community/,
  },
  {
    name: "autograph help",
    query: "How do I request an autograph?",
    context: { path: "/autograph-exchange" },
    expectedAnswer: /Autograph/i,
    expectedCitation: /Autograph|Profiles/i,
    expectedAction: /\/profiles|\/autograph-exchange/,
  },
  {
    name: "support issue",
    query: "The profile page is broken. How do I report it?",
    context: { path: "/profiles" },
    expectedAnswer: /support|report/i,
    expectedCitation: /Support|Issue/i,
    expectedAction: /\/support/,
  },
];

describe("copilot golden-question evals", () => {
  it("keeps public answer faithfulness and citation/action coverage above threshold", async () => {
    const results = await Promise.all(
      goldenQuestions.map(async (item) => {
        const response = await answerCopilotQuestion({
          query: item.query,
          context: item.context,
        });
        const citationText = response.citations.map((citation) => `${citation.title} ${citation.url}`).join(" ");
        const actionText = response.actions.map((action) => action.href).join(" ");

        return {
          ...item,
          answerOk: item.expectedAnswer.test(response.answer),
          citationOk: item.expectedCitation.test(citationText),
          actionOk: item.expectedAction ? item.expectedAction.test(actionText) : true,
          hasCitation: response.citations.length > 0,
          confidenceOk: response.confidence !== "low",
        };
      }),
    );

    const faithful = results.filter((result) => result.answerOk).length / results.length;
    const citationCoverage = results.filter((result) => result.hasCitation && result.citationOk).length / results.length;
    const actionCoverage = results.filter((result) => result.actionOk).length / results.length;
    const confidenceCoverage = results.filter((result) => result.confidenceOk).length / results.length;

    expect(results.filter((result) => !result.answerOk).map((result) => result.name)).toEqual([]);
    expect(faithful).toBeGreaterThanOrEqual(0.9);
    expect(citationCoverage).toBeGreaterThanOrEqual(0.9);
    expect(actionCoverage).toBeGreaterThanOrEqual(0.8);
    expect(confidenceCoverage).toBeGreaterThanOrEqual(0.9);
  });
});
