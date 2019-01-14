
exports.createIcoToken = async (req, res, next) => {

    console.log('/test/icotoken');

    let safeMathLibExtContractInst = null;
    
    try {
        safeMathLibExtContractInst = await global.SafeMathLibExtContract.new();
        console.log('SafeMathLibExt creation OK');
    }
    catch (err) {
        console.log('SafeMathLibExt creation error: ', err);
    }

    try {
        await global.CrowdsaleTokenExtContract.link('SafeMathLibExt', safeMathLibExtContractInst.address);
        console.log('CrowdsaleTokenExt link with SafeMathLibExt - OK');
    }
    catch (err) {
        console.log('CrowdsaleTokenExt link with SafeMathLibExt - error: ', err);
    }

    let crowdsaleTokenExtContractInst = null;
    
    try {
        crowdsaleTokenExtContractInst = await global.CrowdsaleTokenExtContract.new({
            gasPrice: 20 * 1000000000,
            gas: 7000000
          });
        console.log('CrowdsaleTokenExt creation OK');
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
        await crowdsaleTokenExtContractInst.setParam(name, symbol, initialSupply, decimals, mintable, globalMinCap);

        console.log('CrowdsaleTokenExt setParam OK');
    }
    catch (err) {
        console.log('CrowdsaleTokenExt setParam error: ', err);
    }
}

function dummy(param) {
  
}
