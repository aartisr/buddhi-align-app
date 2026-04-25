# Forever Lotus Community Integration for Buddhi Align

This guide explains how to make the Forever Lotus Discourse categories appear from inside Buddhi Align instead of sending users away to a new browser tab.

The target experience is:

- Buddhi Align app: `https://buddhi-align.foreverlotus.com`
- In-app community entry point: `https://buddhi-align.foreverlotus.com/community`
- External Discourse source: `https://community.foreverlotus.com/categories`
- Parent category: `Buddhi Align`
- Subcategories: `Karma Yoga`, `Bhakti Journal`, and the other Buddhi Align module categories

## Quick Decision

Use `/community` as the canonical in-app path.

The Buddhi Align code already supports this path. The existing `CommunityLink` component opens links in the same tab when the resolved URL is same-origin. It opens a new tab only when the URL points to another origin, such as `https://community.foreverlotus.com`.

So the main fix is not a button rewrite. The main fix is to make the generated community URL look like this:

```text
https://buddhi-align.foreverlotus.com/community/c/buddhi-align/karma-yoga
```

instead of this:

```text
https://community.foreverlotus.com/c/buddhi-align/karma-yoga
```

## What Already Exists in the Repo

These files are already in place:

```text
apps/frontend/app/components/CommunityLink.tsx
apps/frontend/app/api/community/link/route.ts
apps/frontend/app/lib/community-links.ts
apps/frontend/app/lib/community/providers/discourse-provider.ts
apps/frontend/app/lib/community/module-map.ts
apps/frontend/next.config.js
apps/frontend/docs/discourse-reverse-proxy-setup.md
```

How the flow works today:

1. Module pages render `CommunityLink`.
2. `CommunityLink` calls `/api/community/link?module=<moduleKey>`.
3. The API route builds a Discourse category URL from environment variables.
4. `CommunityLink` checks the URL origin.
5. If the URL origin is `buddhi-align.foreverlotus.com`, it stays in the same tab.
6. If the URL origin is `community.foreverlotus.com`, it opens a new tab.

That means the current new-tab behavior usually means `NEXT_PUBLIC_DISCOURSE_COMMUNITY_URL` is set to the external Discourse domain.

## Existing Module to Category Slugs

The repo currently maps Buddhi Align modules to these Discourse slugs:

| Module key | Expected category slug |
| --- | --- |
| `karma` | `karma-yoga` |
| `bhakti` | `bhakti-journal` |
| `jnana` | `jnana-reflection` |
| `dhyana` | `dhyana-meditation` |
| `vasana` | `vasana-tracker` |
| `dharma` | `dharma-planner` |
| `motivation` | `motivation-analytics` |
| `autograph` | `autograph-exchange`, when the autograph feature is enabled |

Confirm these against the live Discourse category slugs before deploying. If Discourse uses a different spelling, update `MODULE_CATEGORY_SLUGS` in:

```text
apps/frontend/app/lib/community/module-map.ts
```

For example, if the live category slug is `bhakthi-journal` instead of `bhakti-journal`, change the `bhakti` mapping to match Discourse.

## Step 1: Confirm the Live Discourse Category Data

From a network that is allowed to access `community.foreverlotus.com`, open:

```text
https://community.foreverlotus.com/categories.json
```

or run:

```bash
curl -sS https://community.foreverlotus.com/categories.json
```

If SSL inspection blocks the request on a corporate network, use:

```bash
curl -sSk https://community.foreverlotus.com/categories.json
```

Look for the category named `Buddhi Align`.

Record:

```text
parent category name:
parent category slug:
parent category id:
subcategory names:
subcategory slugs:
subcategory ids:
```

Recommended table to fill in:

| Category name | Slug from Discourse | Category id | Buddhi Align module |
| --- | --- | --- | --- |
| Buddhi Align | `buddhi-align` | `<id>` | parent |
| Karma Yoga | `karma-yoga` | `<id>` | `karma` |
| Bhakti Journal | `bhakti-journal` | `<id>` | `bhakti` |
| Jnana Reflection | `jnana-reflection` | `<id>` | `jnana` |
| Dhyana Meditation | `dhyana-meditation` | `<id>` | `dhyana` |
| Vasana Tracker | `vasana-tracker` | `<id>` | `vasana` |
| Dharma Planner | `dharma-planner` | `<id>` | `dharma` |
| Motivation Analytics | `motivation-analytics` | `<id>` | `motivation` |

Discourse often uses category URLs that include a numeric id, such as:

```text
/c/buddhi-align/karma-yoga/12
```

The current Buddhi Align URL builder creates slug-based paths:

