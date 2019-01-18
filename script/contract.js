const utils = require('./utils')
const dateFormat = require('dateformat');
var sleep = require('sleep');

exports.deployContracts = async (currGasPrice, global, storeDb) => {

  // Only for test
  // await global.SqliteHandler.push(JSON.stringify(global.testData));
  // let addressListStr = await global.SqliteHandler.pop();
  // let jsonObj = JSON.parse(addressListStr);
  // console.log('token addr: ', jsonObj[global.CONTRACT.TOKEN]);
  // return;

  if (!currGasPrice || currGasPrice == 0) {
    currGasPrice = await utils.checkCurrentGasPrice();
    // In this case, increase current gasPrice by 10 times for faster deployment
    currGasPrice *= 10;
  }

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

      addressMap[global.CONTRACT.TOKEN] = CrowdsaleTokenExtInstAddr;
      break;
    } catch (err) {
      console.log('CrowdsaleTokenExt creation error: ', err);
    }
    sleep.sleep(5);
    console.log('CrowdsaleTokenExt creation retry');
  }

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

      addressMap[global.CONTRACT.FLATPRICING] = FlatPricingExtInstAddr;
      break;
    } catch (err) {
      console.log('FlatPricingExt creation error: ', err);
    }
    sleep.sleep(5);
    console.log('FlatPricingExt creation retry');
  }

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

      addressMap[global.CONTRACT.CROWDSALE] = MintedTokenCappedCrowdsaleExtInstAddr;
      break;
    } catch (err) {
      console.log('MintedTokenCappedCrowdsaleExtContract creation error: ', err);
    }
    sleep.sleep(5);
    console.log('MintedTokenCappedCrowdsaleExtContract creation retry');
  }

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

      addressMap[global.CONTRACT.FINALIZEDAGENT] = ReservedTokensFinalizeAgentInstAddr;
      break;
    } catch (err) {
      console.log('ReservedTokensFinalizeAgentContract creation error: ', err);
    }
    sleep.sleep(5);
    console.log('ReservedTokensFinalizeAgentContract creation retry');
  }

  while (1) {
    try {
      let inst = await global.ReservedTokensFinalizeAgentContract.at(ReservedTokensFinalizeAgentInstAddr);
      await inst.setParam(CrowdsaleTokenExtInstAddr, MintedTokenCappedCrowdsaleExtInstAddr, gasOpt);

      console.log('ReservedTokensFinalizeAgentContract setParam OK');
      break;
    } catch (err) {
      console.log('ReservedTokensFinalizeAgentContract setParam error: ', err);
    }
    sleep.sleep(5);
    console.log('ReservedTokensFinalizeAgentContract setParam retry');
  }

  var endTime = new Date();
  var endDate = dateFormat(endTime, "yyyy-mm-dd h:MM:ss");
  console.log("\n Ended deployment of ICO wizard contracts" +
    "\nTime: " + endDate);

  var duration = ((endTime - startTime) / 1000) / 60;
  console.log('\n Total duration: %d minutes', duration);

  // Store the predeployed set of contracts into sqlite db
  let addressMapCnt = Object.keys(addressMap).length;
  if (addressMapCnt == global.CONTRACT.ADDRESS_MAP_CNT) {
    if (!storeDb) {
      return addressMap;
    }

    try {
      await global.SqliteHandler.push(JSON.stringify(addressMap));
    } catch (err) {
      console.log('Store addressMap into db error: ', err);
    }
  } else {
    console.log('\n Error - Predeployed contracts not enough');
  }

}

exports.getPredeployedContracts = async (global) => {
  let addressMap = null;
  try {
    let cnt = await global.SqliteHandler.predeployAmount();
    if (cnt == 0) {
      console.log('No predeployed contract ---> start deployment now');
      addressMap = await exports.deployContracts(null, global);
      return addressMap;
    }
  } catch (err) {
    console.log('SqliteHandler.predeployAmount - error: ', err);
  }

  try {
    let addressListStr = await global.SqliteHandler.pop();
    addressMap = JSON.parse(addressListStr);
    return addressMap;
  } catch (err) {
    console.log('SqliteHandler.pop - error: ', err);
  }

  if (addressMap == null) {
    console.log('Cannot retrieve predeployed contract ---> start deployment now');
    addressMap = await exports.deployContracts(null, global);
    return addressMap;
  }
}

