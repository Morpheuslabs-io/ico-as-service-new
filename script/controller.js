const utils = require('./utils')
const dateFormat = require('dateformat');
const xhr = require("axios");
const { getBlockFromTime } = require("./web3Helper");

const NODE_ENV = process.env.NODE_ENV || "RINKEBY";
let config;
if (NODE_ENV === "RINKEBY") {
  config = require("./config").testnet;
} else {
  config = require("./config").mainnet;
}
console.log("App is running on %s", NODE_ENV);

// Get creating timestamp of token
async function getCreatingTimestamp(tokenAddress) {
  tokenAddress = tokenAddress.toLowerCase();

  try {
    const url = `${
      config.url //  
    }/api?module=account&action=txlist&address=${tokenAddress}&sort=asc&apikey=CWXAFVFUQXG28RHDUISF6GHSP5WPC7K4HA`;
    
    console.log("Etherscan URL :", url);
    let { data } = await xhr.get(url);

    if (data && data.result && data.result[0]) {
      let timeStamp = data.result[0].timeStamp;
      console.log('getCreatingTimestamp - data.result[0]', timeStamp);
      return timeStamp;
    }
    
  } catch (err) {
    console.log('getCreatingTimestamp - Error:', err);
  }

  return null;
}

// Check if user holds "amount" token till 
async function doCheckToken(userAddress, tokenAddress, fromBlock, toBlock, toDate, holdAmount) {

  tokenAddress = tokenAddress.toLowerCase();
  userAddress = userAddress.toLowerCase();

  console.log(
    "doCheckToken - UserAddress:%s, TokenAddress:%s, \nFrom:%s, To:%s, holdAmount:%d",
    userAddress,
    tokenAddress,
    toDate,
    holdAmount
  );

  let tx;
  try {
    const url = `${
      config.url //  
    }/api?module=account&action=tokentx&address=${userAddress}&startblock=${fromBlock}&endblock=${toBlock}&sort=asc&apikey=CWXAFVFUQXG28RHDUISF6GHSP5WPC7K4HA`;
    
    console.log("Etherscan URL :", url);
    
    let { data } = await xhr.get(url);

    if (data && data.result && data.result.length > 0) {
      const len = data.result.length;
      let outAmountTotal = 0;
      let inAmountTotal = 0;
      
      for (let i = 0; i < len; i++) {
        tx = data.result[i];
        
        if (tx.contractAddress === tokenAddress) {

          // Out transfer
          if (tx.from === userAddress) {
            let outAmount = parseInt(tx.value)/(10**parseInt(tx.tokenDecimal));
            outAmountTotal += outAmount;
            let remainingAmount = inAmountTotal - outAmountTotal; 
            
            console.log(`Got tx (${tx.hash}) - outAmount: ${outAmount}`);

            if (remainingAmount < holdAmount) {
              console.log(`   remainingAmount (${remainingAmount}) < holdAmount (${holdAmount})`);
              let msg = `\nUser Address ${userAddress} did not hold Token Address ${tokenAddress} for the amount ${holdAmount} ${tx.tokenSymbol} till ${toDate}\n`
              console.log(msg);
              return {status: false, msg: msg}
            }
          }
          
          // In transfer  
          if (tx.to === userAddress) {
            let inAmount = parseInt(tx.value)/(10**parseInt(tx.tokenDecimal));
            inAmountTotal += inAmount;
            console.log(`Got tx (${tx.hash}) - inAmount: ${inAmount}, inAmountTotal: ${inAmountTotal}`);
          } 
        }
      }
    }
  } catch (error) {
    console.log("doCheckToken error", error);
    return {status: false, msg: 'Cannot determine'}
  }

  let msg = `\nUser Address ${userAddress} really hold Token Address ${tokenAddress} for the amount ${holdAmount} ${tx.tokenSymbol} till ${toDate}\n`
  console.log(msg);
  return {status: true, msg: msg}
}

async function test() {
  const tokenAddress = config.tokenAddress;
  const userAddress = config.userAddress;
  const fromTime = config.fromTime;
  const toTime = config.toTime;
  const holdAmount = config.holdAmount;

  const res = await doCheckToken(userAddress, tokenAddress, fromTime, toTime, holdAmount);
}
 
exports.checktoken = async (req, res) => {
  
  let { userAddress, tokenAddress, toTime, holdAmount } = req.body;
  console.log('checktoken - req.body:', req.body);

  // Determine fromTime manually
  let fromTime = await getCreatingTimestamp(tokenAddress);

  const fromDate = new Date(Number(fromTime) * 1000);
  const toDate =  new Date(Number(toTime) * 1000)

  const fromBlock = await getBlockFromTime(fromTime);
  const toBlock = await getBlockFromTime(toTime);

  let checkRes = await doCheckToken(userAddress, tokenAddress, fromBlock, toBlock, fromDate, toDate, holdAmount);

  res.send(checkRes);
}

exports.checktokenpair = async (req, res) => {
  
  let { userAddress, tokenAddress1, holdAmount1, tokenAddress2, holdAmount2, toTime } = req.body;
  console.log('checktokenpair - req.body:', req.body);

  // Determine fromTime manually
  const fromTime1 = await getCreatingTimestamp(tokenAddress1);
  const fromBlock1 = await getBlockFromTime(fromTime1);
  const toBlock = await getBlockFromTime(toTime);
  const toDate =  new Date(Number(toTime) * 1000)

  let checkRes1 = await doCheckToken(userAddress, tokenAddress1, fromBlock1, toBlock, toDate, holdAmount1);
  
  if (checkRes1.status === false) {
    res.send(checkRes1);
    return;
  }

  const fromTime2 = await getCreatingTimestamp(tokenAddress2);
  const fromBlock2 = await getBlockFromTime(fromTime2);

  let checkRes2 = await doCheckToken(userAddress, tokenAddress2, fromBlock2, toBlock, toDate, holdAmount2);
  
  // Get the final "status"
  checkRes1.status = checkRes2.status
  // But concat "msg"
  checkRes1.msg += '\n' + checkRes2.msg

  res.send(checkRes1);
}

// test()
