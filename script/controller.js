const utils = require('./utils')
const dateFormat = require('dateformat');
const xhr = require("axios");
const { getBlockFromTime, isValidAddress } = require("./web3Helper");
const mail = require('./mail')
var fs = require("fs");
var path = require('path')

const workerFarm = require('worker-farm')
const worker = workerFarm(require.resolve('./checkTokenPairWorker.js'))

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

// "toBlock" is specified by user
// "fromBlock" is the creating block of token (determined internally)
// Version2: not allow out-transfer and remaining balance >= hold-amount
async function doCheckToken(userAddress, tokenAddress, fromBlock, toBlock, toDate, holdAmount) {

  tokenAddress = tokenAddress.toLowerCase();
  userAddress = userAddress.toLowerCase();

  console.log(
    "doCheckToken - UserAddress:%s, TokenAddress:%s, To:%s, holdAmount:%d",
    userAddress,
    tokenAddress,
    toDate,
    holdAmount
  );

  let tx;
  let inAmountTotal = 0;
  try {
    const url = `${
      config.url //  
    }/api?module=account&action=tokentx&address=${userAddress}&startblock=${fromBlock}&endblock=${toBlock}&sort=asc&apikey=CWXAFVFUQXG28RHDUISF6GHSP5WPC7K4HA`;
    
    console.log("Etherscan URL :", url);
    
    let { data } = await xhr.get(url);

    if (data && data.result && data.result.length > 0) {
      const len = data.result.length;
      
      for (let i = 0; i < len; i++) {
        tx = data.result[i];
        
        if (tx.contractAddress === tokenAddress) {

          // Suppose that, till the check-point, the "in-transfer" happens at first
          // as user should receive tokens before the check-point

          // In transfer  
          if (tx.to === userAddress) {
            let inAmount = parseInt(tx.value)/(10**parseInt(tx.tokenDecimal));
            inAmountTotal += inAmount;
            console.log(`Got tx (${tx.hash}) - inAmount: ${inAmount}, inAmountTotal: ${inAmountTotal}`);
          }

          // Out transfer
          if (tx.from === userAddress) {
            let msg = `\nUser Address ${userAddress} did not hold Token Address ${tokenAddress} for the amount ${holdAmount} tokens till ${toDate}\nOut-transfer tx detected: ${tx.hash}\n`
            console.log(msg);
            return {status: false, reason: `Out-transfer tx detected: ${tx.hash}`}
          } 
        }
      }
    }
  } catch (error) {
    console.log("doCheckToken error", error);
    return {status: false, error: 'Cannot determine due to internal failure'}
  }

  if (inAmountTotal >= holdAmount) {
    let msg = `\nUser Address ${userAddress} really hold Token Address ${tokenAddress} for the amount ${holdAmount} tokens till ${toDate}\n`
    console.log(msg);
    return {status: true}
  } else {
    let msg = `\nUser Address ${userAddress} did not hold Token Address ${tokenAddress} till ${toDate}\nRemaining balance  (${inAmountTotal}) lower than the amount (${holdAmount})`
    console.log(msg);
    return {status: false, reason: `Remaining balance  (${inAmountTotal}) lower than the amount (${holdAmount})`}
  }
}

