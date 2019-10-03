import { PrivateService } from '@makerdao/services-core';
import { ESM } from './utils/constants';

export default class EsmService extends PrivateService {
  constructor(name = 'esm') {
    super(name, ['smartContract', 'web3']);
  }

  thresholdAmount() {
    return this._esmContract().min();
  }

  _esmContract() {
    return this.get('smartContract').getContractByName(ESM);
  }
}
