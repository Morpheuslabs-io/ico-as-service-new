const keythereum = require("keythereum");
const fs = require('fs');

var Global = function () { }

getPrivKey = function (addr, keyFileFolder, passphrase) {
  let keyObject = keythereum.importFromFile(addr, keyFileFolder);
  let privateKey = keythereum.recover(passphrase, keyObject);
  let privKeyStrHex = new Buffer(privateKey.toString("hex"), "hex");
  return privKeyStrHex;
}

Global.globalize = function () {
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
}

Global.initContract = function (artifacts) {
  global.SafeMathLibExtContract = artifacts.require("SafeMathLibExt");
  global.CrowdsaleTokenExtContract = artifacts.require("CrowdsaleTokenExt");
  global.FlatPricingExtContract = artifacts.require("FlatPricingExt");
  global.MintedTokenCappedCrowdsaleExtContract = artifacts.require("MintedTokenCappedCrowdsaleExt");
  global.ReservedTokensFinalizeAgentContract = artifacts.require("ReservedTokensFinalizeAgent");

  console.log('Global.initContract - done');
}

module.exports = Global;
