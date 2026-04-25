import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AutographProfileShowcase } from "@aartisr/autograph-feature/profile-components";
import { auth } from "@/auth";
import JsonLd from "@/app/components/JsonLd";
import ModuleLayout from "@/app/components/ModuleLayout";
import { isAutographFeatureEnabled } from "@/app/lib/autographs/feature";
import { autographService } from "@/app/lib/autographs/service";
import {
  buildAutographProfileDescription,
  buildAutographProfilePageJsonLd,
  buildPageMetadata,
} from "@/app/lib/seo";
import { withDisplayAvatarUrl } from "../../api/autographs/_profile-payload";

type ProfilePageProps = {
  params: {
    id: string;
  };
};

const EXCHANGE_HOME_HREF = "/autograph-exchange";
const EXCHANGE_RETURN_HREF = "/autograph-exchange#autograph-request-composer";
const PROFILE_SETUP_HREF = "/autograph-exchange#autograph-profile-setup";
const PROFILES_HREF = "/profiles";
const OUTBOX_HREF = "/autograph-exchange#autograph-requests-sent";

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const profile = isAutographFeatureEnabled()
    ? await autographService.getPublicAutographProfile(params.id)
    : null;

  if (!profile) {
    return buildPageMetadata({
      title: "Autograph Exchange Profile",
      description:
        "Open a Buddhi Align autograph profile to review public details and request a meaningful digital autograph.",
      path: `${PROFILES_HREF}/${params.id}`,
    });
  }

  return buildPageMetadata({
    title: `${profile.displayName} Autograph Profile`,
    description: buildAutographProfileDescription(profile),
    path: `${PROFILES_HREF}/${params.id}`,
    keywords: [profile.role, ...(profile.subjects ?? []), ...(profile.interests ?? [])],
  });
}

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: ProfilePageProps) {
  if (!isAutographFeatureEnabled()) {
    notFound();
  }

  const [profile, session] = await Promise.all([
    autographService.getPublicAutographProfile(params.id),
    auth(),
  ]);

  if (!profile) {
    notFound();
  }

  const viewerId = session?.user?.id;
  const viewer = viewerId
    ? {
        id: viewerId,
        email: session?.user?.email ?? null,
      }
    : null;
  const myProfile = viewerId
    ? (await autographService.listAutographProfiles()).find((item) => item.userId === viewerId)
    : null;

  const displayProfile = withDisplayAvatarUrl(profile);

  return (
    <ModuleLayout titleKey="module.autograph.title">
      <JsonLd data={buildAutographProfilePageJsonLd(displayProfile)} />
      <AutographProfileShowcase
        profile={displayProfile}
        viewer={viewer}
        canEdit={myProfile?.id === profile.id}
        viewerHasProfile={Boolean(myProfile)}
        exchangeHomeHref={EXCHANGE_HOME_HREF}
        exchangeReturnHref={EXCHANGE_RETURN_HREF}
        profileSetupHref={PROFILE_SETUP_HREF}
        profilesHref={PROFILES_HREF}
        outboxHref={OUTBOX_HREF}
      />
    </ModuleLayout>
  );
}