```text
/c/buddhi-align/karma-yoga
```

If the live Discourse site redirects slug-only paths correctly, no code change is needed. If the live site returns a 404 without the numeric id, add category-id support before launch.

## Step 2: Choose the Integration Model

There are three possible models. Use Option A if you control the Discourse deployment. Use Option B if Discourse must remain exactly where it is today.

## Option A: Full Discourse UI Under `/community`

This gives the most complete experience. Users remain on:

```text
https://buddhi-align.foreverlotus.com/community
```

and see the actual Discourse app.

This requires Discourse to be configured to work under the `/community` subpath. Without that, assets, login redirects, websocket paths, and internal links may break because Discourse still thinks it lives at `/`.

### A1. Set Buddhi Align Vercel Environment Variables

In Vercel, open the Buddhi Align project and set:

```text
COMMUNITY_INTEGRATION_PROVIDER=discourse
DISCOURSE_INTEGRATION_ENABLED=true
DISCOURSE_BASE_URL=https://community.foreverlotus.com
NEXT_PUBLIC_DISCOURSE_COMMUNITY_URL=https://buddhi-align.foreverlotus.com/community
COMMUNITY_PROXY_TARGET=https://community.foreverlotus.com/community
DISCOURSE_PARENT_CATEGORY_SLUG=buddhi-align
DISCOURSE_DEFAULT_CATEGORY_SLUG=buddhi-align
```

Important:

- `DISCOURSE_BASE_URL` is the real Discourse origin used by server-side API calls.
- `NEXT_PUBLIC_DISCOURSE_COMMUNITY_URL` is the URL shown to users and used by `Join Community`.
- `COMMUNITY_PROXY_TARGET` is where Next.js rewrites `/community` requests.
- `DISCOURSE_PARENT_CATEGORY_SLUG` makes module links resolve under the Buddhi Align parent category.

If Discourse is not configured with `/community` as its relative URL root, do not use `COMMUNITY_PROXY_TARGET=https://community.foreverlotus.com/community`. Use Option B instead.

### A2. Configure Discourse for the `/community` Subpath

In the Discourse container or runtime configuration, set:

```text
DISCOURSE_HOSTNAME=buddhi-align.foreverlotus.com
DISCOURSE_RELATIVE_URL_ROOT=/community
```

Then rebuild or restart Discourse.

For a standard Discourse Docker install, this usually means editing `app.yml` and running the Discourse rebuild command from the Discourse host.

### A3. Confirm Buddhi Align Rewrites Are Active

The repo already has these rewrites in:

```text
apps/frontend/next.config.js
```

When `COMMUNITY_PROXY_TARGET` is set:

```text
/community -> COMMUNITY_PROXY_TARGET
/community/:path* -> COMMUNITY_PROXY_TARGET/:path*
```

No code change is needed for the basic `/community` proxy path.

### A4. Validate the Join Community Link

Run the app locally with the same environment values:

```bash
npm run dev
```

Open:

```text
http://localhost:3000/api/community/link?module=karma
```

Expected response:

```json
{
  "enabled": true,
  "provider": "discourse",
  "module": "karma",
  "url": "https://buddhi-align.foreverlotus.com/community/c/buddhi-align/karma-yoga"
}
```

Then open a module page and click `Join Community`.

Expected result:

```text
The browser stays on buddhi-align.foreverlotus.com.
No new tab opens.
The path starts with /community.
```

### A5. Validate Discourse UI Behavior

Check:

1. `/community` loads.
2. `/community/categories` loads.
3. `/community/c/buddhi-align` loads.
4. `/community/c/buddhi-align/karma-yoga` loads.
5. Topic pages load.
6. Login redirects come back to `/community`.
7. Composer opens.
8. Notifications and live updates work.
9. Browser console has no blocked assets from `/assets`, `/uploads`, `/message-bus`, or websocket URLs.

If assets request `https://buddhi-align.foreverlotus.com/assets/...` instead of `https://buddhi-align.foreverlotus.com/community/assets/...`, Discourse is not correctly configured for the subpath.

## Option B: Native Buddhi Align Community Hub

Use this if you cannot reconfigure Discourse to live under `/community`.

This option displays the Buddhi Align community categories inside the Buddhi Align app using Discourse JSON APIs. Users stay on the Buddhi Align website. This is the most Vercel-friendly approach because Next.js fetches Discourse data server-side and renders native pages.

Recommended in-app routes:

```text
/community
/community/c/buddhi-align
/community/c/buddhi-align/karma-yoga
/community/c/buddhi-align/bhakti-journal
```

### B1. Set Environment Variables

Use:

