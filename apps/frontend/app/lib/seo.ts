import type { Metadata } from "next";
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
  "A subtle, spiritual, and professional journaling and analytics app.";
export const organizationName = "ForeverLotus";
export const organizationUrl = "https://foreverlotus.com";
export const authorName = "Aarti Sri Ravikumar";
export const authorUrl = "https://aartisr.foreverlotus.com";
export const organizationId = `${organizationUrl}/#organization`;
export const websiteId = `${siteUrl}/#website`;
export const webAppId = `${siteUrl}/#webapp`;
export const personId = `${authorUrl}/#person`;

export const siteKeywords = [
  "spiritual journaling",
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
];

function absoluteUrl(path = "/") {
  return new URL(path, `${siteUrl}/`).toString();
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

  return {
    title,
    description,
    keywords: [...siteKeywords, ...keywords],
    alternates: {
      canonical: canonicalUrl,
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

export const siteJsonLd = {
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
      name: siteName,
      url: siteUrl,
      description: siteDescription,
      inLanguage: "en-US",
      creator: {
        "@id": personId,
      },
      publisher: {
        "@id": organizationId,
      },
    },
    {
      "@type": "WebApplication",
      "@id": webAppId,
      name: siteName,
      url: siteUrl,
      description: siteDescription,
      applicationCategory: "HealthApplication",
      operatingSystem: "Web",
      inLanguage: "en-US",
      isAccessibleForFree: true,
      creator: {
        "@id": personId,
      },
      publisher: {
        "@id": organizationId,
      },
      image: absoluteUrl("/opengraph-image"),
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Spiritual journaling",
        "Meditation tracking",
        "Habit and tendency reflection",
        "Dharma planning",
        "Motivation and analytics dashboards",
        "Integrated autograph exchange keepsakes",
      ],
    },
  ],
};
