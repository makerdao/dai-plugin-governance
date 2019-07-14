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
    return response.activePolls.nodes.map(p => {
      p.startDate = new Date(p.startDate * 1000);
      p.endDate = new Date(p.endDate * 1000);
      return p;
    });
  }

  async getNumUniqueVoters(pollId) {
    const query = `{uniqueVoters(argPollId:${pollId}){
      nodes
    }
    }`;

    const response = await this.getQueryResponse(this.serverUrl, query);
    return parseInt(response.uniqueVoters.nodes[0]);
  }

  async getMkrWeight(address, blockNumber) {
    const query = `{totalMkrWeightProxyAndNoProxyByAddress(argAddress: "${address}", argBlockNumber: ${blockNumber}){
      nodes {
        address
        weight
      }
    }
    }`;
    const response = await this.getQueryResponse(this.serverUrl, query);
    if (!response.totalMkrWeightProxyAndNoProxyByAddress.nodes[0]) return 0;
    return response.totalMkrWeightProxyAndNoProxyByAddress.nodes[0];
  }

  async getOptionVotingFor(address, pollId) {
    const query = `{
      currentVote(argAddress: "${address}", argPollId: ${pollId}){
        nodes{
          optionId
        }
      }
    }`;
    const response = await this.getQueryResponse(this.serverUrl, query);
    return response.currentVote.nodes[0].optionId;
  }

  async getMkrAmtVoted(pollId, blockNumber) {
    const query = `{voteOptionMkrWeights(argPollId: ${pollId}, argBlockNumber: ${blockNumber}){
    nodes{
      optionId
      mkrSupport
    }
  }
  }`;
    const response = await this.getQueryResponse(this.serverUrl, query);
    return response.voteOptionMkrWeights.nodes;
  }
}
