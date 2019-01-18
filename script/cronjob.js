var crontab = require('node-crontab');
var sleep = require('sleep');
const utils = require('./utils')
const contract = require('./contract');

var global = require('./global');
global.initContract(artifacts);
global.initDb();

var isCronRunning = false;

sleep.sleep(5);

var jobId = crontab.scheduleJob("*/1 * * * *", async function(){
    
    if (isCronRunning) {
      console.log('Cron job exits because previous cron job still running');
      return;
    }
    
    console.log('cron job running ...');
    isCronRunning = true;

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

    await contract.deploycontracts(currGasPrice, global);

    console.log('cron job pausing ...');

    isCronRunning = false;

}, null, null);

// var task = cron.schedule("*/1 * * * *", async function () {
//     console.log('cron running');
    
//     if (global.INIT_DB == false)
//     {
//       await global.initDb();
//     }

//     let predeployCnt = await global.SqliteHandler.predeployAmount();
//     if (predeployCnt >= global.PREDEPLOY_MAX)
//     {
//       console.log('cron job - Already predeployed: ' + predeployCnt + ' sets');
//       return;
//     }

//     let currGasPrice = await utils.checkCurrentGasPrice();
//     if (currGasPrice > global.PREDEPLOY_GAS_PRICE_MAX)
//     {
//       console.log(`cron job - current gas price (${currGasPrice}) > maxGasPrice (${global.PREDEPLOY_GAS_PRICE_MAX})`);
//       return;
//     }

//     console.log('cron job running ...');

//     await contract.deploycontracts(currGasPrice);

//     console.log('cron job pausing ...');
  
//   }, global, {scheduled:false});

// task.start();

// var cron = require('node-cron');
 
// var task = cron.schedule("*/1 * * * *", () => {
//   console.log('running a task every 1 min');
// }, {scheduled:false});

// task.start();

module.exports = function (deployer) {}