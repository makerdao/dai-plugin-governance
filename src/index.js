import { map, prop } from 'ramda';

import { PROXY_FACTORY, CHIEF, POLLING } from './utils/constants';
import ChiefService from './ChiefService';
import PollingService from './PollingService';
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

const addContracts = {
  [CHIEF]: {
    address: map(prop('chief'), contractAddresses),
    abi: require('../contracts/abis/DSChief.json')
  },
  [PROXY_FACTORY]: {
    address: map(prop('proxy_factory'), contractAddresses),
    abi: require('../contracts/abis/VoteProxyFactory.json')
  },
  [POLLING]: {
    address: map(prop('polling'), contractAddresses),
    abi: require('../contracts/abis/Polling.json')
  }
};
export default {
  addConfig: function(config) {
    return {
      ...config,
      additionalServices: ['chief', 'polling', 'voteProxy', 'voteProxyFactory'],
      chief: [ChiefService],
      polling: [PollingService],
      voteProxy: [VoteProxyService],
      voteProxyFactory: [VoteProxyFactoryService],
      smartContract: { addContracts }
    };
  }
};
