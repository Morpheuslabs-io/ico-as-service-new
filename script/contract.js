const utils = require('./utils')
const dateFormat = require('dateformat');
var sleep = require('sleep');
var moment = require('moment');

// Deploy only once
deploySafeMathLib = async (gasOpt, global) => {
  let SafeMathLibExtInst = null;
  let SafeMathLibExtInstAddr = null;

  while (1) {
    try {
      SafeMathLibExtInst = await global.SafeMathLibExtContract.new(gasOpt);
      SafeMathLibExtInstAddr = SafeMathLibExtInst.address;
      console.log('SafeMathLibExt creation OK - address:', SafeMathLibExtInstAddr);
      break;
    } catch (err) {
      console.log('SafeMathLibExt creation error: ', err);
    }
    sleep.sleep(5);
    console.log('SafeMathLibExt creation retry');
  }

  return SafeMathLibExtInstAddr;
}

// Deploy only once
deployCrowdsaleToken = async (gasOpt, global, SafeMathLibExtInstAddr) => {
  while (1) {
    try {
      await global.CrowdsaleTokenExtContract.link('SafeMathLibExt', SafeMathLibExtInstAddr);
      console.log('CrowdsaleTokenExt link with SafeMathLibExt - OK');
      break;
    } catch (err) {
      console.log('CrowdsaleTokenExt link with SafeMathLibExt - error: ', err);
    }
    sleep.sleep(5);
    console.log('CrowdsaleTokenExt link retry');
  }

  let CrowdsaleTokenExtInst = null;
  let CrowdsaleTokenExtInstAddr = null;

  while (1) {
    try {
      CrowdsaleTokenExtInst = await global.CrowdsaleTokenExtContract.new(gasOpt);
      CrowdsaleTokenExtInstAddr = CrowdsaleTokenExtInst.address;
      console.log('CrowdsaleTokenExt creation OK - address:', CrowdsaleTokenExtInstAddr);

      break;
    } catch (err) {
      console.log('CrowdsaleTokenExt creation error: ', err);
    }
    sleep.sleep(5);
    console.log('CrowdsaleTokenExt creation retry');
  }

  return CrowdsaleTokenExtInstAddr;
}

// Deploy multiple times
deployCrowdsale = async (gasOpt, global, SafeMathLibExtInstAddr) => {
  while (1) {
    try {
      await global.MintedTokenCappedCrowdsaleExtContract.link('SafeMathLibExt', SafeMathLibExtInstAddr);
      console.log('MintedTokenCappedCrowdsaleExtContract link with SafeMathLibExt - OK');
      break;
    } catch (err) {
      console.log('MintedTokenCappedCrowdsaleExtContract link with SafeMathLibExt - error: ', err);
    }
    sleep.sleep(5);
    console.log('MintedTokenCappedCrowdsaleExtContract link retry');
  }

  let MintedTokenCappedCrowdsaleExtInst = null;
  let MintedTokenCappedCrowdsaleExtInstAddr = null;

  while (1) {
    try {
      MintedTokenCappedCrowdsaleExtInst = await global.MintedTokenCappedCrowdsaleExtContract.new(gasOpt);
      MintedTokenCappedCrowdsaleExtInstAddr = MintedTokenCappedCrowdsaleExtInst.address;
      console.log('MintedTokenCappedCrowdsaleExtContract creation OK - address:', MintedTokenCappedCrowdsaleExtInstAddr);

      break;
    } catch (err) {
      console.log('MintedTokenCappedCrowdsaleExtContract creation error: ', err);
    }
    sleep.sleep(5);
    console.log('MintedTokenCappedCrowdsaleExtContract creation retry');
  }

  return MintedTokenCappedCrowdsaleExtInstAddr;
}

// Deploy multiple times
deployFlatPricing = async (gasOpt, global, SafeMathLibExtInstAddr) => {
  while (1) {
    try {
      await global.FlatPricingExtContract.link('SafeMathLibExt', SafeMathLibExtInstAddr);
      console.log('FlatPricingExtContract link with SafeMathLibExt - OK');
      break;
    } catch (err) {
      console.log('FlatPricingExtContract link with SafeMathLibExt - error: ', err);
    }
    sleep.sleep(5);
    console.log('FlatPricingExtContract link retry');
  }

  let FlatPricingExtInst = null;
  let FlatPricingExtInstAddr = null;

  while (1) {
    try {
      FlatPricingExtInst = await global.FlatPricingExtContract.new(gasOpt);
      FlatPricingExtInstAddr = FlatPricingExtInst.address;
      console.log('FlatPricingExt creation OK - address:', FlatPricingExtInstAddr);

      break;
    } catch (err) {
      console.log('FlatPricingExt creation error: ', err);
    }
    sleep.sleep(5);
    console.log('FlatPricingExt creation retry');
  }

  return FlatPricingExtInstAddr;
}

