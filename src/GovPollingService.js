import { PrivateService } from '@makerdao/services-core';
import { POLLING } from './utils/constants';

export default class GovPollingService extends PrivateService {
  constructor(name = 'govPolling') {
    super(name, ['smartContract']);
  }

  async createPoll(startDate, endDate, multiHash, url) {
    const txo = await this._pollingContract().createPoll(
      startDate,
      endDate,
      multiHash,
      url
    );
    const pollId = parseInt(txo.receipt.logs[0].topics[2]);
    return pollId;
  }

  withdrawPoll(pollId) {
    return this._pollingContract().withdrawPoll(pollId);
  }

  vote(pollId, optionId) {
    return this._pollingContract().vote(pollId, optionId);
  }

  _pollingContract() {
    return this.get('smartContract').getContractByName(POLLING);
  }
}
