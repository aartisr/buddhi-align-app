import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AutographProfileDirectory } from "@aartisr/autograph-feature/profile-components";
import JsonLd from "@/app/components/JsonLd";
import ModuleLayout from "@/app/components/ModuleLayout";
import { isAutographFeatureEnabled } from "@/app/lib/autographs/feature";
import { autographService } from "@/app/lib/autographs/service";
import { buildAutographProfilesDirectoryJsonLd, buildPageMetadata } from "@/app/lib/seo";
import { withDisplayAvatarUrls } from "../api/autographs/_profile-payload";

const EXCHANGE_HOME_HREF = "/autograph-exchange";
const EXCHANGE_RETURN_HREF = "/autograph-exchange#autograph-request-composer";
const PROFILES_HREF = "/profiles";

export const metadata: Metadata = buildPageMetadata({
  title: "Autograph Exchange Profiles",
  description:
    "Browse teacher and student profiles in Buddhi Align, then open a profile to request a meaningful digital autograph.",
  path: PROFILES_HREF,
  keywords: ["autograph profiles", "teacher profiles", "student profiles"],
});

export const dynamic = "force-dynamic";

export default async function ProfilesPage() {
  if (!isAutographFeatureEnabled()) {
    notFound();
  }

  const profiles = await autographService.listPublicAutographProfiles();
  const displayProfiles = withDisplayAvatarUrls(profiles);

  return (
    <ModuleLayout titleKey="module.autograph.title">
      <JsonLd data={buildAutographProfilesDirectoryJsonLd(displayProfiles)} />
      <AutographProfileDirectory
        profiles={displayProfiles}
        exchangeHomeHref={EXCHANGE_HOME_HREF}
        exchangeReturnHref={EXCHANGE_RETURN_HREF}
        profilesHref={PROFILES_HREF}
      />
    </ModuleLayout>
  );
}
