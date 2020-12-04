var Web3 = require("web3");

const {
  ETHEREUM_NODE_URL: nodeUrl
} = process.env;

// connect ETH node
var web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));
// web3 = new Web3(new Web3.providers.WebsocketProvider(ethNode));

web3.eth.getCoinbase()
  .then(coinbase => console.log(`connected to ${nodeUrl} coinbase: ${coinbase}`))
  .catch(ex => {
    console.error('cannot connect to Ethereum Node: ',nodeUrl);
    console.error('error: ', ex);
  });

module.exports = web3;