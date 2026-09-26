#!/bin/bash
# Provision test admin credential using Supabase service-role RPC
# Usage: ./scripts/provision-test-admin.sh <email> <password>

set -e

EMAIL="${1:-}"
PASSWORD="${2:-}"

if [ -z "$EMAIL" ] || [ -z "$PASSWORD" ]; then
  echo "Usage: $0 <email> <password>"
  echo "Example: $0 admin@test.com TestPassword123456"
  exit 1
fi

if [ ${#PASSWORD} -lt 12 ]; then
  echo "Error: Password must be at least 12 characters"
  exit 1
fi

# Load env
if [ -f ".env.local" ]; then
  export $(cat .env.local | grep -v '#' | xargs)
fi

SUPABASE_URL="${VITE_SUPABASE_URL:-}"
SUPABASE_SERVICE_ROLE="${SUPABASE_SERVICE_ROLE_KEY:-}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE" ]; then
  echo "Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
  exit 1
fi

# Call RPC to provision admin
RESULT=$(curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/setup_admin_test_credential" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE}" \
  -d "{\"p_email\": \"${EMAIL}\", \"p_password\": \"${PASSWORD}\"}")

echo "Response:"
echo "$RESULT" | jq . 2>/dev/null || echo "$RESULT"
