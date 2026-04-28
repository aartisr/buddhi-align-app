# Discourse Reverse Proxy Setup (/community)

This guide makes Discourse feel native under the Buddhi Align domain:

- App: https://buddhi-align.foreverlotus.com/
- Community: https://buddhi-align.foreverlotus.com/community

## 1) Application Environment (Buddhi Align frontend)

Set these environment variables in your deployment target (for example Vercel or Netlify) after Discourse has been rebuilt for `/community`:

- COMMUNITY_INTEGRATION_PROVIDER=discourse
- DISCOURSE_BASE_URL=https://buddhi-align.foreverlotus.com/community
- NEXT_PUBLIC_DISCOURSE_COMMUNITY_URL=https://buddhi-align.foreverlotus.com/community
- COMMUNITY_PROXY_TARGET=https://community.foreverlotus.com/community
- DISCOURSE_PARENT_CATEGORY_SLUG=buddhi-align

Optional:

- DISCOURSE_DEFAULT_CATEGORY_SLUG=community
- DISCOURSE_API_USERNAME=system
- DISCOURSE_API_KEY=<admin-api-key>

Set the Discourse API credentials in Vercel/production when module categories are private or group-gated. Buddhi Align uses them server-side to resolve real Discourse category IDs from `/categories.json`; without them, module buttons fall back to `/community` instead of sending users to a category URL that may show Discourse's private/not-found page.

The app now preserves subpaths, so generated category links become:

- /community/c/<subcategory>/<category-id>
- /community/c/<parent>/<subcategory>/<category-id>

When `COMMUNITY_PROXY_TARGET` is set, the Next.js app proxies:

- `/community` -> `COMMUNITY_PROXY_TARGET`
- `/community/:path*` -> `COMMUNITY_PROXY_TARGET/:path*`

This keeps the browser on `https://buddhi-align.foreverlotus.com/community` instead of sending users to a separate tab or visible subdomain.

If the proxy target is not ready yet, leave `COMMUNITY_PROXY_TARGET` unset. Community links will keep using the native Buddhi Align community pages until the full Discourse proxy is ready.

## 2) Discourse Container Configuration

In Discourse `app.yml` (or equivalent runtime env), set:

- DISCOURSE_HOSTNAME=buddhi-align.foreverlotus.com
- DISCOURSE_RELATIVE_URL_ROOT=/community
- DISCOURSE_FORCE_HTTPS=true

Then apply the official Discourse subfolder `run` section for `/community` and rebuild/restart Discourse. The `DISCOURSE_RELATIVE_URL_ROOT` value must not end with a trailing slash.

## 3) Nginx Reverse Proxy (reference)

Use this when Nginx is your edge gateway.

```nginx
server {
  listen 443 ssl http2;
  server_name buddhi-align.foreverlotus.com;

  # App traffic
  location / {
    proxy_pass https://YOUR_APP_ORIGIN;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  # Discourse under /community
  location /community {
    proxy_pass http://YOUR_DISCOURSE_ORIGIN;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Host $host;

    # Required for websocket/live updates
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

Notes:

- Keep trailing slash behavior exactly as shown: the proxy must preserve `/community` because Discourse is configured with `DISCOURSE_RELATIVE_URL_ROOT=/community`.
- If your Discourse runs TLS internally, use `https://` for `YOUR_DISCOURSE_ORIGIN`.

## 4) Caddy Reverse Proxy (reference)

```caddy
buddhi-align.foreverlotus.com {
  handle /community* {
    reverse_proxy YOUR_DISCOURSE_ORIGIN
  }

  handle {
    reverse_proxy YOUR_APP_ORIGIN
  }
}
```

## 5) SSO and Callback URLs

In Discourse settings:

- enable discourse connect = enabled
- discourse connect url = https://buddhi-align.foreverlotus.com/api/community/discourse/sso
- discourse connect secret = the same secret stored in `DISCOURSE_SSO_SECRET`

For seamless app-to-forum navigation, Buddhi Align sends Community links through:

- https://buddhi-align.foreverlotus.com/api/community/discourse/login?returnPath=/community

That route checks the Buddhi Align OAuth session. If a user is already signed in to Buddhi Align, it starts DiscourseConnect at `/community/session/sso?return_path=...` so Discourse creates or reuses the matching user before returning to the forum page. The `return_path` value must be Discourse-relative, for example `/c/buddhi-align/bhakti-journal/11`, not `/community/c/buddhi-align/bhakti-journal/11`. If no Buddhi Align session exists, it falls back to public community browsing.

