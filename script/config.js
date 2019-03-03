module.exports = {
  testnet: {
    url: "http://api-rinkeby.etherscan.io",
    
    userAddress: "0x175FeA8857f7581B971C5a41F27Ea4BB43356298",
    toTime: "1551721300", // Monday, March 4, 2019

    tokenAddress: "0xe880141c45d66a131c99dacc88dbc32f85b454b2", // MITx token
    holdAmount: 1000,

    tokenAddress1: "0xe880141c45d66a131c99dacc88dbc32f85b454b2", // MITx token
    holdAmount1: 1000,

    tokenAddress2: "0x5d9d18e52db4043ca3f12039489464c9a2c83a0e", // SHR token
    holdAmount2: 100,
    
    infuraUrl: "https://rinkeby.infura.io/KD0tyiBLlHULRInWEMaJ"
  },
  mainnet: {
    url: "http://api.etherscan.io",
    userAddress: "0x5a090f416c97c0e34cee3da6ea46228d28e4274b",
    tokenAddress: "0x318117E8fb2E9f6bE234Ee4dab49fbEd97175C7b", // UNK token
    toTime: "1544900676",
    holdAmount: 10,
    infuraUrl: "https://mainnet.infura.io/v3/b60933b14358403d8646546c405d5962"
  }
};