// Deploy multiple times
deployFinalizedAgent = async (gasOpt, global, SafeMathLibExtInstAddr) => {
  while (1) {
    try {
      await global.ReservedTokensFinalizeAgentContract.link('SafeMathLibExt', SafeMathLibExtInstAddr);
      console.log('ReservedTokensFinalizeAgentContract link with SafeMathLibExt - OK');
      break;
    } catch (err) {
      console.log('ReservedTokensFinalizeAgentContract link with SafeMathLibExt - error: ', err);
    }
    sleep.sleep(5);
    console.log('ReservedTokensFinalizeAgentContract link retry');
  }

  let ReservedTokensFinalizeAgentInst = null;
  let ReservedTokensFinalizeAgentInstAddr = null;

  while (1) {
    try {
      ReservedTokensFinalizeAgentInst = await global.ReservedTokensFinalizeAgentContract.new(gasOpt);
      ReservedTokensFinalizeAgentInstAddr = ReservedTokensFinalizeAgentInst.address;
      console.log('ReservedTokensFinalizeAgentContract creation OK - address:', ReservedTokensFinalizeAgentInstAddr);

      break;
    } catch (err) {
      console.log('ReservedTokensFinalizeAgentContract creation error: ', err);
    }
    sleep.sleep(5);
    console.log('ReservedTokensFinalizeAgentContract creation retry');
  }

  return ReservedTokensFinalizeAgentInstAddr;

  // while (1) {
  //   try {
  //     let inst = await global.ReservedTokensFinalizeAgentContract.at(ReservedTokensFinalizeAgentInstAddr);
  //     await inst.setParam(CrowdsaleTokenExtInstAddr, MintedTokenCappedCrowdsaleExtInstAddr, gasOpt);

  //     console.log('ReservedTokensFinalizeAgentContract setParam OK');
  //     break;
  //   } catch (err) {
  //     console.log('ReservedTokensFinalizeAgentContract setParam error: ', err);
  //   }
  //   sleep.sleep(5);
  //   console.log('ReservedTokensFinalizeAgentContract setParam retry');
  // }
}

transferOwnershipToken = async (gasOpt, global, ownerWallet, tokenAddr) => {
  let crowdsaleTokenContract = global.CrowdsaleTokenExtContract;
  let crowdsaleTokenInstance = null;
  while (1) {
    try {
      let crowdsaleTokenInstance = await crowdsaleTokenContract.at(tokenAddr);
      await crowdsaleTokenInstance.transferOwnership(ownerWallet, gasOpt);
      console.log('CrowdsaleTokenExt - transferOwnership OK');
      break;
    } catch (err) {
      console.log('CrowdsaleTokenExt - transferOwnership Error: ', err);
    }
    sleep.sleep(5);
    console.log('CrowdsaleTokenExt - transferOwnership Retry');
  }
}

transferOwnershipCrowdsale = async (gasOpt, global, ownerWallet, crowdsaleAddr) => {
  let crowdsaleContract = global.MintedTokenCappedCrowdsaleExtContract;
  let crowdsaleInstance = null;
  while (1) {
    try {
      let crowdsaleInstance = await crowdsaleContract.at(crowdsaleAddr);
      await crowdsaleInstance.transferOwnership(ownerWallet, gasOpt);
      console.log('MintedTokenCappedCrowdsaleExt - transferOwnership OK');
      break;
    } catch (err) {
      console.log('MintedTokenCappedCrowdsaleExt - transferOwnership Error: ', err);
    }
    sleep.sleep(5);
    console.log('MintedTokenCappedCrowdsaleExt - transferOwnership Retry');
  }
}

