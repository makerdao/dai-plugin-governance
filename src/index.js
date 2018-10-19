import Maker from '@makerdao/dai';
import { map, prop } from 'ramda';

import { PROXY_FACTORY, CHIEF } from './utils/constants';
import ChiefService from './ChiefService';
import VoteProxyService from './VoteProxyService';
import VoteProxyFactoryService from './VoteProxyFactoryService';

const contractAddresses = {
  kovan: require('../contracts/addresses/kovan.json'),
  mainnet: require('../contracts/addresses/mainnet.json')
};

try {
  const testnetAddresses = require('../contracts/addresses/testnet.json');
  contractAddresses.testnet = testnetAddresses;
} catch (err) {
  // do nothing here; throw an error only if we later attempt to use ganache
}

class Governance {
  constructor(preset, config = {}) {
    const addContracts = {
      [CHIEF]: {
        address: map(prop('chief'), contractAddresses),
        abi: require('../contracts/abis/DSChief.json')
      },
      [PROXY_FACTORY]: {
        address: map(prop('proxy_factory'), contractAddresses),
        abi: require('../contracts/abis/VoteProxyFactory.json')
      }
    };
    this.maker = Maker.create(preset, {
      ...config,
      additionalServices: ['chief', 'voteProxy', 'voteProxyFactory'],
      chief: [ChiefService],
      voteProxy: [VoteProxyService],
      voteProxyFactory: [VoteProxyFactoryService],
      smartContract: { addContracts }
    });
  }
}

const delegatedMakerMethods = [
  'authenticate',
  'service',
  'getToken',
  'addAccount',
  'currentAccount',
  'currentAddress',
  'listAccounts',
  'useAccount'
];

for (let method of delegatedMakerMethods) {
  Governance.prototype[method] = function(...args) {
    return this.maker[method](...args);
  };
}

Governance.create = function(preset, config) {
  return new Governance(preset, config);
};

export default Governance;
