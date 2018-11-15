import {
    takeSnapshot,
    restoreSnapshot,
    setupTestMakerInstance,
    linkAccounts
  } from './helpers';
  import VoteProxy from '../src/VoteProxy';
  
  let snapshotId,
    maker, 
    addresses, 
    voteProxyService;
  
  beforeAll(async () => {
    snapshotId = await takeSnapshot();

    maker = await setupTestMakerInstance();

    voteProxyService = maker.service('voteProxy');

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