transferOwnershipFlatPricing = async (gasOpt, global, ownerWallet, flatPricingAddr) => {
  let FlatPricingContract = global.FlatPricingExtContract;
  let FlatPricingInstance = null;
  while (1) {
    try {
      let FlatPricingInstance = await FlatPricingContract.at(flatPricingAddr);
      await FlatPricingInstance.transferOwnership(ownerWallet, gasOpt);
      console.log('FlatPricingExt - transferOwnership OK');
      break;
    } catch (err) {
      console.log('FlatPricingExt - transferOwnership Error: ', err);
    }
    sleep.sleep(5);
    console.log('FlatPricingExt - transferOwnership Retry');
  }
}

transferOwnershipFinalizeAgent = async (gasOpt, global, ownerWallet, finalizedAgentAddr) => {
  let FinalizedAgentContract = global.ReservedTokensFinalizeAgentContract;
  let FinalizedAgentInstance = null;
  while (1) {
    try {
      let FinalizedAgentInstance = await FinalizedAgentContract.at(finalizedAgentAddr);
      await FinalizedAgentInstance.transferOwnership(ownerWallet, gasOpt);
      console.log('ReservedTokensFinalizeAgent - transferOwnership OK');
      break;
    } catch (err) {
      console.log('ReservedTokensFinalizeAgent - transferOwnership Error: ', err);
    }
    sleep.sleep(5);
    console.log('ReservedTokensFinalizeAgent - transferOwnership Retry');
  }
}

transferOwnershipAll = async (gasOpt, global, ownerWallet, address1Map, address2MapList) => {
  await transferOwnershipToken(gasOpt, global, ownerWallet, address1Map[global.CONTRACT.TOKEN]);
  
  for (let i = 0; i < address2MapList.length; i++) {
    let address2Map = address2MapList[i];
    
    await transferOwnershipCrowdsale(gasOpt, global, ownerWallet, address2Map[global.CONTRACT.CROWDSALE]);

    await transferOwnershipFlatPricing(gasOpt, global, ownerWallet, address2Map[global.CONTRACT.FLATPRICING]);

    await transferOwnershipFinalizeAgent(gasOpt, global, ownerWallet, address2Map[global.CONTRACT.FINALIZEDAGENT]);
  }
}

exports.deployContracts = async (gasOpt, global) => {

  // Only for test
  // await global.SqliteHandler.pushAddress1(JSON.stringify(global.testData));
  // let addressListStr = await global.SqliteHandler.popAddress1();
  // let jsonObj = JSON.parse(addressListStr);
  // console.log('token addr: ', jsonObj[global.CONTRACT.TOKEN]);
  // return;

  var startTime = new Date();
  var startDate = dateFormat(startTime, "yyyy-mm-dd h:MM:ss");
  console.log("\n Started deployment of ICO wizard contracts" +
    "\nTime: " + startDate);

  let address1Map = {};
  let address2Map = {};

  let SafeMathLibExtInstAddr = await deploySafeMathLib(gasOpt, global);

  let CrowdsaleTokenExtInstAddr = await deployCrowdsaleToken(gasOpt, global, SafeMathLibExtInstAddr);
  address1Map[global.CONTRACT.TOKEN] = CrowdsaleTokenExtInstAddr;
  
  // Store into db (table "address1")
  await global.SqliteHandler.push(JSON.stringify(address1Map), 'address1');

  // TEST
  //return;

  for (let i = 1; i <= global.PREDEPLOY_MAX_MULTIPLES; i++) {
    let MintedTokenCappedCrowdsaleExtInstAddr = await deployCrowdsale(gasOpt, global, SafeMathLibExtInstAddr);
    let FlatPricingExtInstAddr = await deployFlatPricing(gasOpt, global, SafeMathLibExtInstAddr);
    let ReservedTokensFinalizeAgentInstAddr = await deployFinalizedAgent(gasOpt, global, SafeMathLibExtInstAddr);

    address2Map[global.CONTRACT.CROWDSALE] = MintedTokenCappedCrowdsaleExtInstAddr;
    address2Map[global.CONTRACT.FLATPRICING] = FlatPricingExtInstAddr;
    address2Map[global.CONTRACT.FINALIZEDAGENT] = ReservedTokensFinalizeAgentInstAddr;

    // Store into db (table "address2")
    await global.SqliteHandler.push(JSON.stringify(address2Map), 'address2');
  }

  var endTime = new Date();
  var endDate = dateFormat(endTime, "yyyy-mm-dd h:MM:ss");
  console.log("\n Ended deployment of ICO wizard contracts" +
    "\nTime: " + endDate);

  var duration = ((endTime - startTime) / 1000) / 60;
  console.log('\n Total duration: %d minutes', duration);
}