```text
COMMUNITY_INTEGRATION_PROVIDER=discourse
DISCOURSE_INTEGRATION_ENABLED=true
DISCOURSE_BASE_URL=https://community.foreverlotus.com
NEXT_PUBLIC_DISCOURSE_COMMUNITY_URL=https://buddhi-align.foreverlotus.com/community
DISCOURSE_PARENT_CATEGORY_SLUG=buddhi-align
DISCOURSE_DEFAULT_CATEGORY_SLUG=buddhi-align
```

Leave this unset:

```text
COMMUNITY_PROXY_TARGET
```

Why leave it unset:

The Buddhi Align app will own `/community` as native Next.js pages. The app will fetch Discourse JSON data and render it, instead of proxying the Discourse single-page app.

### B2. Add a Discourse API Helper

Create:

```text
apps/frontend/app/lib/community/discourse-api.ts
```

Responsibilities:

1. Read `DISCOURSE_BASE_URL`.
2. Fetch `/categories.json`.
3. Find the parent category with slug `buddhi-align`.
4. Return its subcategories.
5. Fetch category topic lists when a subcategory page is opened.
6. Use `DISCOURSE_API_USERNAME` and `DISCOURSE_API_KEY` only when private categories require authentication.

Server-side fetches avoid browser CORS issues because the browser only talks to Buddhi Align.

### B3. Add a Community Landing Page

Create:

```text
apps/frontend/app/community/page.tsx
```

The page should:

1. Render an `h1` such as `Buddhi Align Community`.
2. Show cards for the Buddhi Align parent category and subcategories.
3. Link each card to a same-origin Buddhi Align route.
4. Avoid external links for the primary community path.

Example link targets:

```text
/community/c/buddhi-align/karma-yoga
/community/c/buddhi-align/bhakti-journal
/community/c/buddhi-align/dhyana-meditation
```

### B4. Add Category Pages

Create:

```text
apps/frontend/app/community/c/[...categoryPath]/page.tsx
```

The page should:

1. Read the category path from route params.
2. Match it to a known Discourse category slug.
3. Fetch recent topics from Discourse for that category.
4. Render the category name, description, topic list, and a `Continue discussion` action.
5. Keep all navigation under `/community`.

If users need to compose a new topic and full Discourse composer is not embedded, provide a same-tab link to the proxied or external composer only as a secondary action.

### B5. Add API Routes If You Want Client Refresh

Optional API routes:

```text
apps/frontend/app/api/community/categories/route.ts
apps/frontend/app/api/community/topics/route.ts
```

Use these only if the native community pages need client-side refresh. Otherwise, prefer server components so pages are faster and simpler.

### B6. Cache Carefully

For public categories:

```ts
fetch(url, { next: { revalidate: 300 } })
```

For authenticated or user-specific data:

```ts
fetch(url, { cache: "no-store" })
```

Do not cache private user-specific Discourse API responses in a shared page.

### B7. Keep Join Community Same-Tab

With `NEXT_PUBLIC_DISCOURSE_COMMUNITY_URL` set to the Buddhi Align origin, the existing `CommunityLink` component should stay in the same tab.

Validate:

```text
/api/community/link?module=bhakti
```

Expected URL:

```text
https://buddhi-align.foreverlotus.com/community/c/buddhi-align/bhakti-journal
```

If the response URL starts with `https://community.foreverlotus.com`, the link will open a new tab by design. Fix the environment variable, not the button.

## Option C: Iframe Embed

Avoid this unless Discourse is explicitly configured to allow it.

Discourse may block iframe embedding with headers such as:

```text
X-Frame-Options
Content-Security-Policy: frame-ancestors
```

If you still want iframe embedding, Discourse must allow:

```text
https://buddhi-align.foreverlotus.com
```

in its frame ancestor policy. Buddhi Align would also need a `/community` page with an iframe. This is usually less reliable than Option A or Option B for login, SEO, accessibility, and mobile behavior.

## Step 3: Local Setup

Create or update:

```text
apps/frontend/.env.local
```

For Option A:

```text
COMMUNITY_INTEGRATION_PROVIDER=discourse
DISCOURSE_INTEGRATION_ENABLED=true
DISCOURSE_BASE_URL=https://community.foreverlotus.com
NEXT_PUBLIC_DISCOURSE_COMMUNITY_URL=http://localhost:3000/community
COMMUNITY_PROXY_TARGET=https://community.foreverlotus.com/community
DISCOURSE_PARENT_CATEGORY_SLUG=buddhi-align
DISCOURSE_DEFAULT_CATEGORY_SLUG=buddhi-align
```

For Option B:

