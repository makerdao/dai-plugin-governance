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
  const OPTION_ID = 3;
  const txo = await govPollingService.vote(0, OPTION_ID);
  const loggedOptionId = parseInt(txo.receipt.logs[0].topics[3]);
  // this will fail if the event was not emitted
  expect(loggedOptionId).toBe(OPTION_ID);
});

test('can withdraw poll', async () => {
  const POLL_ID = 0;
  const txo = await govPollingService.withdrawPoll(POLL_ID);
  // slice off the zeros used to pad the address to 32 bytes
  const loggedCaller = txo.receipt.logs[0].topics[1].slice(26);
  const { address: activeAddress } = maker.currentAccount();
  // this will fail if the event was not emitted
  expect(loggedCaller).toBe(activeAddress.slice(2));
});

//--- caching tests

test('getPercentageMkrVoted', async () => {
  const percentage = await govPollingService.getPercentageMkrVoted(1);
  console.log('percentage', percentage);
});
