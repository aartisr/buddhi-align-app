import JsonLd from "./JsonLd";
import { buildPublicPageJsonLd } from "../lib/seo";

/** Adds route-specific WebPage and breadcrumb schema to public module pages. */
export default function PublicPageJsonLd({ path }: { path: string }) {
  return <JsonLd data={buildPublicPageJsonLd(path)} />;
}
