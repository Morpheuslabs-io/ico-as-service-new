var querystring = require('querystring');
var request = require('request-promise');
var fs = require("fs");
var sleep = require('sleep');

exports.publishContract = async (contractAddr, contractName, contractFilePath, global) => {
  
  let source = exports.getContractSource(contractFilePath);
  if (!source) return;

  let form = {
    "apikey": global.ETHERSCAN_API_KEY,
    "module": "contract",                           
    "action": "verifysourcecode",                   
    "contractaddress": contractAddr,
    "sourceCode": source,
    "contractname": contractName,
    "compilerversion": "v0.4.24+commit.e67f0147",
    "optimizationUsed": 0,
    "runs": 200
  };

  var formData = querystring.stringify(form);
  var contentLength = formData.length;

  let retryCnt = 1;
  while (retryCnt <= global.RETRY_TIMES) {
    let result = await request({
      headers: {
        'Content-Length': contentLength,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      uri: global.ETHERSCAN_API_URL,
      body: formData,
      method: 'POST'
    });

    console.log('publishContract result:', result);    
    result = JSON.parse(result);    
    if (result.status === "1") {
      break;
    }
    
    sleep.sleep(5);
    console.log('publishContract retry');
    retryCnt++;
  }
}

exports.getContractSource = (contractFilePath) => {

  let source = '';
  try {
      source = fs.readFileSync(contractFilePath, 'utf8');
      console.log('Read contract file OK');
      return source;
  } catch (err){
      console.log('Read contract file Error: ', err);
      return null;
  }
}

async function test2() {
  let contractFilePath = './contracts-flatten/MintedTokenCappedCrowdsaleExtFlatten.sol';
  let contractAddr = "0x58d8015f4fae2abf13108b1304c8435124c0d041";
  let contractName = "MintedTokenCappedCrowdsaleExt";

  let global = {}
  global.ETHERSCAN_API_KEY = 'KCUPM62T94YYXRK6KJFK3VMHVBRASKTHVR';
  global.ETHERSCAN_API_URL = 'http://api-rinkeby.etherscan.io/api';

  await exports.publishContract(contractAddr, contractName, contractFilePath, global);
}

// test2();
