const { getBlockFromTime, isValidAddress } = require("./web3Helper");
const xhr = require("axios");

const NODE_ENV = process.env.NODE_ENV || "RINKEBY";
let config = null;
if (!config) {
  if (NODE_ENV === "RINKEBY") {
    config = require("./config").testnet;
  } else {
    config = require("./config").mainnet;
  }
}

async function doCheckTokenNew(userAddress, token1, token2, fromBlock, toBlock) {

  console.log(`doCheckTokenNew - userAddress:${userAddress}, token1:${JSON.stringify(token1)}, token2:${JSON.stringify(token2)}, fromBlock:${fromBlock}, toBlock:${toBlock}`);

  let tx;
  let inAmountTotal1 = 0;
  let outAmountTotal1 = 0;

  let inAmountTotal2 = 0;
  let outAmountTotal2 = 0;

  let txOnToken1 = false;
  let txOnToken2 = false;
  let breakQKCRemark = '';
  try {
    const url = `${
      config.url //  
    }/api?module=account&action=tokentx&address=${userAddress.toLowerCase()}&startblock=${fromBlock}&endblock=${toBlock}&sort=asc&apikey=CWXAFVFUQXG28RHDUISF6GHSP5WPC7K4HA`;
    
    //console.log("Etherscan URL :", url);
    
    let { data } = await xhr.get(url);

    if (data && data.result && data.result.length > 0) {
      const len = data.result.length;
      
      for (let i = 0; i < len; i++) {
        tx = data.result[i];
        
        if (tx.contractAddress === token1.address) {

          txOnToken1 = true;

          // Suppose that, till the check-point, the "in-transfer" happens at first
          // as user should receive tokens before the check-point

          // In transfer  
          if (tx.to === userAddress) {
            let inAmount = parseInt(tx.value)/(10**parseInt(tx.tokenDecimal));
            inAmountTotal1 += inAmount;
            console.log(`Got in-tx on MITx (${tx.hash}) - inAmount: ${inAmount}, inAmountTotal1: ${inAmountTotal1}`);
          }

          // Out transfer
          if (tx.from === userAddress) {
            let outAmount = parseInt(tx.value)/(10**parseInt(tx.tokenDecimal));
            outAmountTotal1 += outAmount;
            let remainingAmount = inAmountTotal1 - outAmountTotal1; 
            
            console.log(`Got out-tx on MITx (${tx.hash}) - outAmount: ${outAmount}, outAmountTotal1: ${outAmountTotal1}`);

            // If doesn't hold MITx, then no need to check QKC
            if (remainingAmount < token1.holdAmount1) {
              let remark = `MITx token - ever had ${inAmountTotal1} but sent out ${outAmountTotal1} and thus remaining balance: ${remainingAmount} < hold amount: ${token1.holdAmount1}`
              return `${remark},${tx.hash},,,,No,No,No,No,No,No`
            }
          }
        }

        if (tx.contractAddress === token2.address) {

          txOnToken2 = true;

          // Suppose that, till the check-point, the "in-transfer" happens at first
          // as user should receive tokens before the check-point

          // In transfer  
          if (tx.to === userAddress) {
            let inAmount = parseInt(tx.value)/(10**parseInt(tx.tokenDecimal));
            inAmountTotal2 += inAmount;
            console.log(`Got tx on QKC (${tx.hash}) - inAmount: ${inAmount}, inAmountTotal2: ${inAmountTotal2}`);
          }

          // Out transfer
          if (tx.from === userAddress) {
            let outAmount = parseInt(tx.value)/(10**parseInt(tx.tokenDecimal));
            outAmountTotal2 += outAmount;
            let remainingAmount = inAmountTotal2 - outAmountTotal2; 
            
            console.log(`Got out-tx on QKC (${tx.hash}) - outAmount: ${outAmount}, outAmountTotal2: ${outAmountTotal2}`);

            if (remainingAmount < token2.holdAmount1) {
              let remark = `QKC token - ever had ${inAmountTotal2} but sent out ${outAmountTotal2} and thus remaining balance: ${remainingAmount} < hold amount: ${token2.holdAmount1}`
              //return `${remark},,${tx.hash},,,No,No,No,No,No,No`
              breakQKCRemark = `${remark},,${tx.hash}`;
              break;
            }
          }
        }
      }
    } else {
      return 'No transaction found on Etherscan,'
    } 

  } catch (error) {
    console.log("doCheckToken error", error);
    return 'Error: cannot determine due to internal failure,'
  }

  if (inAmountTotal1 === 0) {
    let remark = 'does not have any MITx tokens'
    return `${remark},,,0,,No,No,No,No,No,No`
  }

  const remainingBalance1 = inAmountTotal1 - outAmountTotal1;
  const remainingBalance2 = inAmountTotal2 - outAmountTotal2;

  let result = ''
  if (breakQKCRemark !== '') {
    result = `${breakQKCRemark},${remainingBalance1},${remainingBalance2},`
  } else {
    result = `,,,${remainingBalance1},${remainingBalance2},`
  }

  if (remainingBalance1 >= token1.holdAmount3) {
    result += 'Yes,'
  } else {
    result += 'No,'
  }

  if (remainingBalance2 >= token2.holdAmount3) {
    result += 'Yes,'
  } else {
    result += 'No,'
  }

  if (remainingBalance1 >= token1.holdAmount2) {
    result += 'Yes,'
  } else {
    result += 'No,'
  }

  if (remainingBalance2 >= token2.holdAmount2) {
    result += 'Yes,'
  } else {
    result += 'No,'
  }

  if (remainingBalance1 >= token1.holdAmount1) {
    result += 'Yes,'
  } else {
    result += 'No,'
  }

  if (remainingBalance2 >= token2.holdAmount1) {
    result += 'Yes,'
  } else {
    result += 'No,'
  }

  return result
}

async function doCheckTokenPairNew(userAddress, token1, token2, fromBlock, toBlock) {
  if (!isValidAddress(userAddress)) {
    console.log('doCheckTokenPairNew - Invalid address:', userAddress);
    return 'Invalid address,'
  }

  let checkRes = await doCheckTokenNew(userAddress, token1, token2, fromBlock, toBlock);
  
  return checkRes;
}

module.exports = async function (params, callback = (err, result) => ({})) {
  // callback(null, i*2)
  let {
    userAddress,
    toTimeStr,
    token1, 
    token2, 
    fromBlock, 
    toBlock
  } = params

  let outputUser = `${userAddress},${toTimeStr},`
  let checkRes = await doCheckTokenPairNew(userAddress, token1, token2, fromBlock, toBlock);
  outputUser += checkRes
  callback(null, outputUser)
}
