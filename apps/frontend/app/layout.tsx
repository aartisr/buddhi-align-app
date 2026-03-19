
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import "./components/buddhi-bg.css";

import BackgroundMusic from "./components/BackgroundMusic";
import SiteFooter from "./components/SiteFooter";


const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Buddhi Align App",
  description: "A subtle, spiritual, and professional journaling and analytics app.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <div className="buddhi-bg-gradient" aria-hidden="true"></div>
        <BackgroundMusic />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
