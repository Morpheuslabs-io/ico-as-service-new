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
  async pushUserRequest(requestData) {

    let requestStr = JSON.stringify(requestData.request);

    let queryInsert = "INSERT INTO " + "user" + " (email, request) VALUES (";
    queryInsert += "'" + requestData.email + "'" + "," + "'" + requestStr + "'" + ")";

    try {
      await db.runAsync(queryInsert);
      console.log('pushUserRequest OK - email: ' + requestData.email);
    } catch (err) {
      console.log('pushUserRequest Error: ' + err);
    }
  },
  async pushUserResponse(responseData) {

    let responseStr = JSON.stringify(responseData.response);

    let queryInsert = "INSERT INTO " + "user" + " (email, response) VALUES (";
    queryInsert += "'" + responseData.email + "'" + "," + "'" + responseStr + "'" + ")";

    try {
      await db.runAsync(queryInsert);
      console.log('pushUserResponse OK - email: ' + responseData.email);
    } catch (err) {
      console.log('pushUserResponse Error: ' + err);
    }
  }
}

// async function test() {
//   await SqliteHandler.loadDB('./database/sqlite.db');
//   await SqliteHandler.push('123456', 'address1');
//   await SqliteHandler.push('aaaaa', 'address2');
//   await SqliteHandler.push('456', 'address1');
//   await SqliteHandler.push('aaa', 'address2');
//   await SqliteHandler.predeployed('address1');
//   await SqliteHandler.predeployed('address2');
//   await SqliteHandler.pop('address1');
//   await SqliteHandler.pop('address2');
//   await SqliteHandler.predeployed('address1');
//   await SqliteHandler.predeployed('address2');
//   await SqliteHandler.close();
// }

async function test2() {
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

test2();

module.exports = SqliteHandler;