setReleaseAgentForCrowdsaleToken = async (gasOpt, global, releaseAgent, address1Map) => {
  
  let crowdsaleTokenContract = global.CrowdsaleTokenExtContract;
  let crowdsaleTokenInstance = null;
  while (1) {
    try {
      let crowdsaleTokenInstance = await crowdsaleTokenContract.at(address1Map[global.CONTRACT.TOKEN]);
      await crowdsaleTokenInstance.setReleaseAgent(releaseAgent, gasOpt);
      console.log('CrowdsaleTokenExt - setReleaseAgent OK');
      break;
    } catch (err) {
      console.log('CrowdsaleTokenExt - setReleaseAgent Error: ', err);
    }
    sleep.sleep(5);
    console.log('CrowdsaleTokenExt - setReleaseAgent Retry');
  }
}

setMintAgentManyForCrowdsaleToken = async (gasOpt, global, mintAgentList, address1Map) => {
  
  let crowdsaleTokenContract = global.CrowdsaleTokenExtContract;
  let crowdsaleTokenInstance = null;
  while (1) {
    try {
      let crowdsaleTokenInstance = await crowdsaleTokenContract.at(address1Map[global.CONTRACT.TOKEN]);
      await crowdsaleTokenInstance.setMintAgentMany(mintAgentList, gasOpt);
      console.log('CrowdsaleTokenExt - setMintAgentMany OK');
      break;
    } catch (err) {
      console.log('CrowdsaleTokenExt - setMintAgentMany Error: ', err);
    }
    sleep.sleep(5);
    console.log('CrowdsaleTokenExt - setMintAgentMany Retry');
  }
}

setReservedTokenForCrowdsaleToken = async (gasOpt, global, param, address1Map) => {
  const {
      addrs, inTokens, inPercentageUnit, inPercentageDecimals
  } = param;

  let crowdsaleTokenContract = global.CrowdsaleTokenExtContract;
  let crowdsaleTokenInstance = null;
  while (1) {
    try {
      let crowdsaleTokenInstance = await crowdsaleTokenContract.at(address1Map[global.CONTRACT.TOKEN]);
      await crowdsaleTokenInstance.setReservedTokensListMultiple(addrs, inTokens, inPercentageUnit, inPercentageDecimals, gasOpt);
      console.log('CrowdsaleTokenExt - setReservedToken OK');
      break;
    } catch (err) {
      console.log('CrowdsaleTokenExt - setReservedToken Error: ', err);
    }
    sleep.sleep(5);
    console.log('CrowdsaleTokenExt - setReservedToken Retry');
  }
}

setParamCrowdsaleToken = async (gasOpt, global, param, address1Map) => {
  const {
    name,
    ticker,
    decimals,
    mincap,
    initSupply
  } = param;

  let crowdsaleTokenContract = global.CrowdsaleTokenExtContract;
  let crowdsaleTokenInstance = null;
  while (1) {
    try {
      let crowdsaleTokenInstance = await crowdsaleTokenContract.at(address1Map[global.CONTRACT.TOKEN]);
      await crowdsaleTokenInstance.setParam(name, ticker, initSupply, decimals, true, mincap, gasOpt);
      console.log('CrowdsaleTokenExt - setParam OK');
      break;
    } catch (err) {
      console.log('CrowdsaleTokenExt - setParam Error: ', err);
    }
    sleep.sleep(5);
    console.log('CrowdsaleTokenExt - setParam Retry');
  }
}

setWhitelistForCrowdsale = async (gasOpt, global, paramWhitelist, address2Map) => {
  const {
    addrs, statuses, minCaps, maxCaps
  } = paramWhitelist;

  let crowdsaleContract = global.MintedTokenCappedCrowdsaleExtContract;
  let crowdsaleInstance = null;
  while (1) {
    try {
      let crowdsaleInstance = await crowdsaleContract.at(address2Map[global.CONTRACT.CROWDSALE]);
      await crowdsaleInstance.setEarlyParticipantWhitelistMultiple(addrs, statuses, minCaps, maxCaps, gasOpt);
      console.log('MintedTokenCappedCrowdsaleExt - setEarlyParticipantWhitelistMultiple OK');
      break;
    } catch (err) {
      console.log('MintedTokenCappedCrowdsaleExt - setEarlyParticipantWhitelistMultiple Error: ', err);
    }
    sleep.sleep(5);
    console.log('MintedTokenCappedCrowdsaleExt - setEarlyParticipantWhitelistMultiple Retry');
  }
}

