import { map, prop } from 'ramda';

import { VOTE_PROXY_FACTORY, MCD_ADM } from './utils/constants';
import ChiefService from './ChiefService';
import VoteProxyService from './VoteProxyService';
import VoteProxyFactoryService from './VoteProxyFactoryService';

const contractAddresses = {
  kovan: require('../contracts/addresses/kovan.json'),
  mainnet: require('../contracts/addresses/mainnet.json')
};

const addContracts = {
  [MCD_ADM]: {
    address: map(prop('MCD_ADM'), contractAddresses),
    abi: require('../contracts/abis/DSChief.json')
  },
  [VOTE_PROXY_FACTORY]: {
    address: map(prop('VOTE_PROXY_FACTORY'), contractAddresses),
    abi: require('../contracts/abis/VoteProxyFactory.json')
  }
};
export default {
  addConfig: function(config, { bypassContracts = false }) {
    const options = {
      ...config,
      additionalServices: ['chief', 'voteProxy', 'voteProxyFactory'],
      chief: [ChiefService],
      voteProxy: [VoteProxyService],
      voteProxyFactory: [VoteProxyFactoryService],
      smartContract: { addContracts }
    };

    if (bypassContracts === true) delete options.smartContract;

    return options;
  }
};
