var Mailgun = require('mailgun-js');
var etherscan = require('./etherscan');
var mailgun = null;

exports.buildMailContentSimple = (tokenAddr, crowdsaleAddr, pricingStrategyAddr, finalizedAgentAddr, global) => {
  let mailContent='Hello, \n\n';
  mailContent += 'Please be informed that your ICO contracts have successfully been finalized. \n\n';
  mailContent += 'Token contract: ' + global.ETHERSCAN_ADDRESS_URL + tokenAddr + '\n';
  mailContent += 'Crowdsale contract: ' + global.ETHERSCAN_ADDRESS_URL + crowdsaleAddr + '\n';
  mailContent += 'Pricing Strategy contract: ' + global.ETHERSCAN_ADDRESS_URL + pricingStrategyAddr + '\n';
  mailContent += 'Finalized Agent contract: ' + global.ETHERSCAN_ADDRESS_URL + finalizedAgentAddr + '\n\n';
  mailContent += '@ Morpheus Labs. Inc | 2017 All rights reserved';

  return mailContent;
}

exports.buildHtmlMailContentVesting = async (addressVestingList, vestingList, global) => {
  let mailContent='<p><b>Hello</b></p>';
  let txFee = 0;
  let txFeeTotal = 0;

  mailContent += '<p>Please be informed that your Token-Vesting contracts have successfully been finalized. </p>';
  
  for (let i=0; i<addressVestingList.length; i++) {
    let addrVesting = addressVestingList[i];
    mailContent += '<h4>' + (i+1) + '.</h4>';

    mailContent += '<ul>';
    mailContent += '<li>Beneficiary address: ' + vestingList[i].beneficiaryAddress + '</li>';
    mailContent += '<li>Token-Vesting address: ' + global.ETHERSCAN_ADDRESS_URL + addrVesting + '</li>';
    txFee = await etherscan.getTxFee(addrVesting, global);
    txFeeTotal += txFee;
    mailContent += '<li>Transaction fee: ' + txFee + ' ETH' + '</li>';
    mailContent += '<li>Link: ' + global.TOKEN_VESTING_URL + addrVesting + '/' + vestingList[i].tokenAddress + '</li>';
    mailContent += '</ul>';
  }

  mailContent += '<h4>Total transaction fee: ' + txFeeTotal + ' ETH' + '</h4>';

  mailContent += '<a href="https://morpheuslabs.io/"><b>@ Morpheus Labs. Inc | 2017 All rights reserved</b></a>';

  return mailContent;
}

exports.buildHtmlMailContent = async (tokenAddr, tierList, global) => {
  console.log('buildHtmlMailContent - tokenAddr:', tokenAddr, ', tierList:', tierList);
  let mailContent='<p><b>Hello</b></p>';
  let txFee = 0;
  let txFeeTotal = 0;

  mailContent += '<p>Please be informed that your ICO contracts have successfully been finalized. </p>';
  
  mailContent += '<h4>Token contract:</h4>';
  mailContent += '<ul>';
  mailContent += '<li>Link: ' + global.ETHERSCAN_ADDRESS_URL + tokenAddr + '</li>';
  txFee = await etherscan.getTxFee(tokenAddr, global);
  txFeeTotal += txFee;
  mailContent += '<li>Transaction fee: ' + txFee + ' ETH' + '</li>';
  mailContent += '</ul>';
  
  for (let i=0; i<tierList.length; i++) {
    mailContent += `<h3>Tier ${i+1}</h3>`;
    
    mailContent += '<h4>Crowdsale contract</h4>';
    mailContent += '<ul>';
    mailContent += '<li>Link: ' + global.ETHERSCAN_ADDRESS_URL + tierList[i].crowdsaleAddr + '</li>';
    txFee = await etherscan.getTxFee(tierList[i].crowdsaleAddr, global);
    txFeeTotal += txFee;
    mailContent += '<li>Transaction fee: ' + txFee + ' ETH' + '</li>';
    mailContent += '</ul>';

    mailContent += '<h4>Pricing Strategy contract</h4>';
    mailContent += '<ul>';
    mailContent += '<li>Link: ' + global.ETHERSCAN_ADDRESS_URL + tierList[i].pricingStrategyAddr + '</li>';
    txFee = await etherscan.getTxFee(tierList[i].pricingStrategyAddr, global);
    txFeeTotal += txFee;
    mailContent += '<li>Transaction fee: ' + txFee + ' ETH' + '</li>';
    mailContent += '</ul>';

    mailContent += '<h4>Finalized Agent contract</h4>';
    mailContent += '<ul>';
    mailContent += '<li>Link: ' + global.ETHERSCAN_ADDRESS_URL + tierList[i].finalizedAgentAddr + '</li>';
    txFee = await etherscan.getTxFee(tierList[i].finalizedAgentAddr, global);
    txFeeTotal += txFee;
    mailContent += '<li>Transaction fee: ' + txFee + ' ETH' + '</li>';
    mailContent += '</ul>';
  }

  mailContent += '<h4>Total transaction fee: ' + txFeeTotal + ' ETH' + '</h4>';

  mailContent += '<a href="https://morpheuslabs.io/"><b>@ Morpheus Labs. Inc | 2017 All rights reserved</b></a>';

  return mailContent;
}

