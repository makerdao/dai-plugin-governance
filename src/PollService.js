import { PrivateService } from '@makerdao/services-core';
import { POLLING } from './utils/constants';

export default class PollService extends PrivateService {
  constructor(name = 'poll') {
    super(name, ['smartContract']);
  }

  createPoll(startDate, endDate, multiHash, url) {
    return this._pollingContract().createPoll(
      startDate,
      endDate,
      multiHash,
      url
    );
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
