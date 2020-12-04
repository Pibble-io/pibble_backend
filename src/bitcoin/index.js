const Client = require('bitcoin-core');
const client = new Client({ 
  network: 'testnet',
  host: process.env.BTC_NODE_IP,
  port: process.env.BTC_NODE_PORT,
  username: process.env.BTC_RPC_USERNAME,
  password: process.env.BTC_RPC_PASSWORD,
  version: '0.16.3'
});

client.getBlockchainInfo((error, body) => {
  if (error) {
    console.log("cannot connect to bitcoin node. error: ", error);
  } else {
    console.log('Connected to Bitcoin node, info: ', body);
  }
});

module.exports = client;