import {
  takeSnapshot,
  restoreSnapshot,
  ganacheAccounts,
  ganacheCoinbase
} from './helpers';
import GovService from '../src/index';
import Maker from '@makerdao/dai';
import ChiefService from '../src/ChiefService'

let snapshotId, maker, addresses, chiefService;

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

  chiefService = maker.service('chief');

  addresses = maker
    .listAccounts()
    .reduce((acc, cur) => ({ ...acc, [cur.name]: cur.address }), {});
});

afterAll(async () => {
  await restoreSnapshot(snapshotId);
});

test('can create Chief Service', async () => {
  const chief = maker.service('chief');
  expect(chief).toBeInstanceOf(ChiefService);
});
