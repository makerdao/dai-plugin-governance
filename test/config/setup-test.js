// Until events from the server are set up, we'll have to fake it with sleep
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// const defaultSnapshotId = '18072813273764569849'; // default for remote
const defaultSnapshotId = '5521167592574382503'; // my local one

// const testchainUrl = 'http://18.185.172.121:4000';
// const websocketUrl = 'ws://18.185.172.121:4000/socket';
const testchainUrl = process.env.TESTCHAIN_URL || 'http://localhost:4000';
const websocketUrl = process.env.WEBSOCKET_URL || 'ws://127.1:4000/socket';

const testchainConfig = {
  accounts: 4,
  block_mine_time: 0,
  clean_on_stop: true,
  description: 'DaiPluginDefault4',
  type: 'ganache',
  snapshot_id: defaultSnapshotId
};
const startTestchain = async () => {
  const { Client, Event } = require('@makerdao/testchain-client');
  const client = new Client(testchainUrl, websocketUrl);
  global.client = client;
  await global.client.init();
  global.client.create(testchainConfig);
  const {
    payload: {
      response: { id }
    }
  } = await global.client.once('api', Event.OK);

  return id;
};

const setTestchainDetails = async id => {
  const {
    details: {
      chain_details: { rpc_url }
    }
  } = await global.client.api.getChain(id);

  global.defaultSnapshotId = defaultSnapshotId;
  global.testchainPort = rpc_url.substr(rpc_url.length - 4);
  global.testchainId = id;
  global.rpcUrl = rpc_url.includes('.local')
    ? `http://localhost:${global.testchainPort}`
    : rpc_url;
};

beforeAll(async () => {
  const id = await startTestchain();
  // sleep for 10 seconds while we wait for the chain to start up
  await sleep(10000);
  await setTestchainDetails(id);
});

afterAll(async done => {
  global.client.restoreSnapshot(global.testchainId, global.defaultSnapshotId);
  await sleep(15000);
  console.log('restored snapshot id', defaultSnapshotId);
  await global.client.delete(global.testchainId);
  await sleep(15000);
  console.log('deleted chain id', global.testchainId);
  done();
});
