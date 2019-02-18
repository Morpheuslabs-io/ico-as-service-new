var sqlite3=require('sqlite3-promise')
var db = null;

var SqliteHandler = {
  async loadDB(dbFilePath) {
    try {
      console.log('loadDB - path:', dbFilePath);
      db = new sqlite3.Database(dbFilePath);
      
      await db.runAsync("CREATE TABLE IF NOT EXISTS address1 (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)");

      await db.runAsync("CREATE TABLE IF NOT EXISTS address2 (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)");

      await db.runAsync("CREATE TABLE IF NOT EXISTS user (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, request TEXT, response TEXT)");

      await db.runAsync("CREATE TABLE IF NOT EXISTS addressVesting (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)");

      await db.runAsync("CREATE TABLE IF NOT EXISTS userVesting (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, request TEXT, response TEXT)");

      console.log('loadDB OK');
    } catch (err) {
      console.log('loadDB error: ', err);
    }

  },
  close() {
    db.close();
  },
  async push(addressListStr, addressTableName) {
    let queryInsert = "INSERT INTO " + addressTableName + " (data) VALUES (" + "'" + addressListStr + "')";

    try {
      await db.runAsync(queryInsert);
      console.log('push ' + addressTableName + ' OK');
    } catch (err) {
      console.log('push ' + addressTableName + ' Error: ', err);
    }
  },
  async pop(addressTableName) {

    let addressListStr=null;
    let rowId=null;

    let querySelect = "SELECT * FROM " + addressTableName + " ORDER BY ROWID ASC LIMIT 1";

    let row = null;
    
    try {
      row = await db.allAsync(querySelect);
      if (!row || row.length == 0) {
        console.error('select error');
        return null;
      }
      addressListStr = row[0].data;
      rowId = row[0].id;
      let queryDelete = 'DELETE FROM ' + addressTableName + ' WHERE ROWID=' + rowId;
      try {
        // TEST
        await db.runAsync(queryDelete);
        console.log('pop ' + addressTableName + ' OK - addressList:', addressListStr);
      } catch (err) {
        console.log('pop ' + addressTableName + ' Error: ', err);
        return null;
      }
    } catch (err) {
      console.log('pop ' + addressTableName + ' Error: ', err);
      return null;
    }

    return addressListStr;
  },
  async predeployed(addressTableName) {
    let querySelect = "SELECT count(*) AS rows FROM " + addressTableName;

    try {
      let result = await db.allAsync(querySelect);
      let cnt = result[0] ? result[0].rows : 0;
      console.log('predeployed ' + addressTableName + ' : ', cnt);
      return cnt;
    } catch (err) {
      console.log('predeployed ' + addressTableName + ' Error: ', err);
      return null;
    }
  },
  async pushUserRequest(requestData, userTable) {

    let requestStr = JSON.stringify(requestData.request);
    let myTable = !userTable ? "user" : "userVesting";

    let queryInsert = "INSERT INTO " + myTable + " (email, request) VALUES (";
    queryInsert += "'" + requestData.email.toLowerCase() + "'" + "," + "'" + requestStr + "'" + ")";

    try {
      await db.runAsync(queryInsert);
      console.log('pushUserRequest OK - email: ' + requestData.email.toLowerCase());
    } catch (err) {
      console.log('pushUserRequest Error: ' + err);
    }
  },
  async updateUserResponse(email, htmlMailContent, userTable) {

    htmlMailContent = '<HTML> \n' + '<BODY> \n' + htmlMailContent + '</BODY> \n' + '</HTML>';
    let myTable = !userTable ? "user" : "userVesting";

    console.log('pushUserResponse - htmlMailContent:', htmlMailContent);

    let queryUpdate = "UPDATE " + myTable + " SET response=";
    queryUpdate += "'" + htmlMailContent + "'" + " WHERE email=" + "'" + email + "'";

    try {
      await db.runAsync(queryUpdate);
      console.log('updateUserResponse OK');
    } catch (err) {
      console.log('updateUserResponse Error: ' + err);
    }
  }
}

async function testUserReq() {
  let requestData = {};
  requestData.email = 'midotrinh@gmail.com';
  requestData.request = {
    step2: {
      name: 'Morpheus',
      ticker: 'MMM',
      decimals: 18,
      reserved_token: []
    },
    step3: {
      wallet_address: '0x8847f80cb1b2b567679b3166a0c828453e122c7f',
      email_address: 'midotrinh@gmail.com',
      gasPrice: '3.01',
      mincap: 1,
      enableWhitelisting: 'no',
      tiers: 
      [ { sequence: 1,
          tierName: 'Tier 1',
          allowModifying: 'no',
          startDate: '2019-02-01',
          startTime: '15:27:45',
          endDate: '2019-02-02',
          endTime: '15:27:45',
          lockDate: '2019-02-03T08:27:16.454Z',
          unlockDate: '2019-02-05T08:27:16.454Z',
          rate: 10,
          supply: 1000000,
          whitelist: [] } ]
    }
  };

  await SqliteHandler.loadDB('./database/sqlite.db');
  await SqliteHandler.pushUserRequest(requestData);
  await SqliteHandler.close();
}

async function testUserResponse() {
  let htmlMailContent = '<p><b>Hello</b></p><p>Please be informed that your ICO contracts have successfully been finalized. </p><h4>Token contract:</h4><ul><li>Link: https://rinkeby.etherscan.io/address/0x6fc3d2d026dcec292850dbfd82c10e40e47abb47</li><li>Transaction fee: 0.016878556 ETH</li></ul><h3>Tier 1</h3><h4>Crowdsale contract</h4><ul><li>Link: https://rinkeby.etherscan.io/address/0x25e3cf3a61603ecd91a3072f1c99bd1f28b6d8e8</li><li>Transaction fee: 0.02406358 ETH</li></ul><h4>Pricing Strategy contract</h4><ul><li>Link: https://rinkeby.etherscan.io/address/0x2b3eebd3310f531378714c491ca962579b7db246</li><li>Transaction fee: 0.004232284 ETH</li></ul><h4>Finalized Agent contract</h4><ul><li>Link: https://rinkeby.etherscan.io/address/0xcf4d162fe2209d49ba97eee1449b5fd0fcde7343</li><li>Transaction fee: 0.009527956 ETH</li></ul><h3>Tier 2</h3><h4>Crowdsale contract</h4><ul><li>Link: https://rinkeby.etherscan.io/address/0x25e3cf3a61603ecd91a3072f1c99bd1f28b6d8e8</li><li>Transaction fee: 0.02406358 ETH</li></ul><h4>Pricing Strategy contract</h4><ul><li>Link: https://rinkeby.etherscan.io/address/0x2b3eebd3310f531378714c491ca962579b7db246</li><li>Transaction fee: 0.004232284 ETH</li></ul><h4>Finalized Agent contract</h4><ul><li>Link: https://rinkeby.etherscan.io/address/0xcf4d162fe2209d49ba97eee1449b5fd0fcde7343</li><li>Transaction fee: 0.009527956 ETH</li></ul><h4>Total transaction fee: 0.09252619600000002 ETH</h4><a href="https://morpheuslabs.io/"><b>@ Morpheus Labs. Inc | 2017 All rights reserved</b></a>';

  let email='midotrinh@gmail.com';

  await SqliteHandler.loadDB('./database/sqlite.db');
  await SqliteHandler.updateUserResponse(email, htmlMailContent);
  await SqliteHandler.close();
}

// testUserReq();
// testUserResponse();

module.exports = SqliteHandler;

