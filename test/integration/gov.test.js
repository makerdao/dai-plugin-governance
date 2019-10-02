import { infuraProjectId } from './index';
import govPlugin from '../../src/index';
import Maker from '@makerdao/dai';

let maker;

beforeAll(async () => {
  if (!process.env.PRIVATE_KEY && process.env.NETWORK !== 'test') {
    throw new Error('Please set a private key to run integration tests.');
  }

  const settings = {
    privateKey: process.env.PRIVATE_KEY,
    web3: {
      transactionSettings: {
        gasPrice: 15000000000
      },
      provider: {
        infuraProjectId
      }
    }
  };

  const network =
    process.env.NETWORK === 'test' ? 'testnet' : process.env.NETWORK;

  maker = await Maker.create(process.env.NETWORK, {
    plugins: [[govPlugin, { network, mcd: true }]],
    web3: {
      pollingInterval: 100
    },
    ...settings
  });

  await maker.authenticate();
});

test('can join mkr into esm', async () => {
  const esmService = maker.service('esm');
  const tx = await esmService.join(0.00000000000000001);
  console.log('tx', tx);
});
