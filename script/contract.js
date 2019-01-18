const utils = require('./utils')
const dateFormat = require('dateformat');
var sleep = require('sleep');

exports.deployContracts = async (currGasPrice, global) => {

  // Only for test
  // await global.SqliteHandler.push(JSON.stringify(global.testData));
  // let addressListStr = await global.SqliteHandler.pop();
  // let jsonObj = JSON.parse(addressListStr);
  // console.log('token addr: ', jsonObj[global.CONTRACT.TOKEN]);
  // return;

  let gasOpt = {
      gasPrice: currGasPrice,
      gas: global.GAS_LIMIT
  };

  var startTime = new Date();
  var startDate = dateFormat(startTime, "yyyy-mm-dd h:MM:ss");
  console.log("\n Started deployment of ICO wizard contracts" +
              "\nTime: " + startDate);

  let addressMap = {};

  let SafeMathLibExtInst = null;
  let SafeMathLibExtInstAddr = null;
  
  while (1)
  {
    try {
        SafeMathLibExtInst = await global.SafeMathLibExtContract.new(gasOpt);
        SafeMathLibExtInstAddr = SafeMathLibExtInst.address;
        console.log('SafeMathLibExt creation OK - address:', SafeMathLibExtInstAddr);
        break;
    }
    catch (err) {
        console.log('SafeMathLibExt creation error: ', err);
    }
    sleep.sleep(5);
    console.log('SafeMathLibExt creation retry');
  }

  while (1)
  {
    try {
        await global.CrowdsaleTokenExtContract.link('SafeMathLibExt', SafeMathLibExtInstAddr);
        console.log('CrowdsaleTokenExt link with SafeMathLibExt - OK');
        break;
    }
    catch (err) {
        console.log('CrowdsaleTokenExt link with SafeMathLibExt - error: ', err);
    }
    sleep.sleep(5);
    console.log('CrowdsaleTokenExt link retry');
  }

  let CrowdsaleTokenExtInst = null;
  let CrowdsaleTokenExtInstAddr = null;
  
  while (1)
  {
    try {
        CrowdsaleTokenExtInst = await global.CrowdsaleTokenExtContract.new(gasOpt);
        CrowdsaleTokenExtInstAddr = CrowdsaleTokenExtInst.address;
        console.log('CrowdsaleTokenExt creation OK - address:', CrowdsaleTokenExtInstAddr);

        addressMap[global.CONTRACT.TOKEN] = CrowdsaleTokenExtInstAddr;
        break;
    }
    catch (err) {
        console.log('CrowdsaleTokenExt creation error: ', err);
    }
    sleep.sleep(5);
    console.log('CrowdsaleTokenExt creation retry');
  }

  while (1)
  {
    try {
        await global.FlatPricingExtContract.link('SafeMathLibExt', SafeMathLibExtInstAddr);
        console.log('FlatPricingExtContract link with SafeMathLibExt - OK');
        break;
    }
    catch (err) {
        console.log('FlatPricingExtContract link with SafeMathLibExt - error: ', err);
    }
    sleep.sleep(5);
    console.log('FlatPricingExtContract link retry');
  }

  let FlatPricingExtInst = null;
  let FlatPricingExtInstAddr = null;
  
  while (1)
  {
    try {
        FlatPricingExtInst = await global.FlatPricingExtContract.new(gasOpt);
        FlatPricingExtInstAddr = FlatPricingExtInst.address;
        console.log('FlatPricingExt creation OK - address:', FlatPricingExtInstAddr);

        addressMap[global.CONTRACT.FLATPRICING] = FlatPricingExtInstAddr;
        break;
    }
    catch (err) {
        console.log('FlatPricingExt creation error: ', err);
    }
    sleep.sleep(5);
    console.log('FlatPricingExt creation retry');
  }

  while (1)
  {
    try {
        await global.MintedTokenCappedCrowdsaleExtContract.link('SafeMathLibExt', SafeMathLibExtInstAddr);
        console.log('MintedTokenCappedCrowdsaleExtContract link with SafeMathLibExt - OK');
        break;
    }
    catch (err) {
        console.log('MintedTokenCappedCrowdsaleExtContract link with SafeMathLibExt - error: ', err);
    }
    sleep.sleep(5);
    console.log('MintedTokenCappedCrowdsaleExtContract link retry');
  }

  let MintedTokenCappedCrowdsaleExtInst = null;
  let MintedTokenCappedCrowdsaleExtInstAddr = null;
  
  while (1)
  {
    try {
        MintedTokenCappedCrowdsaleExtInst = await global.MintedTokenCappedCrowdsaleExtContract.new(gasOpt);
        MintedTokenCappedCrowdsaleExtInstAddr = MintedTokenCappedCrowdsaleExtInst.address;
        console.log('MintedTokenCappedCrowdsaleExtContract creation OK - address:', MintedTokenCappedCrowdsaleExtInstAddr);

        addressMap[global.CONTRACT.CROWDSALE] = MintedTokenCappedCrowdsaleExtInstAddr;
        break;
    }
    catch (err) {
        console.log('MintedTokenCappedCrowdsaleExtContract creation error: ', err);
    }
    sleep.sleep(5);
    console.log('MintedTokenCappedCrowdsaleExtContract creation retry');
  }

  while (1)
  {
    try {
        await global.ReservedTokensFinalizeAgentContract.link('SafeMathLibExt', SafeMathLibExtInstAddr);
        console.log('ReservedTokensFinalizeAgentContract link with SafeMathLibExt - OK');
        break;
    }
    catch (err) {
        console.log('ReservedTokensFinalizeAgentContract link with SafeMathLibExt - error: ', err);
    }
    sleep.sleep(5);
    console.log('ReservedTokensFinalizeAgentContract link retry');
  }

  let ReservedTokensFinalizeAgentInst = null;
  let ReservedTokensFinalizeAgentInstAddr = null;
  
  while (1)
  {
    try {
        ReservedTokensFinalizeAgentInst = await global.ReservedTokensFinalizeAgentContract.new(gasOpt);
        ReservedTokensFinalizeAgentInstAddr = ReservedTokensFinalizeAgentInst.address;
        console.log('ReservedTokensFinalizeAgentContract creation OK - address:', ReservedTokensFinalizeAgentInstAddr);

        addressMap[global.CONTRACT.FINALIZEDAGENT] = ReservedTokensFinalizeAgentInstAddr;
        break;
    }
    catch (err) {
        console.log('ReservedTokensFinalizeAgentContract creation error: ', err);
    }
    sleep.sleep(5);
    console.log('ReservedTokensFinalizeAgentContract creation retry');
  }

  while (1)
  {
    try {
        let inst = await global.ReservedTokensFinalizeAgentContract.at(ReservedTokensFinalizeAgentInstAddr);
        await inst.setParam(CrowdsaleTokenExtInstAddr, MintedTokenCappedCrowdsaleExtInstAddr, gasOpt);

        console.log('ReservedTokensFinalizeAgentContract setParam OK');
        break;
    }
    catch (err) {
        console.log('ReservedTokensFinalizeAgentContract setParam error: ', err);
    }
    sleep.sleep(5);
    console.log('ReservedTokensFinalizeAgentContract setParam retry');
  }

  var endTime = new Date();
  var endDate = dateFormat(endTime, "yyyy-mm-dd h:MM:ss");
  console.log("\n Ended deployment of ICO wizard contracts" +
              "\nTime: " + endDate);

  var duration = ((endTime - startTime)/1000)/60;
  console.log('\n Total duration: %d minutes', duration);

  // Store the predeployed set of contracts into sqlite db
  let addressMapCnt = Object.keys(addressMap).length;
  if (addressMapCnt == global.CONTRACT.ADDRESS_MAP_CNT)
  {
    await global.SqliteHandler.push(JSON.stringify(addressMap));
  }
  else
  {
    console.log('\n Error - Predeployed contracts not enough');
  }
  
}

exports.setParamsForContracts = async (params, global) => {

    
}