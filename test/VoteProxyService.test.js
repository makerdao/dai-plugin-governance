import {
    takeSnapshot,
    restoreSnapshot,
    ganacheAccounts,
    ganacheCoinbase
  } from './helpers';
  import GovService from '../src/index';
  import Maker, { MKR } from '@makerdao/dai';
  import { stringToBytes32 } from '@makerdao/dai/src/utils/conversion';
  
  let snapshotId, maker, addresses, voteProxyFactory, mkr;
  
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

    voteProxyService = maker.service('voteProxy');
    voteProxyFactory = maker.service('voteProxyFactory');
    addresses = maker
      .listAccounts()
      .reduce((acc, cur) => ({ ...acc, [cur.name]: cur.address }), {});
    
    mkr = await maker.getToken(MKR);

    await linkAccounts('ali', 'ava');
  });
  
  // beforeEach(async () => {
  //   snapshotId = await takeSnapshot();
  // });
  
  // afterEach(async () => {
  //   await restoreSnapshot(snapshotId);
  // });

  afterAll(async () => {
    await restoreSnapshot(snapshotId);
  });

  export const linkAccounts = async (initiator, approver) => {
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

  export const sendMkrToAddress = async (accountToUse, receiver, amount) => {
    const lad = maker.currentAccount().name;
  
    maker.useAccount(accountToUse);
    const balanceAli = await mkr.balanceOf(receiver);
    console.log('Ali balance before transfer', balanceAli.toNumber());
  
    await mkr.transfer(receiver, amount);
  
    const balanceAliAfter = await mkr.balanceOf(receiver);
    console.log('Ali balance after transfer', balanceAliAfter.toNumber());
  
    maker.useAccount(lad);
  }

  test('can lock an amount of MKR', async () => {
    console.log('ENV', process.env.NETWORK);
    const chiefService = maker.service('chief');
    const sendAmount = 5;
    await sendMkrToAddress('owner', addresses.ali, sendAmount);
  
    maker.useAccount('ali');
    console.log('current acct', maker.currentAccount());

    const { voteProxy, hasProxy } = await maker
      .service('voteProxy')
      .getVoteProxy(addresses.ali);
  
    console.log(hasProxy);
    const vpAddress = voteProxy.getAddress();

    const appr = await mkr.approveUnlimited(vpAddress);
    console.log('approve tx', appr.metadata);
  
    // make sure we have balance:
    const balance = await mkr.balanceOf(maker.currentAccount().address);
    console.log('balance before allowance', balance.toNumber());
  
    const allowance = await mkr.allowance(maker.currentAccount().address, vpAddress);
    console.log('allowance', allowance.toNumber());
  
    const lock = await maker.service('voteProxy')
      .lock(vpAddress, 3);

    // TODO: Write expect based on this result:
    const numDep = await chiefService.getNumDeposits(vpAddress)
  })

  test('can cast an executive vote', async () => {
    const vpService = maker.service('voteProxy')
    const pollingService = maker.service('polling');
    const chiefService = maker.service('chief');
    
    // const pollContract = pollingService.getPollingContract();
    const chiefContract = chiefService.getChiefContract();

    const { voteProxy, hasProxy } = await vpService.getVoteProxy(addresses.ali);
    const vpAddress = voteProxy.getAddress();

    // use owner to create the poll
    await maker.useAccount('owner');
    const createPoll = await pollingService.createPoll(5, 0, 24 * 60 * 60, 'testText');
    console.log('Create Poll Metadata', createPoll.metadata);
    
    // this is owner/creater of poll:
    const picks = ['0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6'];
    const numPols = await pollingService.getNumberOfPolls();
    console.log('numPolls', numPols);
    // console.log('poll at 0 index', await pollContract.polls(0));

    // switch back to cold wallet
    await maker.useAccount('ali');

    console.log('votes() before vote', await chiefContract.votes(vpAddress));

    const voteExec = await voteProxy.voteExec(vpAddress, picks);
    console.log(voteExec.metadata);

    // Write test expect based on this result:
    console.log('votes() after vote', await chiefContract.votes(vpAddress));
    
    const owner = '0x16Fb96a5fa0427Af0C8F7cF1eB4870231c8154B6';
    // const ali =  '0xda1495ebd7573d8e7f860862baa3abecebfa02e0'
    // vpAddress = 0x603D52D6AE2b98A49f8f32817ad4EfFe7E8A2502 // slate adds 24 0's?
    // kovan topic address: 0x0c0fC0952790A96D60CD82cA865C7bb1233477C3

    const yays = await chiefContract.MAX_YAYS();
    console.log('MAX YAYS', yays.toNumber());

    const gvSlate = await chiefService.getVotedSlate(vpAddress);
    console.log('gvSlate', gvSlate);

    console.log(stringToBytes32('he'));
  })

  // test('can free an amount of MKR', async () => {
  //   const { voteProxy, hasProxy } = await maker
  //     .service('voteProxy')
  //     .getVoteProxy(addresses.ali);
  
  //   const vpAddress = voteProxy.getAddress();

  //   const free = await maker.service('voteProxy')
  //     .free(vpAddress, 1);

  //   console.log(free);
  //   // TODO: How to test that this worked correctly?
  // })

  // test('can free all MKR', async () => {
  //   const { voteProxy } = await maker
  //     .service('voteProxy')
  //     .getVoteProxy(addresses.ali);
  
  //   const vpAddress = voteProxy.getAddress();
  
  //   const freeAll = await maker.service('voteProxy')
  //     .freeAll(vpAddress);

  //   console.log(freeAll);
  //   // TODO: How to test that this worked correctly?
  // })
  
  /**
   * VPS Tests TODO:
   * getLinkedAddress - check for both roles
   * getVotedProposalAddresses - invalid opcode error
   * getVoteProxy - explicitly test this
   */