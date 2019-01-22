const keythereum = require("keythereum");
const fs = require('fs');
const SqliteHandler = require("./sqlite.js")

var global = { }

getPrivKey = function (addr, keyFileFolder, passphrase) {
  let keyObject = keythereum.importFromFile(addr, keyFileFolder);
  let privateKey = keythereum.recover(passphrase, keyObject);
  let privKeyStrHex = new Buffer(privateKey.toString("hex"), "hex");
  return privKeyStrHex;
}

global.globalize = function () {
  var env = process.env.NODE_ENV;
  console.log("Environment: " + env);
  let rawdata;
  let settingData;
  
  if (env === "rinkeby") {
    rawdata = fs.readFileSync('./setting/testnet.json');  
    settingData = JSON.parse(rawdata);
  }
  else {
    rawdata = fs.readFileSync('./setting/mainnet.json');  
    settingData = JSON.parse(rawdata);
  }

  global.OWNER_ADDR = settingData.OWNER_ADDR;
  global.privKeyStrHexOwner = getPrivKey(settingData.OWNER_ADDR, settingData.OWNER_KEY_FILE_FOLDER, settingData.OWNER_PASSPHRASE);
  global.GAS_LIMIT = settingData.GAS_LIMIT;
  global.GAS_PRICE = settingData.GAS_PRICE;

  global.DB_FILE_PATH = settingData.DB_FILE_PATH;
  global.PREDEPLOY_INTERVAL = settingData.PREDEPLOY_INTERVAL;
  global.PREDEPLOY_MAX = settingData.PREDEPLOY_MAX;
  global.PREDEPLOY_MAX_MULTIPLES = settingData.PREDEPLOY_MAX_MULTIPLES;
  global.PREDEPLOY_GAS_PRICE_MAX = settingData.PREDEPLOY_GAS_PRICE_MAX;
  global.JUST_RETURN_PREDEPLOY = settingData.JUST_RETURN_PREDEPLOY;
}

global.initContract = function (artifacts) {
  global.SafeMathLibExtContract = artifacts.require("SafeMathLibExt");
  global.CrowdsaleTokenExtContract = artifacts.require("CrowdsaleTokenExt");
  global.FlatPricingExtContract = artifacts.require("FlatPricingExt");
  global.MintedTokenCappedCrowdsaleExtContract = artifacts.require("MintedTokenCappedCrowdsaleExt");
  global.ReservedTokensFinalizeAgentContract = artifacts.require("ReservedTokensFinalizeAgent");

  // Define enum for accessing the predeployed contracts
  global.CONTRACT = {};
  global.CONTRACT.ADDRESS_MAP_CNT = 4;
  global.CONTRACT.TOKEN = 'CrowdsaleTokenExt';
  global.CONTRACT.CROWDSALE = 'MintedTokenCappedCrowdsaleExt';
  global.CONTRACT.FLATPRICING = 'FlatPricingExt';
  global.CONTRACT.FINALIZEDAGENT = 'ReservedTokensFinalizeAgent';

  console.log('global.initContract done');
}

global.initDb = async function(dbFilePath) {
  await SqliteHandler.loadDB(dbFilePath || global.DB_FILE_PATH);
  global.SqliteHandler = SqliteHandler;
  global.INIT_DB = true;

  let testData = {};
  testData[global.CONTRACT.TOKEN] = '0x7f072d2f783146f7acab4ac5d5f04aa1f70969e3';
  testData[global.CONTRACT.CROWDSALE] = '0xc141be1f89b4e03c215ede2a91da4628862f72d5';
  testData[global.CONTRACT.FLATPRICING] = '0x28b4f88ac88165eb9b6f9910532a2a1a97b9ab33'; 
  testData[global.CONTRACT.FINALIZEDAGENT] = '0xc141be1f89b4e03c215ede2a91da4628862f72d5';

  global.testData = testData;
}

module.exports = global;
