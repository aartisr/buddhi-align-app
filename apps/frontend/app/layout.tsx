
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
import SiteFooter from "./components/SiteFooter";
import { I18nProvider } from "./i18n/provider";
import { DEFAULT_LOCALE, translate } from "./i18n/config";
import Providers from "./components/Providers";
import { getSiteUrl } from "./lib/site-url";

const siteUrl = getSiteUrl();

const title = translate(DEFAULT_LOCALE, "app.title");
const description = translate(DEFAULT_LOCALE, "app.description");

export const metadata: Metadata = {
  title: {
    default: title,
    template: `%s | ${title}`,
  },
  description,
  metadataBase: new URL(siteUrl),
  applicationName: title,
  manifest: "/manifest.json",
  keywords: [
    "spiritual journaling",
    "meditation tracker",
    "karma yoga",
    "bhakti journal",
    "dhyana meditation",
    "jnana reflection",
    "self-development",
    "mindfulness",
    "Indian philosophy",
  ],
  authors: [{ name: "Aarti Sri Ravikumar", url: "https://aartisr.netlify.app/" }],
  creator: "Aarti Sri Ravikumar",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1 },
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: title,
    title,
    description,
  },
  twitter: {
    card: "summary",
    title,
    description,
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
