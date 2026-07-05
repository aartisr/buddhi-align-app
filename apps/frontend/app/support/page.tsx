import JsonLd from "../components/JsonLd";
import FocusIntro from "../components/FocusIntro";
import ModuleLayout from "../components/ModuleLayout";
import { buildSupportPageJsonLd } from "../lib/seo";
import SupportPageClient from "./SupportPageClient";

export default function SupportPage() {
  return (
    <ModuleLayout titleKey="support.title">
      <JsonLd data={buildSupportPageJsonLd()} />
      <FocusIntro
        title="Report the issue fast"
        summary="Share only what happened and where; we will handle the rest."
      />
      <SupportPageClient />
    </ModuleLayout>
  );
}
