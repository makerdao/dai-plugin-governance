// Until events from the server are set up, we'll have to fake it with sleep
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const testchainConfig = {
  accounts: 4,
  block_mine_time: 0,
  clean_on_stop: true,
  description: 'DaiPluginDefault',
  step_id: 2,
  type: 'ganache'
};
const startTestchain = async () => {
  console.log('start testchain');
  const { Client, Event } = require('@makerdao/testchain-client');
  const client = new Client();
  await client.init();
  client.create(testchainConfig);
  const {
    payload: {
      response: { id }
    }
  } = await client.once('api', Event.OK);
  // console.log('response', response);
  return id;
};

const getTestchainDetails = async id => {
  console.log('get tc url');
  const { Client, Event } = require('@makerdao/testchain-client');
  const client = new Client();
  await client.init();
  return client.api.getChain(id);
};

beforeAll(async () => {
  console.log('beforeall foreal testchain');
  const id = await startTestchain();
  await sleep(30000);
  const {
    details: {
      chain_details: { rpc_url }
    }
  } = await getTestchainDetails(id);
  console.log('CHAIN DATA', rpc_url);
  global.testchainPort = rpc_url.substr(id.length - 5);
  global.testchainId = id;

  console.log('GLOBAL ID', id);
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
