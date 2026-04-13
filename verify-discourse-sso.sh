#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="apps/frontend/.env.local"
APP_URL="${APP_URL:-http://localhost:3000}"
CURL_INSECURE="${CURL_INSECURE:-0}"
CURL_CA_BUNDLE_PATH="${CURL_CA_BUNDLE_PATH:-}"

curl_opts=(-sS)
if [[ "$CURL_INSECURE" == "1" ]]; then
  curl_opts+=(-k)
elif [[ -n "$CURL_CA_BUNDLE_PATH" ]]; then
  curl_opts+=(--cacert "$CURL_CA_BUNDLE_PATH")
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "FAIL: missing $ENV_FILE"
  exit 1
fi

get_env_value() {
  local key="$1"
  local val
  val="$(grep -E "^${key}=" "$ENV_FILE" | tail -n 1 | cut -d'=' -f2- || true)"
  echo "$val"
}

COMMUNITY_PROVIDER="$(get_env_value COMMUNITY_INTEGRATION_PROVIDER)"
DISCOURSE_BASE_URL="$(get_env_value DISCOURSE_BASE_URL)"
DISCOURSE_SSO_SECRET="$(get_env_value DISCOURSE_SSO_SECRET)"

echo "== 1) Required SSO env checks =="
[[ "$COMMUNITY_PROVIDER" == "discourse" ]] || { echo "FAIL: COMMUNITY_INTEGRATION_PROVIDER must be discourse"; exit 1; }
[[ -n "$DISCOURSE_BASE_URL" ]] || { echo "FAIL: DISCOURSE_BASE_URL missing"; exit 1; }
[[ -n "$DISCOURSE_SSO_SECRET" ]] || { echo "FAIL: DISCOURSE_SSO_SECRET missing"; exit 1; }
echo "OK: provider/base_url/secret present"

echo
echo "== 2) Discourse host reachable =="
curl "${curl_opts[@]}" -I "$DISCOURSE_BASE_URL" | head -n 1

echo
echo "== 3) App SSO endpoint rejects bad signature =="
BAD_SSO="$(printf "nonce=badcheck123&return_sso_url=%s/session/sso_login" "$DISCOURSE_BASE_URL" | base64 | tr -d '\n')"
BAD_SIG="deadbeef"

BAD_STATUS="$(curl "${curl_opts[@]}" -o /tmp/sso_bad_body.txt -w "%{http_code}" \
  "$APP_URL/api/community/discourse/sso?sso=$BAD_SSO&sig=$BAD_SIG" || true)"

if [[ "$BAD_STATUS" == "400" || "$BAD_STATUS" == "401" || "$BAD_STATUS" == "403" ]]; then
  echo "OK: invalid signature rejected (HTTP $BAD_STATUS)"
else
  echo "WARN: expected 400/401/403 for bad signature, got HTTP $BAD_STATUS"
  echo "Body:"
  cat /tmp/sso_bad_body.txt || true
fi

echo
echo "== 4) App SSO endpoint accepts valid signature format =="
GOOD_NONCE="healthcheck$(date +%s)"
GOOD_SSO="$(printf "nonce=%s&return_sso_url=%s/session/sso_login" "$GOOD_NONCE" "$DISCOURSE_BASE_URL" | base64 | tr -d '\n')"
GOOD_SIG="$(printf "%s" "$GOOD_SSO" | openssl dgst -sha256 -hmac "$DISCOURSE_SSO_SECRET" -hex | awk '{print $2}')"

TMP_HEADERS="$(mktemp)"
GOOD_STATUS="$(curl "${curl_opts[@]}" -o /tmp/sso_good_body.txt -D "$TMP_HEADERS" -w "%{http_code}" \
  "$APP_URL/api/community/discourse/sso?sso=$GOOD_SSO&sig=$GOOD_SIG" || true)"

LOCATION="$(awk 'tolower($1)=="location:"{print $2}' "$TMP_HEADERS" | tr -d '\r' | tail -n 1 || true)"

echo "HTTP status: $GOOD_STATUS"
echo "Location: $LOCATION"

if [[ "$GOOD_STATUS" == "302" || "$GOOD_STATUS" == "303" || "$GOOD_STATUS" == "307" || "$GOOD_STATUS" == "308" ]]; then
  echo "OK: valid signed payload was accepted and redirected"
else
  echo "WARN: expected redirect for valid signature, got HTTP $GOOD_STATUS"
  echo "Body:"
  cat /tmp/sso_good_body.txt || true
fi

echo
if [[ "$CURL_INSECURE" == "1" ]]; then
  echo "WARN: Running with CURL_INSECURE=1 (TLS verification disabled)."
elif [[ -n "$CURL_CA_BUNDLE_PATH" ]]; then
  echo "INFO: Running with custom CA bundle: $CURL_CA_BUNDLE_PATH"
fi

echo
echo "Done."
echo "Note: If not logged in, redirect should usually go to your app sign-in page."
echo "If logged in (browser flow), redirect should go back to Discourse return_sso_url."
