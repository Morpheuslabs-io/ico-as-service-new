var request = require('requestretry');

/**
 * Declare class
 * @class Utils
 */
var Utils = function () { }

var oldGas = 0;

Utils.requestRetryAsync = async (url, opt) => {
  var reqOpt = {
    url: '',
    json: true,
    // The below parameters are specific to request-retry
    maxAttempts: 5, // (default) try 5 times
    retryDelay: 5000, // (default) wait for 5s before trying again
    fullResponse: false // (default) To resolve the promise with the full response or just the body
  }

  if (opt) {
    reqOpt.maxAttempts = opt.maxAttempts ? opt.maxAttempts : reqOpt.maxAttempts
    reqOpt.retryDelay = opt.retryDelay ? opt.retryDelay : reqOpt.retryDelay
  }

  reqOpt.url = url
  try {
    let re = await request(reqOpt)
    // console.log('requestRetryAsync: ', re)
    return re
  } catch (err) {
    console.log('requestRetryAsync - error: ', err)
    return null
  }
}

Utils.getGasPriceGST = async function () {
    const GAS_STATION_URL = 'https://ethgasstation.info/json/ethgasAPI.json';
    var re = await Utils.requestRetryAsync(GAS_STATION_URL);
    if (!re) return null;
    let average = re.average / 10;
    return average; //Gwei
}
//etherchain
Utils.getGasPriceETHC = async function () {
    const GAS_STATION_URL = 'https://www.etherchain.org/api/gasPriceOracle';
    var re = await Utils.requestRetryAsync(GAS_STATION_URL);
    if (!re) return null;
    let standard = re.standard;
    return standard; //Gwei
}

Utils.checkCurrentGasPrice = async function () {
    let gas = await Utils.getGasPriceGST();
    if (!gas) {
        gas = await Utils.getGasPriceETHC();
        if (!gas) {
          gas = oldGas;
        }
    }
    oldGas = gas;
    let currentGasPrice = gas * (10 ** 9); //wei
    console.log('checkCurrentGasPrice:', gas, ' Gwei');
    return currentGasPrice;
}

Utils.getTxReceipt = async function (_txHash) {
    return new Promise(function (resolve, reject) {
        global.web3.eth.getTransactionReceipt(_txHash, (err, res) => {
            if (!err) {
                resolve(res)
            } else {
                reject(err.message);
            }
        })
    })
}

Utils.getTx = async function (_txHash) {
    return new Promise(function (resolve, reject) {
        global.web3.eth.getTransaction(_txHash, (err, res) => {
            if (!err) {
                resolve(res)
            } else {
                reject(err.message);
            }
        })
    })
}

Utils.getTxPriceInfoAsync = async function (_txHash) {
    let txReceipt;
    let tx;
    let status = 'failed';
    try {
        txReceipt = await this.getTxReceipt(_txHash);
        if (txReceipt) { // tx success
            tx = await this.getTx(_txHash);

            if (txReceipt.status === '0x1') {
                status = 'success'
            } else if (txReceipt.status === '0x0') {
                status = 'failed'
            }
            if (tx) {

                return {
                    status: status,
                    gasPrice: global.web3.fromWei(tx.gasPrice, 'ether').toString(),
                    gasLimit: parseInt(tx.gas),
                    gasUsed: parseInt(txReceipt.gasUsed),
                    actualTxCost: parseInt(tx.gas) * parseInt(txReceipt.gasUsed)
                }
            }
        }
    } catch (error) {
        return null;
    }
    return null;
}

module.exports = Utils;