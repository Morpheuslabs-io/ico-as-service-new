var sqlite3=require('sqlite3-promise')
// const dbFilePath = './database/sqlite.db';
var db = null;

var SqliteHandler = {
  async loadDB(dbFilePath) {
    try {
      db = new sqlite3.Database(dbFilePath);
      await db.runAsync("CREATE TABLE IF NOT EXISTS address (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)");
      console.log('loadDB OK');
    } catch (err) {
      console.log('loadDB error: ', err);
    }

  },
  close() {
    db.close();
  },
  async push(addressListStr) {

    await db.runAsync("INSERT INTO address (data) VALUES (" + "'" + addressListStr + "')");

    console.log('push OK - addressList:', addressListStr);
  },
  async pop() {
    let addressListStr=null;
    let rowId=null;

    let row = await db.allAsync("SELECT * FROM address ORDER BY ROWID ASC LIMIT 1");
    if (!row || row.length == 0) {
      console.error('select error');
      return null;
    }
    addressListStr = row[0].data;
    rowId = row[0].id;
    console.log(rowId + ": " + addressListStr);

    await db.runAsync(`DELETE FROM address WHERE ROWID=${rowId}`);

    console.log('pop OK - addressList:', addressListStr);

    return addressListStr;
  },
  async predeployAmount() {

    let result = await db.allAsync("SELECT count(*) AS rows FROM address");
    let cnt = result[0] ? result[0].rows : 0;
    console.log('predeployAmount: ', cnt);
    return cnt;
  }
}

// async function main() {
//   await SqliteHandler.loadDB('./database/sqlite.db');
//   await SqliteHandler.push('123456');
//   await SqliteHandler.push('789');
//   await SqliteHandler.pop();
//   await SqliteHandler.predeployAmount();
//   await SqliteHandler.close();
// }

// main();

module.exports = SqliteHandler;

