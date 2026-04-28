const COMMUNITY_ROUTE = "/community";
const COMMUNITY_SSO_LOGIN_ROUTE = "/api/community/discourse/login";

function isCommunityPath(value: string): boolean {
  return value === COMMUNITY_ROUTE
    || value.startsWith(`${COMMUNITY_ROUTE}/`)
    || value.startsWith(`${COMMUNITY_ROUTE}?`)
    || value.startsWith(`${COMMUNITY_ROUTE}#`);
}

function isDiscourseSsoSystemPath(pathname: string): boolean {
  return pathname === `${COMMUNITY_ROUTE}/session/sso`
    || pathname === `${COMMUNITY_ROUTE}/session/sso_login`;
}

export function isSameOriginCommunityHref(href?: string, currentOrigin = ""): boolean {
  if (!href) return false;

  if (isCommunityPath(href)) {
    return true;
  }

  if (!currentOrigin) return false;

  try {
    const url = new URL(href, currentOrigin);
    return url.origin === currentOrigin
      && (url.pathname === COMMUNITY_ROUTE || url.pathname.startsWith(`${COMMUNITY_ROUTE}/`));
  } catch {
    return false;
  }
}

export function shouldWarmCommunityHref(href?: string, currentOrigin = ""): boolean {
  return isSameOriginCommunityHref(href, currentOrigin);
}

export function shouldUseDocumentNavigationForCommunity(href?: string): boolean {
  return href ? isCommunityPath(href) : false;
}

export function normalizeCommunityReturnPath(href?: string, currentOrigin = ""): string {
  if (!href) return COMMUNITY_ROUTE;

  let pathnameWithQueryAndHash: string | undefined;

  if (isCommunityPath(href)) {
    pathnameWithQueryAndHash = href;
  } else if (currentOrigin) {
    try {
      const url = new URL(href, currentOrigin);
      if (url.origin === currentOrigin && isSameOriginCommunityHref(url.toString(), currentOrigin)) {
        pathnameWithQueryAndHash = `${url.pathname}${url.search}${url.hash}`;
      }
    } catch {
      pathnameWithQueryAndHash = undefined;
    }
  }

  if (!pathnameWithQueryAndHash) return COMMUNITY_ROUTE;

  try {
    const parsed = new URL(pathnameWithQueryAndHash, "https://buddhi-align.local");
    if (isDiscourseSsoSystemPath(parsed.pathname)) return COMMUNITY_ROUTE;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return COMMUNITY_ROUTE;
  }
}

export function buildCommunitySsoLoginHref(returnPath?: string, currentOrigin = ""): string {
  const params = new URLSearchParams();
  params.set("returnPath", normalizeCommunityReturnPath(returnPath, currentOrigin));
  return `${COMMUNITY_SSO_LOGIN_ROUTE}?${params.toString()}`;
}
