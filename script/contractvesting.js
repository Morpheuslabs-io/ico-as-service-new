const utils = require('./utils')
const mail = require('./mail')
const publish = require('./publish')
const dateFormat = require('dateformat');
var sleep = require('sleep');
var moment = require('moment');

doSendMailAndStoreResponse = async (toAddr, addressVestingList, vestingList, global) => {
  
  // Send notification email to user
  let htmlMailContent = await doSendMail(toAddr, addressVestingList, vestingList, global);
  //////////////////////////////////

  // Store user response
  await global.SqliteHandler.updateUserResponse(toAddr, htmlMailContent, "userVesting");
  //////////////////////////////////
}

doSendMail = async (toAddr, addressVestingList, vestingList, global) => {

  let htmlMailContent = await mail.buildHtmlMailContentVesting(addressVestingList, vestingList, global);
  
  await mail.sendMail(toAddr, htmlMailContent, global);

  return htmlMailContent;
}

buildReturnedDataVesting = (addressVestingList, global) => {
  let data = '';
  let dataAddrVestingList = [];

  for (let i=0; i < addressVestingList.length; i++) {
    data += 'Token Vesting ' + (i+1) +': ' + addressVestingList[i] + '\n';
    dataAddrVestingList.push(addressVestingList[i]);
  }
  return {data, dataAddrVestingList};
}

transferOwnership = async (gasOpt, global, ownerWallet, tokenVestingAddress) => {
  let tokenVestingContract = global.TokenVestingContract;
  let tokenVestingInstance = null;
  let retryCnt = 1;
  while (retryCnt <= global.RETRY_TIMES) {
    try {
      tokenVestingInstance = await tokenVestingContract.at(tokenVestingAddress);
      await tokenVestingInstance.transferOwnership(ownerWallet, gasOpt);
      console.log('TokenVesting - transferOwnership OK');
      break;
    } catch (err) {
      console.log('TokenVesting - transferOwnership Error: ', (err.message || ''));
    }
    sleep.sleep(5);
    console.log('TokenVesting - transferOwnership Retry');
    gasOpt.gasPrice *= global.RETRY_GAS_PRICE_MULTIPLIER; // double the gasPrice for every retry
    retryCnt++;
  }
}

setParamTokenVesting = async (gasOpt, global, paramTokenVesting, tokenVestingAddress) => {
  const {
    beneficiary, start, cliff, duration
  } = paramTokenVesting;

  let tokenVestingContract = global.TokenVestingContract;
  let tokenVestingInstance = null;
  let retryCnt = 1;
  while (retryCnt <= global.RETRY_TIMES) {
    try {
      tokenVestingInstance = await tokenVestingContract.at(tokenVestingAddress);
      await tokenVestingInstance.setParam(beneficiary, start, cliff, duration, true, gasOpt);
      console.log('TokenVesting - setParam OK');
      break;
    } catch (err) {
      console.log('TokenVesting - setParam Error: ', (err.message || ''));
    }
    sleep.sleep(5);
    console.log('TokenVesting - setParam Retry');
    gasOpt.gasPrice *= global.RETRY_GAS_PRICE_MULTIPLIER; // double the gasPrice for every retry
    retryCnt++;
  }
}

deployTokenVesting = async (gasOpt, global) => {

  let TokenVestingInst = null;
  let TokenVestingInstAddr = null;

  let retryCnt = 1;
  while (retryCnt <= global.RETRY_TIMES) {
    try {
      TokenVestingInst = await global.TokenVestingContract.new(gasOpt);
      TokenVestingInstAddr = TokenVestingInst.address;
      console.log('TokenVesting creation OK - address:', TokenVestingInstAddr);

      break;
    } catch (err) {
      console.log('TokenVesting creation error: ', (err.message || ''), err);
    }
    sleep.sleep(5);
    console.log('TokenVesting creation retry');
    gasOpt.gasPrice *= global.RETRY_GAS_PRICE_MULTIPLIER; // double the gasPrice for every retry
    retryCnt++;
  }

  let contractAddr = TokenVestingInstAddr;
  let contractName = global.CONTRACT.TOKENVESTING;
  let contractFilePath = global.CONTRACTS_FLATTEN_DIR + "/" + contractName + global.CONTRACTS_FLATTEN_SUFFIX;
  await publish.publishContract(contractAddr, contractName, contractFilePath, global);

  return TokenVestingInstAddr;
}

