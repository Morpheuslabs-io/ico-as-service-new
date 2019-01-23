var sqlite3=require('sqlite3-promise')
var db = null;

var SqliteHandler = {
  async loadDB(dbFilePath) {
    try {
      console.log('loadDB - path:', dbFilePath);
      db = new sqlite3.Database(dbFilePath);
      
      await db.runAsync("CREATE TABLE IF NOT EXISTS address1 (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)");

      await db.runAsync("CREATE TABLE IF NOT EXISTS address2 (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)");
      
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

// test();

module.exports = SqliteHandler;

