const contract = require('./contract')
const testData = require('../data/fake_test_data').testData;
var sleep = require('sleep');

const global = require('./global');

setparamtest = async (global) => {
  
  const {
    step2,
    step3
  } = testData;

  console.log('testData:', testData);

  console.log('controller::setparamtest - step2:', step2, ', step3:', step3);

  let result = await contract.setParamForContracts(step2, step3, global);

  if (result.error) {
    console.log('setparamtest - Error:', result.error);
  } else {
    console.log('setparamtest - Result:', result);
  }
}

(async function main() {
  global.initContract(artifacts);
  
  await global.initDb("../database/sqlite.db");

  await setparamtest(global);
})();

module.exports = function (deployer) {}


