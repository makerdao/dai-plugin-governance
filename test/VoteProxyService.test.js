import {
    takeSnapshot,
    restoreSnapshot,
    ganacheAccounts,
    ganacheCoinbase
  } from './helpers';
  import GovService from '../src/index';
  import Maker from '@makerdao/dai';
  import VoteProxyService from '../src/VoteProxyService'
  import { linkAccounts } from './VoteProxyFactory.test';
  
  let snapshotId, maker, addresses, voteProxyService;
  
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

    voteProxyService = maker.service('voteProxy');
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
  
  test('can create VoteProxy Service', async () => {
    const vps = maker.service('voteProxy');
    expect(vps).toBeInstanceOf(VoteProxyService);
  });
  