import { PrivateService } from '@makerdao/services-core';
import { ESM } from './utils/constants';

export default class EsmService extends PrivateService {
  constructor(name = 'esm') {
    super(name, ['smartContract', 'web3']);
  }

  _esmContract() {
    return this.get('smartContract').getContractByName(ESM);
  }
}