exports.sendMail = async (toAddr, mailContent, global) => {

  if (!mailgun) {
    mailgun = new Mailgun({apiKey: global.MAILGUN_API_KEY, domain: global.MAILGUN_DOMAIN});
  }

  const data = {
    from: global.MAILGUN_FROM,
    to: toAddr,
    subject: global.MAILGUN_SUBJECT,
    html: mailContent
  };
  
  try {
    let result = await mailgun.messages().send(data);
    console.log('sendMail OK - result:', result);
  } catch (err) {
    console.log('sendMail Error:', err);
  }
}

async function test1() {

  let globalJSONStr = '';
  try {
    globalJSONStr = require("fs").readFileSync('./setting/testnet.json', 'utf8');
    console.log('Read testnet.json OK');
  } catch (err){
    console.log('Read testnet.json Error: ', err);
    return null;
  }
  let global = JSON.parse(globalJSONStr);

  // let toAddr='branson@morpheuslabs.io';
  let toAddr='bransonlee@gmail.com';
  // let toAddr='midotrinh@gmail.com';
  
  let tokenAddr = '0x375d9bd360b848f7b11842914f231dd0a0746850';
  let crowdsaleAddr = '0x656049ec7D3A2a632D859EBE08e9Bc3934163AA4';
  let pricingStrategyAddr = '0xabc03df8b04a0f6bb24ec20498dc4c77d9f3a5fa';
  let finalizedAgentAddr = '0xcaa273f21b5c982259d5c44943127157daf8633b';
  let mailContent = exports.buildMailContentSimple(tokenAddr, crowdsaleAddr, pricingStrategyAddr, finalizedAgentAddr, global);
  
  await exports.sendMail(toAddr, mailContent, global);
}

async function test2() {

  let globalJSONStr = '';
  try {
    globalJSONStr = require("fs").readFileSync('./setting/testnet.json', 'utf8');
    console.log('Read testnet.json OK');
  } catch (err){
    console.log('Read testnet.json Error: ', err);
    return null;
  }
  let global = JSON.parse(globalJSONStr);

  // let toAddr='branson@morpheuslabs.io';
  // let toAddr='bransonlee@gmail.com';
  let toAddr='midotrinh@gmail.com';
  
  let tokenAddr = '0x6fc3d2d026dcec292850dbfd82c10e40e47abb47';
  let crowdsaleAddr = '0x25e3cf3a61603ecd91a3072f1c99bd1f28b6d8e8';
  let pricingStrategyAddr = '0x2b3eebd3310f531378714c491ca962579b7db246';
  let finalizedAgentAddr = '0xcf4d162fe2209d49ba97eee1449b5fd0fcde7343';

  let tierContent = {
    crowdsaleAddr,
    pricingStrategyAddr,
    finalizedAgentAddr
  }

  let tierList = [tierContent, tierContent];

  let mailContent = await exports.buildHtmlMailContent(tokenAddr, tierList, global);

  console.log('mailContent: ', mailContent);
  
  await exports.sendMail(toAddr, mailContent, global);
}

// test2();

