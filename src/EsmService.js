import { PrivateService } from '@makerdao/services-core';
import { ESM } from './utils/constants';
import { END } from './utils/constants';

export default class EsmService extends PrivateService {
  constructor(name = 'esm') {
    super(name, ['smartContract', 'web3']);
  }

  thresholdAmount() {
    return this._esmContract().min();
  }

  async emergencyShutdownActive() {
    const active = await this._endContract().live();
    return active.eq(0);
  }

  async canFire() {
    const [fired, live] = await Promise.all([
      this._esmContract().fired(),
      this.emergencyShutdownActive()
    ]);
    return !fired && !live;
  }

  getTotalStaked() {
    return this._esmContract().Sum();
  }

  getTotalStakedByAddress(address) {
    if (!address) {
      address = this.get('web3').currentAddress();
    }
    return this._esmContract().sum(address);
  }

  _esmContract() {
    return this.get('smartContract').getContractByName(ESM);
  }

  _endContract() {
    return this.get('smartContract').getContractByName(END);
  }
}
