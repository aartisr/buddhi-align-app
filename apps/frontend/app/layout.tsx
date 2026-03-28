
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import "./components/buddhi-bg.css";

import BackgroundMusic from "./components/BackgroundMusic";
import SiteFooter from "./components/SiteFooter";
import { I18nProvider } from "./i18n/provider";
import { DEFAULT_LOCALE, translate } from "./i18n/config";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: translate(DEFAULT_LOCALE, "app.title"),
  description: translate(DEFAULT_LOCALE, "app.description"),
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <I18nProvider>
          <div className="buddhi-bg-gradient" aria-hidden="true"></div>
          <BackgroundMusic />
          {children}
          <SiteFooter />
        </I18nProvider>
      </body>
    </html>
  );
}
