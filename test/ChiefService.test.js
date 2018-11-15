import {
  takeSnapshot,
  restoreSnapshot,
  ganacheAccounts,
  ganacheCoinbase,
  setupTestMakerInstance
} from './helpers';
import { ZERO_ADDRESS } from '../src/utils/constants';
import GovService from '../src/index';
import Maker, { MKR }  from '@makerdao/dai';
import ChiefService from '../src/ChiefService';

let snapshotId,
    maker, 
    addresses, 
    voteProxyService, 
    voteProxyFactory, 
    chiefService, 
    pollingService,
    mkr;

const picks = [
  '0x26EC003c72ebA27749083d588cdF7EBA665c0A1D',
  '0x54F4E468FB0297F55D8DfE57336D186009A1455a'
];
const mkrToLock = 3;

beforeAll(async () => {
  snapshotId = await takeSnapshot();

  maker = await setupTestMakerInstance();

  voteProxyService = maker.service('voteProxy');
  voteProxyFactory = maker.service('voteProxyFactory');
  chiefService = maker.service('chief');
  pollingService = maker.service('polling');

  addresses = maker
    .listAccounts()
    .reduce((acc, cur) => ({ ...acc, [cur.name]: cur.address }), {});
  
  mkr = await maker.getToken(MKR);

  await linkAccounts('ali', 'ava');
  maker.useAccount('ali');
  await setup();
});

afterAll(async () => {
  await restoreSnapshot(snapshotId);
});

export const linkAccounts = async (initiator, approver) => {
  const lad = maker.currentAccount().name;

  // initiator wants to create a link with approver
  maker.useAccount(initiator);
  await voteProxyFactory.initiateLink(addresses[approver]);

  // approver confirms it
  maker.useAccount(approver);
  await voteProxyFactory.approveLink(addresses[initiator]);

  // no other side effects
  maker.useAccount(lad);
};

const setup = async () => {
  const sendAmount = 5;
  await sendMkrToAddress('owner', addresses.ali, sendAmount);
  maker.useAccount('ali');
  const { voteProxy } = await voteProxyService.getVoteProxy(addresses.ali);
  const vpAddress = voteProxy.getProxyAddress();
  
  await mkr.approveUnlimited(vpAddress);
  await mkr.allowance(voteProxy.getColdAddress(), vpAddress);

  await maker.service('voteProxy').lock(vpAddress, mkrToLock);
  await castVoteViaProxy();
}

export const sendMkrToAddress = async (accountToUse, receiver, amount) => {
  const lad = maker.currentAccount().name;

  maker.useAccount(accountToUse);
  await mkr.transfer(receiver, amount);

  maker.useAccount(lad);
}

export const castVoteViaProxy = async () => {
  const { voteProxy } = await voteProxyService.getVoteProxy(addresses.ali);
  const vpAddress = voteProxy.getProxyAddress();

  await voteProxyService.voteExec(vpAddress, picks);
}

test('can create Chief Service', async () => {
  const chief = maker.service('chief');
  expect(chief).toBeInstanceOf(ChiefService);
});

test('number of deposits for a proxy contract address should equal locked MKR amount', async () => {
  const { voteProxy } = await voteProxyService.getVoteProxy(addresses.ali);
  const numDeposits = await chiefService.getNumDeposits(voteProxy.getProxyAddress());
  expect(numDeposits.toNumber()).toBe(mkrToLock);
});

test('approval count for voted on address should equal locked MKR amount', async () => {
  const approvalCount = await chiefService.getApprovalCount(picks[0]);
  expect(approvalCount.toNumber()).toBe(mkrToLock);
});

test('can get voted slate, and convert to address', async () => {
  const { voteProxy } = await voteProxyService.getVoteProxy(addresses.ali);
  const vpAddress = voteProxy.getProxyAddress();
  
  const slate = await chiefService.getVotedSlate(vpAddress);
  const addr = await chiefService.getSlateAddresses(slate);

  expect(slate).not.toBe(ZERO_ADDRESS);
  expect(addr).toEqual(picks);
});

test('get hat should return lifted address', async () => {
  const addressToLift = picks[0];
  
  const oldHat = await chiefService.getHat();
  expect(oldHat).toBe(ZERO_ADDRESS);

  await chiefService.lift(addressToLift);

  const newHat = await chiefService.getHat();
  expect(newHat).toBe(addressToLift);
});
