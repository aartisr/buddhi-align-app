import JsonLd from "../components/JsonLd";
import ModuleLayout from "../components/ModuleLayout";
import { buildSupportPageJsonLd } from "../lib/seo";
import SupportPageClient from "./SupportPageClient";

export default function SupportPage() {
  return (
    <ModuleLayout titleKey="support.title">
      <JsonLd data={buildSupportPageJsonLd()} />
      <SupportPageClient />
    </ModuleLayout>
  );
}