Optional: if you want direct visits to `/community` to always require Buddhi Align SSO, enable Discourse `login required`. Leave it disabled if anonymous read access should remain available.

In app environment:

- DISCOURSE_SSO_SECRET must match Discourse discourse connect secret.
- AUTH_URL / NEXTAUTH_URL should use https://buddhi-align.foreverlotus.com in production.

## 6) Validation Checklist

1. Open `https://buddhi-align.foreverlotus.com/community` and confirm the page is the full Discourse app, not the native Buddhi cards.
2. Open `/api/community/link?module=bhakti` and verify the JSON URL is ID-qualified when Discourse is reachable, for example `/community/c/buddhi-align/bhakti-journal/11`.
3. While signed in to Buddhi Align, open `/api/community/discourse/login?returnPath=/community/c/buddhi-align/bhakti-journal/11` and confirm it redirects to `/community/session/sso?return_path=/c/buddhi-align/bhakti-journal/11`.
4. Click `Discuss in Community` from a module and confirm same-domain navigation in the current tab.
5. Sign in and confirm DiscourseConnect returns to `/community/session/sso_login`, then lands back on the intended `/community/...` path with the Discourse user logged in.
6. Create or open a topic and confirm composer, notifications, uploads, and live updates work.
7. Browser devtools should show Discourse assets loading from `/community/...`, not root `/assets/...`.

## 7) Performance, Search, and Sharing

Keep the Discourse origin warm and crawlable:

- Add both sitemap URLs to Google Search Console and Bing Webmaster Tools:
  - https://buddhi-align.foreverlotus.com/sitemap.xml
  - https://buddhi-align.foreverlotus.com/community/sitemap.xml
- Confirm `https://buddhi-align.foreverlotus.com/robots.txt` allows `/community`, `/community/c/`, and `/community/t/`, while blocking login/session/admin/search routes.
- In Discourse Admin -> Settings, set the site title, description, short site description, logo, large icon, favicon, default locale, and social share images.
- In Discourse Admin -> Settings, keep `login required` off if public topic pages should rank. Turn it on only if the community must be private.
- Keep topic titles specific and human-searchable: module name + question/outcome works better than generic titles.
- Pin one welcome topic in each module category with a concise description and links back to the matching Buddhi Align module.
- Keep Caddy and Discourse warm with a lightweight cron from the server:
  - `*/5 * * * * curl -fsS https://buddhi-align.foreverlotus.com/community >/dev/null`
  - `*/5 * * * * curl -fsS https://buddhi-align.foreverlotus.com/community/categories.json >/dev/null`
- After deploys or Discourse rebuilds, test first byte time:
  - `curl -sS -o /dev/null -w 'ttfb=%{time_starttransfer} total=%{time_total} code=%{http_code}\n' https://buddhi-align.foreverlotus.com/community`
  - `curl -sS -o /dev/null -w 'ttfb=%{time_starttransfer} total=%{time_total} code=%{http_code}\n' https://buddhi-align.foreverlotus.com/community/c/buddhi-align/bhakti-journal/11`

## 8) Share Community Widgets on Other Websites

Other websites can promote the same community without embedding the full Discourse app.

Use this lightweight widget:

```html
<div
  data-buddhi-community-widget
  data-module="dhyana"
  data-title="Discuss with the ForeverLotus Community"
  data-body="Discuss meditation practice, reflections, and steady daily growth with the Buddhi Align community."
></div>
<script async src="https://buddhi-align.foreverlotus.com/community-widget.js"></script>
```

Supported `data-module` values:

- `karma`
- `bhakti`
- `jnana`
- `dhyana`
- `vasana`
- `dharma`
- `motivation`
- `autograph`

Optional attributes:

- `data-base-url`: override the community base URL.
- `data-label`: override the button label.

The widget intentionally opens the community in a new tab when embedded on other websites, while Buddhi Align opens same-origin `/community` links in the current tab.

## 9) Rollback Plan

If needed, revert only these env values:

- DISCOURSE_BASE_URL=https://community.foreverlotus.com
- NEXT_PUBLIC_DISCOURSE_COMMUNITY_URL=https://community.foreverlotus.com
- unset COMMUNITY_PROXY_TARGET

No app code rollback is needed for subdomain mode.
