import { PrivateService } from '@makerdao/services-core';
import { MKR, ESM } from './utils/constants';
import { getCurrency } from './utils/helpers';

export default class EsmService extends PrivateService {
  constructor(name = 'esm') {
    super(name, ['smartContract', 'web3']);
  }

  // Writes -----------------------------------------------

  join(amt, unit = MKR) {
    const mkrAmt = getCurrency(amt, unit).toFixed('wei');
    return this._esmContract().join(mkrAmt);
  }

  _esmContract() {
    return this.get('smartContract').getContractByName(ESM);
  }
}
