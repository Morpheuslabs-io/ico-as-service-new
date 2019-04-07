var HDWalletProvider = require("truffle-hdwallet-provider-privkey");

var env = process.env.NODE_ENV;
var privKeyArr = [];

if (env) {
    var global = require('./script/global')
    global.globalize();
    privKeyArr.push(global.privKeyStrHexOwner);
}

module.exports = {
    networks: {
        rinkeby: {
            provider: function () {
                return new HDWalletProvider(privKeyArr, 'https://rinkeby.infura.io/v3/426e2bd78c974009982c19b2e49f89e3')
            },
            network_id: "*",
            gas: 1497877,
            gasPrice: 23000000000
        },
        mainnet: {
            provider: function () {
                return new HDWalletProvider(privKeyArr, 'https://mainnet.infura.io/v3/426e2bd78c974009982c19b2e49f89e3')
            },
            network_id: "*",
            gas: 8007817,
            gasPrice: 2000000000
        },
        development: {
          host: "127.0.0.1",
          port: 8545,
          network_id: "*" // Match any network id
        }
    }
};