import { setupTestMakerInstance } from '../helpers';
import GovQueryApiService from '../../src/GovQueryApiService';

let service;

beforeAll(async () => {
  const maker = await setupTestMakerInstance();
  service = maker.service('govQueryApi');
  console.log('service', service);
});

test('get all active polls', async () => {
  const polls = await service.getAllWhitelistedPolls();
  console.log('polls');
});
