const utils = require('./utils')

exports.deploycontract = async (req, res, next) => {

    console.log('/test/deploycontract');

    let currGasPrice = await utils.checkCurrentGasPrice();
    let gasOpt = {
        gasPrice: 2*currGasPrice,
        gas: global.GAS_LIMIT
    }

    console.log('SafeMathLibExt deployment - started');

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
    }
    catch (err) {
        console.log('CrowdsaleTokenExt creation error: ', err);
    }

    let name = 'Trung';
    let symbol = 'TTT';
    let decimals = 18;
    let initialSupply = 1000;
    let mintable = true;
    let globalMinCap = 100000;
    
    try {
        let crowdsaleToken = await global.CrowdsaleTokenExtContract.at(CrowdsaleTokenExtInstAddr);
        await crowdsaleToken.setParam(name, symbol, initialSupply, decimals, mintable, globalMinCap, gasOpt);

        console.log('CrowdsaleTokenExt setParam OK');
    }
    catch (err) {
        console.log('CrowdsaleTokenExt setParam error: ', err);
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
    }
    catch (err) {
        console.log('FlatPricingExt creation error: ', err);
    }

    let oneTokenInWei = 100;

    try {
        let inst = await global.FlatPricingExtContract.at(FlatPricingExtInstAddr);
        await inst.setParam(oneTokenInWei, gasOpt);

        console.log('FlatPricingExtContract setParam OK');
    }
    catch (err) {
        console.log('FlatPricingExtContract setParam error: ', err);
    }

    let MintedTokenCappedCrowdsaleExtInst = null;
    let MintedTokenCappedCrowdsaleExtInstAddr = null;
    
    try {
        MintedTokenCappedCrowdsaleExtInst = await global.MintedTokenCappedCrowdsaleExtContract.new(gasOpt);
        MintedTokenCappedCrowdsaleExtInstAddr = MintedTokenCappedCrowdsaleExtInst.address;
        console.log('MintedTokenCappedCrowdsaleExtContract creation OK - address:', MintedTokenCappedCrowdsaleExtInstAddr);
    }
    catch (err) {
        console.log('MintedTokenCappedCrowdsaleExtContract creation error: ', err);
    }

    let _name = 'CrowdSaleTrung';
    let _token = CrowdsaleTokenExtInstAddr;
    let _pricingStrategy = 'FlatPricingExtInstAddr';
    let _multisigWallet = '0xFb2e63ABeBCB0A75c03A6BE27b89fC5E38751986';
    let _start = 1547629588000;
    let _end =   1547715988000;
    let _minimumFundingGoal = 1;
    let _isWhiteListed = true;
    let _maximumSellableTokens = 1000;

    try {
        let inst = await global.MintedTokenCappedCrowdsaleExtContract.at(MintedTokenCappedCrowdsaleExtInstAddr);
        await inst.setParam(_name, _token, _pricingStrategy, _multisigWallet, _start, _end, _minimumFundingGoal, _isWhiteListed, _maximumSellableTokens, gasOpt);

        console.log('MintedTokenCappedCrowdsaleExtContract setParam OK');
    }
    catch (err) {
        console.log('MintedTokenCappedCrowdsaleExtContract setParam error: ', err);
    }

    let ReservedTokensFinalizeAgentInst = null;
    let ReservedTokensFinalizeAgentInstAddr = null;
    
    try {
        ReservedTokensFinalizeAgentInst = await global.ReservedTokensFinalizeAgentContract.new(gasOpt);
        ReservedTokensFinalizeAgentInstAddr = ReservedTokensFinalizeAgentInst.address;
        console.log('ReservedTokensFinalizeAgentContract creation OK - address:', MintedTokenCappedCrowdsaleExtInstAddr);
    }
    catch (err) {
        console.log('ReservedTokensFinalizeAgentContract creation error: ', err);
    }

    try {
        let inst = await global.ReservedTokensFinalizeAgentContract.at(ReservedTokensFinalizeAgentInstAddr);
        await inst.setParam(_token, MintedTokenCappedCrowdsaleExtInstAddr, gasOpt);

        console.log('ReservedTokensFinalizeAgentContract setParam OK');
    }
    catch (err) {
        console.log('ReservedTokensFinalizeAgentContract setParam error: ', err);
    }

}

function dummy(param) {
  
}
