import type { Metadata } from "next";
import {
  homepageFaq,
  publicPageProfileByPath,
  publicPageProfiles,
  type PublicPageProfile,
} from "./public-content";
import { getSiteUrl } from "./site-url";

type PageMetadataOptions = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  imagePath?: string;
  imageAlt?: string;
};

export const siteUrl = getSiteUrl();
export const siteName = "Buddhi Align App";
export const siteDescription =
  "Buddhi Align is a contemplative practice app for dharma planning, meditation tracking, service journaling, self-reflection, and gentle spiritual growth analytics.";
export const organizationName = "ForeverLotus";
export const organizationUrl = "https://foreverlotus.com";
export const authorName = "Aarti Sri Ravikumar";
export const authorUrl = "https://aartisr.foreverlotus.com";
export const organizationId = `${organizationUrl}/#organization`;
export const websiteId = `${siteUrl}/#website`;
export const webAppId = `${siteUrl}/#webapp`;
export const personId = `${authorUrl}/#person`;

export const siteKeywords = [
  "Buddhi Align",
  "spiritual journaling",
  "daily reflection app",
  "meditation tracker",
  "karma yoga",
  "bhakti journal",
  "dhyana meditation",
  "jnana reflection",
  "vasana tracker",
  "dharma planner",
  "self-development",
  "mindfulness",
  "spiritual discipline",
  "personal growth analytics",
  "Indian philosophy",
  "contemplative practice",
  "AI searchable wellness app",
];

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function absoluteUrl(path = "/") {
  return new URL(path, `${siteUrl}/`).toString();
}

function pageId(path: string) {
  return `${absoluteUrl(path)}#webpage`;
}

function breadcrumbId(path: string) {
  return `${absoluteUrl(path)}#breadcrumb`;
}

function buildWebPageNode(profile: PublicPageProfile) {
  return {
    "@type": "WebPage",
    "@id": pageId(profile.path),
    url: absoluteUrl(profile.path),
    name: profile.title,
    description: profile.description,
    isPartOf: {
      "@id": websiteId,
    },
    about: profile.keywords.map((keyword) => ({
      "@type": "Thing",
      name: keyword,
    })),
    audience: profile.audience.map((audienceType) => ({
      "@type": "Audience",
      audienceType,
    })),
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: absoluteUrl("/opengraph-image"),
      width: 1200,
      height: 630,
    },
    breadcrumb: {
      "@id": breadcrumbId(profile.path),
    },
  };
}

function buildBreadcrumbNode(profile: PublicPageProfile) {
  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: siteName,
      item: absoluteUrl("/"),
    },
  ];

  if (profile.path !== "/") {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: profile.title,
      item: absoluteUrl(profile.path),
    });
  }

  return {
    "@type": "BreadcrumbList",
    "@id": breadcrumbId(profile.path),
    itemListElement: items,
  };
}

export function buildPageMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  imagePath = "/opengraph-image",
  imageAlt = `${title} social preview`,
}: PageMetadataOptions): Metadata {
  const canonicalUrl = absoluteUrl(path);
  const pageProfile = publicPageProfileByPath.get(path);
  const mergedKeywords = uniqueValues([
    ...siteKeywords,
    ...(pageProfile?.keywords ?? []),
    ...keywords,
  ]);

  return {
    title,
    description,
    applicationName: siteName,
    authors: [{ name: authorName, url: authorUrl }],
    creator: authorName,
    publisher: organizationName,
    category: "health",
    classification: "Contemplative practice, spiritual journaling, and personal growth analytics",
    keywords: mergedKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonicalUrl,
      siteName,
      title,
      description,
      images: [
        {
          url: imagePath,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imagePath],
    },
  };
}

export function buildNoIndexMetadata(options: PageMetadataOptions): Metadata {
  return {
    ...buildPageMetadata(options),
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
        "max-snippet": 0,
        "max-image-preview": "none",
        "max-video-preview": 0,
      },
    },
  };
}

