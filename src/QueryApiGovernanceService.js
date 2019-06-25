import { PublicService } from '@makerdao/services-core';

const mockAllPollsData = [
  {
    pollId: 0,
    startTime: '2004-09-17T00:00:30.75',
    endTime: '2005-09-17T00:00:30.75',
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

  async getMkrSupport(pollId, blockNumber) {
    //graphql query to get mkr support per option for a given poll id at a given block number
    return mockPollHistory;
  }

  async getAllWhitelistedPolls() {
    //graphql query to get all polls that have been created by whitelisted addresses excluding ones that have been withdrawn
    return mockAllPollsData;
  }

  async getUniqueVoters(pollId) {
    //graphql query to get number of unique addresses that have voted for a given poll
    return 1234;
  }
}
