import { PrivateService } from '@makerdao/dai';
import { PROXY_FACTORY } from './utils/constants';
import ApproveLinkTransaction from './ApproveLinkTransaction';

export default class VoteProxyFactoryService extends PrivateService {
  constructor(name = 'voteProxyFactory') {
    super(name, ['smartContract', 'voteProxy', 'transactionManager']);
  }

  initiateLink(hotAddress) {
    return this._proxyFactoryContract().initiateLink(hotAddress);
  }

  approveLink(coldAddress) {
    const tx = new ApproveLinkTransaction();
    return tx.build(
      this._proxyFactoryContract(),
      'approveLink',
      [coldAddress],
      this.get('transactionManager')
    );
  }

  breakLink() {
    return this._proxyFactoryContract().breakLink();
  }

  getVoteProxy(address) {
    return this.get('voteProxy').getVoteProxy(address);
  }

  _proxyFactoryContract() {
    return this.get('smartContract').getContractByName(PROXY_FACTORY);
  }
}
