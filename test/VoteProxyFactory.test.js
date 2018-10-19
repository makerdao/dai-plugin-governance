import { takeSnapshot, restoreSnapshot, ganacheAccounts } from './helpers';
import GovService from '../src/index';

let snapshotId, maker, addresses;

beforeAll(async () => {
  maker = GovService.create('test', {
    accounts: {
      ali: { type: 'privateKey', key: ganacheAccounts[0].privateKey },
      sam: { type: 'privateKey', key: ganacheAccounts[1].privateKey },
      ava: { type: 'privateKey', key: ganacheAccounts[2].privateKey }
    },
    provider: { type: 'TEST' }
  });
  await maker.authenticate();
  addresses = maker
    .listAccounts()
    .reduce((acc, cur) => ({ ...acc, [cur.name]: cur.address }), {});
});

beforeEach(async () => {
  snapshotId = await takeSnapshot();
});

afterEach(async () => {
  await restoreSnapshot(snapshotId);
});

const linkAccounts = async (initiator, approver) => {
  const voteProxyFactory = maker.service('voteProxyFactory');
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

test('can create a vote proxy linking two addressses', async () => {
  await linkAccounts('ali', 'ava');

  const { hasProxy } = await maker
    .service('voteProxyFactory')
    .getVoteProxy(addresses.ali);

  expect(hasProxy).toBeTruthy();
});