```text
COMMUNITY_INTEGRATION_PROVIDER=discourse
DISCOURSE_INTEGRATION_ENABLED=true
DISCOURSE_BASE_URL=https://community.foreverlotus.com
NEXT_PUBLIC_DISCOURSE_COMMUNITY_URL=http://localhost:3000/community
DISCOURSE_PARENT_CATEGORY_SLUG=buddhi-align
DISCOURSE_DEFAULT_CATEGORY_SLUG=buddhi-align
```

Then run:

```bash
npm run dev
```

Open:

```text
http://localhost:3000/api/community/link?module=karma
```

Expected local result:

```text
http://localhost:3000/community/c/buddhi-align/karma-yoga
```

## Step 4: Vercel Deployment Setup

In Vercel:

1. Open the Buddhi Align project.
2. Go to `Settings`.
3. Go to `Environment Variables`.
4. Add the selected Option A or Option B variables.
5. Set values for `Production`, `Preview`, and `Development` as needed.
6. Redeploy the latest commit.

Production value for `NEXT_PUBLIC_DISCOURSE_COMMUNITY_URL`:

```text
https://buddhi-align.foreverlotus.com/community
```

Preview value can use the Vercel preview domain, but production should use the real Buddhi Align domain.

## Step 5: Verification Checklist

After deployment, verify these URLs:

```text
https://buddhi-align.foreverlotus.com/api/community/link?module=karma
https://buddhi-align.foreverlotus.com/api/community/link?module=bhakti
https://buddhi-align.foreverlotus.com/community
```

Expected API behavior:

```text
enabled: true
provider: discourse
url starts with https://buddhi-align.foreverlotus.com/community
```

Expected click behavior:

```text
Click Join Community.
Stay in the same browser tab.
Stay on buddhi-align.foreverlotus.com.
Land under /community.
```

Expected build behavior:

```bash
npm run build
```

The build should complete without requiring network access to install new packages. This integration should use the existing Next.js app and native `fetch`.

## Step 6: Troubleshooting

### Join Community Still Opens a New Tab

Check:

```text
https://buddhi-align.foreverlotus.com/api/community/link?module=karma
```

If `url` starts with:

```text
https://community.foreverlotus.com
```

then update:

```text
NEXT_PUBLIC_DISCOURSE_COMMUNITY_URL=https://buddhi-align.foreverlotus.com/community
```

Redeploy after changing Vercel environment variables.

### `/community` Shows the Buddhi Align 404 Page

If using Option A:

1. Confirm `COMMUNITY_PROXY_TARGET` is set in Vercel.
2. Redeploy after setting it.
3. Confirm `apps/frontend/next.config.js` is included in the deployed build.

If using Option B:

1. Confirm `apps/frontend/app/community/page.tsx` exists.
2. Confirm `COMMUNITY_PROXY_TARGET` is unset so the native page can own `/community`.

### Discourse Loads But CSS or JavaScript Is Broken

This usually means Discourse is not configured for `/community`.

Fix Discourse:

```text
DISCOURSE_RELATIVE_URL_ROOT=/community
```

or switch to Option B.

### Category Links Return 404

Confirm the real Discourse slug and category id from:

```text
https://community.foreverlotus.com/categories.json
```

Then update:

```text
apps/frontend/app/lib/community/module-map.ts
```

If Discourse requires numeric ids, add category-id support to the community URL builder or render native category pages using the Discourse JSON API.

### Login Loops Between Buddhi Align and Discourse

Check DiscourseConnect settings:

```text
discourse connect url = https://buddhi-align.foreverlotus.com/api/community/discourse/sso
```

Check Buddhi Align environment:

```text
DISCOURSE_SSO_SECRET=<same secret configured in Discourse>
```

### Corporate Network Blocks Category JSON

Some enterprise networks classify new community domains as unknown. Verify from:

1. A personal network.
2. Vercel runtime logs.
3. The Discourse server itself.
4. A machine with the domain allowlisted.

## Recommended Implementation Path

1. Start with Option B if you do not control the Discourse server.
2. Set `NEXT_PUBLIC_DISCOURSE_COMMUNITY_URL` to the Buddhi Align `/community` URL.
3. Build a native `/community` landing page that displays the Buddhi Align parent category and subcategories from Discourse JSON.
4. Keep module `Join Community` links pointed at same-origin `/community/c/...` routes.
5. Move to Option A later only if Discourse can be configured with `DISCOURSE_RELATIVE_URL_ROOT=/community`.

This gives the user the important experience immediately: they click `Join Community`, remain inside Buddhi Align, and see the Buddhi Align community categories without a new tab.

