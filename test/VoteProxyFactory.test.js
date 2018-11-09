import { takeSnapshot, restoreSnapshot, ganacheAccounts, ganacheCoinbase } from './helpers';
import { PROXY_FACTORY, ZERO_ADDRESS } from '../src/utils/constants';
import GovService from '../src/index';
import Maker, { ETH, MKR } from '@makerdao/dai';
import VoteProxyFactoryService from '../src/VoteProxyFactoryService';

let snapshotId, maker, addresses, mkr;

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

    mkr = await maker.getToken(MKR);
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
  const voteProxyFactory = maker.service('voteProxyFactory');
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
  console.log('Ali balance before', balanceAli.toNumber());

  await mkr.transfer(receiver, amount);

  const balanceAliAfter = await mkr.balanceOf(receiver);
  console.log('Ali BAL AFTER', balanceAliAfter.toNumber());

  maker.useAccount(lad);
}

test('can create a vote proxy linking two addressses', async () => {
  await linkAccounts('ali', 'ava');

  const { voteProxy, hasProxy } = await maker
    .service('voteProxyFactory')
    .getVoteProxy(addresses.ali);

    expect(hasProxy).toBeTruthy();
});


test('can lock', async () => {
  const sendAmount = 5;
  await sendMkrToAddress('owner', addresses.ali, sendAmount);

  const { voteProxy, hasProxy } = await maker
    .service('voteProxyFactory')
    .getVoteProxy(addresses.ali);

    console.log(hasProxy);

  // const contractAddress = await maker.service('smartContract')
  //   .getContractByName(PROXY_FACTORY).address;

  const vpAddress = voteProxy.getAddress();
  const vpRole = voteProxy.getRole();
  const vpStatus = voteProxy.getStatus();
  const vpLinkedAdd = await voteProxy.getLinkedAddress();

  console.log(vpAddress, vpRole, vpStatus, vpLinkedAdd);
  
  /**
   * set up allowance
   * mkr.approve(spender, value) // spender is contract?
   * mkr.allowance(tokenOwner, spender)
   */

  maker.useAccount('ali');
  console.log('current acct', maker.currentAccount())
  // console.log(maker.listAccounts());
   // this error? Sender must be a Cold or Hot Wallet
  
  // approve allowance to my vote proxy contract
  // const appr = await mkr.approve(vpAddress, 10**18);
  const appr = await mkr.approveUnlimited(vpAddress);
  
  console.log('approve tx', appr.metadata);

  // make sure we have balance:
  const balance = await mkr.balanceOf(maker.currentAccount().address);
  console.log('balance before allowance', balance.toNumber());

  // maker.useAccount('ava');
  const allowance = await mkr.allowance(maker.currentAccount().address, vpAddress);
  console.log('allowance', allowance.toNumber());

  const lock = await maker.service('voteProxy')
    .lock(vpAddress, 1);
    // console.log(lock);
  
})

/** TODO uncomment this, break link test passes. */
// const breakLink = async () => {
//   const voteProxyFactory = maker.service('voteProxyFactory');
//   const lad = maker.currentAccount().name;

//   maker.useAccount(lad);
//   await voteProxyFactory.breakLink();
// };

// test('can break a link between linked accounts', async () => {
//   await breakLink();

//   const { hasProxy } = await maker
//     .service('voteProxyFactory')
//     .getVoteProxy(addresses.ali);

//     expect(hasProxy).toBe(false);
// });
