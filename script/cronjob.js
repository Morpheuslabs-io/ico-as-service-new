var crontab = require('node-crontab');
var sleep = require('sleep');
const utils = require('./utils')
const contract = require('./contract');
const contractVesting = require('./contractvesting');

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

    let isVesting = process.env.VESTING ? true : false;
    
    console.log('------------------------------------------------');
    console.log(`cron job running ... (isVesting: ${isVesting})`);
    isCronRunning = true;

    let predeployCnt;
    if (isVesting) {
      predeployCnt = await global.SqliteHandler.predeployed('addressVesting');
    } else {
      predeployCnt = await global.SqliteHandler.predeployed('address1');
    }
    
    if (predeployCnt >= global.PREDEPLOY_MAX)
    {
      console.log('cron job - Already predeployed: ' + predeployCnt + ' sets');
      isCronRunning = false;
      return;
    }

    let currGasPrice = await utils.checkCurrentGasPrice();
    if ((predeployCnt >= global.PREDEPLOY_MIN) &&
        (currGasPrice > global.PREDEPLOY_GAS_PRICE_MAX)
      )
    {
      console.log(`cron job - current gas price (${currGasPrice}) > maxGasPrice (${global.PREDEPLOY_GAS_PRICE_MAX}) - Not deploy contracts`);
      isCronRunning = false;
      return;
    }

    let gasOpt = {
      gasPrice: currGasPrice,
      gas: global.GAS_LIMIT
    };

    if (isVesting) {
      await contractVesting.deployContracts(gasOpt, global, true);
    } else {
      await contract.deployContracts(gasOpt, global, true);
    }

    console.log('cron job pausing ...');

    isCronRunning = false;

}, null, null);

module.exports = function (deployer) {}