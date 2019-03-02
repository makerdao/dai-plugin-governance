import { map, prop } from 'ramda';
import { createCurrency } from '@makerdao/currency';
import { VOTE_PROXY_FACTORY, MCD_ADM } from './utils/constants';
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
  addConfig: function(config, { network = 'mainnet' }) {
    let makerConfig = {
      ...config,
      additionalServices: ['chief', 'voteProxy', 'voteProxyFactory'],
      chief: [ChiefService],
      voteProxy: [VoteProxyService],
      voteProxyFactory: [VoteProxyFactoryService],
      smartContract: { addContracts }
    };

    if (network === 'kovan') {
      const MKR = createCurrency('MKR');
      makerConfig.token = {
        erc20: [
          {
            currency: MKR,
            symbol: MKR.symbol,
            address: contractAddresses.kovan.MCD_GOV
          }
        ]
      };
    }

    return makerConfig;
  }
};
