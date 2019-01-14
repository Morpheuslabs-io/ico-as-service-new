var HDWalletProvider = require("truffle-hdwallet-provider-privkey");

var env = process.env.NODE_ENV;
var privKeyArr = [];

if (env) {
    require('./script/global').globalize();
    privKeyArr.push(global.privKeyStrHexOwner);
}

module.exports = {
    networks: {
        rinkeby: {
            provider: function () {
                return new HDWalletProvider(privKeyArr, 'https://rinkeby.infura.io/KD0tyiBLlHULRInWEMaJ/')
            },
            network_id: 5,
            gas: 1497877,
            gasPrice: 23000000000
        },
        mainnet: {
            provider: function () {
                return new HDWalletProvider(privKeyArr, 'https://mainnet.infura.io/v3/b60933b14358403d8646546c405d5962')
            },
            network_id: 5,
            gas: 8007817,
            gasPrice: 2000000000
        }
    }
};