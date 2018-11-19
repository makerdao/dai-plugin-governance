import {
  takeSnapshot,
  restoreSnapshot,
  setupTestMakerInstance,
  linkAccounts,
  sendMkrToAddress,
  setUpAllowance
} from './helpers';
import { ZERO_ADDRESS } from '../src/utils/constants';
import ChiefService from '../src/ChiefService';
import * as web3utils from 'web3-utils';

let snapshotId, maker, addresses, voteProxyService, chiefService;

const picks = [
  '0x26EC003c72ebA27749083d588cdF7EBA665c0A1D',
  '0x54F4E468FB0297F55D8DfE57336D186009A1455a'
];
const mkrToLock = 3;

beforeAll(async () => {
  snapshotId = await takeSnapshot();

  maker = await setupTestMakerInstance();

  voteProxyService = maker.service('voteProxy');
  chiefService = maker.service('chief');

  addresses = maker
    .listAccounts()
    .reduce((acc, cur) => ({ ...acc, [cur.name]: cur.address }), {});

  //TODO: this won't be necessary one I can lock MKR without a vote proxy.
  // await setupVoteProxy();
});

afterAll(async () => {
  await restoreSnapshot(snapshotId);
});

const setupVoteProxy = async () => {
  const sendAmount = 5;

  await linkAccounts(maker, addresses.ali, addresses.ava);
  await sendMkrToAddress(maker, addresses.owner, addresses.ali, sendAmount);

  maker.useAccount('ali');
  const { voteProxy } = await voteProxyService.getVoteProxy(addresses.ali);
  const vpAddress = voteProxy.getProxyAddress();

  await setUpAllowance(maker, vpAddress);

  await voteProxyService.lock(vpAddress, mkrToLock);
  await voteProxyService.voteExec(vpAddress, picks);
};

test.only('EXAMPLE 1: vote with hash issue', async () => {
  // etch the picks
  await chiefService.etch(picks);

  // hash the picks to get slate hash
  // const hash = web3utils.keccak256(picks[0]); //keccak256
  const hash = web3utils.soliditySha3(picks[0]); //soliditysha (packed)
  console.log(hash);

  // cast a vote for the slate hash
  await chiefService.vote(hash);

  /**Confused why getSlateAddresses doesn't return the addresses
   * even though the getVotedSlate returns a valid slate hash
   */
  const slate = await chiefService.getVotedSlate(
    maker.currentAccount().address
  );
  console.log('get voted slate', slate);
  expect(slate).toBe(hash); // This passes

  // this causes opcode error (I'm guessing out of bounds error because it can't find slate)
  const addrs = await chiefService.getSlateAddresses(slate);
  console.log(addrs);
  expect(addrs).toEqual(picks); // this does not pass
});

test.skip('EXAMPLE 2: lock MKR opcode issue', async () => {
  // owner votes with picks array
  await chiefService.vote(picks);

  const slate = await chiefService.getVotedSlate(
    maker.currentAccount().address
  );
  const addrs = await chiefService.getSlateAddresses(slate);
  console.log(addrs);
  expect(addrs).toEqual(picks);
  addrs.map(x => expect(x).not.toBe(ZERO_ADDRESS));

  /** Lock doesn't appear to work here
   * any amount higher than this, causes the transaction to revert:
   */
  await chiefService.lock(0.0000000000000000001);

  const numDeposits = await chiefService.getNumDeposits(
    maker.currentAccount().address
  );
  console.log('numDeposits', numDeposits.toNumber());

  const approvalCount = await chiefService.getApprovalCount(picks[0]);
  console.log('approvalCount', approvalCount.toNumber());
});

test('can create Chief Service', async () => {
  const chief = maker.service('chief');
  expect(chief).toBeInstanceOf(ChiefService);
});

test('number of deposits for a proxy contract address should equal locked MKR amount', async () => {
  const { voteProxy } = await voteProxyService.getVoteProxy(addresses.ali);
  const numDeposits = await chiefService.getNumDeposits(
    voteProxy.getProxyAddress()
  );
  expect(numDeposits.toNumber()).toBe(mkrToLock);
});

test('approval count for voted on address should equal locked MKR amount', async () => {
  const approvalCount = await chiefService.getApprovalCount(picks[0]);
  expect(approvalCount.toNumber()).toBe(mkrToLock);
});

// test('can get voted slate, and convert to address', async () => {
//   const { voteProxy } = await voteProxyService.getVoteProxy(addresses.ali);
//   const vpAddress = voteProxy.getProxyAddress();
//   const slate = await chiefService.getVotedSlate(vpAddress);
//   const addr = await chiefService.getSlateAddresses(slate);

//   expect(slate).not.toBe(ZERO_ADDRESS);
//   expect(addr).toEqual(picks);
// });

test('get hat should return lifted address', async () => {
  const addressToLift = picks[0];

  const oldHat = await chiefService.getHat();
  expect(oldHat).toBe(ZERO_ADDRESS);

  await chiefService.lift(addressToLift);

  const newHat = await chiefService.getHat();
  expect(newHat).toBe(addressToLift);
});
