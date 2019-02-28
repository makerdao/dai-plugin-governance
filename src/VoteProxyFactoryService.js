import Maker from '@makerdao/dai';
import { VOTE_PROXY_FACTORY, PROXY_FACTORY } from './utils/constants';
import ApproveLinkTransaction from './ApproveLinkTransaction';
import { LocalService } from '@makerdao/services-core';

export default class VoteProxyFactoryService extends Maker.LocalService {
  constructor(name = 'voteProxyFactory') {
    super(name, ['smartContract', 'voteProxy', 'transactionManager']);
  }

  initiateLink(hotAddress) {
    return this._proxyFactoryContract().initiateLink(hotAddress);
  }

  approveLink(coldAddress) {
    const tx = new ApproveLinkTransaction(
      this._proxyFactoryContract(),
      this.get('transactionManager')
    );
    return tx.build('approveLink', [coldAddress]);
  }

  breakLink() {
    return this._proxyFactoryContract().breakLink();
  }

  getVoteProxy(address) {
    return this.get('voteProxy').getVoteProxy(address);
  }

  _proxyFactoryContract() {
    return this.get('smartContract').getContractByName(VOTE_PROXY_FACTORY);
  }
}