export function buildSiteJsonLd({
  name = siteName,
  description = siteDescription,
}: {
  name?: string;
  description?: string;
} = {}) {
  const publicPageReferences = publicPageProfiles.map((profile) => ({
    "@id": pageId(profile.path),
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: organizationName,
        url: organizationUrl,
        founder: {
          "@id": personId,
        },
        logo: absoluteUrl("/buddhi-align-icon.svg"),
        sameAs: [organizationUrl, authorUrl],
      },
      {
        "@type": "Person",
        "@id": personId,
        name: authorName,
        url: authorUrl,
        worksFor: {
          "@id": organizationId,
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name,
        alternateName: ["Buddhi Align", "Buddhi Align by ForeverLotus"],
        url: siteUrl,
        description,
        inLanguage: "en-US",
        creator: {
          "@id": personId,
        },
        publisher: {
          "@id": organizationId,
        },
        hasPart: publicPageReferences,
      },
      {
        "@type": "WebApplication",
        "@id": webAppId,
        name,
        alternateName: "Buddhi Align",
        url: siteUrl,
        description,
        applicationCategory: "HealthApplication",
        applicationSubCategory: "Contemplative practice and reflective journaling",
        operatingSystem: "Web",
        browserRequirements: "Requires JavaScript and a modern web browser",
        availableOnDevice: ["Desktop", "Tablet", "Mobile"],
        inLanguage: "en-US",
        isAccessibleForFree: true,
        isFamilyFriendly: true,
        accessibilitySummary:
          "The app uses semantic navigation, visible labels, keyboard-accessible controls, and high-contrast theme support.",
        creator: {
          "@id": personId,
        },
        publisher: {
          "@id": organizationId,
        },
        image: absoluteUrl("/opengraph-image"),
        screenshot: absoluteUrl("/opengraph-image"),
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        audience: [
          { "@type": "Audience", audienceType: "spiritual growth practitioners" },
          { "@type": "Audience", audienceType: "mindfulness and meditation users" },
          { "@type": "Audience", audienceType: "schools and reflective communities" },
        ],
        featureList: [
          "Dharma planning",
          "Karma Yoga service journaling",
          "Bhakti gratitude journaling",
          "Dhyana meditation tracking",
          "Jnana reflection notes",
          "Vasana pattern awareness",
          "Motivation and analytics dashboards",
          "Invite and sharing tools",
        ],
        hasPart: publicPageReferences,
      },
      ...publicPageProfiles.map(buildWebPageNode),
      ...publicPageProfiles.map(buildBreadcrumbNode),
    ],
  };
}

export const siteJsonLd = buildSiteJsonLd();

export function buildHomePageJsonLd() {
  const homeProfile = publicPageProfileByPath.get("/") ?? publicPageProfiles[0];
  const moduleProfiles = publicPageProfiles.filter(
    (profile) => !["/", "/share"].includes(profile.path),
  );

  return {
    "@context": "https://schema.org",
    "@graph": [
      buildWebPageNode(homeProfile),
      buildBreadcrumbNode(homeProfile),
      {
        "@type": "FAQPage",
        "@id": `${absoluteUrl("/")}#faq`,
        mainEntity: homepageFaq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
      {
        "@type": "ItemList",
        "@id": `${absoluteUrl("/")}#core-modules`,
        name: "Buddhi Align core practice modules",
        itemListElement: moduleProfiles.map((profile, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: profile.title,
          url: absoluteUrl(profile.path),
          description: profile.summary,
        })),
      },
    ],
  };
}

export function buildSharePageJsonLd() {
  const shareProfile = publicPageProfileByPath.get("/share");

  if (!shareProfile) return null;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...buildWebPageNode(shareProfile),
        "@type": "CollectionPage",
        mainEntity: {
          "@type": "ItemList",
          name: "Buddhi Align share snippets",
          itemListElement: shareProfile.outcomes.map((outcome, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: outcome,
          })),
        },
      },
      buildBreadcrumbNode(shareProfile),
    ],
  };
}
