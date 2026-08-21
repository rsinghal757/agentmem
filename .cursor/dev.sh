#!/usr/bin/env bash
# Long-running Next.js dev server (http://localhost:3000).
# The app auto-runs DB migrations on first database access. Clerk runs in
# keyless development mode unless Clerk keys are provided as secrets.
set -euo pipefail
cd "$(dirname "$0")/.."
export PATH="$HOME/.bun/bin:$PATH"
exec bun dev
