import fetch from 'node-fetch';
import Maker from '@makerdao/dai';
// import GovPlugin from '@makerdao/dai-plugin-governance';
import GovPlugin from '../../src/index';
import ConfigPlugin from '@makerdao/dai-plugin-config';
// import Client from '@makerdao/testchain-client';
// import { MKR } from '../../src/utils/constants';
import { createCurrency } from '@makerdao/currency';

// Set some account names for easy reference
const accountNames = ['owner', 'ali', 'sam', 'ava'];

// function ganacheAddress() {
//   const port = process.env.GOV_TESTNET_PORT || 2000;
//   return `http://localhost:${port}`;
// }

// let requestCount = 0;

// export async function takeSnapshot() {
//   const id = requestCount;
//   requestCount += 1;

//   const res = await fetch(ganacheAddress(), {
//     method: 'POST',
//     headers: {
//       Accept: 'application/json',
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       jsonrpc: '2.0',
//       method: 'evm_snapshot',
//       params: [],
//       id: id
//     })
//   });

//   const json = await res.json();
//   return parseInt(json['result'], 16);
// }

// export async function restoreSnapshot(snapId) {
//   const id = requestCount;
//   requestCount += 1;

//   const res = await fetch(ganacheAddress(), {
//     method: 'POST',
//     headers: {
//       Accept: 'application/json',
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       jsonrpc: '2.0',
//       method: 'evm_revert',
//       params: [snapId],
//       id: id
//     })
//   });

//   const json = await res.json();
//   return json['result'];
// }

export const fakeAddresses = ['0xbeefed1bedded2dabbed3defaced4decade5dead'];

// some of the accounts that're generated from the mnemonic we give ganache
export const ganacheAccounts = [
  {
    address: '0xda1495ebd7573d8e7f860862baa3abecebfa02e0',
    privateKey:
      '0xbc838ab7af00cda00cb02efbbe4dbb1ce51f5d2613acfe11bd970ce659ad8704',
    type: 'GANACHE'
  },
  {
    address: '0x81431b69b1e0e334d4161a13c2955e0f3599381e',
    privateKey:
      '0xb3ae65f191aac33f3e3f662b8411cabf14f91f2b48cf338151d6021ea1c08541',
    type: 'GANACHE'
  },
  {
    address: '0xb76a5a26ba0041eca3edc28a992e4eb65a3b3d05',
    privateKey:
      '0xa052332a502d9a91636931be4ffd6e1468684544a1a7bc4a64c21c6f5daa759a',
    type: 'GANACHE'
  }
];
export const ganacheCoinbase = {
  address: '0x16fb96a5fa0427af0c8f7cf1eb4870231c8154b6',
  privateKey:
    '0x474beb999fed1b3af2ea048f963833c686a0fba05f5724cb6417cf3b8ee9697e',
  type: 'GANACHE'
};
// ^ our default coinbase BUT we should probably avoid using it for
// tests (besides sending mkr) since it's the address the contracts are deployed
// from on ganache, so it has special privledges that could affect test results

const MKR = createCurrency('MKR');
const IOU = createCurrency('IOU');

const fetchAccounts = async () => {
  // const rpcUrl = 'http://ex-testchain.local:8569';
  // const wsUrl = 'ws://ex-testchain.local:8569';
  const { Client, Event } = require('@makerdao/testchain-client');

  const client = new Client();
  const { details: chainData } = await client.api.getChain(testchainId);

  console.log('chainData', chainData);
  const deployedAccounts = chainData.chain_details.accounts;
  // console.log('json', JSON.parse(chainData));
  console.log('deployedAccounts', deployedAccounts);

  const accounts = deployedAccounts.reduce((result, value, index) => {
    if (index < 4) {
      const name = accountNames[index];
      console.log('name', name);

      result[name] = {
        type: 'privateKey',
        key: value.priv_key
      };
    }
    console.log('results', result);
    return result;
    // return;
  }, {});

  console.log('testAccounts', accounts);
  return accounts;
};

// accounts: {
//   owner: { type: 'privateKey', key: ganacheCoinbase.privateKey },
//   ali: { type: 'privateKey', key: ganacheAccounts[0].privateKey },
//   sam: { type: 'privateKey', key: ganacheAccounts[1].privateKey },
//   ava: { type: 'privateKey', key: ganacheAccounts[2].privateKey }
// },
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const testchainId = '17453460837341857085';
// const thisSnapshotName = 'PretestSnapshot1927';

export const takeSnapshot = async name => {
  const { Client, Event } = require('@makerdao/testchain-client');
  const client = new Client();
  await client.init();
  client.takeSnapshot(testchainId, name);
  await sleep(7000);

  const snapshots = await client.api.listAllSnapshots('ganache');
  const mySnap = snapshots.data.filter(x => x.description === name);
  // console.log('snapshots', snapshots);
  // console.log('mySnap', mySnap);

  return mySnap[0].id;
};

export const restoreSnapshot = async snapshotId => {
  const { Client, Event } = require('@makerdao/testchain-client');
  const client = new Client();
  await client.init();
  client.restoreSnapshot(testchainId, snapshotId);
  await sleep(7000);
  console.log('restored snapshot id', snapshotId);
  return true;
};

export const setupTestMakerInstance = async () => {
  const accounts = await fetchAccounts();
  const maker = await Maker.create('http', {
    plugins: [
      [GovPlugin, { network: 'ganache' }],
      [ConfigPlugin, { testchainId }]
    ],
    url: 'http://localhost:8568',
    accounts
  });

  console.log('maker create done');

  await maker.authenticate();
  console.log('maker authenticate done');

  return maker;
};

export const linkAccounts = async (maker, initiator, approver) => {
  const lad = maker.currentAccount().name;
  console.log('lad', lad);

  console.log('about to use account with this address', initiator);
  // initiator wants to create a link with approver
  maker.useAccountWithAddress(initiator);
  console.log('finished use account');
  const vpsFactory = maker.service('voteProxyFactory');
  console.log('vpsfactor', vpsFactory);
  const a = await vpsFactory.initiateLink(approver);
  console.log('initiateLink finished', a);

  // approver confirms it
  maker.useAccountWithAddress(approver);
  const b = await maker.service('voteProxyFactory').approveLink(initiator);
  console.log('approveLink finished', b);

  // no other side effects
  maker.useAccount(lad);
};

export const sendMkrToAddress = async (
  maker,
  accountToUse,
  receiver,
  amount
) => {
  const lad = maker.currentAccount().name;
  console.log('lad', lad);
  const mkr = await maker.getToken(MKR);
  console.log('MKR', MKR);
  console.log('mkr', mkr);

  await maker.useAccountWithAddress(accountToUse);
  await mkr.transfer(receiver, amount);

  console.log('sent almost finished');
  maker.useAccount(lad);
  console.log('finished');
};

export const setUpAllowance = async (maker, address) => {
  const lad = maker.currentAccount().name;
  const mkr = await maker.getToken(MKR);

  await mkr.approveUnlimited(address);

  maker.useAccount(lad);
};