exports.deployContracts = async (gasOpt, global) => {

  var startTime = new Date();
  var startDate = dateFormat(startTime, "yyyy-mm-dd h:MM:ss");
  console.log("\n Started deployment of TokenVesting contracts" +
    "\nTime: " + startDate);

  let TokenVestingInstAddr = await deployTokenVesting(gasOpt, global);
  
  await global.SqliteHandler.push(TokenVestingInstAddr, 'addressVesting');

  var endTime = new Date();
  var endDate = dateFormat(endTime, "yyyy-mm-dd h:MM:ss");
  console.log("\n Ended deployment of ICO wizard contracts" +
    "\nTime: " + endDate);

  var duration = ((endTime - startTime) / 1000) / 60;
  console.log('\n Total duration: %d minutes', duration);
}

map2Array = (myMap) => {
  let myArray = []
  let mapKeys = Object.keys(myMap)
  for (let i = 0; i < mapKeys.length; i++) {
    let key = mapKeys[i];
    myArray.push(myMap[key]);
  }
  return myArray;
}

exports.setParamForVesting = async (res, vestingList, email_address, wallet_address, global) => {

  let vestingArray = map2Array(vestingList);

  let addressVestingList = [];
  for (let i = 0; i < vestingArray.length; i++) {
    let addressVesting = await global.SqliteHandler.pop('addressVesting');
    if (!addressVesting) {
      let errMsg = 'Cannot get the predeployed contract';
      console.log('setParamForVesting - error: ', errMsg);
      res.send({"status":false, "message": errMsg});
      return;
    }
    addressVestingList.push(addressVesting);
  }

  // Returned data 
  let returnedData = buildReturnedDataVesting(addressVestingList, global);
  res.send({"status":true, "data": returnedData});
  console.log('setParamForVesting - send the predeployed contract addresses');
  /////////////////

  // Store user request
  let requestData = {};
  requestData.email = email_address;
  requestData.request = {vestingList, email_address, wallet_address};
  await global.SqliteHandler.pushUserRequest(requestData, "userVesting");
  /////////////////

  if (global.DO_NOT_SET_PARAM == 1) {
    
    // Send notification email to user and store response
    await doSendMailAndStoreResponse(email_address, addressVestingList, vestingList, global);
    //////////////////////////////////
    
    return;
  }

  var startTime = new Date();
  var startDate = dateFormat(startTime, "yyyy-mm-dd h:MM:ss");
  console.log("\n Started setting params of Token-Vesting contracts" +
    "\nTime: " + startDate);

  let currGasPrice = await utils.checkCurrentGasPrice();
  let gasOpt = {
    gasPrice: currGasPrice,
    gas: global.GAS_LIMIT
  };

  for (let i = 0; i < vestingArray.length; i++) {
    let vestingEntry = vestingArray[i];
    let tokenVestingAddress = addressVestingList[i];

    let beneficiary = vestingEntry.beneficiaryAddress;
    let start = moment(vestingEntry.startVesting).unix();
    let cliff = moment(vestingEntry.cliffVesting).unix();
    let end = moment(vestingEntry.endVesting).unix();
    let duration = end - start;

    let paramTokenVesting = {
      beneficiary, start, cliff, duration
    };

    await setParamTokenVesting(gasOpt, global, paramTokenVesting, tokenVestingAddress);

    await transferOwnership(gasOpt, global, wallet_address, tokenVestingAddress);
  }
  
  var endTime = new Date();
  var endDate = dateFormat(endTime, "yyyy-mm-dd h:MM:ss");
  console.log("\n Ended setting params of Token-Vesting contracts" +
    "\nTime: " + endDate);

  var duration = ((endTime - startTime) / 1000) / 60;
  console.log('\n Total duration: %d minutes', duration);

  // Send notification email to user and store response
  await doSendMailAndStoreResponse(email_address, addressVestingList, vestingList, global);
  //////////////////////////////////

}
