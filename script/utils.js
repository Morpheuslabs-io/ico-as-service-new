var request = require('request');

/**
 * Declare class
 * @class Utils
 */
var Utils = function () { }

Utils.httpGet = function (route) {
    return new Promise(function (resolve, reject) {
        request.get(route, (er, res, body) => {
            if (er) return reject(er);
            body = JSON.parse(body);
            return resolve(body);
        });
    });
}

Utils.getGasPriceGST = async function () {
    const GAS_STATION_URL = 'https://ethgasstation.info/json/ethgasAPI.json';
    var re = await Utils.httpGet(GAS_STATION_URL);
    let average = re.average / 10;
    return average; //Gwei
}
//etherchain
Utils.getGasPriceETHC = async function () {
    const GAS_STATION_URL = 'https://www.etherchain.org/api/gasPriceOracle';
    var re = await Utils.httpGet(GAS_STATION_URL);
    let standard = re.standard;
    return standard; //Gwei
}

Utils.checkCurrentGasPrice = async function () {
    let gas = await Utils.getGasPriceGST();
    if (gas === undefined || gas === null) {
        gas = await Utils.getGasPriceETHC();
    }
    let currentGasPrice = gas * (10 ** 9); //wei
    console.log('checkCurrentGasPrice:', currentGasPrice);
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