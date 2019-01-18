var cron = require('node-cron');
const utils = require('./utils')
const contract = require('./contract');

const global = require('./global');
global.initContract(artifacts);
global.initDb();

var task = cron.schedule("*/1 * * * *", async function () {

    let predeployCnt = await global.SqliteHandler.predeployAmount();
    if (predeployCnt >= global.PREDEPLOY_MAX)
    {
      console.log('cron job - Already predeployed: ' + predeployCnt + ' sets');
      return;
    }

    let currGasPrice = await utils.checkCurrentGasPrice();
    if (currGasPrice > global.PREDEPLOY_GAS_PRICE_MAX)
    {
      console.log(`cron job - current gas price (${currGasPrice}) > maxGasPrice (${global.PREDEPLOY_GAS_PRICE_MAX})`);
      return;
    }

    console.log('cron job running ...');

    await contract.deploycontracts(currGasPrice);

    console.log('cron job pausing ...');
  
  }, true);

  task.start();

// task.stop();

module.exports = function (deployer) {}