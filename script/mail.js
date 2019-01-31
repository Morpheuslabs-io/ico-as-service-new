var Mailgun = require('mailgun-js');
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

exports.buildMailContent = (tokenAddr, tierList, global) => {
  let mailContent='Hello, \n\n';

  mailContent += 'Please be informed that your ICO contracts have successfully been finalized. \n\n';
  
  mailContent += 'Token contract: ' + global.ETHERSCAN_ADDRESS_URL + tokenAddr + '\n\n';
  
  for (let i=0; i<tierList.length; i++) {
    mailContent += `Tier ${i+1}:\n`;
    mailContent += '  Crowdsale contract: ' + global.ETHERSCAN_ADDRESS_URL + tierList[i].crowdsaleAddr + '\n';
    mailContent += '  Pricing Strategy contract: ' + global.ETHERSCAN_ADDRESS_URL + tierList[i].pricingStrategyAddr + '\n';
    mailContent += '  Finalized Agent contract: ' + global.ETHERSCAN_ADDRESS_URL + tierList[i].finalizedAgentAddr + '\n\n'; 
  }

  mailContent += '@ Morpheus Labs. Inc | 2017 All rights reserved';

  return mailContent;
}

// exports.buildTierContentForMail = (crowdsaleAddr, pricingStrategyAddr, finalizedAgentAddr, global) => {
//   let tierContent='';
//   tierContent += 'Crowdsale contract: ' + global.ETHERSCAN_ADDRESS_URL + crowdsaleAddr + '\n';
//   tierContent += 'Pricing Strategy contract: ' + global.ETHERSCAN_ADDRESS_URL + pricingStrategyAddr + '\n';
//   tierContent += 'Finalized Agent contract: ' + global.ETHERSCAN_ADDRESS_URL + finalizedAgentAddr + '\n\n';

//   return tierContent;
// }

exports.sendMail = async (toAddr, mailContent, global) => {

  if (!mailgun) {
    mailgun = new Mailgun({apiKey: global.MAILGUN_API_KEY, domain: global.MAILGUN_DOMAIN});
  }

  const data = {
    from: global.MAILGUN_FROM,
    to: toAddr,
    subject: global.MAILGUN_SUBJECT,
    text: mailContent
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
  
  let tokenAddr = '0x375d9bd360b848f7b11842914f231dd0a0746850';
  let crowdsaleAddr = '0x656049ec7D3A2a632D859EBE08e9Bc3934163AA4';
  let pricingStrategyAddr = '0xabc03df8b04a0f6bb24ec20498dc4c77d9f3a5fa';
  let finalizedAgentAddr = '0xcaa273f21b5c982259d5c44943127157daf8633b';

  let tierContent = {
    crowdsaleAddr,
    pricingStrategyAddr,
    finalizedAgentAddr
  }

  let tierList = [tierContent, tierContent];

  let mailContent = exports.buildMailContent(tokenAddr, tierList, global);
  
  await exports.sendMail(toAddr, mailContent, global);
}

// test2();

