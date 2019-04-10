var api = null;

exports.getTxFee = async (contractAddr, global) => {
  if (!api) {
    api = require('etherscan-api').init(global.ETHERSCAN_API_KEY, global.ETHERSCAN_NETWORK, '3000');
  }

  console.log(`getTxFee - contractAddr: ${contractAddr}`);

  let txFee=0;
  try {
    var txlistResult = await api.account.txlist(contractAddr, 1, 'latest', 1, 100, 'asc');
    if (!txlistResult) {
      console.log(`getTxFee (contractAddr:${contractAddr}) - empty txlist !!`);
      return 0;  
    }
    let txlist = txlistResult.result;
    for (let i=0; i<txlist.length; i++) {
      let tx = txlist[i];
      if (tx.from.toLowerCase() == global.OWNER_ADDR.toLowerCase()) {
        let txFeeEach = (tx.gasUsed * (tx.gasPrice/10**18));
        txFee += txFeeEach;
        // console.log(`getTxFee - txID: ${tx.hash}, txFeeEach: ${txFeeEach}`);
      }
      // console.log(`getTxFee - from: ${tx.from}`);
    }
    // console.log(`getTxFee - total: ${txFee}`);
  } catch (err) {
    console.log('getTxFee (contractAddr:', contractAddr,' - txlist error:', err);
    return 0;
  }
  
  console.log(`getTxFee - contractAddr: ${contractAddr} - fee: ${txFee}`);
  return txFee; 
}

async function test() {
  let global={};
  global.ETHERSCAN_API_KEY='KCUPM62T94YYXRK6KJFK3VMHVBRASKTHVR';
  global.ETHERSCAN_NETWORK='rinkeby'
  global.OWNER_ADDR = '0x8847F80cB1b2B567679B3166A0C828453e122c7F'

  let contractAddr='0x6Fc3d2D026dcec292850DBfD82C10E40e47aBb47'
  await exports.getTxFee(contractAddr, global);
}

test()