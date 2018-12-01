import { utils } from 'ethers';

export default class ApproveLinkTransaction {
  proxyAddress() {
    return this._proxyAddress;
  }

  fees() {
    return this._txMgr.getTransaction(this.promise).fees();
  }

  timeStamp() {
    return this._txMgr.getTransaction(this.promise).timeStamp();
  }

  build(contract, method, args, transactionManager) {
    this._contract = contract;
    this._txMgr = transactionManager;
    const promise = (async () => {
      await 0;
      const txo = await contract[method](...[...args, { promise }]);
      this._parseLogs(txo.receipt.logs);
      return this;
    })();
    this.promise = promise;
    return promise;
  }

  _parseLogs(logs) {
    //use lower level ethersJS functions to parse logs
    const { LinkConfirmed } = this._contract.interface.events;
    const web3 = this._txMgr.get('web3')._web3;
    const topic = utils.keccak256(web3.utils.toHex(LinkConfirmed.signature));
    const receiptEvent = logs.filter(
      e => e.topics[0].toLowerCase() === topic.toLowerCase() //filter for LinkConfirmed events
    );
    const parsedLog = LinkConfirmed.parse(
      receiptEvent[0].topics,
      receiptEvent[0].data
    );
    this._proxyAddress = parsedLog['voteProxy'];
  }
}
