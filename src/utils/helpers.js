import { createGetCurrency } from '@makerdao/currency';
import { MKR, LOCAL_URL, STAGING_URL, PROD_URL } from './constants';

/**
 * @desc get network name
 * @param  {Number|String} id
 * @return {String}
 */
export const netIdToName = id => {
  switch (parseInt(id, 10)) {
    case 1:
      return 'mainnet';
    case 42:
      return 'kovan';
    case 999:
      return 'ganache';
    default:
      return '';
  }
};

export const netIdtoSpockUrl = id => {
  switch (parseInt(id, 10)) {
    case 1:
      return PROD_URL;
    case 42:
      return STAGING_URL;
    default:
      return LOCAL_URL;
  }
};

export const getCurrency = createGetCurrency({ MKR });
