import {
  takeSnapshot,
  restoreSnapshot,
  setupTestMakerInstance,
  setUpAllowance
} from './helpers';
import { ZERO_ADDRESS } from '../src/utils/constants';
import ChiefService from '../src/ChiefService';
import * as web3utils from 'web3-utils';

let snapshotId, maker, chiefService;

const picks = [
  '0x26EC003c72ebA27749083d588cdF7EBA665c0A1D',
  '0x54F4E468FB0297F55D8DfE57336D186009A1455a'
];
const mkrToLock = 3;

beforeAll(async () => {
  snapshotId = await takeSnapshot();

  maker = await setupTestMakerInstance();

  chiefService = maker.service('chief');
});

afterAll(async () => {
  await restoreSnapshot(snapshotId);
});

test('can create Chief Service', async () => {
  const chief = maker.service('chief');
  expect(chief).toBeInstanceOf(ChiefService);
});

test('can cast vote with an array of addresses', async () => {
  // owner casts vote with picks array
  await chiefService.vote(picks);

  const slate = await chiefService.getVotedSlate(
    maker.currentAccount().address
  );
  const addrs = await chiefService.getSlateAddresses(slate);

  expect(addrs).toEqual(picks);
});

test('can cast vote with a slate hash', async () => {
  // etch the picks
  await chiefService.etch(picks);

  // hash the picks to get slate hash
  const hash = web3utils.soliditySha3({ type: 'address[]', value: picks });

  // cast a vote for the slate hash
  await chiefService.vote(hash);

  const slate = await chiefService.getVotedSlate(
    maker.currentAccount().address
  );
  expect(slate).toBe(hash);
  expect(slate).not.toBe(ZERO_ADDRESS);

  const addresses = await chiefService.getSlateAddresses(slate);

  expect(addresses).toEqual(picks);
});

test('number of deposits for a proxy contract address should equal locked MKR amount', async () => {
  await setUpAllowance(maker, chiefService._chiefContract().address);
  await chiefService.lock(mkrToLock);

  const numDeposits = await chiefService.getNumDeposits(
    maker.currentAccount().address
  );

  expect(numDeposits.toNumber()).toBe(mkrToLock);
});

test('approval count for a voted-on address should equal locked MKR amount', async () => {
  const approvalCount = await chiefService.getApprovalCount(picks[0]);
  expect(approvalCount.toNumber()).toBe(mkrToLock);
});

test('get hat should return lifted address', async () => {
  const addressToLift = picks[0];

  const oldHat = await chiefService.getHat();
  expect(oldHat).toBe(ZERO_ADDRESS);

  await chiefService.lift(addressToLift);

  const newHat = await chiefService.getHat();
  expect(newHat).toBe(addressToLift);
});
