var querystring = require('querystring');
var request = require('request-promise');
var fs = require("fs");

exports.publishContract = async (contractAddr, contractName, contractFilePath) => {
  
  let source = exports.getContractSource(contractFilePath);
  if (!source) return;

  let form = {
    "apikey": "KCUPM62T94YYXRK6KJFK3VMHVBRASKTHVR",
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

  let result = await request({
    headers: {
      'Content-Length': contentLength,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    uri: 'http://api-rinkeby.etherscan.io/api?module=contract',
    body: formData,
    method: 'POST'
  });
  console.log('Result:', result);
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
  //let contractFilePath = './contracts-flatten/ReservedTokensFinalizeAgentFlattened.sol';
  // let contractFilePath = './script/data.js';
  let contractFilePath = './contracts-flatten/MintedTokenCappedCrowdsaleExtFlatten.sol';
  let contractAddr = "0x58d8015f4fae2abf13108b1304c8435124c0d041";
  let contractName = "MintedTokenCappedCrowdsaleExt";

  await exports.publishContract(contractAddr, contractName, contractFilePath);
}

test2();
