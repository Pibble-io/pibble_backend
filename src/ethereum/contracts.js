var web3 = require('./index');
var tokenABI = require("./abi/erc20.json");

const {
    PIBBLE_TOKEN_ADDRESS: tokenAddress,
    GAS,
    GAS_PRICE,
    DEFAULT_ACCOUNT
} = process.env;

const options = {
    from: DEFAULT_ACCOUNT, // default from address
    gasPrice: GAS_PRICE,
    gas: GAS
}
exports.options = options;

exports.pibbleToken = new web3.eth.Contract(tokenABI, tokenAddress, options);