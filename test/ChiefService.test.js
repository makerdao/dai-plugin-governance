import {
  takeSnapshot,
  restoreSnapshot,
  setupTestMakerInstance,
  linkAccounts,
  sendMkrToAddress,
  setUpAllowance
} from './helpers';
import { ZERO_ADDRESS } from '../src/utils/constants';
import ChiefService from '../src/ChiefService';

let snapshotId, maker, addresses, voteProxyService, chiefService;

const picks = [
  '0x26EC003c72ebA27749083d588cdF7EBA665c0A1D',
  '0x54F4E468FB0297F55D8DfE57336D186009A1455a'
];
const mkrToLock = 3;

beforeAll(async () => {
  snapshotId = await takeSnapshot();

  maker = await setupTestMakerInstance();

  voteProxyService = maker.service('voteProxy');
  chiefService = maker.service('chief');

  addresses = maker
    .listAccounts()
    .reduce((acc, cur) => ({ ...acc, [cur.name]: cur.address }), {});

  await setupVoteProxy();
});

afterAll(async () => {
  await restoreSnapshot(snapshotId);
});

const setupVoteProxy = async () => {
  const sendAmount = 5;

  await linkAccounts(maker, addresses.ali, addresses.ava);
  await sendMkrToAddress(maker, addresses.owner, addresses.ali, sendAmount);

  maker.useAccount('ali');
  const { voteProxy } = await voteProxyService.getVoteProxy(addresses.ali);
  const vpAddress = voteProxy.getProxyAddress();

  await setUpAllowance(maker, vpAddress, voteProxy.getColdAddress());

  await voteProxyService.lock(vpAddress, mkrToLock);
  await voteProxyService.voteExec(vpAddress, picks);
};

test('can create Chief Service', async () => {
  const chief = maker.service('chief');
  expect(chief).toBeInstanceOf(ChiefService);
});

test('number of deposits for a proxy contract address should equal locked MKR amount', async () => {
  const { voteProxy } = await voteProxyService.getVoteProxy(addresses.ali);
  const numDeposits = await chiefService.getNumDeposits(
    voteProxy.getProxyAddress()
  );
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
