#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf tools/.test-build
mkdir -p tools/.test-build
NODE_PATH="$(npm root -g)" node tools/transpile-core.cjs
node --test tools/.test-build/tests/*.test.js

python tests/sqlite_contract.test.py
python tests/assets_config_contract.test.py
