const utils = require('./utils')
const dateFormat = require('dateformat');

exports.deploycontracts = async (currGasPrice, global) => {

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
  
  try {
      SafeMathLibExtInst = await global.SafeMathLibExtContract.new(gasOpt);
      console.log('SafeMathLibExt creation OK');
  }
  catch (err) {
      console.log('SafeMathLibExt creation error: ', err);
  }

  try {
      await global.CrowdsaleTokenExtContract.link('SafeMathLibExt', SafeMathLibExtInst.address);
      console.log('CrowdsaleTokenExt link with SafeMathLibExt - OK');
  }
  catch (err) {
      console.log('CrowdsaleTokenExt link with SafeMathLibExt - error: ', err);
  }

  let CrowdsaleTokenExtInst = null;
  let CrowdsaleTokenExtInstAddr = null;
  
  try {
      CrowdsaleTokenExtInst = await global.CrowdsaleTokenExtContract.new(gasOpt);
      CrowdsaleTokenExtInstAddr = CrowdsaleTokenExtInst.address;
      console.log('CrowdsaleTokenExt creation OK - address:', CrowdsaleTokenExtInstAddr);

      addressMap[global.CONTRACT.TOKEN] = CrowdsaleTokenExtInstAddr;
  }
  catch (err) {
      console.log('CrowdsaleTokenExt creation error: ', err);
  }

  try {
      await global.FlatPricingExtContract.link('SafeMathLibExt', SafeMathLibExtInst.address);
      console.log('FlatPricingExtContract link with SafeMathLibExt - OK');
  }
  catch (err) {
      console.log('FlatPricingExtContract link with SafeMathLibExt - error: ', err);
  }

  let FlatPricingExtInst = null;
  let FlatPricingExtInstAddr = null;
  
  try {
      FlatPricingExtInst = await global.FlatPricingExtContract.new(gasOpt);
      FlatPricingExtInstAddr = FlatPricingExtInst.address;
      console.log('FlatPricingExt creation OK - address:', FlatPricingExtInstAddr);

      addressMap[global.CONTRACT.FLATPRICING] = FlatPricingExtInstAddr;
  }
  catch (err) {
      console.log('FlatPricingExt creation error: ', err);
  }

  try {
      await global.MintedTokenCappedCrowdsaleExtContract.link('SafeMathLibExt', SafeMathLibExtInst.address);
      console.log('MintedTokenCappedCrowdsaleExtContract link with SafeMathLibExt - OK');
  }
  catch (err) {
      console.log('MintedTokenCappedCrowdsaleExtContract link with SafeMathLibExt - error: ', err);
  }

  let MintedTokenCappedCrowdsaleExtInst = null;
  let MintedTokenCappedCrowdsaleExtInstAddr = null;
  
  try {
      MintedTokenCappedCrowdsaleExtInst = await global.MintedTokenCappedCrowdsaleExtContract.new(gasOpt);
      MintedTokenCappedCrowdsaleExtInstAddr = MintedTokenCappedCrowdsaleExtInst.address;
      console.log('MintedTokenCappedCrowdsaleExtContract creation OK - address:', MintedTokenCappedCrowdsaleExtInstAddr);

      addressMap[global.CONTRACT.CROWDSALE] = MintedTokenCappedCrowdsaleExtInstAddr;
  }
  catch (err) {
      console.log('MintedTokenCappedCrowdsaleExtContract creation error: ', err);
  }

  try {
      await global.ReservedTokensFinalizeAgentContract.link('SafeMathLibExt', SafeMathLibExtInst.address);
      console.log('ReservedTokensFinalizeAgentContract link with SafeMathLibExt - OK');
  }
  catch (err) {
      console.log('ReservedTokensFinalizeAgentContract link with SafeMathLibExt - error: ', err);
  }

  let ReservedTokensFinalizeAgentInst = null;
  let ReservedTokensFinalizeAgentInstAddr = null;
  
  try {
      ReservedTokensFinalizeAgentInst = await global.ReservedTokensFinalizeAgentContract.new(gasOpt);
      ReservedTokensFinalizeAgentInstAddr = ReservedTokensFinalizeAgentInst.address;
      console.log('ReservedTokensFinalizeAgentContract creation OK - address:', ReservedTokensFinalizeAgentInstAddr);

      addressMap[global.CONTRACT.FINALIZEDAGENT] = ReservedTokensFinalizeAgentInstAddr;
  }
  catch (err) {
      console.log('ReservedTokensFinalizeAgentContract creation error: ', err);
  }

  try {
      let inst = await global.ReservedTokensFinalizeAgentContract.at(ReservedTokensFinalizeAgentInstAddr);
      await inst.setParam(CrowdsaleTokenExtInstAddr, MintedTokenCappedCrowdsaleExtInstAddr, gasOpt);

      console.log('ReservedTokensFinalizeAgentContract setParam OK');
  }
  catch (err) {
      console.log('ReservedTokensFinalizeAgentContract setParam error: ', err);
  }

  var endTime = new Date();
  var endDate = dateFormat(endTime, "yyyy-mm-dd h:MM:ss");
  console.log("\n Ended deployment of ICO wizard contracts" +
              "\nTime: " + endDate);

  var duration = (endTime - startTime)/1000;
  console.log('\n Total duration: %ds', duration);

  // Store the predeployed set of contracts into sqlite db
  await global.SqliteHandler.push(JSON.stringify(addressMap));
}