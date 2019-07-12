import { PublicService } from '@makerdao/services-core';
import assert from 'assert';

const LOCAL_URL = 'http://localhost:3001/v1';

export default class QueryApi extends PublicService {
  constructor(name = 'govQueryApi') {
    super(name, ['web3']);
  }

  async getQueryResponse(serverUrl, query, variables) {
    const resp = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables
      })
    });
    const { data } = await resp.json();
    assert(data, `error fetching data from ${serverUrl}`);
    return data;
  }

  connect() {
    const network = this.get('web3').network;
    switch (network) {
      default:
        this.serverUrl = LOCAL_URL;
        break;
    }
  }

  async getAllWhitelistedPolls() {
    const query = `{activePolls {
      nodes {
          creator
          pollId
          blockCreated
          startDate
          endDate
          multiHash
        }
      }
    }`;

    const response = await this.getQueryResponse(this.serverUrl, query);
    return response.activePolls.nodes;
  }
}
