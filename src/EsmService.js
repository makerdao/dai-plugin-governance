import { PrivateService } from '@makerdao/services-core';
import { MKR, ESM, END } from './utils/constants';
import { getCurrency } from './utils/helpers';

export default class EsmService extends PrivateService {
  constructor(name = 'esm') {
    super(name, ['smartContract', 'web3', 'token', 'allowance']);
  }

  thresholdAmount() {
    return this._esmContract().min();
  }

  fired() {
    return this._esmContract().fired();
  }

  async emergencyShutdownActive() {
    const active = await this._endContract().live();
    return active.eq(0);
  }

  async canFire() {
    const [fired, live] = await Promise.all([
      this.fired(),
      this.emergencyShutdownActive()
    ]);
    return !fired && !live;
  }

  async getTotalStaked() {
    const total = await this._esmContract().Sum();
    return getCurrency(total, MKR).shiftedBy(-18);
  }

  async getTotalStakedByAddress(address = false) {
    if (!address) {
      address = this.get('web3').currentAddress();
    }
    const total = await this._esmContract().sum(address);
    return getCurrency(total, MKR).shiftedBy(-18);
  }

  async stake(amount, skipChecks = false) {
    const mkrAmount = getCurrency(amount, MKR);
    if (!skipChecks) {
      const [fired, mkrBalance] = await Promise.all([
        this.fired(),
        this.get('token')
          .getToken(MKR)
          .balance()
      ]);
      if (fired) {
        throw new Error('cannot join when emergency shutdown has been fired');
      }
      if (mkrBalance.lt(mkrAmount)) {
        throw new Error('amount to join is greater than the user balance');
      }
    }
    return this._esmContract().join(mkrAmount.toFixed('wei'));
  }

  _esmContract() {
    return this.get('smartContract').getContractByName(ESM);
  }

  _endContract() {
    return this.get('smartContract').getContractByName(END);
  }
}
