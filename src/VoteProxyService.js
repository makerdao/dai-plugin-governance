import VoteProxy from './VoteProxy';
import { PrivateService, MKR } from '@makerdao/dai';
import { PROXY_FACTORY, ZERO_ADDRESS } from './utils/constants';
// maybe a "dai.js developer utils" package is useful?
import { getCurrency } from '@makerdao/dai/src/eth/Currency';
import voteProxyAbi from '../contracts/abis/VoteProxy.json';

export default class VoteProxyService extends PrivateService {
  constructor(name = 'voteProxy') {
    super(name, ['smartContract', 'chief']);
  }

  // Writes -----------------------------------------------

  lock(proxyAddress, amt, unit = MKR) {
    const mkrAmt = getCurrency(amt, unit).toEthersBigNumber('wei');
    console.log('mkr amount', mkrAmt)
    const pc = this._proxyContract(proxyAddress);
    return pc.lock(mkrAmt);
  }

  free(proxyAddress, amt, unit = MKR) {
    const mkrAmt = getCurrency(amt, unit).toEthersBigNumber('wei');
    return this._proxyContract(proxyAddress).free(mkrAmt);
  }

  freeAll(proxyAddress) {
    return this._proxyContract(proxyAddress).freeAll();
  }

  voteExec(proxyAddress, picks) {
    if (Array.isArray(picks))
      return this._proxyContract(proxyAddress)['vote(address[])'](picks);
    return this._proxyContract(proxyAddress)['vote(bytes32)'](picks);
  }

  // Reads ------------------------------------------------

  async getVotedProposalAddresses(proxyAddress) {
    const _slate = await this.get('chief').getVotedSlate(proxyAddress);
    return this.get('chief').getSlateAddresses(_slate);
  }

  async getVoteProxy(addressToCheck) {
    const {
      hasProxy,
      role,
      address: proxyAddress
    } = await this._getProxyStatus(addressToCheck);
    if (!hasProxy) return { hasProxy, voteProxy: null };
    const otherRole = role === 'hot' ? 'cold' : 'hot';
    const otherAddress = await this._getAddressOfRole(proxyAddress, otherRole);
    return {
      hasProxy,
      voteProxy: new VoteProxy({
        voteProxyService: this,
        proxyAddress,
        [`${role}Address`]: addressToCheck,
        [`${otherRole}Address`]: otherAddress
      })
    };
  }

  // Internal --------------------------------------------

  _proxyContract(address) {
    return this.get('smartContract').getContractByAddressAndAbi(
      address,
      voteProxyAbi
    );
  }

  _proxyFactoryContract() {
    return this.get('smartContract').getContractByName(PROXY_FACTORY);
  }

  async _getProxyStatus(address) {
    const [proxyAddressCold, proxyAddressHot] = await Promise.all([
      this._proxyFactoryContract().coldMap(address),
      this._proxyFactoryContract().hotMap(address)
    ]);
    if (proxyAddressCold !== ZERO_ADDRESS)
      return { role: 'cold', address: proxyAddressCold, hasProxy: true };
    if (proxyAddressHot !== ZERO_ADDRESS)
      return { role: 'hot', address: proxyAddressHot, hasProxy: true };
    return { role: null, address: '', hasProxy: false };
  }

  _getAddressOfRole(proxyAddress, role) {
    if (role === 'hot') return this._proxyContract(proxyAddress).hot();
    else if (role === 'cold') return this._proxyContract(proxyAddress).cold();
    return null;
  }
}

// add a few Chief Service methods to the Vote Proxy Service
Object.assign(
  VoteProxyService.prototype,
  ['getVotedSlate', 'getNumDeposits'].reduce((acc, name) => {
    acc[name] = function(...args) {
      return this.get('chief')[name](...args);
    };
    return acc;
  }, {})
);
