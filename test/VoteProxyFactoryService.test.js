import { takeSnapshot, restoreSnapshot, ganacheAccounts, ganacheCoinbase } from './helpers';
import { PROXY_FACTORY, ZERO_ADDRESS } from '../src/utils/constants';
import GovService from '../src/index';
import VoteProxyFactoryService from '../src/VoteProxyFactoryService';
import Maker from '@makerdao/dai';

let snapshotId, maker, addresses, voteProxyFactory, voteProxyService;

beforeAll(async () => {
  snapshotId = await takeSnapshot();

  maker = Maker.create('test', {
    accounts: {
      owner: { type: 'privateKey', key: ganacheCoinbase.privateKey },
      ali: { type: 'privateKey', key: ganacheAccounts[0].privateKey },
      sam: { type: 'privateKey', key: ganacheAccounts[1].privateKey },
      ava: { type: 'privateKey', key: ganacheAccounts[2].privateKey }
    },
    provider: { type: 'TEST' },
    plugins: [GovService]
  });
  await maker.authenticate();
  addresses = maker
    .listAccounts()
    .reduce((acc, cur) => ({ ...acc, [cur.name]: cur.address }), {});

    voteProxyFactory = maker.service('voteProxyFactory');
    voteProxyService = maker.service('voteProxy');
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

test('can create VPFS Service', async () => {
  const vpfs = maker.service('voteProxyFactory');
  expect(vpfs).toBeInstanceOf(VoteProxyFactoryService);
});

test('can create a vote proxy linking two addressses', async () => {
  await linkAccounts('ali', 'ava');

  const { hasProxy } = await voteProxyService.getVoteProxy(addresses.ali);
  expect(hasProxy).toBeTruthy();
});

test('can break a link between linked accounts', async () => {
  maker.useAccount('ali');
  await voteProxyFactory.breakLink();

  const { hasProxy } = await voteProxyService.getVoteProxy(addresses.ali);
  expect(hasProxy).toBe(false);
});
