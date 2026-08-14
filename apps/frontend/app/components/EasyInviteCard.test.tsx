import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const component = readFileSync(resolve(__dirname, "EasyInviteCard.tsx"), "utf8");

describe("EasyInviteCard growth loop", () => {
  it("creates absolute, attributable links for every sharing channel", () => {
    expect(component).toContain('new URL(path, `${siteUrl}/`)');
    expect(component).toContain('url.searchParams.set("utm_campaign", "community-invite")');
    expect(component).toContain('buildCampaignUrl(invitePath, "whatsapp")');
    expect(component).toContain('https://wa.me/?text=');
  });

  it("records sharing intent without collecting a recipient's data", () => {
    expect(component).toContain('logEvent("invite_shared"');
    expect(component).toContain('channel: "whatsapp"');
    expect(component).not.toContain('email: emailTo');
    expect(component).not.toContain('phone: phoneTo');
  });
});
