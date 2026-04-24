# Discourse Reverse Proxy Setup (/community)

This guide makes Discourse feel native under the Buddhi Align domain:

- App: https://buddhi-align.foreverlotus.com/
- Community: https://buddhi-align.foreverlotus.com/community

## 1) Application Environment (Buddhi Align frontend)

Set these environment variables in your deployment target (for example Vercel):

- COMMUNITY_INTEGRATION_PROVIDER=discourse
- DISCOURSE_BASE_URL=https://buddhi-align.foreverlotus.com/community
- NEXT_PUBLIC_DISCOURSE_COMMUNITY_URL=https://buddhi-align.foreverlotus.com/community
- COMMUNITY_PROXY_TARGET=https://community.foreverlotus.com/community
- DISCOURSE_PARENT_CATEGORY_SLUG=buddhi-align

Optional:

- DISCOURSE_DEFAULT_CATEGORY_SLUG=community

The app now preserves subpaths, so generated category links become:

- /community/c/<subcategory>
- /community/c/<parent>/<subcategory>

When `COMMUNITY_PROXY_TARGET` is set, the Next.js app proxies:

- `/community` -> `COMMUNITY_PROXY_TARGET`
- `/community/:path*` -> `COMMUNITY_PROXY_TARGET/:path*`

This keeps the browser on `https://buddhi-align.foreverlotus.com/community` instead of sending users to a separate tab or visible subdomain.

If the proxy target is not ready yet, leave `COMMUNITY_PROXY_TARGET` unset. Community links will still be generated from `NEXT_PUBLIC_DISCOURSE_COMMUNITY_URL`, but the in-site proxy will not be active.

## 2) Discourse Container Configuration

In Discourse app.yml (or equivalent runtime env), set:

- DISCOURSE_HOSTNAME=buddhi-align.foreverlotus.com
- DISCOURSE_RELATIVE_URL_ROOT=/community

Then rebuild/restart Discourse.

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
  location /community/ {
    proxy_pass http://YOUR_DISCOURSE_ORIGIN/;
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

- Keep trailing slash behavior exactly as shown for proxy_pass in /community/.
- If your Discourse runs TLS internally, use https:// for YOUR_DISCOURSE_ORIGIN.

## 4) Caddy Reverse Proxy (reference)

```caddy
buddhi-align.foreverlotus.com {
  handle_path /community/* {
    reverse_proxy YOUR_DISCOURSE_ORIGIN
  }

  handle {
    reverse_proxy YOUR_APP_ORIGIN
  }
}
```

## 5) SSO and Callback URLs

In Discourse settings:

- discourse connect url = https://buddhi-align.foreverlotus.com/api/community/discourse/sso

In app environment:

- DISCOURSE_SSO_SECRET must match Discourse discourse connect secret.

## 6) Validation Checklist

1. Open /api/community/link?module=bhakti and verify url includes /community/c/...
2. Click Join Community and confirm same domain path navigation in the current tab.
3. Confirm login and DiscourseConnect handoff works.
4. Confirm topic pages, composer, and notifications load.
5. Confirm websocket/live updates are working (no stuck loading indicators).

## 7) Share Community Widgets on Other Websites

Other websites can promote the same community without embedding the full Discourse app.

Use this lightweight widget:

```html
<div
  data-buddhi-community-widget
  data-module="dhyana"
  data-title="Join the ForeverLotus Community"
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

## 8) Rollback Plan

If needed, revert only these env values:

- DISCOURSE_BASE_URL=https://community.foreverlotus.com
- NEXT_PUBLIC_DISCOURSE_COMMUNITY_URL=https://community.foreverlotus.com
- unset COMMUNITY_PROXY_TARGET

No app code rollback is needed for subdomain mode.
