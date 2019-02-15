import { map, prop } from 'ramda';

import {
  VOTE_PROXY_FACTORY,
  PROXY_FACTORY,
  CHIEF,
  GOV_POLL_GEN,
  MCD_ADM
} from './utils/constants';
import ChiefService from './ChiefService';
import PollingService from './PollingService';
import VoteProxyService from './VoteProxyService';
import VoteProxyFactoryService from './VoteProxyFactoryService';

const contractAddresses = {
  kovan: require('../contracts/addresses/kovan.json'),
  mainnet: require('../contracts/addresses/mainnet.json')
};

const addContracts = {
  [MCD_ADM]: {
    address: map(prop('chief'), contractAddresses),
    abi: require('../contracts/abis/DSChief.json')
  },
  [VOTE_PROXY_FACTORY]: {
    address: map(prop('proxy_factory'), contractAddresses),
    abi: require('../contracts/abis/VoteProxyFactory.json')
  },
  [GOV_POLL_GEN]: {
    address: map(prop('polling'), contractAddresses),
    abi: require('../contracts/abis/Polling.json')
  }
};
export default {
  addConfig: function(config, { bypassContracts }) {
    const options = {
      ...config,
      additionalServices: ['chief', 'polling', 'voteProxy', 'voteProxyFactory'],
      chief: [ChiefService],
      polling: [PollingService],
      voteProxy: [VoteProxyService],
      voteProxyFactory: [VoteProxyFactoryService],
      smartContract: { addContracts }
    };

    if (bypassContracts === true) delete options.smartContract;

    return options;
  }
};
