#!/usr/bin/env bash
set -e

CWD=`dirname $0`
CONTRACTS=$CWD/../contracts
SOURCE=${1:-$CWD/../node_modules/@makerdao/testchain}

CHIEF=`jq ".OLD_CHIEF" "$SOURCE/out/addresses.json"`
jq ".CHIEF=$CHIEF" $CONTRACTS/addresses/testnet.json > testnet.tmp && mv testnet.tmp $CONTRACTS/addresses/testnet.json
cp $SOURCE/out/DSChief.abi $CONTRACTS/abis/DSChief.json

IOU=`jq ".OLD_IOU" "$SOURCE/out/addresses.json"`
jq ".IOU=$IOU" $CONTRACTS/addresses/testnet.json > testnet.tmp && mv testnet.tmp $CONTRACTS/addresses/testnet.json

VOTE_PROXY_FACTORY=`jq ".OLD_VOTE_PROXY_FACTORY" "$SOURCE/out/addresses.json"`
jq ".VOTE_PROXY_FACTORY=$VOTE_PROXY_FACTORY" $CONTRACTS/addresses/testnet.json > testnet.tmp && mv testnet.tmp $CONTRACTS/addresses/testnet.json
cp $SOURCE/out/VoteProxyFactory.abi $CONTRACTS/abis/VoteProxyFactory.json

POLLING=`jq ".POLLING" "$SOURCE/out/addresses.json"`
jq ".POLLING=$POLLING" $CONTRACTS/addresses/testnet.json > testnet.tmp && mv testnet.tmp $CONTRACTS/addresses/testnet.json
cp $SOURCE/out/PollingEmitter.abi $CONTRACTS/abis/Polling.json

GOV=`jq ".GOV" "$SOURCE/out/addresses.json"`
jq ".GOV=$GOV" $CONTRACTS/addresses/testnet.json > testnet.tmp && mv testnet.tmp $CONTRACTS/addresses/testnet.json

# Relevant contracts from MCD:
for CONTRACT in "MCD_ESM","ESM" "MCD_END","End"
do
  IFS=',' read NAME ABI <<< "${CONTRACT}"
  ADDRESS=`jq ".$NAME" "$SOURCE/out/addresses-mcd.json"`
  jq ".$NAME=$ADDRESS" $CONTRACTS/addresses/testnet.json > testnet.tmp && mv testnet.tmp $CONTRACTS/addresses/testnet.json
  cp $SOURCE/out/mcd/$ABI.abi $CONTRACTS/abis/$ABI.json
done