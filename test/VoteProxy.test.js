import {
    takeSnapshot,
    restoreSnapshot,
    ganacheAccounts,
    ganacheCoinbase,
    setupTestMakerInstance,
    linkAccounts
  } from './helpers';
  import GovService from '../src/index';
  import VoteProxyService from '../src/VoteProxyService';
  import VoteProxy from '../src/VoteProxy';
  import Maker from '@makerdao/dai';
  
  let snapshotId,
    maker, 
    addresses, 
    voteProxyService, 
    voteProxyFactory;
  
  beforeAll(async () => {
    snapshotId = await takeSnapshot();

    maker = await setupTestMakerInstance();

    voteProxyService = maker.service('voteProxy');
    voteProxyFactory = maker.service('voteProxyFactory');

    addresses = maker
      .listAccounts()
      .reduce((acc, cur) => ({ ...acc, [cur.name]: cur.address }), {});

    await linkAccounts(addresses.ali, addresses.ava);
  });

  afterAll(async () => {
    await restoreSnapshot(snapshotId);
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
  })
