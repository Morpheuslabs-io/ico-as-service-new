var crontab = require('node-crontab');
var sleep = require('sleep');
const utils = require('./utils')
const contract = require('./contract');

var global = require('./global');
global.initContract(artifacts);
global.initDb();

var isCronRunning = false;

sleep.sleep(5);

var jobId = crontab.scheduleJob(global.PREDEPLOY_INTERVAL, async function(){
    
    if (isCronRunning) {
      // console.log('Cron job exits because previous cron job still running');
      return;
    }
    
    console.log('------------------------------------------------');
    console.log('cron job running ...');
    isCronRunning = true;

    let predeployCnt = await global.SqliteHandler.predeployed('address1');
    if (predeployCnt >= global.PREDEPLOY_MAX)
    {
      console.log('cron job - Already predeployed: ' + predeployCnt + ' sets');
      isCronRunning = false;
      return;
    }

    let currGasPrice = await utils.checkCurrentGasPrice();
    if (currGasPrice > global.PREDEPLOY_GAS_PRICE_MAX)
    {
      console.log(`cron job - current gas price (${currGasPrice}) > maxGasPrice (${global.PREDEPLOY_GAS_PRICE_MAX}) - Not deploy contracts`);
      isCronRunning = false;
      return;
    }

    let gasOpt = {
      gasPrice: currGasPrice,
      gas: global.GAS_LIMIT
    };

    await contract.deployContracts(gasOpt, global, true);

    console.log('cron job pausing ...');

    isCronRunning = false;

}, null, null);

module.exports = function (deployer) {}