import { PrivateService } from '@makerdao/services-core';

const mockParsedAllPollsData = [
  {
    creator: '0xeda95d1bdb60f901986f43459151b6d1c734b8a2',
    pollId: 0,
    blockCreated: 123456789,
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

  async getOptionVotingFor(pollId, address) {
    //this.get('governance:queryApi').getOptionVotingFor(pollId, address);
    return 1;
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

  async getNumUniqueVoters(pollId) {
    //this.get('governance:queryApi').getNumUniqueVotes(pollId);
  }

  async getMkrAmtVoted(pollId) {
    //_getPoll(pollId) and grab end time
    //call this.get('governance:queryApi').getMkrAmtVoted with the current blockNumber or poll end time, whichever is first and then return the sum of all MKR
  }

  async getPercentageMkrVoted(pollId) {
    //Promise.all
    //this.getMkrVoted(pollId);
    //get total mkr supply
    //return mkr voted / mkr supply
  }
}
