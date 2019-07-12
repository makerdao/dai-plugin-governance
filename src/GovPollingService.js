import { PrivateService } from '@makerdao/services-core';
import { POLLING } from './utils/constants';
import { MKR } from './utils/constants';

export default class GovPollingService extends PrivateService {
  constructor(name = 'govPolling') {
    super(name, ['smartContract', 'govQueryApi']);
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

  //--- cache queries

  async getAllWhitelistedPolls() {
    return this.get('govQueryApi').getAllWhitelistedPolls();
  }

  async getNumUniqueVoters(pollId) {
    return this.get('govQueryApi').getNumUniqueVoters(pollId);
  }

  async getMkrWeight(address) {
    const weight = this.get('govQueryApi').getMkrWeight(address, 999999999); //todo: a more elegant solution to current block number
    return MKR(weight);
  }
}