setFinalizedAgentForCrowdsale = async (gasOpt, global, finalizedAgentAddr, address2Map) => {

  let crowdsaleContract = global.MintedTokenCappedCrowdsaleExtContract;
  let crowdsaleInstance = null;
  while (1) {
    try {
      let crowdsaleInstance = await crowdsaleContract.at(address2Map[global.CONTRACT.CROWDSALE]);
      await crowdsaleInstance.setFinalizeAgent(finalizedAgentAddr, gasOpt);
      console.log('MintedTokenCappedCrowdsaleExt - setFinalizeAgent OK');
      break;
    } catch (err) {
      console.log('MintedTokenCappedCrowdsaleExt - setFinalizeAgent Error: ', err);
    }
    sleep.sleep(5);
    console.log('MintedTokenCappedCrowdsaleExt - setFinalizeAgent Retry');
  }
}

setParamCrowdsale = async (gasOpt, global, paramCrowdsale, address2Map) => {
  const {
    name,
    token,
    pricingStrategy,
    multisigWallet,
    start,
    end,
    minimumFundingGoal,
    maximumSellableTokens,
    isWhiteListed
  } = paramCrowdsale;

  let crowdsaleContract = global.MintedTokenCappedCrowdsaleExtContract;
  let crowdsaleInstance = null;
  while (1) {
    try {
      let crowdsaleInstance = await crowdsaleContract.at(address2Map[global.CONTRACT.CROWDSALE]);
      await crowdsaleInstance.setParam(name, token, pricingStrategy, multisigWallet, start, end, minimumFundingGoal, maximumSellableTokens, isWhiteListed, gasOpt);
      console.log('MintedTokenCappedCrowdsaleExt - setParam OK');
      break;
    } catch (err) {
      console.log('MintedTokenCappedCrowdsaleExt - setParam Error: ', err);
    }
    sleep.sleep(5);
    console.log('MintedTokenCappedCrowdsaleExt - setParam Retry');
  }
}

setParamPricingStrategy = async (gasOpt, global, paramPricing, address2Map) => {
  
  const {
    rate,
    tokenAddr
  } = paramPricing;

  let PricingStrategyContract = global.FlatPricingExtContract;
  let PricingStrategyInstance = null;
  while (1) {
    try {
      let PricingStrategyInstance = await PricingStrategyContract.at(address2Map[global.CONTRACT.FLATPRICING]);
      await PricingStrategyInstance.setParam(rate, gasOpt);
      await PricingStrategyInstance.setTier(tokenAddr, gasOpt);
      console.log('FlatPricingExt - setParam OK');
      break;
    } catch (err) {
      console.log('FlatPricingExt - setParam Error: ', err);
    }
    sleep.sleep(5);
    console.log('FlatPricingExt - setParam Retry');
  }

}

setParamFinalizedAgent = async (gasOpt, global, paramFinalizedAgent, address2Map) => {
  
  const {
    tokenAddr,
    crowdsaleAddr
  } = paramFinalizedAgent;

  let FinalizedAgentContract = global.ReservedTokensFinalizeAgentContract;
  let FinalizedAgentInstance = null;
  while (1) {
    try {
      let FinalizedAgentInstance = await FinalizedAgentContract.at(address2Map[global.CONTRACT.FINALIZEDAGENT]);
      await FinalizedAgentInstance.setParam(tokenAddr, crowdsaleAddr, gasOpt);
      console.log('ReservedTokensFinalizeAgent - setParam OK');
      break;
    } catch (err) {
      console.log('ReservedTokensFinalizeAgent - setParam Error: ', err);
    }
    sleep.sleep(5);
    console.log('ReservedTokensFinalizeAgent - setParam Retry');
  }

}

countDecimalPlaces = num => {
  const match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);

  if (!match[0] && !match[1] && !match[2]) return 0;

  const digitsAfterDecimal = match[1] ? match[1].length : 0;
  const adjust = match[2] ? +match[2] : 0;

  return Math.max(0, digitsAfterDecimal - adjust);
};