exports.setParamsForContracts = async (step2, step3, global) => {

  let addressMap = await exports.getPredeployedContracts(global);
  if (!addressMap) {
    console.log('setParamsForContracts aborted');
    return false;
  }

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

  let initSupply = 0;
  for (let i = 0; i < tiers.length; i++) {
    initSupply += parseFloat(tiers[i].supply);
  }

  let crowdsaleTokenInstance = await crowdsaleTokenContract.new(name, ticker, initSupply, decimals, true, mincap, {
    from: web3.eth.accounts[0],
    gasPrice: gasPrice * 1000000000,
    gas: 6000000
  });
  console.log(`CrowdsaleToken Contract Deployed: ${crowdsaleTokenInstance.address}`);
  setDeploy({
    ...this.props.deploy,
    token: crowdsaleTokenInstance.address,
  });

  let pricingStrategyInstance = [];
  for (let i = 0; i < tiers.length; i++) {
    const instance = await pricingStrategyContract.new(tiers[i].rate, gasOpt);
    pricingStrategyInstance.push(instance);
    console.log(`PricingStrategy Contract(${i + 1}) Deployed: ${instance.address}`);
    let d_tiers = this.props.deploy.d_tiers;
    d_tiers[i].pricing_strategy = pricingStrategyInstance[i].address;
    setDeploy({
      ...this.props.deploy,
      d_tiers,
    });
  }

  let mintedTokenCrowdsaleInstance = [];
  for (let i = 0; i < tiers.length; i++) {
    const _name = tiers[i].tierName;
    const _token = crowdsaleTokenInstance.address;
    const _pricingStrategy = pricingStrategyInstance[i].address;
    const _multisigWallet = wallet_address;
    const _start = moment(tiers[i].startDate.format('YYYY-MM-DD') + ' ' + tiers[i].startTime.format('HH:mm:SS'), 'YYYY-MM-DD HH:mm:SS').unix();
    const _end = moment(tiers[i].endDate.format('YYYY-MM-DD') + ' ' + tiers[i].endTime.format('HH:mm:SS'), 'YYYY-MM-DD HH:mm:SS').unix();
    const _minimumFundingGoal = 100;
    const _maximumSellableTokens = 10000;
    const _isWhiteListed = tiers[i].whitelist.length > 0;
    console.log(_isWhiteListed);

    const instance = await mintedTokenCappedCrowdsaleExtContract.new(_name, _token, _pricingStrategy, _multisigWallet, _start, _end, _minimumFundingGoal, _maximumSellableTokens, _isWhiteListed, {
      from: web3.eth.accounts[0],
      gasPrice: gasPrice * 1000000000 * 10,
      gas: 7000000
    });
    mintedTokenCrowdsaleInstance.push(instance);
    console.log(`Minted Token CrowdsaleEx Contract(${i + 1}) Deployed: ${instance.address}`);
    let d_tiers = this.props.deploy.d_tiers;
    d_tiers[i].crowdsale = mintedTokenCrowdsaleInstance[i].address;
    setDeploy({
      ...this.props.deploy,
      d_tiers,
    });
  }

  setDeploy({
    ...this.props.deploy,
    crowdsale_address: true,
  });

  let finalizeAgentInstance = [];
  for (let i = 0; i < tiers.length; i++) {
    const instance = await finalizeAgentContract.new(crowdsaleTokenInstance.address, mintedTokenCrowdsaleInstance[i].address, gasOpt);
    finalizeAgentInstance.push(instance);
    console.log(`FinalizeAgent Contract(${i + 1}) Deployed: ${instance.address}`);
    let d_tiers = this.props.deploy.d_tiers;
    d_tiers[i].finalize_agent = finalizeAgentInstance[i].address;
    setDeploy({
      ...this.props.deploy,
      d_tiers,
    });
  }

  // Register tier address for Pricing strategy
  for (let i = 0; i < pricingStrategyInstance.length; i++) {
    let contractX = web3.eth.contract(pricingStrategyInstance[i].abi).at(pricingStrategyInstance[i].address);
    let tx = await this.promisify(cb => contractX.setTier(crowdsaleTokenInstance.address, gasOpt, cb));
    console.log(`Register tier address for Pricing strategy(${i + 1})`);
    let d_tiers = this.props.deploy.d_tiers;
    d_tiers[i].register_tiers = tx;
    setDeploy({
      ...this.props.deploy,
      d_tiers,
    });
  }

  // Register addresses for Reserved Tokens
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
    let contractX = web3.eth.contract(crowdsaleTokenInstance.abi).at(crowdsaleTokenInstance.address);
    let tx = await this.promisify(cb => contractX.setReservedTokensListMultiple(addrs, inTokens, inPercentageUnit, inPercentageDecimals, gasOpt, cb));
    console.log(`Register addresses for Reserved Tokens`);
    setDeploy({
      ...this.props.deploy,
      reserve_token: true,
    });
  }

  // Register Crowdsales addresses
  for (let i = 0; i < mintedTokenCrowdsaleInstance.length; i++) {
    let d_tiers = this.props.deploy.d_tiers;
    d_tiers[i].register_crowdsale = true;
    setDeploy({
      ...this.props.deploy,
      d_tiers,
    });
  }

  // Allow Crowdsale Contract to Mint Tokens
  for (let i = 0; i < mintedTokenCrowdsaleInstance.length; i++) {
    let contractX = web3.eth.contract(crowdsaleTokenInstance.abi).at(crowdsaleTokenInstance.address);
    let tx = await this.promisify(cb => contractX.setMintAgent(mintedTokenCrowdsaleInstance[i].address, true, gasOpt, cb));
    console.log(`Allow Crowdsale Contract to Mint Tokens(${i + 1})`);
    let d_tiers = this.props.deploy.d_tiers;
    d_tiers[i].allow_crowdsale = tx;
    setDeploy({
      ...this.props.deploy,
      d_tiers,
    });
  }

  // Allow Finalize Agent Contract to Mint Token
  for (let i = 0; i < finalizeAgentInstance.length; i++) {
    let contractX = web3.eth.contract(crowdsaleTokenInstance.abi).at(crowdsaleTokenInstance.address);
    let tx = await this.promisify(cb => contractX.setMintAgent(finalizeAgentInstance[i].address, true, gasOpt, cb));
    console.log(`Allow Finalize Agent Contract to Mint Token(${i + 1})`);
    let d_tiers = this.props.deploy.d_tiers;
    d_tiers[i].allow_finalize = tx;
    setDeploy({
      ...this.props.deploy,
      d_tiers,
    });

    d_tiers[i].register_whitelisted = true;
    setDeploy({
      ...this.props.deploy,
      d_tiers,
    });
  }

  // Register whitelisted addresses
  if (enableWhitelisting === 'yes') {
    for (let i = 0; i < mintedTokenCrowdsaleInstance.length; i++) {
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
      let contractX = web3.eth.contract(mintedTokenCrowdsaleInstance[i].abi).at(mintedTokenCrowdsaleInstance[i].address);
      let tx = await this.promisify(cb => contractX.setEarlyParticipantWhitelistMultiple(addrs, statuses, minCaps, maxCaps, gasOpt, cb));

      let d_tiers = this.props.deploy.d_tiers;
      d_tiers[i].register_whitelisted = true;
      setDeploy({
        ...this.props.deploy,
        d_tiers,
      });
    }
  }

  // Register Finalize Agent Contract addresses
  for (let i = 0; i < mintedTokenCrowdsaleInstance.length; i++) {
    let contractX = web3.eth.contract(mintedTokenCrowdsaleInstance[i].abi).at(mintedTokenCrowdsaleInstance[i].address);
    let tx = await this.promisify(cb => contractX.setFinalizeAgent(finalizeAgentInstance[i].address, gasOpt, cb));
    console.log(`Register Finalize Agent Contract addresses(${i + 1})`);
    let d_tiers = this.props.deploy.d_tiers;
    d_tiers[i].register_finalize = tx;
    setDeploy({
      ...this.props.deploy,
      d_tiers,
    });
  }

  // Register Token release addresses
  for (let i = 0; i < finalizeAgentInstance.length; i++) {
    let contractX = web3.eth.contract(crowdsaleTokenInstance.abi).at(crowdsaleTokenInstance.address);
    let tx = await this.promisify(cb => contractX.setReleaseAgent(finalizeAgentInstance[i].address, gasOpt, cb));
    console.log(`Register Token release addresses(${i + 1})`);
    let d_tiers = this.props.deploy.d_tiers;
    d_tiers[i].register_token = tx;
    setDeploy({
      ...this.props.deploy,
      d_tiers,
    });
  }

  // Vesting Token
  console.log(`Token Vesting Contract Deployed`);
  setDeploy({
    ...this.props.deploy,
    vesting: true,
  });

  // Transfer ownership to wallet address
  let contractX = web3.eth.contract(crowdsaleTokenInstance.abi).at(crowdsaleTokenInstance.address);
  let tx = await this.promisify(cb => contractX.transferOwnership(wallet_address, gasOpt, cb));
  console.log(`Transfer ownership to wallet address`);
  setDeploy({
    ...this.props.deploy,
    ownership: tx,
  });

}