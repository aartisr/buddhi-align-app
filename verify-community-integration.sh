#!/usr/bin/env bash
set -euo pipefail

APP_URL="${APP_URL:-http://localhost:3000}"
COMMUNITY_URL="${COMMUNITY_URL:-https://community.foreverlotus.com}"
MODULE="${MODULE:-bhakti}"
ENV_FILE="apps/frontend/.env.local"
CURL_INSECURE="${CURL_INSECURE:-0}"
CURL_CA_BUNDLE_PATH="${CURL_CA_BUNDLE_PATH:-}"

curl_opts=(-sS)
if [[ "$CURL_INSECURE" == "1" ]]; then
  curl_opts+=(-k)
elif [[ -n "$CURL_CA_BUNDLE_PATH" ]]; then
  curl_opts+=(--cacert "$CURL_CA_BUNDLE_PATH")
fi

echo "== 1) Env file checks =="
test -f "$ENV_FILE" || { echo "Missing $ENV_FILE"; exit 1; }

grep -E '^COMMUNITY_INTEGRATION_PROVIDER=discourse$' "$ENV_FILE" >/dev/null \
  && echo "OK: COMMUNITY_INTEGRATION_PROVIDER=discourse" \
  || { echo "FAIL: COMMUNITY_INTEGRATION_PROVIDER not set to discourse"; exit 1; }

grep -E '^DISCOURSE_BASE_URL=' "$ENV_FILE" || { echo "FAIL: DISCOURSE_BASE_URL missing"; exit 1; }
grep -E '^NEXT_PUBLIC_DISCOURSE_COMMUNITY_URL=' "$ENV_FILE" || { echo "FAIL: NEXT_PUBLIC_DISCOURSE_COMMUNITY_URL missing"; exit 1; }

echo
echo "== 2) Discourse host reachable =="
curl "${curl_opts[@]}" -I "$COMMUNITY_URL" | head -n 1

echo
echo "== 3) App community link endpoint =="
TMP_HEADERS="$(mktemp)"
TMP_BODY="$(mktemp)"
curl "${curl_opts[@]}" -D "$TMP_HEADERS" -o "$TMP_BODY" "$APP_URL/api/community/link?module=$MODULE" || {
  echo "FAIL: Could not call $APP_URL/api/community/link"
  exit 1
}

STATUS="$(awk 'NR==1{print $2}' "$TMP_HEADERS")"
BODY="$(cat "$TMP_BODY")"
URL_FROM_BODY="$(printf '%s' "$BODY" | sed -n 's/.*"url":"\([^"]*\)".*/\1/p')"
ENABLED_FROM_BODY="$(printf '%s' "$BODY" | sed -n 's/.*"enabled":\(true\|false\).*/\1/p')"

echo "HTTP status: $STATUS"
echo "Body: $BODY"

if [[ "$STATUS" == "200" ]]; then
  echo "OK: JSON status received"
else
  echo "FAIL: Expected HTTP 200 from community link endpoint"
  exit 1
fi

if [[ "$ENABLED_FROM_BODY" != "true" ]]; then
  echo "FAIL: Expected enabled=true in response body"
  exit 1
fi

case "$URL_FROM_BODY" in
  "$COMMUNITY_URL"/*|"$COMMUNITY_URL")
    echo "OK: Response URL points to Discourse community host"
    ;;
  *)
    echo "FAIL: Response URL does not point to expected community host"
    exit 1
    ;;
esac

echo
echo "== 4) Optional SSO env presence check =="
if grep -E '^DISCOURSE_SSO_SECRET=' "$ENV_FILE" >/dev/null && \
   grep -E '^DISCOURSE_API_USERNAME=' "$ENV_FILE" >/dev/null && \
   grep -E '^DISCOURSE_API_KEY=' "$ENV_FILE" >/dev/null; then
  echo "OK: SSO-related env keys are present"
else
  echo "WARN: SSO env keys missing (link-only mode is still fine)"
fi

echo
if [[ "$CURL_INSECURE" == "1" ]]; then
  echo "WARN: Running with CURL_INSECURE=1 (TLS verification disabled)."
elif [[ -n "$CURL_CA_BUNDLE_PATH" ]]; then
  echo "INFO: Running with custom CA bundle: $CURL_CA_BUNDLE_PATH"
fi

echo
echo "All automated checks passed."
