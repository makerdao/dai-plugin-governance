import { setupTestMakerInstance } from '../helpers';
import GovQueryApiService from '../../src/GovQueryApiService';

let service;

beforeAll(async () => {
  const maker = await setupTestMakerInstance();
  service = maker.service('govQueryApi');
});

test('get all active polls', async () => {
  const polls = await service.getAllWhitelistedPolls();
  console.log('polls', polls);
});

test('get unique voters', async () => {
  const num = await service.getNumUniqueVoters(1);
  console.log('numUnique', num);
});

test('get mkr weight', async () => {
  const weight = await service.getMkrWeight('address', 999999999);
  console.log('weight', weight);
});
