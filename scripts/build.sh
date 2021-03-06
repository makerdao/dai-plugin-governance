# #!/usr/bin/env bash

set -e

if [ "$1" = "dirty" ]; then
  echo "Dirty mode: not removing previous build files."
else
  rm -rf dist
fi

babel contracts --out-dir ./dist/contracts
babel src --out-dir ./dist/src

copyfiles \
  README.md \
  LICENSE \
  package.json \
  contracts/* \
  contracts/abis/* \
  contracts/addresses/* \
  dist
