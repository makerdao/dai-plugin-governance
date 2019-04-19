import {
  takeSnapshot,
  restoreSnapshot,
  setupTestMakerInstance,
  linkAccounts,
  setupTestchainClient
} from './helpers';
import VoteProxy from '../src/VoteProxy';

let snapshotId, maker, addresses, voteProxyService, client;

jest.setTimeout(60000);

beforeAll(async () => {
  client = await setupTestchainClient();
  snapshotId = await takeSnapshot(client, 'thur2');

  maker = await setupTestMakerInstance();

  voteProxyService = maker.service('voteProxy');

  addresses = maker
    .listAccounts()
    .reduce((acc, cur) => ({ ...acc, [cur.name]: cur.address }), {});

  await linkAccounts(maker, addresses.ali, addresses.ava);
});

afterAll(async () => {
  await restoreSnapshot(client, snapshotId);
});

test('Vote proxy instance returns correct information about itself', async () => {
  const { voteProxy } = await voteProxyService.getVoteProxy(addresses.ali);
  expect(voteProxy).toBeInstanceOf(VoteProxy);

  const vpAddress = voteProxy.getProxyAddress();
  expect(vpAddress).toBeTruthy();

  // Hot address should be the same as the approver
  const hotAddress = voteProxy.getHotAddress();
  expect(hotAddress.toLowerCase()).toBe(addresses.ava.toLowerCase());

  // Cold address should be the same as the initiator
  const coldAddress = voteProxy.getColdAddress();
  expect(coldAddress.toLowerCase()).toBe(addresses.ali.toLowerCase());
});
