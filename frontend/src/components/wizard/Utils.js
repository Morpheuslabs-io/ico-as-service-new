import Web3 from 'web3';
import moment from 'moment';
import axios from 'axios';
import crypto from "crypto";
import dotenv from "dotenv";
import validator from 'validator';
import { keccak256 } from 'js-sha3';
const Buf = require('safe-buffer').Buffer;
let web3 = null;


/**
 * Checks if the given string is an address
 *
 * @method isAddress
 * @param {String} address the given HEX adress
 * @return {Boolean}
*/
var isAddress = function (address) {
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
      // check if it has the basic requirements of an address
      return false;
  } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
      // If it's all small caps or all all caps, return true
      return true;
  } else {
      // Otherwise check each case
      return isChecksumAddress(address);
  }
};

/**
* Checks if the given string is a checksummed address
*
* @method isChecksumAddress
* @param {String} address the given HEX adress
* @return {Boolean}
*/
var isChecksumAddress = function (address) {
  // Check each case
  address = address.replace('0x','');
  var addressHash = keccak256(address.toLowerCase());
  for (var i = 0; i < 40; i++ ) {
      // the nth letter should be uppercase if the nth digit of casemap is 1
      if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
          return false;
      }
  }
  return true;
};

export function isValidAddress(address) {
  let ret = isAddress(address);
  return ret;
}

export function isValidEmailAddress(email){
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  let ret =  re.test(email.toLowerCase());
  return ret;
}

export function validMetamask() {
  
  // MetaMask is not needed
  return 2;

  if (typeof(window.web3) !== 'undefined') {
    web3 = window.web3;
  }
  if (typeof web3 === 'undefined' || web3 === null) {
    return 0;
  } else {
    const account = web3.eth.accounts[0];
    if (!account) {
      return 1;
    }
    return 2;
  }
}

// get diff seconds
export function diffDates(startD, startT, endD, endT) {
  startD = startD.format('YYYY-MM-DD');
  startT = startT.format('HH:mm');
  endD = endD.format('YYYY-MM-DD');
  endT = endT.format('HH:mm');
  const start = moment(startD + ' ' + startT, 'YYYY-MM-DD HH:mm');
  const end = moment(endD + ' ' + endT, 'YYYY-MM-DD HH:mm');
  return end.diff(start) / 1000;
}

export const countDecimalPlaces = num => {
  const match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);

  if (!match[0] && !match[1] && !match[2]) return 0;

  const digitsAfterDecimal = match[1] ? match[1].length : 0;
  const adjust = match[2] ? +match[2] : 0;

  return Math.max(0, digitsAfterDecimal - adjust);
};

export function toFixed(x) {
  if (Math.abs(x) < 1.0) {
    let e = parseInt(x.toString().split('e-')[1], 10);
    if (e) {
      x *= Math.pow(10, e - 1);
      x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
    }
  } else {
    let e = parseInt(x.toString().split('+')[1], 10);
    if (e > 20) {
      e -= 20;
      x /= Math.pow(10, e);
      x += (new Array(e + 1)).join('0');
    }
  }
  return x;
}

export const setAuthorizationHeader = (token = null) => {
  if (token) {
    axios.defaults.headers.common.authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.authorization;
  }
};

dotenv.config();
const algorithm = 'aes-256-ctr';
const password = process.env.REACT_APP_RNDKEY;
const IV = Buf.from(crypto.randomBytes(16));

export const encrypt = text => {
  const cipher = crypto.createCipheriv(algorithm, password, IV);
  let crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
};

export const decrypt = text => {
  const decipher = crypto.createCipheriv(algorithm, password, IV);
  let dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
};
