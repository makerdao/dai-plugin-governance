import { map, prop } from 'ramda';
import { VOTE_PROXY_FACTORY, CHIEF, MKR, IOU } from './utils/constants';

import ChiefService from './ChiefService';
import VoteProxyService from './VoteProxyService';
import VoteProxyFactoryService from './VoteProxyFactoryService';

export default {
  addConfig: function(config, { network = 'mainnet', addressOverrides }) {
    const contractAddresses = {
      kovan: addressOverrides
        ? addressOverrides
        : require('../contracts/addresses/kovan.json'),
      mainnet: require('../contracts/addresses/mainnet.json')
    };

    try {
      contractAddresses.testnet = require('../contracts/addresses/testnet.json');
    } catch (err) {
      // do nothing here; throw an error only if we later attempt to use ganache
    }

    const addContracts = {
      [CHIEF]: {
        address: map(prop('CHIEF'), contractAddresses),
        // TODO check for MCD-specific version of DSChief
        abi: require('../contracts/abis/DSChief.json')
      },
      [VOTE_PROXY_FACTORY]: {
        address: map(prop('VOTE_PROXY_FACTORY'), contractAddresses),
        abi: require('../contracts/abis/VoteProxyFactory.json')
      }
    };

    let contractData;
    if (network !== 'ganache')
      contractData = {
        smartContract: { addContracts },
        token: {
          erc20: [
            {
              currency: MKR,
              symbol: MKR.symbol,
              address: contractAddresses[network].GOV
            },
            {
              currency: IOU,
              symbol: IOU.symbol,
              address: contractAddresses[network].IOU
            }
          ]
        }
      };

    const makerConfig = {
      ...config,
      additionalServices: ['chief', 'voteProxy', 'voteProxyFactory'],
      chief: [ChiefService],
      voteProxy: [VoteProxyService],
      voteProxyFactory: [VoteProxyFactoryService],
      ...contractData
    };

    return makerConfig;
  }
};
