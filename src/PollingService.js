import { PrivateService } from '@makerdao/dai';
import { POLLING } from './utils/constants';

export default class PollingService extends PrivateService {
  constructor(name = 'polling') {
    super(name, ['smartContract']);
  }

  // Writes -----------------------------------------------

  createPoll(numChoices, delay, ttl, multihash) {
    // TODO: check for auth first
    return this._pollingContract().createPoll(
      numChoices,
      delay,
      ttl,
      multihash
    );
  }

  // Reads ------------------------------------------------

  async getNumberOfPolls() {
    return (await this._pollingContract().npoll()).toNumber();
  }

  // Internal --------------------------------------------

  _pollingContract() {
    return this.get('smartContract').getContractByName(POLLING);
  }
}
