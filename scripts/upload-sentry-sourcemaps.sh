#!/bin/bash

# Script to upload sourcemaps to Sentry with graceful fallback

if [ -z "$SENTRY_AUTH_TOKEN" ]; then
  echo "⚠️  SENTRY_AUTH_TOKEN not set, skipping sourcemap upload to Sentry"
  echo "   To enable Sentry sourcemap uploads:"
  echo "   1. Get your auth token from https://sentry.io/settings/account/api/auth-tokens/"
  echo "   2. Add SENTRY_AUTH_TOKEN as a GitHub secret in your repository settings"
  echo "   3. Pass it to the workflow as an environment variable"
  exit 0
fi

echo "Uploading sourcemaps to Sentry..."
sentry-cli sourcemaps inject --org meticulous --project sdk ./out && \
sentry-cli sourcemaps upload --org meticulous --project sdk ./out

if [ $? -eq 0 ]; then
  echo "✅ Sourcemaps uploaded successfully to Sentry"
else
  echo "❌ Failed to upload sourcemaps to Sentry"
  exit 1
fi