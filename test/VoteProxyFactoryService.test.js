import { takeSnapshot, restoreSnapshot, ganacheAccounts, ganacheCoinbase } from './helpers';
import { PROXY_FACTORY, ZERO_ADDRESS } from '../src/utils/constants';
import GovService from '../src/index';
import Maker from '@makerdao/dai';
import VoteProxyFactoryService from '../src/VoteProxyFactoryService';

let snapshotId, maker, addresses, voteProxyFactory;

beforeAll(async () => {
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
});

// beforeEach(async () => {
//   snapshotId = await takeSnapshot();
// });

// afterEach(async () => {
//   await restoreSnapshot(snapshotId);
// });

beforeAll(async () => {
  snapshotId = await takeSnapshot();
});

afterAll(async () => {
  await restoreSnapshot(snapshotId);
});

export const linkAccounts = async (initiator, approver) => {
  // const voteProxyFactory = maker.service('voteProxyFactory');
  const lad = maker.currentAccount().name;
  console.log(lad); //'owner' when test spins up

  // initiator wants to create a link with approver
  maker.useAccount(initiator);
  await voteProxyFactory.initiateLink(addresses[approver]);

  // approver confirms it
  maker.useAccount(approver);
  await voteProxyFactory.approveLink(addresses[initiator]);

  // no other side effects
  maker.useAccount(lad);
};

test('can create a vote proxy linking two addressses', async () => {
  await linkAccounts('ali', 'ava');

  //TODO use VPFS pointer
  const { voteProxy, hasProxy } = await maker
    .service('voteProxyFactory')
    .getVoteProxy(addresses.ali);

    expect(hasProxy).toBeTruthy();
});

/** TODO uncomment this, break link test passes. */
// const breakLink = async () => {
//   // const voteProxyFactory = maker.service('voteProxyFactory');
//   const lad = maker.currentAccount().name;

//   maker.useAccount(lad);
//   await voteProxyFactory.breakLink();
// };

test('can break a link between linked accounts', async () => {
  // await breakLink();
  maker.useAccount('ali');
  await voteProxyFactory.breakLink();

  const { hasProxy } = await maker
    .service('voteProxyFactory')
    .getVoteProxy(addresses.ali);

    expect(hasProxy).toBe(false);
});