toFixed = (x) => {
  if (Math.abs(x) < 1.0) {
    let e = parseInt(x.toString().split('e-')[1], 10);
    if (e) {
      x *= Math.pow(10, e - 1);
      x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
    }
  } else {
    let e = parseInt(x.toString().split('+')[1], 10);
    if (e > 20) {
      e -= 20;
      x /= Math.pow(10, e);
      x += (new Array(e + 1)).join('0');
    }
  }
  return x;
}

buildReturnedData = (address1MapStr, address2MapStrList, global) => {
  let data = '';
  let address1Map = JSON.parse(address1MapStr);
  data += global.CONTRACT.TOKEN + ': ' + address1Map[global.CONTRACT.TOKEN] + '\n\n';

  for (let i=0; i < address2MapStrList.length; i++) {
    let address2MapStr = address2MapStrList[i];
    let address2Map = JSON.parse(address2MapStr);
    data += global.CONTRACT.CROWDSALE + ': ' + address2Map[global.CONTRACT.CROWDSALE] + '\n\n';
    data += global.CONTRACT.FLATPRICING + ': ' + address2Map[global.CONTRACT.FLATPRICING] + '\n\n';
    data += global.CONTRACT.FINALIZEDAGENT + ': ' + address2Map[global.CONTRACT.FINALIZEDAGENT] + '\n\n\n';
  }
  return data;
}

