import { PrivateService } from '@makerdao/services-core';
import { POLLING } from './utils/constants';
import { MKR } from './utils/constants';

export default class GovPollingService extends PrivateService {
  constructor(name = 'govPolling') {
    super(name, ['smartContract', 'govQueryApi', 'token']);
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

  async _getPoll(pollId) {
    const polls = await this.get('govQueryApi').getAllWhitelistedPolls();
    return polls.filter(p => p.pollId === pollId);
  }

  async getAllWhitelistedPolls() {
    return this.get('govQueryApi').getAllWhitelistedPolls();
  }

  async getOptionVotingFor(address, pollId) {
    return this.get('govQueryApi').getOptionVotingFor(address, pollId);
  }

  async getNumUniqueVoters(pollId) {
    return this.get('govQueryApi').getNumUniqueVoters(pollId);
  }

  async getMkrWeight(address) {
    const weight = this.get('govQueryApi').getMkrWeight(address, 999999999); //todo: a more elegant solution to current block number
    return MKR(weight);
  }

  async getMkrAmtVoted(pollId) {
    const weights = await this.get('govQueryApi').getMkrSupport(
      pollId,
      999999999
    );
    return MKR(weights.reduce((acc, cur) => acc + cur.mkrSupport, 0));
  }

  async getPercentageMkrVoted(pollId) {
    const [voted, total] = await Promise.all([
      this.getMkrAmtVoted(pollId),
      this.get('token')
        .getToken(MKR)
        .totalSupply()
    ]);
    return voted.div(supply);
  }

  async getWinningProposal(pollId) {
    const currentVotes = this.get('govQueryApi').getMkrSupport(
      pollId,
      999999999
    );
    let max = currentVotes[0];
    for (let i = 1; i < currentVotes.length; i++) {
      if (currentVotes[i] > max) {
        max = currentVotes[i];
      }
    }
    return max.optionId;
  }

  async getVoteHistory(pollId, numPlots) {
    const { startDate, endDate } = this._getPoll(pollId);
    //convert startDate and endDate to blockNumber?
    //get current block number
    let voteHistory = [];
    for (
      let i = startBlock;
      i <= Math.min(currentBlock, endBlock);
      i += Math.ceil(endBlock - startBlock) / numPlots
    ) {
      const mkrSupport = this.get('govQueryApi').getMkrSupport(
        pollId,
        999999999
      );
      //todo: update getMkrSupport to also return the timestamp of the blocknumber supplied? or just use web3 to get it?
      voteHistory.push({ time: 'time', options: mkrSupport });
    }
    return voteHistory;
  }
}
