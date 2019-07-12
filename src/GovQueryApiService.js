import { PublicService } from '@makerdao/services-core';

export default class QueryApi extends PublicService {
  constructor(name = 'govQueryApi') {
    super(name, []);
  }
}