exports.setParamForContracts = async (step2, step3, global) => {

  const {
    name,
    ticker,
    decimals,
    reserved_token
  } = step2;

  const {
    wallet_address,
    gasPrice,
    mincap,
    enableWhitelisting,
    tiers
  } = step3;

  console.log('setParamForContracts started');

  let address1MapStr = await global.SqliteHandler.pop('address1');
  if (!address1MapStr) {
    let errMsg = 'Cannot get the predeployed contract';
    console.log('setParamForContracts - error: ', errMsg);
    return {error: errMsg};
  }
  let address1Map = JSON.parse(address1MapStr);

  let address2MapList = [];
  let address2MapStrList = [];
  for (let i = 0; i < tiers.length; i++) {
    let address2MapStr = await global.SqliteHandler.pop('address2');
    if (!address2MapStr) {
      let errMsg = 'Cannot get the predeployed contract';
      console.log('setParamForContracts - error: ', errMsg);
      return {error: errMsg};
    }
    let address2Map = JSON.parse(address2MapStr);
    address2MapList.push(address2Map);
    address2MapStrList.push(address2MapStr);
  }

  // Returned data
  let returnedData = buildReturnedData(address1MapStr, address2MapStrList, global);
  
  // TEST
  return returnedData;
  
  let currGasPrice = await utils.checkCurrentGasPrice();
  let gasOpt = {
    gasPrice: currGasPrice,
    gas: global.GAS_LIMIT
  };

  // Accumulate initial supply
  let initSupply = 0;
  for (let i = 0; i < tiers.length; i++) {
    initSupply += parseFloat(tiers[i].supply);
  }

  let paramCrowdsaleToken = {
    name,
    ticker,
    decimals,
    mincap,
    initSupply
  };

  let crowdsaleTokenInstAddr = address1Map[global.CONTRACT.TOKEN];
  await setParamCrowdsaleToken(gasOpt, global, paramCrowdsaleToken, address1Map);

  let pricingStrategyAddrList = [];
  for (let i = 0; i < tiers.length; i++) {
    let address2Map = address2MapList[i];

    const paramPricing = {
      rate: tiers[i].rate,
      tokenAddr: crowdsaleTokenInstAddr
    };

    await setParamPricingStrategy(gasOpt, global, paramPricing, address2Map);
    pricingStrategyAddrList.push(address2Map[global.CONTRACT.FLATPRICING]);
  }

  let crowdsaleAddrList = [];
  for (let i = 0; i < tiers.length; i++) {
    let address2Map = address2MapList[i];
    
    const name = tiers[i].tierName;
    const token = crowdsaleTokenInstAddr;
    const pricingStrategy = pricingStrategyAddrList[i];
    const multisigWallet = wallet_address;
    const start = moment(tiers[i].startDate + ' ' + tiers[i].startTime, 'YYYY-MM-DD HH:mm:SS').unix();
    const end = moment(tiers[i].endDate + ' ' + tiers[i].endTime, 'YYYY-MM-DD HH:mm:SS').unix();
    const minimumFundingGoal = 100;
    const maximumSellableTokens = 10000;
    const isWhiteListed = tiers[i].whitelist.length > 0;

    let paramCrowdsale = {
      name,
      token,
      pricingStrategy,
      multisigWallet,
      start,
      end,
      minimumFundingGoal,
      maximumSellableTokens,
      isWhiteListed
    };

    await setParamCrowdsale(gasOpt, global, paramCrowdsale, address2Map);

    crowdsaleAddrList.push(address2Map[global.CONTRACT.CROWDSALE]);
  }

  let finalizeAgentAddrList = [];
  for (let i = 0; i < tiers.length; i++) {
    let address2Map = address2MapList[i];

    let paramFinalizedAgent = {
      tokenAddr:      crowdsaleTokenInstAddr,
      crowdsaleAddr:  crowdsaleAddrList
    };

    await setParamFinalizedAgent(gasOpt, global, paramFinalizedAgent, address2Map);

    finalizeAgentAddrList.push(address2Map[global.CONTRACT.FINALIZEDAGENT]);
  }

  // Set reserved tokens for the crowdsale token
  if (reserved_token.length !== 0) {
    let addrs = [];
    let inTokens = [];
    let inPercentageUnit = [];
    let inPercentageDecimals = [];
    
    for (let i = 0; i < reserved_token.length; i++) {
      let _inTokens = 0;
      let _inPercentageDecimals = 0;
      let _inPercentageUnit = 0;
      if (reserved_token[i].dimension === 'tokens')
        _inTokens = reserved_token[i].tokenAmount * 10 ** decimals;
      else {
        _inPercentageDecimals = countDecimalPlaces(reserved_token[i].tokenAmount);
        _inPercentageUnit = reserved_token[i].tokenAmount * 10 ** _inPercentageDecimals;
      }
      addrs.push(reserved_token[i].address);
      inTokens.push(reserved_token[i].dimension === 'tokens' ? toFixed(_inTokens.toString()) : 0);
      inPercentageUnit.push(_inPercentageUnit ? _inPercentageUnit : 0);
      inPercentageDecimals.push(_inPercentageDecimals ? _inPercentageDecimals : 0);
    }

    let paramReservedTokenForToken = {
      addrs, inTokens, inPercentageUnit, inPercentageDecimals
    };

    await setReservedTokenForCrowdsaleToken(gasOpt, global, paramReservedTokenForToken, address1Map);
  }

  // Allow Crowdsale Contract to Mint Tokens
  await setMintAgentManyForCrowdsaleToken(gasOpt, global, crowdsaleAddrList, address1Map);

  // Allow Finalize Agent Contract to Mint Token
  await setMintAgentManyForCrowdsaleToken(gasOpt, global, finalizeAgentAddrList, address1Map);

  // Register whitelisted addresses for crowdsale
  // Set FinalizedAgent for crowdsale
  if (enableWhitelisting === 'yes') {
    for (let i = 0; i < crowdsaleAddrList.length; i++) {

      let address2Map = address2MapList[i];

      let addrs = [];
      let statuses = [];
      let minCaps = [];
      let maxCaps = [];
      
      for (let j = 0; j < tiers[i].whitelist.length; j++) {
        addrs.push(tiers[i].whitelist[j].w_address);
        statuses.push(true);
        minCaps.push(tiers[i].whitelist[j].w_min * 10 ** decimals ? toFixed((tiers[i].whitelist[j].w_min * 10 ** decimals).toString()) : 0);
        maxCaps.push(tiers[i].whitelist[j].w_max * 10 ** decimals ? toFixed((tiers[i].whitelist[j].w_max * 10 ** decimals).toString()) : 0);
      }

      let paramWhitelist = {
        addrs, statuses, minCaps, maxCaps
      };

      await setWhitelistForCrowdsale(gasOpt, global, paramWhitelist, address2Map);
      await setFinalizedAgentForCrowdsale(gasOpt, global, finalizeAgentAddrList[i], address2Map);
    }
  }

  // Set releaseAgent for token
  // QUESTION? there's only 1 token but loop over finalizedAgentList??
  // Maybe, missing the releaseAgent input from frontend??
  // Temporarily, borrow the first finalizedAgent
  let releaseAgent = finalizeAgentAddrList[0];
  await setReleaseAgentForCrowdsaleToken(gasOpt, global, releaseAgent, address1Map);

  // QUESTION? No handling for Vesting Token
  
  // Transfer ownership to wallet address
  await transferOwnershipAll(gasOpt, global, wallet_address, address1Map, address2MapList);
  
  return returnedData;
}
