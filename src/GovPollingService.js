import { PrivateService } from '@makerdao/services-core';
import { POLLING } from './utils/constants';
import { MKR } from './utils/constants';

const POSTGRES_MAX_INT = 2147483647;

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

  async getPoll(multiHash) {
    const polls = await this.getAllWhitelistedPolls();
    const filtered = polls.filter(p => p.multiHash === multiHash);
    let lowest = Infinity;
    let lowestPoll;
    for (let i = 0; i < filtered.length; i++) {
      if (filtered[i].pollId < lowest) {
        lowest = filtered[i].pollId;
        lowestPoll = filtered[i];
      }
    }
    return lowestPoll;
  }

  async _getPoll(pollId) {
    const polls = await this.getAllWhitelistedPolls();
    return polls.filter(p => p.pollId === pollId);
  }

  async getAllWhitelistedPolls() {
    if (this.polls) return this.polls;
    this.polls = await this.get('govQueryApi').getAllWhitelistedPolls();
    return this.polls;
  }

  refresh() {
    this.polls = null;
  }

  async getOptionVotingFor(address, pollId) {
    return this.get('govQueryApi').getOptionVotingFor(address, pollId);
  }

  async getNumUniqueVoters(pollId) {
    return this.get('govQueryApi').getNumUniqueVoters(pollId);
  }

  async getMkrWeight(address) {
    const weight = await this.get('govQueryApi').getMkrWeight(
      address,
      POSTGRES_MAX_INT
    );
    return MKR(weight);
  }

  async getMkrAmtVoted(pollId) {
    const weights = await this.get('govQueryApi').getMkrSupport(
      pollId,
      POSTGRES_MAX_INT
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
    return voted.div(total); //TODO: why is this throwing an error about NaN?
  }

  async getWinningProposal(pollId) {
    const currentVotes = await this.get('govQueryApi').getMkrSupport(
      pollId,
      POSTGRES_MAX_INT
    );
    let max = currentVotes[0];
    for (let i = 1; i < currentVotes.length; i++) {
      if (currentVotes[i].mkrSupport > max.mkrSupport) {
        max = currentVotes[i];
      }
    }
    return max.optionId;
  }

  async getVoteHistory(pollId, numPlots) {
    const { startDate, endDate } = this._getPoll(pollId);
    const startUnix = Math.floor(startDate / 1000);
    const endUnix = Math.floor(endDate / 1000);
    const [startBlock, endBlock] = await Promise.all([
      this.get('govQueryApi').getBlockNumber(startUnix),
      this.get('govQueryApi').getBlockNumber(endUnix) //should return current block number if endDate hasn't happened yet
    ]);
    let voteHistory = [];
    for (
      let i = endBlock;
      i >= startBlock;
      i -= Math.round(endBlock - startBlock) / numPlots
    ) {
      const mkrSupport = await this.get('govQueryApi').getMkrSupport(
        pollId,
        POSTGRES_MAX_INT
      );
      voteHistory.push({
        time: mkrSupport[0].blockTimestamp,
        options: mkrSupport
      });
    }
    return voteHistory;
  }
}
