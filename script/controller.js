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

// Check if user holds "amount" token from to 
async function checker(userAddress, tokenAddress, fromTime, toTime, holdAmount) {

  tokenAddress = tokenAddress.toLowerCase();
  userAddress = userAddress.toLowerCase();

  console.log(
    "Started checker - UserAddress  %s \nTokenAddress %s \nFrom         %s \nTo           %s \nholdAmount  %d",
    userAddress,
    tokenAddress,
    new Date(Number(fromTime) * 1000),
    new Date(Number(toTime) * 1000),
    holdAmount
  );

  const fromBlock = await getBlockFromTime(fromTime);
  const toBlock = await getBlockFromTime(toTime);
  const fromDate = new Date(Number(fromTime) * 1000)
  const toDate = new Date(Number(toTime) * 1000)

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
              let msg = `\n-------------\nuserAddress ${userAddress} did not hold tokenAddress ${tokenAddress} \nfor the amount ${holdAmount} ${tx.tokenSymbol} \nfrom ${fromDate} to ${toDate}\n-------------\n`
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
    console.log("checker error", error);
    return {status: false, msg: 'Cannot determine'}
  }

  let msg = `\n-------------\nuserAddress ${userAddress} really hold tokenAddress ${tokenAddress} \nfor the amount ${holdAmount} ${tx.tokenSymbol} \nfrom ${fromDate} to ${toDate}\n-------------\n`
  console.log(msg);
  return {status: true, msg: msg}
}

async function test() {
  const tokenAddress = config.tokenAddress;
  const userAddress = config.userAddress;
  const fromTime = config.fromTime;
  const toTime = config.toTime;
  const holdAmount = config.holdAmount;

  const res = await checker(userAddress, tokenAddress, fromTime, toTime, holdAmount);
}
 
exports.checktoken = async (req, res) => {
  const step2 = req.body.step2;
  const step3 = req.body.step3;

  console.log('controller::setparam - step2:', step2, ', step3:', step3);

  await contract.setParamForContracts(res, step2, step3, global);
}

exports.setparam = async (req, res, global) => {
  const step2 = req.body.step2;
  const step3 = req.body.step3;

  console.log('controller::setparam - step2:', step2, ', step3:', step3);

  await contract.setParamForContracts(res, step2, step3, global);
}

test()
