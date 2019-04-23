// Until events from the server are set up, we'll have to fake it with sleep
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const defaultSnapshot = '1373323262812202725';

const testchainConfig = {
  accounts: 4,
  block_mine_time: 0,
  clean_on_stop: true,
  description: 'DaiPluginDefault2',
  type: 'ganache',
  snapshot_id: defaultSnapshot
};
const startTestchain = async () => {
  console.log('start testchain');
  const { Client, Event } = require('@makerdao/testchain-client');
  const client = new Client();
  global.client = client;
  await global.client.init();
  global.client.create(testchainConfig);
  const {
    payload: {
      response: { id }
    }
  } = await global.client.once('api', Event.OK);
  // console.log('response', response);
  return id;
};

const getTestchainDetails = async id => {
  return global.client.api.getChain(id);
};

beforeAll(async () => {
  console.log('beforeall testchain');
  const id = await startTestchain();
  // sleep for 10 seconds while we wait for the snapshot to restore
  await sleep(10000);
  const {
    details: {
      chain_details: { rpc_url }
    }
  } = await getTestchainDetails(id);
  console.log('rpc_url', rpc_url);
  global.testchainPort = rpc_url.substr(rpc_url.length - 4);
  global.testchainId = id;

  console.log('GLOBAL ID', global.testchainId);
  console.log('GLOBAL PORT', global.testchainPort);
  // snapshotId = await takeSnapshot();
});

// afterEach(() => {
//   return Web3ServiceList.disconnectAll();
// });

// let snapshotId;

// afterAll(async () => {
//   await restoreSnapshot(snapshotId);
// });

//default snapshot
// take new snapshot of default
// test
// restore new snapshot
// delete new snapshot
