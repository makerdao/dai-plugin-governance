import { PrivateService } from '@makerdao/services-core';

const mockParsedAllPollsData = [
  {
    pollId: 0,
    startTime: new Date(),
    endTime: new Date(),
    multiHash: 'QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT3L4'
  }
];

const mockParsedVoteHistory = [
  {
    time: new Date(),
    options: [
      {
        option: 0,
        mkr: 200,
        percentage: 50
      }
    ]
  }
];

export default class PollService extends PrivateService {
  constructor(name = 'poll') {
    super(name, ['governance:queryApi']);
  }

  _getPoll(pollId) {
    //call getAllWhitelistedPolls, and filter on pollId
  }

  async getAllWhitelistedPolls() {
    //return cached polls (if cached).  I think a cache works since poll data (id, start time, end time, multihash) is immutable (other than being withdrawn, which shouldn't happen much)
    //otherwise await this.get('governance:queryApi').getAllWhitelistedPolls();
    // return parsed data
    return mockParsedAllPollsData;
  }

  async getVoteHistory(pollId, numPlots) {
    //_getPoll(pollId) and grab start time and end time
    //iteratively call this.get('governance:queryApi').getMkrSupport(pollId, blockNumber);
    //return array of parsed data
    return mockParsedVoteHistory;
  }

  async getWinningProposal(pollId) {
    //_getPoll(pollId) and grab end time
    //call this.get('governance:queryApi').getMkrSupport() with the current blockNumber or poll end time, whichever is first, and then return the option with the most MKR
  }

  async getUniqueVoters(pollId) {
    //this.get('governance:queryApi').getUniqueVotes(pollId);
  }

  async getMkrVoted(pollId) {
    //_getPoll(pollId) and grab end time
    //call getMkrSupport with the current blockNumber or poll end time, whichever is first and then return the sum of all MKR
  }

  async getPercentageMkrVoted(pollId) {
    //Promise.all
    //this.getMkrVoted(pollId);
    //get total mkr supply
    //return mkr voted / mkr supply
  }
}
