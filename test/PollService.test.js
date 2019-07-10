import {
  setupTestMakerInstance,
  restoreSnapshotOriginal,
  sleep
} from './helpers';
import GovPollingService from '../src/GovPollingService';

let maker, govPollingService;

jest.setTimeout(60000);

beforeAll(async () => {
  maker = await setupTestMakerInstance();
  govPollingService = maker.service('govPolling');

  maker.useAccount('owner');
});

afterAll(async done => {
  if (global.useOldChain) {
    await restoreSnapshotOriginal(global.snapshotId);
    done();
  } else {
    global.client.restoreSnapshot(global.testchainId, global.defaultSnapshotId);
    await sleep(15000);
    await global.client.delete(global.testchainId);
    await sleep(15000);
    done();
  }
});

test('can create Gov Polling Service', () => {
  expect(govPollingService).toBeInstanceOf(GovPollingService);
});

test('can create poll', async () => {
  const START_DATE = Math.floor(new Date().getTime() / 1000) + 100;
  const END_DATE = START_DATE + 5000;
  const MULTI_HASH = 'dummy hash';
  const URL = 'dummy url';
  const firstPollId = await govPollingService.createPoll(
    START_DATE,
    END_DATE,
    MULTI_HASH,
    URL
  );
  expect(firstPollId).toBe(0);

  const secondPollId = await govPollingService.createPoll(
    START_DATE,
    END_DATE,
    MULTI_HASH,
    URL
  );
  expect(secondPollId).toBe(1);
});

test('can vote', async () => {
  await govPollingService.vote(0, 1);
});

test('can withdraw poll', async () => {
  await govPollingService.withdrawPoll(0);
});
