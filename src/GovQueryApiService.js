import { PublicService } from '@makerdao/services-core';
import assert from 'assert';
import { netIdtoSpockUrl } from './utils/helpers';

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
    this.serverUrl = netIdtoSpockUrl(network);
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
          url
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
    return response.totalMkrWeightProxyAndNoProxyByAddress.nodes[0].weight;
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
    if (!response.currentVote.nodes[0]) return null;
    return response.currentVote.nodes[0].optionId;
  }

  async getBlockNumber(unixTime) {
    const query = `{
      timeToBlockNumber(argUnix: ${unixTime}){
      nodes
    }
    }`;
    const response = await this.getQueryResponse(this.serverUrl, query);
    return response.timeToBlockNumber.nodes[0];
  }

  async getMkrSupport(pollId, blockNumber) {
    const query = `{voteOptionMkrWeights(argPollId: ${pollId}, argBlockNumber: ${blockNumber}){
    nodes{
      optionId
      mkrSupport
    }
  }
  }`;
    const response = await this.getQueryResponse(this.serverUrl, query);
    const weights = response.voteOptionMkrWeights.nodes;
    // We don't want to calculate votes for 0:abstain
    if (weights[0] && weights[0].optionId === 0) weights.shift();
    const totalWeight = weights.reduce((acc, cur) => {
      const mkrSupport = isNaN(parseFloat(cur.mkrSupport))
        ? 0
        : parseFloat(cur.mkrSupport);
      return acc + mkrSupport;
    }, 0);
    return weights.map(o => {
      const mkrSupport = isNaN(parseFloat(o.mkrSupport))
        ? 0
        : parseFloat(o.mkrSupport);
      o.mkrSupport = mkrSupport;
      o.percentage = (100 * mkrSupport) / totalWeight;
      o.blockTimestamp = new Date(o.blockTimestamp);
      return o;
    });
  }
}
