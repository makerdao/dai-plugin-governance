import {
    takeSnapshot,
    restoreSnapshot,
    ganacheAccounts,
    ganacheCoinbase,
    setupTestMakerInstance
  } from './helpers';
  // import GovService from '../src/index';
  import VoteProxyService from '../src/VoteProxyService';
  import VoteProxy from '../src/VoteProxy';
  import Maker, { MKR } from '@makerdao/dai';
  
  let snapshotId,
    maker, 
    addresses, 
    voteProxyService, 
    voteProxyFactory, 
    chiefService, 
    pollingService,
    mkr;
  
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

  export const sendMkrToAddress = async (accountToUse, receiver, amount) => {
    const lad = maker.currentAccount().name;
  
    maker.useAccount(accountToUse);
    await mkr.transfer(receiver, amount);

    maker.useAccount(lad);
  }

  test('can create VP Service', async () => {
    const vps = maker.service('voteProxy');
    expect(vps).toBeInstanceOf(VoteProxyService);
  });

  test('can lock an amount of MKR', async () => {
    const sendAmount = 5;
    const amountToLock = 3;
    await sendMkrToAddress('owner', addresses.ali, sendAmount);
  
    maker.useAccount('ali');

    const { voteProxy } = await voteProxyService.getVoteProxy(addresses.ali);
  
    const vpAddress = voteProxy.getProxyAddress();
    const hotAddress = voteProxy.getHotAddress();
    const coldAddress = voteProxy.getColdAddress();

    await mkr.approveUnlimited(vpAddress);
  
    // give allowance to vote proxy from cold address
    await mkr.allowance(coldAddress, vpAddress);
  
    // No deposits prior to locking maker
    const preLockDeposits = await chiefService.getNumDeposits(vpAddress);
    expect(preLockDeposits.toNumber()).toBe(0);

    await maker.service('voteProxy').lock(vpAddress, amountToLock);
    
    const postLockDeposits = await chiefService.getNumDeposits(vpAddress);
    expect(postLockDeposits.toNumber()).toBe(amountToLock);
  })

  test('can cast an executive vote and retrieve voted on addresses from slate', async () => {
    const { voteProxy } = await voteProxyService.getVoteProxy(addresses.ali);
    const vpAddress = voteProxy.getProxyAddress();
    const picks = [
      '0x26EC003c72ebA27749083d588cdF7EBA665c0A1D',
      '0x54F4E468FB0297F55D8DfE57336D186009A1455a'
    ];

    await voteProxyService.voteExec(vpAddress, picks);
    
    const addressesVotedOn = await voteProxyService.getVotedProposalAddresses(vpAddress);
    expect(addressesVotedOn).toEqual(picks);
  })

  test('can free an amount of MKR', async () => {
    const amountToFree = 1;
    const { voteProxy } = await voteProxyService.getVoteProxy(addresses.ali);
  
    const vpAddress = voteProxy.getProxyAddress();

    const preFreeDeposits = await chiefService.getNumDeposits(vpAddress);
    await maker.service('voteProxy').free(vpAddress, amountToFree);

    const postFreeDeposits = await chiefService.getNumDeposits(vpAddress);
    expect(postFreeDeposits.toNumber()).toBe(preFreeDeposits.toNumber() - amountToFree)
  })

  test('can free all MKR', async () => {
    const { voteProxy } = await voteProxyService.getVoteProxy(addresses.ali);
    const vpAddress = voteProxy.getProxyAddress();
  
    const preFreeDeposits = await chiefService.getNumDeposits(vpAddress);
    expect(preFreeDeposits.toNumber()).toBeGreaterThan(0);

    await maker.service('voteProxy').freeAll(vpAddress);

    const postFreeDeposits = await chiefService.getNumDeposits(vpAddress);
    expect(postFreeDeposits.toNumber()).toBe(0);
  })

  test('getVoteProxy returns a VoteProxy if one exists for a given address', async () => {
    const address = addresses.ali;
    const { hasProxy, voteProxy } = await voteProxyService.getVoteProxy(address);

    expect(hasProxy).toBe(true);
    expect(voteProxy).toBeInstanceOf(VoteProxy);
  })

  test('getVoteProxy returns a null if none exists for a given address', async () => {
    const address = addresses.ali;

    await voteProxyFactory.breakLink();
    const { hasProxy, voteProxy } = await voteProxyService.getVoteProxy(address);

    expect(hasProxy).toBe(false);
    expect(voteProxy).toBeNull();
  })
  