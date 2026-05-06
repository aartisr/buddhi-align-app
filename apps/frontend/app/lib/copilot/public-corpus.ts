import { readFile } from "node:fs/promises";
import path from "node:path";

import { DEFAULT_LOCALE, MODULE_CATALOG, translate } from "@/app/i18n/config";
import {
  homepageFaq,
  homepageHighlights,
  publicPageProfiles,
  shareSnippets,
} from "@/app/lib/public-content";
import { MODULE_CATEGORY_SLUGS } from "@/app/lib/community/module-map";

import type { CopilotDocument } from "./types";

const LLMS_FILES = ["llms.txt", "llms-full.txt"] as const;

function normalizePublicPath(href: string): string {
  return href === "/" ? "/" : href.replace(/\/$/, "");
}

function documentFromText(input: {
  id: string;
  title: string;
  url: string;
  text: string;
  sourceType: CopilotDocument["sourceType"];
  summary?: string;
  moduleKey?: string;
  lastModified?: string;
}): CopilotDocument {
  return {
    id: input.id,
    title: input.title,
    url: input.url,
    text: input.text.replace(/\s+/g, " ").trim(),
    sourceType: input.sourceType,
    summary: input.summary,
    moduleKey: input.moduleKey,
    visibility: "public",
    lastModified: input.lastModified,
  };
}

function buildPublicPageDocuments(): CopilotDocument[] {
  return publicPageProfiles.map((profile) => {
    const text = [
      profile.title,
      profile.description,
      profile.summary,
      `Audience: ${profile.audience.join(", ")}.`,
      `Outcomes: ${profile.outcomes.join("; ")}.`,
      `Keywords: ${profile.keywords.join(", ")}.`,
    ].join(" ");

    return documentFromText({
      id: `public-page:${profile.path}`,
      title: profile.title,
      url: normalizePublicPath(profile.path),
      text,
      sourceType: "public_page",
      summary: profile.summary,
      moduleKey: profile.inviteModuleKey,
      lastModified: profile.lastModified,
    });
  });
}

function buildModuleDocuments(): CopilotDocument[] {
  const moduleDocuments = MODULE_CATALOG.map((item) => {
    const title = translate(DEFAULT_LOCALE, item.titleKey);
    const description = translate(DEFAULT_LOCALE, item.descriptionKey);
    const navLabel = translate(DEFAULT_LOCALE, item.navKey ?? item.titleKey);

    return documentFromText({
      id: `module:${item.key}`,
      title,
      url: item.href,
      sourceType: "public_page",
      moduleKey: item.key,
      summary: description,
      text: `${title}. ${navLabel}. ${description}. Route: ${item.href}.`,
    });
  });

  const communityDocuments = MODULE_CATALOG.flatMap((item) => {
    const slug = MODULE_CATEGORY_SLUGS[item.key];
    if (!slug) return [];

    const title = translate(DEFAULT_LOCALE, item.navKey ?? item.titleKey);
    const description = translate(DEFAULT_LOCALE, item.descriptionKey);

    return [
      documentFromText({
        id: `community-category:${item.key}`,
        title: `${title} Community`,
        url: `/community/c/${slug}`,
        sourceType: "community_category",
        moduleKey: item.key,
        summary: `Community discussions for ${title}.`,
        text: `${title} community discussion space. ${description}. Questions, shared reflection, practice support, and module discussion for ${title}.`,
      }),
    ];
  });

  return [...moduleDocuments, ...communityDocuments];
}

function buildHomepageDocuments(): CopilotDocument[] {
  const highlights = homepageHighlights.map((item) =>
    documentFromText({
      id: `homepage-highlight:${item.title}`,
      title: item.title,
      url: "/",
      sourceType: "homepage_highlight",
      summary: item.body,
      text: `${item.title}. ${item.body}`,
    }),
  );

  const faq = homepageFaq.map((item) =>
    documentFromText({
      id: `homepage-faq:${item.question}`,
      title: item.question,
      url: "/",
      sourceType: "homepage_faq",
      summary: item.answer,
      text: `${item.question} ${item.answer}`,
    }),
  );

  const snippets = shareSnippets.map((item) =>
    documentFromText({
      id: `share-snippet:${item.label}`,
      title: item.label,
      url: "/share",
      sourceType: "share_snippet",
      summary: item.text,
      text: `${item.label}. ${item.text}`,
    }),
  );

  return [...highlights, ...faq, ...snippets];
}

async function readPublicFile(fileName: string): Promise<string | null> {
  const candidates = [
    path.join(process.cwd(), "public", fileName),
    path.join(process.cwd(), "apps", "frontend", "public", fileName),
  ];

  for (const candidate of candidates) {
    try {
      return await readFile(candidate, "utf8");
    } catch {
      // Try the next likely project root.
    }
  }

  return null;
}

async function buildLlmsDocuments(): Promise<CopilotDocument[]> {
  const documents = await Promise.all(
    LLMS_FILES.map(async (fileName) => {
      const content = await readPublicFile(fileName);
      if (!content) return null;

      return documentFromText({
        id: `llms:${fileName}`,
        title: fileName === "llms.txt" ? "Buddhi Align AI Reference" : "Buddhi Align Extended AI Reference",
        url: `/${fileName}`,
        sourceType: "llms_reference",
        summary: "Canonical AI-readable guidance for Buddhi Align.",
        text: content,
      });
    }),
  );

  return documents.filter((document): document is CopilotDocument => Boolean(document));
}

let publicCorpusCache: CopilotDocument[] | null = null;

export async function buildPublicCopilotCorpus(): Promise<CopilotDocument[]> {
  if (publicCorpusCache) return publicCorpusCache;

  publicCorpusCache = [
    ...buildPublicPageDocuments(),
    ...buildModuleDocuments(),
    ...buildHomepageDocuments(),
    ...(await buildLlmsDocuments()),
  ];

  return publicCorpusCache;
}

export function resetPublicCopilotCorpusCache(): void {
  publicCorpusCache = null;
}
