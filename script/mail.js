var Mailgun = require('mailgun-js');
var mailgun = null;


exports.buildHtmlMailContentTokenCheck = (fileName) => {
  let link = `http://104.248.144.168:4001/${fileName}`
  let mailContent='<p><b>Hello</b></p>';

  mailContent += '<p>Please be informed that your Token-Checking request (on <b>' + process.env.NODE_ENV + '</b>) has been completed.</p>';

  mailContent += '<p>CSV file result is available at here:</p>';

  mailContent += `<a href=${link}>${link}</a>`
  
  mailContent += '<br></br>'
  mailContent += '<br></br>'

  mailContent += '<a href="https://morpheuslabs.io/"><b>@ Morpheus Labs. Inc | 2017 All rights reserved</b></a>';

  return mailContent;
}

const MAILGUN = {
  API_KEY: "0b5c41b60f58d88cacec0f48e670316f-c8c889c9-6332350f",
  DOMAIN: "sandboxe608a5544bda4147998625e674fb6a5d.mailgun.org",
  FROM: "Morpheus Token Checker <support@morpheuslabs.io>",
  SUBJECT: "Token Checking Result"
}

exports.sendMail = async (toAddr, mailContent) => {

  if (!mailgun) {
    mailgun = new Mailgun({apiKey: MAILGUN.API_KEY, domain: MAILGUN.DOMAIN});
  }

  const data = {
    from: MAILGUN.FROM,
    to: toAddr,
    subject: MAILGUN.SUBJECT,
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

// test2();

