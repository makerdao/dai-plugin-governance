import { PublicService } from '@makerdao/services-core';

const mockAllPollsData = [
  {
    creator: '0xeda95d1bdb60f901986f43459151b6d1c734b8a2',
    pollId: 0,
    blockCreated: 123456789,
    startTime: '2019-07-02T11:00:00Z',
    endTime: '2019-07-03T16:00:00Z',
    multiHash: 'QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT3L4'
  }
];

const mockMkrSupport = [
  {
    option: 0,
    mkr: 20
  }
];

export default class QueryApi extends PublicService {
  constructor(name = 'governance:queryApi') {
    super(name, []);
  }

  async getOptionVotingFor(pollId, address) {
    //graphql query to get the option that an address is currently voting for, returns null if not voting
    return [{ option_id: 1 }];
  }

  async getMkrWeight(address) {
    //graphql query to get mkr weight for a given address
    return [
      { hot: '0xhot', cold: '0xcold', proxy: '0xproxy', total_weight: '5' }
    ];
  }

  async getMkrAmtVoted(pollId, blockNumber) {
    //graphql query to get mkr support per option for a given poll id at a given block number
    return mockPollHistory;
  }

  async getAllWhitelistedPolls() {
    //graphql query to get all polls that have been created by whitelisted addresses excluding ones that have been withdrawn
    return mockAllPollsData;
  }

  async getNumUniqueVoters(pollId) {
    //graphql query to get number of unique addresses that have voted for a given poll
    return [{ unique_voters: 100 }];
  }
}
