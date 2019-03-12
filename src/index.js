import { map, prop } from 'ramda';
import { VOTE_PROXY_FACTORY, MCD_ADM, MKR, POLLING } from './utils/constants';
import ChiefService from './ChiefService';
import PollingService from './PollingService';
import VoteProxyService from './VoteProxyService';
import VoteProxyFactoryService from './VoteProxyFactoryService';

export default {
  addConfig: function(config, { network = 'mainnet', mcd }) {
    const contractAddresses = {
      kovan: mcd
        ? require('../contracts/addresses/kovan-mcd.json')
        : require('../contracts/addresses/kovan.json'),
      mainnet: require('../contracts/addresses/mainnet.json')
    };

    try {
      contractAddresses.testnet = require('../contracts/addresses/testnet.json');
    } catch (err) {
      // do nothing here; throw an error only if we later attempt to use ganache
    }

    const addContracts = {
      [MCD_ADM]: {
        address: map(prop('MCD_ADM'), contractAddresses),
        // TODO check for MCD-specific version of DSChief
        abi: require('../contracts/abis/DSChief.json')
      },
      [VOTE_PROXY_FACTORY]: {
        address: map(prop('VOTE_PROXY_FACTORY'), contractAddresses),
        abi: require('../contracts/abis/VoteProxyFactory.json')
      },
      [POLLING]: {
        address: map(prop('POLLING'), contractAddresses),
        abi: require('../contracts/abis/Polling.json')
      }
    };

    let makerConfig = {
      ...config,
      additionalServices: ['chief', 'polling', 'voteProxy', 'voteProxyFactory'],
      chief: [ChiefService],
      polling: [PollingService],
      voteProxy: [VoteProxyService],
      voteProxyFactory: [VoteProxyFactoryService],
      smartContract: { addContracts },
      token: {
        erc20: [
          {
            currency: MKR,
            symbol: MKR.symbol,
            address: contractAddresses[network].MCD_GOV
          }
        ]
      }
    };

    return makerConfig;
  }
};
