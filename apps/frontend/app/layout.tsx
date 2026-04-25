
import type { Metadata, Viewport } from "next";

import "./globals.css";
import "./styles/theme-base.css";
import "./styles/auth-ui.css";
import "./styles/feedback-ui.css";
import "./styles/analytics-ui.css";
import "./styles/widgets.css";
import "./styles/records.css";
import "./styles/navigation.css";
import "./styles/responsive.css";
import "./styles/contrast-overrides.css";
import "./components/buddhi-bg.css";

import BackgroundMusic from "./components/BackgroundMusic";
import JsonLd from "./components/JsonLd";
import SiteFooter from "./components/SiteFooter";
import { I18nProvider } from "./i18n/provider";
import { DEFAULT_LOCALE, translate } from "./i18n/config";
import Providers from "./components/Providers";
import {
  authorName,
  authorUrl,
  buildPageMetadata,
  buildSiteJsonLd,
  organizationName,
  siteName,
  siteUrl,
} from "./lib/seo";

const title = translate(DEFAULT_LOCALE, "app.title");
const description = translate(DEFAULT_LOCALE, "app.description");

export const metadata: Metadata = {
  ...buildPageMetadata({
    title,
    description,
  }),
  title: {
    default: title,
    template: `%s | ${siteName}`,
  },
  metadataBase: new URL(siteUrl),
  applicationName: title,
  manifest: "/manifest.json",
  authors: [{ name: authorName, url: authorUrl }],
  creator: authorName,
  publisher: organizationName,
  category: "health",
  classification: "Contemplative practice, spiritual journaling, and personal growth analytics",
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/buddhi-align-icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/buddhi-align-icon.svg" }],
    shortcut: ["/favicon.ico"],
  },
  appleWebApp: {
    capable: true,
    title,
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
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName,
    title,
    description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${title} social preview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/twitter-image"],
  },
};

export const viewport: Viewport = {
  themeColor: "#2f5d50",
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <JsonLd data={buildSiteJsonLd({ name: title, description })} />
        <h1 className="sr-only">{title}</h1>
        <Providers>
          <I18nProvider>
            <div className="buddhi-bg-gradient" aria-hidden="true"></div>
            <BackgroundMusic />
            {children}
            <SiteFooter />
          </I18nProvider>
        </Providers>
      </body>
    </html>
  );
}
