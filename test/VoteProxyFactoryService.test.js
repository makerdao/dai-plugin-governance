import {
  takeSnapshot,
  restoreSnapshot,
  setupTestMakerInstance,
  linkAccounts
} from './helpers';
import VoteProxyFactoryService from '../src/VoteProxyFactoryService';

let snapshotId, maker, addresses, voteProxyFactory, voteProxyService;

beforeAll(async () => {
  snapshotId = await takeSnapshot();

  maker = await setupTestMakerInstance();

  addresses = maker
    .listAccounts()
    .reduce((acc, cur) => ({ ...acc, [cur.name]: cur.address }), {});

  voteProxyFactory = maker.service('voteProxyFactory');
  voteProxyService = maker.service('voteProxy');
});

afterAll(async () => {
  await restoreSnapshot(snapshotId);
});

test('can create VPFS Service', async () => {
  const vpfs = maker.service('voteProxyFactory');
  expect(vpfs).toBeInstanceOf(VoteProxyFactoryService);
});

test('can create a vote proxy linking two addressses', async () => {
  await linkAccounts(maker, addresses.ali, addresses.ava);

  const { hasProxy } = await voteProxyService.getVoteProxy(addresses.ali);
  expect(hasProxy).toBeTruthy();
});

test('can break a link between linked accounts', async () => {
  maker.useAccount('ali');
  await voteProxyFactory.breakLink();

  const { hasProxy } = await voteProxyService.getVoteProxy(addresses.ali);
  expect(hasProxy).toBe(false);
});
