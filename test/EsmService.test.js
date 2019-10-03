import {
  setupTestMakerInstance,
  restoreSnapshotOriginal,
  sleep,
  addressRegex
} from './helpers';
import EsmService from '../src/EsmService';

let maker, esmService;
beforeAll(async () => {
  maker = await setupTestMakerInstance();
  esmService = maker.service('esm');
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

test('can create ESM Service', async () => {
  expect(esmService).toBeInstanceOf(EsmService);
});

test('can access deployed contract interface', async () => {
  const contract = await esmService._esmContract();
  expect(addressRegex.test(contract.address)).toBe(true);
});

test('can return the minimum threshold', async () => {
  const threshold = await esmService.thresholdAmount();
  expect(threshold.toNumber()).toBe(50000);
});
