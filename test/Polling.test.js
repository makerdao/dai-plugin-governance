import {
  takeSnapshot,
  restoreSnapshot,
  setupTestMakerInstance
} from './helpers';
import PollingService from '../src/PollingService';

let snapshotId, maker, addresses;

beforeAll(async () => {
  snapshotId = await takeSnapshot();
  
  maker = await setupTestMakerInstance();

  addresses = maker
    .listAccounts()
    .reduce((acc, cur) => ({ ...acc, [cur.name]: cur.address }), {});
});

afterAll(async () => {
  await restoreSnapshot(snapshotId);
});

test('can create Polling Service', async () => {
  const polling = maker.service('polling');
  expect(polling).toBeInstanceOf(PollingService);
});

test('can create a poll', async () => {
  const polling = maker.service('polling');

  // owner created the polling contract &
  // is the only one w/ the auth to create polls at first
  maker.useAccount('owner');

  // poll -> 5 vote options, no delay, 1 day lifetime, empty multihash
  await polling.createPoll(5, 0, 24 * 60 * 60, '');
  expect(await polling.getNumberOfPolls()).toBe(1);

  await polling.createPoll(5, 0, 24 * 60 * 60, '');
  expect(await polling.getNumberOfPolls()).toBe(2);
});