// "toBlock" is specified by user
// "fromBlock" is the creating block of token (determined internally)
// Version1: still allow out-transfer and remaining balance >= hold-amount
async function doCheckTokenV1(userAddress, tokenAddress, fromBlock, toBlock, toDate, holdAmount) {

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
  let inAmountTotal = 0;
  try {
    const url = `${
      config.url //  
    }/api?module=account&action=tokentx&address=${userAddress}&startblock=${fromBlock}&endblock=${toBlock}&sort=asc&apikey=CWXAFVFUQXG28RHDUISF6GHSP5WPC7K4HA`;
    
    console.log("Etherscan URL :", url);
    
    let { data } = await xhr.get(url);

    if (data && data.result && data.result.length > 0) {
      const len = data.result.length;
      let outAmountTotal = 0;
      
      for (let i = 0; i < len; i++) {
        tx = data.result[i];
        
        if (tx.contractAddress === tokenAddress) {

          // Suppose that, till the check-point, the "in-transfer" happens at first
          // as user should receive tokens before the check-point

          // In transfer  
          if (tx.to === userAddress) {
            let inAmount = parseInt(tx.value)/(10**parseInt(tx.tokenDecimal));
            inAmountTotal += inAmount;
            console.log(`Got tx (${tx.hash}) - inAmount: ${inAmount}, inAmountTotal: ${inAmountTotal}`);
          }

          // Out transfer
          if (tx.from === userAddress) {
            let outAmount = parseInt(tx.value)/(10**parseInt(tx.tokenDecimal));
            outAmountTotal += outAmount;
            let remainingAmount = inAmountTotal - outAmountTotal; 
            
            console.log(`Got tx (${tx.hash}) - outAmount: ${outAmount}`);

            if (remainingAmount < holdAmount) {
              console.log(`   remainingAmount (${remainingAmount}) < holdAmount (${holdAmount})`);
              let msg = `\nUser Address ${userAddress} did not hold Token Address ${tokenAddress} for the amount ${holdAmount} tokens till ${toDate}\n`
              console.log(msg);
              return {status: false, msg: msg}
            }
          } 
        }
      }
    }
  } catch (error) {
    console.log("doCheckToken error", error);
    return {status: false, msg: 'Cannot determine'}
  }

  if (inAmountTotal > 0) {
    let msg = `\nUser Address ${userAddress} really hold Token Address ${tokenAddress} for the amount ${holdAmount} tokens till ${toDate}\n`
    console.log(msg);
    return {status: true, msg: msg}
  } else {
    let msg = `\nUser Address ${userAddress} does not have any Token Address ${tokenAddress} till ${toDate}\n`
    console.log(msg);
    return {status: false, msg: msg}
  }
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

async function doCheckTokenPairNew(userAddress, token1, token2, fromBlock, toBlock) {
  if (!isValidAddress(userAddress)) {
    console.log('doCheckTokenPairNew - Invalid address:', userAddress);
    return 'Invalid address,'
  }

  let checkRes = await doCheckTokenNew(userAddress, token1, token2, fromBlock, toBlock);
  
  return checkRes;
}

exports.checktokenpairBulk = async (req, res) => {
  let {
    email,
    outputName,
    toTime,
    toTimeStr,
    
    tokenAddress1,
    holdAmount11,
    holdAmount12,
    holdAmount13,
    
    tokenAddress2,
    holdAmount21,
    holdAmount22,
    holdAmount23
  } = JSON.parse(req.body.params);

  let inputFilePath = req.files.file.path;
  let inputFileData = null
  try {
    inputFileData = await fs.readFileSync(inputFilePath, 'utf8');
  } catch (err){
    console.log("Failed to read uploaded file:", err)
  }

  // Always delete tmp file
  await fs.unlinkSync(inputFilePath)

  if (!inputFileData) {
    return res.send('Failed to read uploaded file');
  }

  let userList = [];
  let userListTmp = inputFileData.split('\n');
  for (const id in userListTmp) {
    let line = userListTmp[id];
    if (line && line !== '') {
      userList.push(line.replace(/\s+/g, '').toLowerCase());
    }
  }

  console.log('checktokenpairBulk - req.body.params:', req.body.params);
  console.log('checktokenpairBulk - userListSize:', userListTmp.length);

  res.send(`Your request is in progress. \nOnce done, a notification will be sent to your provided email:\n ${email}`);

  let token1 = {
    address: tokenAddress1,
    holdAmount1: holdAmount11,
    holdAmount2: holdAmount12,
    holdAmount3: holdAmount13
  }

  let token2 = {
    address: tokenAddress2,
    holdAmount1: holdAmount21,
    holdAmount2: holdAmount22,
    holdAmount3: holdAmount23
  }

  let outputCSV = 'User,Check Point,Remark/Error,MITx Out-Tx,QKC Out-Tx,MITx balance,QKC balance,Holding 100K MITx,Holding 30K QKC,Holding 30K MITx,Holding 10K QKC,Holding 15K MITx,Holding 5K QKC'

  const toBlock = await getBlockFromTime(toTime);
  
  const MITx = '0x4a527d8fc13C5203AB24BA0944F4Cb14658D1Db6'
  const fromBlock1 = 5090186
  const QKC = '0xEA26c4aC16D4a5A106820BC8AEE85fd0b7b2b664'
  const fromBlock2 = 5718081
  const fromBlock = fromBlock1 <= fromBlock2 ? fromBlock1 : fromBlock2

  let params = {
    userAddress: null,
    toTimeStr,
    token1, 
    token2, 
    fromBlock, 
    toBlock
  }

  let ret = 0
  let done = false
  for (let i=0; i < userList.length; i++) {
    params.userAddress = userList[i];
    worker(params, (err, result) => {
      if (err) {
        console.log('checkTokenPairWorker Error:', err);
      } else {
        outputCSV += '\n' + result
        if (++ret == userList.length) {
          workerFarm.end(worker)
          done = true
        }
      }
      // workerFarm.end(workers)
    })
  }

  require('deasync').loopWhile(function(){return !done;});

  const storageDir = './frontend/public/'
  const currTimeStamp = Date.now()
  const fileName = (!outputName || outputName === '') ? currTimeStamp : outputName + '.csv'
  const filePath = path.resolve(storageDir + fileName)
  try {
    fs.writeFileSync(filePath, outputCSV, 'utf8');
  } catch (err){
      console.log("Cannot write file", err)
  }
  
  let mailContent = mail.buildHtmlMailContentTokenCheck(fileName);

  await mail.sendMail(email, mailContent);
}

// test()
