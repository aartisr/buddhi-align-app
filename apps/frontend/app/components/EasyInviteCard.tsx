"use client";

import React from "react";
import { useMemo, useState } from "react";
import { MODULE_CATALOG, translate, DEFAULT_LOCALE } from "@/app/i18n/config";

type EasyInviteCardProps = {
  title: string;
  subtitle: string;
  defaultPath?: string;
  moduleOptions?: InviteModuleOption[];
  includeHomeOption?: boolean;
  homeOptionLabel?: string;
  moduleSelectorLabel?: string;
  emailFieldLabel?: string;
  phoneFieldLabel?: string;
  emailPlaceholder?: string;
  phonePlaceholder?: string;
  emailCta: string;
  smsCta: string;
  copyCta: string;
  shareCta: string;
  copiedLabel: string;
};

type InviteModuleOption = {
  key: string;
  href: string;
  label: string;
};

type InviteTemplate = {
  id: string;
  path: string;
  label: string;
  params: Record<string, string>;
};

function defaultLabelFromHref(href: string): string {
  return href
    .replace(/^\//, "")
    .split("-")
    .map((token) => (token ? token[0].toUpperCase() + token.slice(1) : ""))
    .join(" ") || href;
}

function getDefaultModuleOptions(): InviteModuleOption[] {
  return MODULE_CATALOG.map((item) => ({
    key: item.key,
    href: item.href,
    label: defaultLabelFromHref(item.href),
  }));
}

function buildInviteTemplates(options: {
  moduleOptions: InviteModuleOption[];
  includeHomeOption: boolean;
  homeOptionLabel: string;
}): InviteTemplate[] {
  const templates: InviteTemplate[] = [];

  if (options.includeHomeOption) {
    templates.push({
      id: "home",
      path: "/",
      label: options.homeOptionLabel,
      params: {
        source: "invite",
        mode: "quickstart",
      },
    });
  }

  for (const moduleOption of options.moduleOptions) {
    templates.push({
      id: moduleOption.key,
      path: moduleOption.href,
      label: moduleOption.label,
      params: {
        source: "invite",
        module: moduleOption.key,
        onboarding: "1",
      },
    });
  }

  return templates;
}

function buildTemplateUrl(template: InviteTemplate): string {
  const params = new URLSearchParams(template.params);
  const query = params.toString();
  return query ? `${template.path}?${query}` : template.path;
}

function makeAbsoluteUrl(path: string): string {
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

function buildInviteMessage(url: string): string {
  return translate(DEFAULT_LOCALE, "invite.messageTemplate", { url });
}

export default function EasyInviteCard({
  title,
  subtitle,
  defaultPath = "/",
  moduleOptions,
  includeHomeOption = true,
  homeOptionLabel = "Home (quick start)",
  moduleSelectorLabel = "Share module",
  emailFieldLabel = "Email (optional)",
  phoneFieldLabel = "Phone (optional)",
  emailPlaceholder = "friend@example.com",
  phonePlaceholder = "+1 555 123 4567",
  emailCta,
  smsCta,
  copyCta,
  shareCta,
  copiedLabel,
}: EasyInviteCardProps) {
  const templates = useMemo(
    () =>
      buildInviteTemplates({
        moduleOptions: moduleOptions && moduleOptions.length > 0 ? moduleOptions : getDefaultModuleOptions(),
        includeHomeOption,
        homeOptionLabel,
      }),
    [moduleOptions, includeHomeOption, homeOptionLabel],
  );

  const [invitePath, setInvitePath] = useState(() => {
    const fallback = templates[0];
    if (!fallback) return defaultPath;
    const hasDefaultTemplate = templates.some((item) => item.path === defaultPath);
    if (!hasDefaultTemplate) return buildTemplateUrl(fallback);
    const template = templates.find((item) => item.path === defaultPath) ?? fallback;
    return buildTemplateUrl(template);
  });
  const [emailTo, setEmailTo] = useState("");
  const [phoneTo, setPhoneTo] = useState("");
  const [copied, setCopied] = useState(false);

  const inviteUrl = useMemo(() => makeAbsoluteUrl(invitePath), [invitePath]);
  const inviteMessage = useMemo(() => buildInviteMessage(inviteUrl), [inviteUrl]);
  const hasNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const emailHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set("subject", translate(DEFAULT_LOCALE, "invite.mailSubject"));
    params.set("body", inviteMessage);
    const recipient = emailTo.trim();
    return `mailto:${encodeURIComponent(recipient)}?${params.toString()}`;
  }, [emailTo, inviteMessage]);

  const smsHref = useMemo(() => {
    const encoded = encodeURIComponent(inviteMessage);
    const recipient = phoneTo.trim();
    return `sms:${encodeURIComponent(recipient)}?body=${encoded}`;
  }, [phoneTo, inviteMessage]);

  async function copyInviteLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  async function shareInviteLink() {
    if (!hasNativeShare) return;
    try {
      await navigator.share({
        title: title,
        text: translate(DEFAULT_LOCALE, "invite.shareText"),
        url: inviteUrl,
      });
    } catch {
      // User cancel should remain silent.
    }
  }

  return (
    <section className="app-surface-card max-w-4xl mx-auto mb-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="app-panel-title text-lg sm:text-xl font-bold leading-tight">{title}</h2>
          <p className="app-copy-soft text-sm mt-1">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <label className="text-xs app-copy-soft md:col-span-1">
            {moduleSelectorLabel}
            <select
              value={invitePath}
              onChange={(event) => setInvitePath(event.target.value)}
              className="app-input w-full mt-1"
              aria-label={translate(DEFAULT_LOCALE, "invite.modulePathAria")}
            >
              {templates.map((item) => (
                <option key={item.id} value={buildTemplateUrl(item)}>{item.label}</option>
              ))}
            </select>
          </label>

          <label className="text-xs app-copy-soft md:col-span-1">
            {emailFieldLabel}
            <input
              className="app-input w-full mt-1"
              type="email"
              inputMode="email"
              placeholder={emailPlaceholder}
              value={emailTo}
              onChange={(event) => setEmailTo(event.target.value)}
            />
          </label>

          <label className="text-xs app-copy-soft md:col-span-1">
            {phoneFieldLabel}
            <input
              className="app-input w-full mt-1"
              type="tel"
              inputMode="tel"
              placeholder={phonePlaceholder}
              value={phoneTo}
              onChange={(event) => setPhoneTo(event.target.value)}
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a href={emailHref} className="app-user-action px-3 py-2 rounded-lg text-sm">{emailCta}</a>
          <a href={smsHref} className="app-user-action px-3 py-2 rounded-lg text-sm">{smsCta}</a>
          <button type="button" onClick={copyInviteLink} className="app-user-action px-3 py-2 rounded-lg text-sm">
            {copied ? copiedLabel : copyCta}
          </button>
          {hasNativeShare ? (
            <button type="button" onClick={shareInviteLink} className="app-button-primary px-3 py-2 rounded-lg text-sm">
              {shareCta}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
