import { MDAI } from '../src';

export const dummyMkrSupportData = [
  {
    optionId: 1,
    mkrSupport: 10000,
    percentage: 25,
    blockTimestamp: Date.now()
  },
  {
    optionId: 2,
    mkrSupport: 30000,
    percentage: 75,
    blockTimestamp: Date.now()
  }
];

export const dummyAllPollsData = [
  {
    creator: '0xeda95d1bdb60f901986f43459151b6d1c734b8a2',
    pollId: 1,
    blockCreated: 123456788,
    startDate: Date.now() - 10000000,
    endDate: Date.now() - 1,
    multiHash: 'QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT3L4',
    url: 'https://dummyURL/1'
  },
  {
    creator: '0xTYa95d1bdb60f901986f43459151b6d1c734b8a2',
    pollId: 2,
    blockCreated: 123456789,
    startDate: Date.now() - 20000000,
    endDate: Date.now(),
    multiHash: 'ZmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT3L4',
    url: 'https://dummyURL/2'
  }
];

class BlockNumGen {
  constructor() {
    this.i = 0;
    this.nums = [8017399, 8200000];
  }
  next() {
    return this.nums[i++];
  }
}

export function dummyBlockNumber(unix) {
  const g = new BlockNumGen();
  return g.next();
}

export const dummyNumUnique = 225;

export const dummyWeight = 5.5;

export const dummyOption = 1;
