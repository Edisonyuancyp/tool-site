#!/bin/bash
set -e

cd "$(dirname "$0")/.."

python3 scripts/maintenance.py 2>&1 | tail -30 || echo "maintenance.py failed, continuing..."
python3 scripts/generate-variants.py --limit 20 2>&1 | tail -30 || echo "generate-variants.py failed, continuing..."
python3 scripts/generate-programmatic-seo.py 2>&1 | tail -30 || echo "generate-programmatic-seo.py failed, continuing..."
python3 scripts/deep-review.py 2>&1 | tail -30 || echo "deep-review.py failed, continuing..."
python3 scripts/refresh-llms-txt.py 2>&1 | tail -10 || echo "refresh-llms-txt.py failed, continuing..."

node scripts/audit-tools.mjs || true
node scripts/fix-broken-tools.mjs || echo "fix-broken-tools.mjs failed, continuing..."

echo "Maintenance scripts done."
