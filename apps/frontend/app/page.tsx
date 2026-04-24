import React from "react";

import JsonLd from "./components/JsonLd";
import HomePageClient from "./HomePageClient";
import { buildHomePageJsonLd } from "./lib/seo";

export default function Home() {
  return (
    <>
      <JsonLd data={buildHomePageJsonLd()} />
      <HomePageClient />
    </>
  );
}
